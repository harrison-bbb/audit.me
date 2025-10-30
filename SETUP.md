# Setup Guide: Email Authentication & Google Sheets Integration

This guide will help you configure email authentication and Google Sheets logging for your chat application.

## Prerequisites

- A Google Cloud account
- Access to Google Sheets
- A Netlify account for deployment

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

## Step 2: Create Google Cloud Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the **Google Sheets API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

4. Create a Service Account:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Give it a name (e.g., "chat-logger")
   - Click "Create and Continue"
   - Skip optional steps and click "Done"

5. Create a Service Account Key:
   - Click on the service account you just created
   - Go to the "Keys" tab
   - Click "Add Key" > "Create New Key"
   - Choose "JSON" format
   - Download the JSON file (keep it secure!)

6. Share your Google Sheet with the Service Account:
   - Open the JSON file and find the `client_email` field
   - Copy the email address (looks like: `your-service-account@your-project.iam.gserviceaccount.com`)
   - Go back to your Google Sheet
   - Click "Share" and add this email with "Editor" permissions

## Step 3: Configure Netlify Environment Variables

1. Go to your [Netlify Dashboard](https://app.netlify.com)
2. Select your site
3. Go to "Site settings" > "Environment variables"
4. Add the following variables:

### Google Sheets Configuration

**GOOGLE_SERVICE_ACCOUNT_EMAIL**
- Value: Copy the `client_email` from your service account JSON file

**GOOGLE_PRIVATE_KEY**
- Value: Copy the `private_key` from your service account JSON file
- ⚠️ **Important**: Keep the quotes and newline characters (`\n`) in the key

**GOOGLE_SPREADSHEET_ID**
- Value: Your spreadsheet ID from Step 1

### n8n Configuration

**N8N_WEBHOOK_URL**
- Value: Your n8n webhook URL
- Example: `https://n8n.srv891288.hstgr.cloud/webhook/your-webhook-id`

**N8N_AUTH_TOKEN**
- Value: Your n8n authentication token (if required)

### Optional Variables

**SHEET_NAME_EMAILS** (optional, defaults to "Email Entries")
- Value: Name of your email entries sheet

**SHEET_NAME_CHAT_LOGS** (optional, defaults to "Chat Logs")
- Value: Name of your chat logs sheet

## Step 4: Install Dependencies

Run the following command to install the required packages:

```bash
npm install
```

## Step 5: Local Development (Optional)

If you want to test locally with Netlify CLI:

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Create a `.env` file in the root directory (use `.env.example` as reference)

3. Run the development server:
   ```bash
   netlify dev
   ```

## Step 6: Deploy to Netlify

1. Push your changes to GitHub
2. Netlify will automatically deploy (if auto-deploy is enabled)
3. Or manually trigger a deploy from the Netlify dashboard

## Testing

Once deployed:

1. Visit your site URL
2. You should see an email gate asking for your email
3. Enter your email and start chatting
4. Check your Google Sheets to verify:
   - Email entry is logged in "Email Entries" sheet
   - Chat messages are logged in "Chat Logs" sheet

## Troubleshooting

### "Failed to log email" error
- Verify the service account email has editor access to the Google Sheet
- Check that the `GOOGLE_PRIVATE_KEY` includes all `\n` characters
- Ensure the Google Sheets API is enabled in your Google Cloud project

### "Failed to process chat message" error
- Verify all environment variables are set correctly in Netlify
- Check the Netlify function logs for detailed error messages
- Ensure the n8n webhook URL is correct and accessible

### Messages not appearing in Google Sheets
- Verify the sheet names match exactly (case-sensitive)
- Check that the service account has editor permissions
- Look at Netlify function logs for any API errors

## Security Notes

- ⚠️ **Never commit your `.env` file or service account JSON to Git**
- Keep your service account credentials secure
- Regularly rotate your service account keys
- Only grant necessary permissions to the service account

## Architecture Overview

```
User → Email Gate → Log Email Function → Google Sheets (Email Entries)
                          ↓
                   Store in localStorage
                          ↓
User → Chat Interface → Chat Function → Google Sheets (Chat Logs)
                              ↓
                        n8n Webhook → AI Response
                              ↓
                   Google Sheets (Chat Logs)
```

## Support

For issues or questions:
1. Check the Netlify function logs
2. Review the browser console for frontend errors
3. Verify all environment variables are set correctly
4. Ensure Google Sheets API permissions are configured properly
