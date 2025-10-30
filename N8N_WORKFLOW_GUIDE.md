# n8n Workflow Configuration Guide

This guide provides step-by-step instructions for configuring your n8n workflow to handle email logging and chat message logging to Google Sheets.

## Overview

Your n8n workflow will receive requests from Netlify Functions and:
1. Log email entries when users first sign in
2. Log chat messages (user + bot) to Google Sheets
3. Call your AI service and return responses

---

## Workflow Structure

```
┌──────────────────────┐
│  Webhook (Start)     │
│  Listen for requests │
└──────────┬───────────┘
           │
           ↓
┌──────────────────────┐
│  Switch Node         │
│  Route by "action"   │
└──────┬───────┬───────┘
       │       │
       │       └─────────────────┐
       │                         │
       ↓                         ↓
┌──────────────┐         ┌──────────────┐
│ Email Branch │         │  Chat Branch │
└──────────────┘         └──────────────┘
```

---

## Step-by-Step Setup

### 1. Create New Workflow

1. Open your n8n instance
2. Click **"New Workflow"**
3. Give it a name like **"Audit Chat Logger"**

---

### 2. Add Webhook Node (Trigger)

This is your starting point that receives requests from Netlify.

**Configuration:**
1. Add a **"Webhook"** node
2. Set **HTTP Method**: `POST`
3. Set **Path**: `/audit-chat` (or use your existing webhook path)
4. Set **Authentication**:
   - For production: Use **"Header Auth"** (recommended)
   - For testing: Use **"None"**
5. Set **Response Mode**: `"When Last Node Finishes"`
6. **Save** the node

**Copy the webhook URL** - you'll need this for Netlify environment variables.

---

### 3. Add Switch Node

This routes requests to the correct branch based on the `action` field.

**Configuration:**
1. Add a **"Switch"** node
2. Connect it to the Webhook node
3. Set **Mode**: `Rules`
4. Add **Rule 1**:
   - **Field**: `{{ $json.body.action }}`
   - **Operation**: `Equal to`
   - **Value**: `log-email`
   - **Output**: `0`
5. Add **Rule 2**:
   - **Field**: `{{ $json.body.action }}`
   - **Operation**: `Equal to`
   - **Value**: `chat`
   - **Output**: `1`
6. **Fallback Output**: `2` (for error handling)
7. **Save** the node

---

### 4. Email Branch (Output 0)

#### 4a. Add Google Sheets Node (Log Email Entry)

**Configuration:**
1. Add **"Google Sheets"** node connected to Switch Output 0
2. **Credential**: Select or create your Google Sheets OAuth2 credential
3. **Operation**: `Append`
4. **Document ID**: Your Spreadsheet ID (from Step 1 in SETUP.md)
5. **Sheet**: `Email Entries`
6. **Columns**:
   - **A** (Timestamp): `{{ $json.body.timestamp }}`
   - **B** (Email): `{{ $json.body.email }}`
   - **C** (Session ID): `{{ $json.body.sessionId }}`
7. **Options** → **Data Mode**: `Define Below`
8. **Save** the node

#### 4b. Add Respond to Webhook Node

**Configuration:**
1. Add **"Respond to Webhook"** node
2. Connect it to the Google Sheets node
3. **Response Code**: `200`
4. **Response Body**:
```json
{
  "success": true,
  "message": "Email logged successfully"
}
```
5. **Save** the node

---

### 5. Chat Branch (Output 1)

This branch needs to:
1. Log user message
2. Call AI service
3. Log bot response
4. Return bot response

#### 5a. Add Google Sheets Node (Log User Message)

**Configuration:**
1. Add **"Google Sheets"** node connected to Switch Output 1
2. **Credential**: Your Google Sheets OAuth2 credential
3. **Operation**: `Append`
4. **Document ID**: Your Spreadsheet ID
5. **Sheet**: `Chat Logs`
6. **Columns**:
   - **A** (Timestamp): `{{ $json.body.timestamp }}`
   - **B** (Email): `{{ $json.body.email }}`
   - **C** (Session ID): `{{ $json.body.sessionId }}`
   - **D** (Message Type): `user`
   - **E** (Content): `{{ $json.body.message }}`
7. **Save** the node

#### 5b. Add HTTP Request Node (Call AI Service)

**Configuration:**

**Option 1: If your AI is accessible via HTTP:**
1. Add **"HTTP Request"** node
2. **Method**: `POST`
3. **URL**: Your AI service URL
4. **Authentication**: As required by your AI service
5. **Body Parameters**:
   - `message`: `{{ $json.body.message }}`
   - `sessionId`: `{{ $json.body.sessionId }}`
6. **Save** the node

**Option 2: If using an existing n8n workflow:**
1. Add **"Execute Workflow"** node
2. Select your existing AI workflow
3. Pass the message and sessionId as inputs
4. **Save** the node

**Option 3: If using OpenAI:**
1. Add **"OpenAI"** node
2. Select operation: `Chat`
3. **Model**: `gpt-4` or your preferred model
4. **Messages**:
   ```json
   [
     {
       "role": "user",
       "content": "{{ $json.body.message }}"
     }
   ]
   ```
5. **Save** the node

#### 5c. Add Code Node (Extract Response)

This normalizes the AI response format.

