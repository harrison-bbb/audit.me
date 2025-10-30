import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

/**
 * Email logging function - forwards email entries to n8n for Google Sheets logging
 * Requires N8N_WEBHOOK_URL environment variable to be set in Netlify
 */

// Validate email format
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
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
    const { email, sessionId } = JSON.parse(event.body || "{}");

    // Validate email
    if (!email || !isValidEmail(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Invalid email address" }),
      };
    }

    // Validate session ID
    if (!sessionId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Session ID is required" }),
      };
    }

    // Call n8n webhook to log email
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
        action: "log-email",
        email,
        sessionId,
        timestamp,
      }),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook failed: ${response.statusText}`);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Email logged successfully",
        email,
        sessionId,
      }),
    };
  } catch (error: any) {
    console.error("Error logging email:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to log email",
        message: error.message,
      }),
    };
  }
};

export { handler };
