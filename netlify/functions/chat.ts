import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

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

    // Call n8n webhook with all data
    // n8n will handle: logging user message → calling AI → logging bot response → returning response
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    const authToken = process.env.N8N_AUTH_TOKEN;

    if (!webhookUrl) {
      throw new Error("n8n webhook URL not configured");
    }

    const timestamp = new Date().toISOString();

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authToken && { auth: authToken }),
      },
      body: JSON.stringify({
        action: "chat",
        message,
        sessionId,
        email,
        timestamp,
      }),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook failed: ${response.statusText}`);
    }

    const data = await response.json();

    // Handle various response formats from n8n
    let botResponse = "";
    if (data.response) {
      botResponse = data.response;
    } else if (data.message) {
      botResponse = data.message;
    } else if (data.output) {
      botResponse = data.output;
    } else if (data.text) {
      botResponse = data.text;
    } else {
      botResponse = JSON.stringify(data);
    }

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
