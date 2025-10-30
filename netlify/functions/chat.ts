import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { google } from "googleapis";

// Initialize Google Sheets API
const getGoogleSheetsClient = () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
};

// Log message to Google Sheets
const logToGoogleSheets = async (
  email: string,
  sessionId: string,
  messageType: "user" | "bot",
  content: string
) => {
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  const sheetName = process.env.SHEET_NAME_CHAT_LOGS || "Chat Logs";

  if (!spreadsheetId) {
    throw new Error("Google Spreadsheet ID not configured");
  }

  const timestamp = new Date().toISOString();
  const values = [[timestamp, email, sessionId, messageType, content]];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:E`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values,
    },
  });
};

// Call n8n webhook
const callN8nWebhook = async (message: string, sessionId: string) => {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  const authToken = process.env.N8N_AUTH_TOKEN;

  if (!webhookUrl) {
    throw new Error("n8n webhook URL not configured");
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authToken && { auth: authToken }),
    },
    body: JSON.stringify({
      message,
      sessionId,
    }),
  });

  if (!response.ok) {
    throw new Error(`n8n webhook failed: ${response.statusText}`);
  }

  const data = await response.json();

  // Handle various response formats from n8n
  let botMessage = "";
  if (data.response) {
    botMessage = data.response;
  } else if (data.message) {
    botMessage = data.message;
  } else if (data.output) {
    botMessage = data.output;
  } else if (data.text) {
    botMessage = data.text;
  } else {
    botMessage = JSON.stringify(data);
  }

  return botMessage;
};

const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  // Set CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle preflight request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    // Parse request body
    const { message, sessionId, email } = JSON.parse(event.body || "{}");

    // Validate required fields
    if (!message || !sessionId || !email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Missing required fields: message, sessionId, and email",
        }),
      };
    }

    // Log user message to Google Sheets
    await logToGoogleSheets(email, sessionId, "user", message);

    // Call n8n webhook to get bot response
    const botResponse = await callN8nWebhook(message, sessionId);

    // Log bot response to Google Sheets
    await logToGoogleSheets(email, sessionId, "bot", botResponse);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        response: botResponse,
      }),
    };
  } catch (error: any) {
    console.error("Error processing chat message:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to process chat message",
        message: error.message,
      }),
    };
  }
};

export { handler };