**Configuration:**
1. Add **"Code"** node
2. **Language**: `JavaScript`
3. **Code**:
```javascript
// Extract bot response from various possible formats
let botResponse = "";

if ($input.item.json.response) {
  botResponse = $input.item.json.response;
} else if ($input.item.json.message) {
  botResponse = $input.item.json.message;
} else if ($input.item.json.output) {
  botResponse = $input.item.json.output;
} else if ($input.item.json.text) {
  botResponse = $input.item.json.text;
} else if ($input.item.json.choices && $input.item.json.choices[0]) {
  // OpenAI format
  botResponse = $input.item.json.choices[0].message.content;
} else {
  botResponse = JSON.stringify($input.item.json);
}

// Get original request data
const originalData = $('Webhook').first().json.body;

return {
  botResponse: botResponse,
  email: originalData.email,
  sessionId: originalData.sessionId,
  timestamp: new Date().toISOString()
};
```
4. **Save** the node

#### 5d. Add Google Sheets Node (Log Bot Response)

**Configuration:**
1. Add **"Google Sheets"** node
2. **Credential**: Your Google Sheets OAuth2 credential
3. **Operation**: `Append`
4. **Document ID**: Your Spreadsheet ID
5. **Sheet**: `Chat Logs`
6. **Columns**:
   - **A** (Timestamp): `{{ $json.timestamp }}`
   - **B** (Email): `{{ $json.email }}`
   - **C** (Session ID): `{{ $json.sessionId }}`
   - **D** (Message Type): `bot`
   - **E** (Content): `{{ $json.botResponse }}`
7. **Save** the node

#### 5e. Add Respond to Webhook Node

**Configuration:**
1. Add **"Respond to Webhook"** node
2. **Response Code**: `200`
3. **Response Body**:
```json
{
  "success": true,
  "response": "={{ $json.botResponse }}"
}
```
4. **Save** the node

---

### 6. Error Handling Branch (Output 2)

Optional but recommended for debugging.

**Configuration:**
1. Add **"Respond to Webhook"** node connected to Switch Output 2
2. **Response Code**: `400`
3. **Response Body**:
```json
{
  "error": "Invalid action",
  "received": "={{ $json.body }}"
}
```
4. **Save** the node

---

## Complete Workflow Visualization

```
Webhook (POST)
    ↓
Switch (action field)
    ↓
    ├─[0: log-email]──→ Google Sheets (Email Entries) ──→ Respond (200)
    │
    ├─[1: chat]──→ Google Sheets (User Msg) ──→ AI Service ──→ Code (Extract) ──→ Google Sheets (Bot Msg) ──→ Respond (200)
    │
    └─[2: fallback]──→ Respond (400 Error)
```

---

## Testing Your Workflow

### Test Email Logging

1. In n8n, click **"Execute Workflow"** or enable **"Listen for Test Webhook"**
2. Use a tool like Postman or curl to send:

```bash
curl -X POST https://your-n8n-instance/webhook/audit-chat \
  -H "Content-Type: application/json" \
  -d '{
    "action": "log-email",
    "email": "test@example.com",
    "sessionId": "test-session-123",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }'
```

3. Check your Google Sheet "Email Entries" tab - you should see a new row

### Test Chat Logging

```bash
curl -X POST https://your-n8n-instance/webhook/audit-chat \
  -H "Content-Type: application/json" \
  -d '{
    "action": "chat",
    "message": "What is an audit?",
    "email": "test@example.com",
    "sessionId": "test-session-123",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }'
```

4. Check your Google Sheet "Chat Logs" tab - you should see TWO new rows (user + bot)

---

## Troubleshooting

### Webhook not receiving data
- Ensure the workflow is **activated** (toggle in top right)
- Check that your webhook URL is correct
- Verify no firewall blocks n8n

### Google Sheets node fails
- Re-authenticate your Google Sheets credential
- Check that sheet names match exactly (case-sensitive)
- Verify the Spreadsheet ID is correct
- Ensure columns are defined correctly

### AI Service not responding
- Test the AI service directly
- Check authentication credentials
- Verify the AI service URL is accessible from n8n
- Review n8n execution logs for detailed errors

### Data not appearing in correct format
- Check the Code node for response extraction
- Review the AI service response structure
- Update the mapping expressions in Google Sheets nodes

---

## Advanced Tips

### Adding Authentication

For production, add webhook authentication:
1. In Webhook node, set **Authentication**: `Header Auth`
2. Set **Header Name**: `auth`
3. Set **Header Value**: Your secret token
4. Update Netlify `N8N_AUTH_TOKEN` environment variable with the same token

### Adding Logging

Add **"Write to Log"** nodes after each step for debugging:
```
{{ JSON.stringify($json, null, 2) }}
```

### Adding Notifications

After the Google Sheets nodes, add:
- **Email** node to notify on new signups
- **Slack** node to alert on errors
- **Discord** node for team notifications

### Rate Limiting

Add a **"Rate Limit"** node before the Switch to prevent abuse:
- **Max Requests**: 100
- **Per**: 1 minute
- **By**: IP Address

---

## Activating Your Workflow

1. Test all branches thoroughly
2. Click **"Active"** toggle in the top right
3. Copy the production webhook URL
4. Add it to your Netlify environment variables
5. Deploy your frontend

---

## Monitoring

To monitor your workflow:
1. Go to **"Executions"** tab in n8n
2. Review successful and failed executions
3. Check execution times for performance
4. Set up error notifications for failed executions

---

## Support

If you encounter issues:
1. Check n8n execution history for detailed logs
2. Verify all credentials are valid
3. Test each node individually
4. Review the [n8n community forum](https://community.n8n.io)
