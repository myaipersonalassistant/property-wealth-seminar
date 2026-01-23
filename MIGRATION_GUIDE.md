# Migration Guide: Supabase → Google Sheets + Stripe

## Overview

This document guides you through migrating from Supabase to Google Sheets for data storage and implementing Stripe for payments.

## What Changed

### Before (Supabase)
- Supabase PostgreSQL database for storing tickets
- Supabase Edge Functions for creating Stripe checkout sessions
- Direct database queries from components

### After (Google Sheets + Stripe)
- Google Sheets for storing ticket data
- Backend API for handling Stripe payments
- Centralized backend for data and payment operations

## Quick Start

### 1. Frontend Changes

#### New Service Files Created

**`src/lib/stripe.ts`** - Stripe payment integration
```typescript
import { createCheckoutSession } from '@/lib/stripe';

// Usage
const result = await createCheckoutSession({
  name: "John Smith",
  email: "john@example.com",
  phone: "+44 7700 900000",
  quantity: 2,
  ticketPrice: 10,
});

if (result.url) {
  window.location.href = result.url;
}
```

**`src/lib/google-sheets.ts`** - Google Sheets data storage
```typescript
import { getTicketPurchase } from '@/lib/google-sheets';

// Usage
const ticket = await getTicketPurchase('ORDER-123456');
console.log(ticket.customer_name, ticket.quantity);
```

#### Components Updated

**`src/components/TicketModal.tsx`**
- Removed: `import { supabase } from '@/lib/supabase'`
- Added: `import { createCheckoutSession } from '@/lib/stripe'`
- Changed: Supabase edge function call → Stripe API call

**`src/components/PaymentSuccess.tsx`**
- Removed: Supabase database query
- Added: Google Sheets API call via `getTicketPurchase()`

### 2. Backend Setup

You need to create a backend server to handle:
- Creating Stripe checkout sessions
- Managing Stripe webhooks
- Writing to Google Sheets
- Sending confirmation emails

#### Option A: Use Node.js/Express (Recommended)

Sample server provided in `server.js.sample`

**Installation:**
```bash
npm install express stripe google-spreadsheet google-auth-library nodemailer cors dotenv
```

**Copy and customize:**
```bash
cp server.js.sample server.js
```

**Set up environment variables** (see `.env.example`):
```bash
cp .env.example .env
```

**Start the server:**
```bash
node server.js
```

#### Option B: Use Existing Backend

If you have an existing backend, add these endpoints:

- `POST /api/create-checkout-session` - Create Stripe session
- `GET /api/verify-session/:sessionId` - Verify payment
- `GET /api/tickets/:orderReference` - Get ticket details
- `POST /api/tickets` - Create ticket record
- `PATCH /api/tickets/:orderReference` - Update ticket record
- `POST /api/webhooks/stripe` - Handle Stripe webhooks

See `BACKEND_SETUP.md` for detailed endpoint specifications.

### 3. Environment Configuration

#### Frontend (`.env`)
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
VITE_GOOGLE_SHEETS_SHEET_ID=your_sheet_id
VITE_API_BASE=https://your-backend.com
VITE_SUCCESS_URL=https://your-domain.com/payment-success
VITE_CANCEL_URL=https://your-domain.com/
```

#### Backend (`.env`)
```env
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
GOOGLE_SHEETS_ID=your_sheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=service@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_KEY={json_key_as_string}
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

See `.env.example` for complete instructions on obtaining credentials.

## Step-by-Step Implementation

### Phase 1: Get Credentials (1-2 hours)

1. **Create Stripe Account**
   - Go to stripe.com
   - Create account
   - Get API keys from Dashboard → Developers → API Keys
   - Create webhook endpoint

2. **Set up Google Cloud**
   - Go to console.cloud.google.com
   - Create new project
   - Enable Google Sheets API
   - Create service account
   - Download JSON credentials

3. **Create Google Sheet**
   - Create new spreadsheet at sheets.google.com
   - Add column headers
   - Share with service account email
   - Copy Sheet ID

### Phase 2: Deploy Backend (2-4 hours)

1. **Choose Hosting**
   - Heroku (free tier available)
   - Railway
   - Render
   - AWS Lambda + API Gateway
   - Your own server

2. **Set up Deployment**
   - Clone/create backend repository
   - Add `server.js` from sample
   - Configure environment variables on hosting platform
   - Deploy

3. **Test Backend**
   ```bash
   curl https://your-backend.com/health
   # Should return: {"status":"OK"}
   ```

4. **Configure Stripe Webhook**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://your-backend.com/api/webhooks/stripe`
   - Select events: `checkout.session.completed`, `checkout.session.expired`
   - Copy signing secret to backend `.env`

### Phase 3: Update Frontend (1 hour)

1. **Install/Update Dependencies** (if needed)
   ```bash
   npm install
   ```

2. **Update Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Test Integration**
   ```bash
   npm run dev
   ```

