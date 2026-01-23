# Google Sheets Setup - Step-by-Step Guide

Complete guide to set up Google Sheets integration for your seminar booking system.

## Overview

This guide covers:
1. ✅ Creating a Google Cloud Project
2. ✅ Enabling Google Sheets API
3. ✅ Creating a Service Account
4. ✅ Downloading the JSON Key
5. ✅ Creating a Google Sheet
6. ✅ Setting up Gmail for confirmations

**Total Time:** 20-30 minutes

---

## Step 1: Create Google Cloud Project

### 1.1 Go to Google Cloud Console

1. Navigate to [console.cloud.google.com](https://console.cloud.google.com)
2. Sign in with your Google account
   - If you don't have one, create one at [accounts.google.com](https://accounts.google.com)
3. Accept the terms of service

### 1.2 Create a New Project

1. Look at the top-left where it says "Select a Project"
   ```
   ┌─────────────────────────┐
   │ Google Cloud            │
   │ ▼ Select a Project      │
   └─────────────────────────┘
   ```

2. Click on "Select a Project" dropdown
3. Click the blue **"NEW PROJECT"** button in the popup
4. Enter project name:
   - Name: `Seminar Booking` (or any name you prefer)
   - Organization: (leave empty or select if you have one)
   - Click **CREATE**

5. Wait for the project to be created (this takes 1-2 minutes)
6. You'll see a notification: "Project created successfully"
7. The new project will automatically be selected

### 1.3 Verify Project Creation

- At the top, you should see your project name displayed
- Note the **Project ID** (looks like `seminar-booking-789456`)
- You'll need this later

---

## Step 2: Enable Google Sheets API

### 2.1 Navigate to APIs & Services

1. Click the hamburger menu (☰) in the top-left
2. Select **"APIs & Services"**
3. Click **"Library"**

### 2.2 Search for Sheets API

1. In the search box at the top, type: `Google Sheets API`
2. Click on the **"Google Sheets API"** result
3. You'll see:
   ```
   Google Sheets API
   The Google Sheets API lets you programmatically access 
   and modify the contents of spreadsheets.
   ```

### 2.3 Enable the API

1. Click the blue **"ENABLE"** button
2. Wait for it to enable (takes a few seconds)
3. You'll see: `API Enabled` with a checkmark

### 2.4 Verify Enable

- You should now see a blue **"MANAGE"** button (instead of ENABLE)
- This confirms the API is enabled

---

## Step 3: Create a Service Account

### 3.1 Navigate to Service Accounts

1. In the left sidebar, click **"Credentials"**
2. At the top, click **"+ CREATE CREDENTIALS"**
3. From the dropdown, select **"Service Account"**

### 3.2 Fill in Service Account Details

**First Form - Service Account Details:**

1. Enter these details:
   - **Service account name:** `seminar-booking-api`
   - **Service account ID:** (auto-fills, looks like `seminar-booking-api@...`)
   - **Description:** `Service account for seminar booking system`

2. Click **"CREATE AND CONTINUE"**

**Second Form - Grant roles (Optional but recommended):**

1. Click on the dropdown **"Select a role"**
2. Search for: `Editor`
3. Select **"Editor"** (this allows reading/writing to Sheets)
4. Click **"CONTINUE"**

**Third Form - Grant users access (Skip this):**

1. Leave this empty
2. Click **"DONE"**

### 3.3 Verify Service Account Created

- You'll be taken back to the Credentials page
- You should see your service account listed under "Service Accounts"
- It shows your service account email (something like `seminar-booking-api@project-id.iam.gserviceaccount.com`)

---

## Step 4: Download JSON Key

### 4.1 Create the Key

1. On the Credentials page, find your service account in the list
2. Click on the service account email link
3. Click on the **"KEYS"** tab
4. Click **"+ ADD KEY"** → **"Create new key"**
5. Select **"JSON"**
6. Click **"CREATE"**

### 4.2 Download the File

1. A JSON file will automatically download to your computer
   - It's named something like: `seminar-booking-project-123456789.json`
   - **Save this file somewhere safe** - you'll need it for backend configuration

### 4.3 View the Key Content

1. Open the downloaded JSON file with a text editor
2. You'll see something like:
   ```json
   {
     "type": "service_account",
     "project_id": "seminar-booking-789456",
     "private_key_id": "abc123...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...",
     "client_email": "seminar-booking-api@seminar-booking-789456.iam.gserviceaccount.com",
     "client_id": "123456789",
     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
     "token_uri": "https://oauth2.googleapis.com/token",
     "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs"
   }
   ```

3. Copy the **`client_email`** value - you'll need it in Step 6

### 4.4 Store in Backend .env

1. Open your backend `.env` file
2. Add these two variables:

   ```env
   GOOGLE_SERVICE_ACCOUNT_EMAIL=seminar-booking-api@seminar-booking-789456.iam.gserviceaccount.com
   GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"seminar-booking-789456",...}
   ```

   For the key, convert the entire JSON to a single line (remove newlines):
   - Copy all content from the JSON file
   - Remove all newline characters
   - Paste as the value for `GOOGLE_SERVICE_ACCOUNT_KEY`

---

## Step 5: Create Google Sheet

### 5.1 Create a New Spreadsheet

1. Go to [sheets.google.com](https://sheets.google.com)
2. Click **"+ Blank spreadsheet"**
3. A new blank sheet opens
4. At the top-left where it says "Untitled spreadsheet", rename it:
   - Click on "Untitled spreadsheet"
   - Type: `Ticket Purchases`
   - Press Enter

### 5.2 Add Column Headers

1. In the first row, add these column headers (one per cell, left to right):

   | A | B | C | D | E | F | G | H | I | J | K |
   |---|---|---|---|---|---|---|---|---|---|---|
   | order_reference | customer_name | customer_email | customer_phone | quantity | amount_total | stripe_session_id | stripe_payment_intent_id | status | created_at | updated_at |

2. How to add headers:
   - Click on cell **A1**
   - Type: `order_reference`
   - Press **Tab** to move to B1
   - Type: `customer_name`
   - Press **Tab** to move to C1
   - Continue for all columns...

3. Press Enter when done with the last column

### 5.3 Format the Headers (Optional but recommended)

1. Select all header cells (A1:K1)
   - Click on A1, then Shift+Click on K1
2. Make them bold:
   - Click the **Bold** button (or Ctrl+B)
3. Add background color:
   - Click **Fill color** icon
   - Choose a light gray or blue color

### 5.4 Get the Sheet ID

1. Look at the URL in your browser:
   ```
   https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
   ```

2. Copy the **SHEET_ID** (the long string between `/d/` and `/edit`)
   - Example: `1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t`

3. Save this in your backend `.env`:
   ```env
   GOOGLE_SHEETS_ID=1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t
   ```

### 5.5 Share Sheet with Service Account

**This is CRITICAL - without this, the API won't have access!**

1. Click the **"Share"** button (top-right)
2. In the "Share with people and groups" box, paste your service account email:
   ```
   seminar-booking-api@seminar-booking-789456.iam.gserviceaccount.com
   ```
3. In the dropdown that appears, select **"Editor"**
   - This gives the service account permission to write data
4. Click **"Share"**
5. You might get a warning that this email doesn't have a Google account
   - This is normal - click **"Share anyway"**

### 5.6 Verify Sheet Setup

Your sheet should now look like this:

```
┌──────────────────────────────────────────────────────────────┐
│ Ticket Purchases          [Share] [Share]                    │
├──────────────────────────────────────────────────────────────┤
│ A              B               C              D         E     │
│ order_ref      customer_name   customer_email phone    qty    │
│ F              G               H              I        J      │
│ amount_total   stripe_session  stripe_payment status  created │
│                                                                 │
│ K                                                              │
│ updated_at                                                     │
└──────────────────────────────────────────────────────────────┘
```

---

## Step 6: Create Gmail App Password (for Email Confirmations)

### 6.1 Enable 2-Factor Authentication

**Note:** Gmail app passwords require 2FA to be enabled on your account

1. Go to [myaccount.google.com](https://myaccount.google.com)
2. In the left sidebar, click **"Security"**
3. Scroll down to **"2-Step Verification"**
4. If not enabled, click **"Enable"** and follow the prompts:
   - Verify your phone number
   - Follow SMS verification
   - Complete the setup

### 6.2 Create App Password

1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Or: Go to **Security** → Scroll to **App passwords** (only shows if 2FA is enabled)

2. Select:
   - **Select the app:** `Mail`
   - **Select the device:** `Windows Computer` (or your device type)

3. Click **"Generate"**

4. A popup shows your app password:
   ```
   Your app password
   
   abc def ghi jkl
   ```

5. Copy this password (without spaces)
   - Copy: `abcdefghijklmno` (the actual password shown to you)

### 6.3 Store in Backend .env

1. Open your backend `.env` file
2. Add:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=abcdefghijklmno
   ```

   Where:
   - `EMAIL_USER` = your Gmail address (the one where you enabled 2FA)
   - `EMAIL_PASSWORD` = the app password you just generated

### 6.4 Keep the Backup Code Safe

1. Google shows you a backup code
2. Take a screenshot or save it somewhere safe
3. You can use this if you lose access to your app password

---

## Summary of Configuration

By now, you should have collected these values:

```env
# Google Cloud Project
GOOGLE_SHEETS_ID=YOUR_SHEET_ID_HERE

# Service Account
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...full JSON...}

# Gmail (for confirmations)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

---

## Troubleshooting

### Problem: "Permission denied" when accessing sheet

**Solution:**
1. Make sure the sheet is shared with the service account email
2. Service account should have "Editor" role, not "Viewer"
3. Wait 1-2 minutes after sharing for permissions to propagate

### Problem: "Service account not found"

**Solution:**
1. Verify the email is correct (copy from the JSON key file)
2. Check you're in the right Google Cloud project
3. Verify the service account is enabled (check Credentials page)

### Problem: "App password not working"

**Solution:**
1. Make sure 2-Factor Authentication is enabled on your Gmail account
2. Verify you're using the generated password, not your regular Gmail password
3. Check for typos in the email/password in `.env`
4. Regenerate a new app password

### Problem: "Google Sheets API not enabled"

**Solution:**
1. Go back to APIs & Services → Library
2. Search for "Google Sheets API"
3. Click "Enable" again
4. Wait for confirmation

### Problem: JSON key format error

**Solution:**
1. Make sure the entire JSON is on one line (no newlines)
2. Remove all line breaks and replace with spaces if needed
3. The string should start with `{"type":"service_account"...` and end with `}`

---

## Testing Your Setup

Once everything is configured, test with this simple check:

1. Open your backend `.env` file
2. Verify all values are present:
   ```env
   GOOGLE_SHEETS_ID=xxx
   GOOGLE_SERVICE_ACCOUNT_EMAIL=xxx
   GOOGLE_SERVICE_ACCOUNT_KEY=xxx
   EMAIL_USER=xxx
   EMAIL_PASSWORD=xxx
   ```

3. Start your backend: `node server.js`
4. You should see no errors

5. Test from frontend:
   - Fill in booking form
   - Complete payment
   - Check Google Sheet - new row should appear!

---

## What Happens Next

Once configured:

1. **User fills booking form** → TicketModal component
2. **User pays with Stripe** → Payment processed
3. **Webhook received** → Backend webhook handler
4. **Google Sheet updated** → New row added automatically
5. **Confirmation email sent** → Via Gmail SMTP
6. **Success page shows** → User sees confirmation

---

## Security Notes

⚠️ **Important:**
- ✅ Keep your `service_account_key.json` file safe
- ✅ Never commit `.env` files to Git
- ✅ Never share your app password publicly
- ✅ The JSON key allows anyone to write to your sheet
- ✅ Store all credentials on backend only, never in frontend

---

## Next Steps

1. ✅ Complete all 6 steps above
2. ✅ Add credentials to your backend `.env`
3. ✅ Start backend server
4. ✅ Follow [QUICK_START.md](./QUICK_START.md) for full setup
5. ✅ Test the payment flow

---

## Support

If you get stuck:
- Review the detailed steps above
- Check the troubleshooting section
- Verify all prerequisites are met
- Review [BACKEND_SETUP.md](./BACKEND_SETUP.md) for API documentation
- Check [.env.example](./.env.example) for all required variables

Good luck! 🚀
