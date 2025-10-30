# Setup Guide: Email Authentication & Google Sheets Integration via n8n

This guide will help you configure email authentication and Google Sheets logging for your chat application using n8n.

## Overview

Instead of calling Google Sheets directly from the backend, we use n8n as an intermediary. This approach:
- ✅ **No Google Cloud service account required**
- ✅ Authenticate once in n8n with your Google account
- ✅ Simpler setup, especially for organizations with restricted Cloud Console access
- ✅ All logic centralized in n8n workflow

## Architecture

```
Frontend → Netlify Functions → n8n Workflow → Google Sheets + AI
```

## Prerequisites

- Access to n8n (your existing instance)
- A Google account with access to Google Sheets
- A Netlify account for deployment

---

## Step 1: Create Google Sheets

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet (name it whatever you like, e.g., "Audit Chat Logs")
3. Create two sheets (tabs) in the spreadsheet:

### Sheet 1: "Email Entries"
Add these column headers in row 1:
- **A1**: Timestamp
- **B1**: Email
- **C1**: Session ID

### Sheet 2: "Chat Logs"
Add these column headers in row 1:
- **A1**: Timestamp
- **B1**: Email
- **C1**: Session ID
- **D1**: Message Type
- **E1**: Content

4. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit
   ```
   Keep this handy for configuring n8n.

---

## Step 2: Configure n8n Workflow

### 2.1 Authenticate n8n with Google Sheets

1. In n8n, go to **Credentials** → **Create New Credential**
2. Select **Google Sheets OAuth2 API**
3. Click "Sign in with Google" and authorize n8n to access your Google Sheets
4. Save the credential

### 2.2 Update Your n8n Workflow

Your n8n workflow needs to handle two types of actions:
1. **log-email**: Log email entries when users first sign in
2. **chat**: Log chat messages and get AI responses

See **N8N_WORKFLOW_GUIDE.md** for detailed workflow configuration with visual examples and node setup.

### Key Workflow Structure

```
Webhook (receives data)
    ↓
Switch (based on "action" field)
    ↓
├─ [action = "log-email"]
│   ↓
│   Google Sheets (append to "Email Entries")
│   ↓
│   Return success response
│
├─ [action = "chat"]
    ↓
    Google Sheets (log user message to "Chat Logs")
    ↓
    Your AI Service (get response)
    ↓
    Google Sheets (log bot response to "Chat Logs")
    ↓
    Return bot response