4. **Build and Deploy**
   ```bash
   npm run build
   npm run preview
   # Deploy to Vercel, Netlify, or your host
   ```

### Phase 4: Testing (1-2 hours)

1. **Test Payment Flow**
   - Click "Book Your Seat"
   - Fill in test details
   - Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date and CVC (e.g., 12/25, 123)
   - Verify success page

2. **Verify Data Storage**
   - Check Google Sheet for new entry
   - Verify all fields populated correctly

3. **Verify Email**
   - Check inbox/spam for confirmation email
   - Verify content and links

4. **Test Edge Cases**
   - Expired checkout session
   - Network errors
   - Invalid data submission

## File Changes Summary

### New Files Created
- `src/lib/stripe.ts` - Stripe integration service
- `src/lib/google-sheets.ts` - Google Sheets service
- `BACKEND_SETUP.md` - Backend implementation guide
- `server.js.sample` - Sample Node.js backend
- `.env.example` - Environment configuration template

### Modified Files
- `src/components/TicketModal.tsx` - Updated payment handling
- `src/components/PaymentSuccess.tsx` - Updated data fetching
- `src/lib/supabase.ts` - Deprecated (kept for reference)

### Removed from package.json (optional)
- `@supabase/supabase-js` - No longer needed

## API Response Examples

### Create Checkout Session
**Request:**
```bash
POST /api/create-checkout-session
Content-Type: application/json

{
  "name": "John Smith",
  "email": "john@example.com",
  "phone": "+44 7700 900000",
  "quantity": 2,
  "ticketPrice": 10,
  "successUrl": "https://example.com/payment-success",
  "cancelUrl": "https://example.com/"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/pay/cs_live_...",
  "sessionId": "cs_live_..."
}
```

### Get Ticket Purchase
**Request:**
```bash
GET /api/tickets/ORDER-1234567890-ABC123
```

**Response:**
```json
{
  "order_reference": "ORDER-1234567890-ABC123",
  "customer_name": "John Smith",
  "customer_email": "john@example.com",
  "customer_phone": "+44 7700 900000",
  "quantity": 2,
  "amount_total": 2000,
  "stripe_session_id": "cs_live_...",
  "stripe_payment_intent_id": "pi_...",
  "status": "completed",
  "created_at": "2026-01-22T10:00:00Z",
  "updated_at": "2026-01-22T10:05:00Z"
}
```

## Troubleshooting

### Issue: "Stripe publishable key is not configured"
**Solution:** 
- Check `.env` file has `VITE_STRIPE_PUBLISHABLE_KEY`
- Verify key starts with `pk_`
- Restart dev server after changing .env

### Issue: "Failed to create checkout session"
**Solution:**
- Verify backend is running and accessible
- Check `VITE_API_BASE` points to correct backend
- Review backend logs for errors
- Verify Stripe API keys on backend

### Issue: Google Sheet not updating
**Solution:**
- Verify service account email has editor access to sheet
- Check sheet column names match exactly
- Verify `GOOGLE_SHEETS_ID` is correct
- Review backend logs

### Issue: Confirmation email not received
**Solution:**
- Verify Gmail credentials on backend
- Check app-specific password is being used
- Review backend logs for email errors
- Check spam folder

### Issue: Webhook not firing
**Solution:**
- Verify webhook URL is public and accessible
- Check webhook signing secret in `.env`
- Review Stripe webhook logs
- Test manually via Stripe dashboard

## Security Checklist

- [ ] Never commit `.env` files to git
- [ ] Use HTTPS for all API calls
- [ ] Verify Stripe webhook signatures
- [ ] Store sensitive keys only on backend
- [ ] Use environment variables for all credentials
- [ ] Validate all user inputs on backend
- [ ] Implement rate limiting on API endpoints
- [ ] Set up CORS properly (whitelist your domain)
- [ ] Enable 2FA on Stripe and Google accounts
- [ ] Regularly rotate API keys

## Performance Optimization

1. **Caching**
   - Cache ticket details for 1 minute
   - Reduce Google Sheets API calls

2. **Database**
   - Use sheet ranges instead of reading all rows
   - Batch operations when possible

3. **API**
   - Implement request throttling
   - Cache successful responses

## Next Steps

1. **Email Customization**
   - Customize confirmation email template in backend
   - Add event details and venue information

2. **Payment Confirmation**
   - Send invoice PDFs
   - Store PDFs in cloud storage

3. **Admin Dashboard**
   - Create admin interface for viewing purchases
   - Generate reports and analytics

4. **Automated Reminders**
   - Send reminder email before event
   - SMS reminders (Twilio integration)

## Support Resources

- **Stripe:** https://stripe.com/docs
- **Google Sheets API:** https://developers.google.com/sheets/api
- **Express.js:** https://expressjs.com
- **Nodemailer:** https://nodemailer.com

## Questions?

If you encounter issues during migration:
1. Check the troubleshooting section above
2. Review the relevant setup document
3. Check service documentation for specific errors
4. Review backend console logs and error messages
