# Environment Variables Setup Guide

This guide explains all the environment variables needed for both the frontend and backend.

## Frontend Environment Variables

Create a `.env` file in the root of your frontend project (same directory as `package.json`).

### Required Variables

```env
# Stripe Publishable Key
# Get this from: https://dashboard.stripe.com/apikeys
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Backend API Base URL
# For local development: http://localhost:3001
# For production: https://api.yourdomain.com
VITE_API_BASE=http://localhost:3001
```

### Optional Variables

```env
# Custom Success/Cancel URLs (defaults to current origin if not set)
VITE_SUCCESS_URL=http://localhost:5173/?payment=success
VITE_CANCEL_URL=http://localhost:5173/?payment=cancelled

# Google Sheets ID (only needed if accessing from frontend)
VITE_GOOGLE_SHEETS_SHEET_ID=your_google_sheet_id_here
```

### How to Get Stripe Publishable Key

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** → **API keys**
3. Copy the **Publishable key** (starts with `pk_test_` for test mode or `pk_live_` for live mode)
4. Paste it into your `.env` file

---

## Backend Environment Variables

Create a `.env` file in the root of your backend project (where `server.js` or `index.js` is located).

### Required Variables

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Google Sheets Configuration
GOOGLE_SHEETS_ID=your_google_sheet_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
```

### How to Get Each Variable

#### 1. Stripe Secret Key

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** → **API keys**
3. Copy the **Secret key** (starts with `sk_test_` for test mode or `sk_live_` for live mode)
4. **Important**: Never commit this to version control!

#### 2. Stripe Webhook Secret

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** → **Webhooks**
3. Click **Add endpoint** or select an existing endpoint
4. Set the endpoint URL to: `https://your-backend-domain.com/api/webhooks/stripe`
5. Select events: `checkout.session.completed` and `checkout.session.expired`
6. After creating, click on the webhook and copy the **Signing secret** (starts with `whsec_`)

#### 3. Google Sheets Configuration

**Step 1: Create Google Cloud Project**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Sheets API**

**Step 2: Create Service Account**
1. Navigate to **IAM & Admin** → **Service Accounts**
2. Click **Create Service Account**
3. Give it a name (e.g., "seminar-backend")
4. Click **Create and Continue**
5. Skip role assignment (or add "Editor" if needed)
6. Click **Done**

**Step 3: Create and Download Key**
1. Click on the service account you just created
2. Go to **Keys** tab
3. Click **Add Key** → **Create new key**
4. Choose **JSON** format
5. Download the JSON file

**Step 4: Extract Values from JSON**
Open the downloaded JSON file and extract:
- `client_email` → This is your `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `private_key` → This is your `GOOGLE_SERVICE_ACCOUNT_KEY` (keep the quotes and `\n` characters)

**Step 5: Share Google Sheet**
1. Open your Google Sheet
2. Click **Share** button
3. Add the service account email (from Step 4)
4. Give it **Editor** permissions
5. Copy the Sheet ID from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
   - This is your `GOOGLE_SHEETS_ID`

#### 4. Email Configuration (Gmail Example)

**Step 1: Enable 2-Factor Authentication**
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled

**Step 2: Create App Password**
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select **Mail** and **Other (Custom name)**
3. Enter "Seminar Backend" as the name
4. Click **Generate**
5. Copy the 16-character password (this is your `EMAIL_PASSWORD`)

**Step 3: Set Email Variables**
- `EMAIL_USER`: Your Gmail address (e.g., `yourname@gmail.com`)
- `EMAIL_PASSWORD`: The 16-character app password from Step 2

---

## Production Environment Variables

For production, update these values:

### Frontend (.env.production)

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_API_BASE=https://api.yourdomain.com
```

### Backend (.env.production)

```env
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Important Notes:**
- Use `pk_live_` and `sk_live_` keys for production (not `pk_test_` or `sk_test_`)
- Update webhook endpoint URL in Stripe dashboard to your production backend URL
- Never commit `.env` files to version control
- Add `.env` to your `.gitignore` file

---

## Security Best Practices

1. **Never commit `.env` files** - Add them to `.gitignore`
2. **Use different keys for development and production**
3. **Rotate keys regularly** if compromised
4. **Use environment-specific files** (`.env.development`, `.env.production`)
5. **Restrict API key permissions** in Stripe dashboard
6. **Use app-specific passwords** for email (not your main password)

---

## Testing Your Configuration

### Frontend
1. Start your dev server: `npm run dev`
2. Check browser console for any missing environment variable errors
3. Try accessing the booking or book purchase pages

### Backend
1. Start your server: `node server.js` or `npm start`
2. Check console for successful connection messages
3. Test health endpoint: `curl http://localhost:3001/health`
4. Check for any missing environment variable errors in console

---

## Troubleshooting

### Frontend Issues

**Error: "Stripe publishable key is not configured"**
- Check that `VITE_STRIPE_PUBLISHABLE_KEY` is set in `.env`
- Restart your dev server after adding environment variables
- Make sure variable name starts with `VITE_` (required for Vite)

**Error: "Failed to create checkout session"**
- Check that `VITE_API_BASE` points to your running backend
- Verify backend is running and accessible
- Check browser network tab for API errors

### Backend Issues

**Error: "Stripe secret key is not configured"**
- Check that `STRIPE_SECRET_KEY` is set in `.env`
- Verify the key starts with `sk_test_` or `sk_live_`
- Restart server after adding environment variables

**Error: "Google Sheets authentication failed"**
- Verify `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_SERVICE_ACCOUNT_KEY` are correct
- Check that service account has access to the Google Sheet
- Ensure private key includes `\n` characters (newlines)

**Error: "Email sending failed"**
- Verify `EMAIL_USER` and `EMAIL_PASSWORD` are correct
- For Gmail, ensure you're using an App Password (not your regular password)
- Check that 2FA is enabled on your Google account

---

## Example .env Files

### Frontend `.env`
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51AbC123...
VITE_API_BASE=http://localhost:3001
```

### Backend `.env`
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

STRIPE_SECRET_KEY=sk_test_51XyZ789...
STRIPE_WEBHOOK_SECRET=whsec_abc123...

GOOGLE_SHEETS_ID=1a2b3c4d5e6f7g8h9i0j
GOOGLE_SERVICE_ACCOUNT_EMAIL=seminar-backend@my-project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"

EMAIL_USER=yourname@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

---

## Quick Checklist

- [ ] Frontend `.env` file created with `VITE_STRIPE_PUBLISHABLE_KEY` and `VITE_API_BASE`
- [ ] Backend `.env` file created with all required variables
- [ ] Stripe keys obtained from Stripe Dashboard
- [ ] Google Sheets service account created and key downloaded
- [ ] Google Sheet shared with service account email
- [ ] Email app password created (for Gmail)
- [ ] Stripe webhook endpoint configured
- [ ] `.env` files added to `.gitignore`
- [ ] Both frontend and backend servers can start without errors