```

### Expected Webhook Data Formats

**For email logging:**
```json
{
  "action": "log-email",
  "email": "user@example.com",
  "sessionId": "abc-123-def",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**For chat:**
```json
{
  "action": "chat",
  "message": "What is an audit?",
  "email": "user@example.com",
  "sessionId": "abc-123-def",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Step 3: Configure Netlify Environment Variables

1. Go to your [Netlify Dashboard](https://app.netlify.com)
2. Select your site
3. Go to "Site settings" → "Environment variables"
4. Add the following variables:

### Required Variables

**N8N_WEBHOOK_URL**
- Value: Your n8n webhook URL
- Example: `https://n8n.srv891288.hstgr.cloud/webhook/a894c064-5707-49cf-8026-268b15c1f71f`

**N8N_AUTH_TOKEN** (optional)
- Value: Your n8n authentication token (if your webhook requires authentication)
- Leave blank if your webhook is public

---

## Step 4: Install Dependencies & Deploy

1. Install dependencies:
   ```bash
   npm install
   ```

2. Push changes to GitHub:
   ```bash
   git push
   ```

3. Netlify will automatically deploy (if auto-deploy is enabled)

---

## Step 5: Test the Integration

### Test Email Logging

1. Visit your deployed site
2. You should see an email gate
3. Enter your email address
4. Check your Google Sheet "Email Entries" tab - you should see a new row with:
   - Timestamp
   - Your email
   - Session ID

### Test Chat Logging

1. After entering your email, send a chat message
2. Wait for the bot response
3. Check your Google Sheet "Chat Logs" tab - you should see TWO new rows:
   - Row 1: User message (Message Type = "user")
   - Row 2: Bot response (Message Type = "bot")

---

## Troubleshooting

### Email gate appears but nothing logs to Google Sheets

**Check n8n workflow:**
- Ensure the webhook is active and accessible
- Check n8n execution logs for errors
- Verify Google Sheets credential is connected

**Check Netlify:**
- Verify `N8N_WEBHOOK_URL` is set correctly in environment variables
- Check Netlify function logs for errors

### Chat messages don't appear in Google Sheets

**Check n8n workflow:**
- Verify the Switch node correctly routes `action: "chat"` requests
- Check that both Google Sheets nodes (user message + bot message) are configured
- Ensure the Sheet name is exactly "Chat Logs" (case-sensitive)

### Bot doesn't respond to messages

**Check n8n workflow:**
- Verify your AI service node is configured correctly
- Check that the AI service is reachable from n8n
- Review n8n execution logs for the specific request

### "Failed to log email" or "Failed to send message" errors

**Common causes:**
1. n8n webhook URL is incorrect
2. n8n workflow is not activated
3. Google Sheets credential expired (re-authenticate in n8n)
4. Sheet names don't match exactly ("Email Entries" vs "email entries")

**Debugging steps:**
1. Check browser console for detailed error messages
2. Check Netlify function logs: Netlify Dashboard → Functions → View logs
3. Check n8n execution history for failed executions
4. Test the webhook directly using Postman or curl

---

## n8n Workflow Tips

### Adding More Logging Fields

You can extend the Google Sheets nodes to log additional data:
- User location (from IP)
- Message length
- Response time
- Conversation thread counts

### Setting Up Notifications

Add an Email or Slack node to notify you when:
- New users sign up
- Error messages occur
- Specific keywords are mentioned in chat

### Data Retention

Consider adding n8n scheduled workflows to:
- Archive old chat logs
- Generate weekly summary reports
- Clean up test data

---

## Security Notes

- ⚠️ **Never commit your `.env` file to Git**
- Keep your n8n webhook URL private (or use authentication)
- Regularly review your Google Sheets access logs
- Consider adding rate limiting to your n8n webhook
- Use n8n's built-in authentication for production deployments

---

## Architecture Diagram

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. User enters email
       ↓
┌─────────────────────────────┐
│  Netlify Function           │
│  /.netlify/functions/       │
│  log-email                  │
└──────┬──────────────────────┘
       │ 2. POST with action="log-email"
       ↓
┌─────────────────────────────┐
│   n8n Workflow              │
│   ┌───────────────────────┐ │
│   │ Webhook               │ │
│   └───────────┬───────────┘ │
│               ↓             │
│   ┌───────────────────────┐ │
│   │ Switch (action)       │ │
│   └───────────┬───────────┘ │
│               ↓             │
│   ┌───────────────────────┐ │
│   │ Google Sheets         │ │
│   │ (Email Entries)       │ │
│   └───────────────────────┘ │
└─────────────────────────────┘
       │
       ↓
┌─────────────────────────────┐
│   Google Sheets             │
│   "Email Entries" tab       │
└─────────────────────────────┘

[Similar flow for chat messages, with additional AI service call]
```

---

## Next Steps

1. ✅ Create your Google Sheets with proper structure
2. ✅ Configure n8n workflow (see N8N_WORKFLOW_GUIDE.md)
3. ✅ Set Netlify environment variables
4. ✅ Deploy and test
5. 🎉 Start chatting and logging!

## Additional Resources

- [n8n Documentation](https://docs.n8n.io)
- [Google Sheets API Docs](https://developers.google.com/sheets/api)
- [Netlify Functions Docs](https://docs.netlify.com/functions/overview/)

---

## Support

For issues:
1. Check Netlify function logs
2. Review n8n execution history
3. Verify Google Sheets credential status
4. Check browser console for frontend errors
