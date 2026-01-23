# Integration Checklist & Architecture

## Implementation Checklist

### Phase 1: Preparation (30 minutes)

- [ ] Create Stripe account at stripe.com
- [ ] Create Google Cloud project at console.cloud.google.com
- [ ] Enable Google Sheets API in Google Cloud
- [ ] Create service account and download JSON key
- [ ] Create Google Sheet with proper column headers
- [ ] Get Stripe API keys (publishable and secret)
- [ ] Create Gmail app-specific password (for email confirmations)

### Phase 2: Frontend Configuration (15 minutes)

- [ ] Copy `.env.example` to `.env`
- [ ] Add Stripe publishable key to `.env`
- [ ] Add Google Sheets Sheet ID to `.env`
- [ ] Set API_BASE to backend URL (http://localhost:3001 for dev)
- [ ] Set SUCCESS_URL and CANCEL_URL
- [ ] Run `npm install` to ensure dependencies are installed
- [ ] Test with `npm run dev`

### Phase 3: Backend Setup (45 minutes)

- [ ] Create backend directory and copy `server.js.sample` to `server.js`
- [ ] Install Node.js dependencies
- [ ] Copy `.env.example` to backend `.env`
- [ ] Add Stripe secret key
- [ ] Add Stripe webhook secret
- [ ] Add Google Sheets credentials
- [ ] Add Gmail credentials
- [ ] Test backend with `node server.js`
- [ ] Verify `/health` endpoint returns OK

### Phase 4: Stripe Configuration (15 minutes)

- [ ] Log in to Stripe Dashboard
- [ ] Go to Developers → Webhooks
- [ ] Add webhook endpoint (e.g., http://localhost:3001/api/webhooks/stripe for local testing)
- [ ] Select events: `checkout.session.completed`, `checkout.session.expired`
- [ ] Copy webhook signing secret to backend `.env`
- [ ] Test webhook in Stripe dashboard

### Phase 5: Testing (30 minutes)

- [ ] Start frontend: `npm run dev`
- [ ] Start backend: `node server.js`
- [ ] Click "Book Your Seat" button
- [ ] Fill in test form (Name, Email, Phone optional, Quantity)
- [ ] Complete checkout with test card: `4242 4242 4242 4242`
- [ ] Verify success page displays
- [ ] Check Google Sheet for new entry
- [ ] Verify confirmation email received
- [ ] Test cancellation by closing checkout without paying
- [ ] Verify "pending" status stays in Google Sheet

### Phase 6: Production Deployment (1-2 hours)

- [ ] Choose hosting for frontend (Vercel, Netlify, etc.)
- [ ] Choose hosting for backend (Heroku, Railway, Render, etc.)
- [ ] Set up production Stripe API keys (pk_live_, sk_live_)
- [ ] Deploy frontend
- [ ] Deploy backend
- [ ] Configure production environment variables
- [ ] Update Stripe webhook URL to production backend
- [ ] Test full flow on production
- [ ] Set up monitoring and error tracking

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                            │
├─────────────────────────────────────────────────────────────────┤
│                   React Frontend (src/)                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ TicketModal Component                                    │  │
│  │ - Collects booking details                              │  │
│  │ - Calls createCheckoutSession() from stripe.ts          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓↑                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ PaymentSuccess Component                                 │  │
│  │ - Shows confirmation                                    │  │
│  │ - Calls getTicketPurchase() from google-sheets.ts      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
           ↓↑                                    ↓
           │                                    │
      API Calls                          Stripe Redirect
           │                                    │
┌──────────┴────────────────┐                   │
│   Backend API Server       │                   │
│   (Node.js + Express)      │                   │
├────────────────────────────┤                   │
│ POST /api/create-checkout  │◄──────────────────┤
│  - Creates Stripe session  │
│  - Creates Google Sheet row│
│  - Returns checkout URL    │
├────────────────────────────┤
│ POST /webhooks/stripe      │◄──Stripe Webhook ─┐
│  - Receives payment event  │                   │
│  - Updates Google Sheet    │
│  - Sends confirmation email│
├────────────────────────────┤
│ GET /api/tickets/:orderRef │
│  - Fetches from Google Sheets
│  - Returns order details
└────────────────────────────┘
           ↓↑
    ┌──────┴─────┬──────────┬──────────────┐
    │            │          │              │
┌───▼──┐  ┌──────▼──┐ ┌────▼────┐ ┌──────▼──┐
│Stripe│  │ Google  │ │  Gmail  │ │Database │
│API   │  │ Sheets  │ │  SMTP   │ │(legacy) │
└──────┘  │ API     │ │         │ └─────────┘
          │  (Data) │ │(Emails) │
          └─────────┘ └─────────┘
```

### Data Flow

#### Payment Processing Flow

```
1. User Booking
   ├─ Opens ticket modal
   ├─ Enters name, email, phone, quantity
   └─ Clicks "Proceed to Payment"

2. Frontend Processing
   ├─ Validates form data
   ├─ Calls stripe.ts::createCheckoutSession()
   └─ Sends POST to backend

3. Backend Processing
   ├─ Generates unique order reference
   ├─ Creates Stripe checkout session
   │  └─ Line items: quantity × price
   │  └─ Metadata: order ref, customer info
   ├─ Adds row to Google Sheets (status: pending)
   └─ Returns checkout URL

4. Frontend Redirect
   ├─ Receives checkout URL
   ├─ Redirects user to Stripe Checkout
   └─ User completes payment on Stripe

5. Stripe Processes Payment
   ├─ Validates card
   ├─ Processes payment
   ├─ Sends webhook to backend
   └─ Redirects to success URL

6. Backend Webhook Handler
   ├─ Receives checkout.session.completed event
   ├─ Verifies webhook signature
   ├─ Updates Google Sheet (status: completed)
   │  ├─ Adds stripe_payment_intent_id
   │  └─ Updates timestamp
   ├─ Sends confirmation email
   └─ Logs transaction

7. Frontend Success Page
   ├─ Receives order_ref from URL parameter
   ├─ Fetches ticket details from backend
   ├─ Displays confirmation with order details
   └─ Shows event information
```

#### Data Storage Structure

```
Google Sheets: Ticket Purchases
┌─────────────────────────────────────────────────────────────────┐
│ Row │ Field                    │ Type      │ Example             │
├─────┼──────────────────────────┼───────────┼─────────────────────┤
│  1  │ order_reference          │ String    │ ORDER-1234567890... │
│  2  │ customer_name            │ String    │ John Smith          │
│  3  │ customer_email           │ Email     │ john@example.com    │
│  4  │ customer_phone           │ String    │ +44 7700 900000     │
│  5  │ quantity                 │ Number    │ 2                   │
│  6  │ amount_total             │ Number    │ 2000 (pence)        │
│  7  │ stripe_session_id        │ String    │ cs_live_...         │
│  8  │ stripe_payment_intent_id │ String    │ pi_...              │
│  9  │ status                   │ String    │ pending|completed   │
│ 10  │ created_at               │ Timestamp │ 2026-01-22T...      │
│ 11  │ updated_at               │ Timestamp │ 2026-01-22T...      │
└─────┴──────────────────────────┴───────────┴─────────────────────┘
```

### Component Communication

```
TicketModal (Book)
    ↓
    ├─ imports: createCheckoutSession from stripe.ts
    ├─ calls: createCheckoutSession({...})
    ├─ receives: { url, sessionId } or { error }
    ├─ redirects: window.location.href = url
    └─ → Stripe Checkout

PaymentSuccess (Confirmation)
    ↓
    ├─ imports: getTicketPurchase from google-sheets.ts
    ├─ useEffect: getTicketPurchase(orderRef)
    ├─ receives: TicketPurchase object
    ├─ displays: Order confirmation details
    └─ → Shows in modal
```

### API Endpoints Map

```
Frontend                Backend API                   External Service
┌─────────┐
│ App     │
└────┬────┘
     │
     ├─→ POST /api/create-checkout-session ──→ Stripe API
     │   Req: {name, email, phone, quantity}      (create session)
     │   Res: {url, sessionId}                 ✓ Google Sheets API
     │                                           (create row)
     │
     ├─→ GET /api/tickets/:orderRef ──→ Google Sheets API
     │   Res: {TicketPurchase object}        (read row)
     │
     ├─→ GET /api/verify-session/:sessionId ──→ Stripe API
     │   Res: {status, amountTotal}              (get session)
     │
     └─→ Receives redirect from Stripe
         GET /?session_id=cs_...&order_ref=...
         → Shows PaymentSuccess component
         → Fetches ticket details via API
```

## File Dependencies

```
Frontend Dependencies:
├── stripe.ts
│   ├── imports: environment variables
│   ├── exports: createCheckoutSession(), verifyPaymentSession()
│   └── calls: Backend API
│
├── google-sheets.ts
│   ├── imports: environment variables
│   ├── exports: getTicketPurchase(), addTicketPurchase()
│   └── calls: Backend API
│
├── TicketModal.tsx
│   ├── imports: createCheckoutSession from stripe.ts
│   ├── on-submit: calls createCheckoutSession()
│   └── on-success: redirects to Stripe
│
└── PaymentSuccess.tsx
    ├── imports: getTicketPurchase from google-sheets.ts
    ├── on-mount: calls getTicketPurchase()
    └── on-success: displays confirmation

Backend Dependencies:
├── Express (HTTP server)
├── Stripe (payment processing)
├── Google Spreadsheet (data storage)
├── JWT (Google authentication)
├── Nodemailer (email service)
└── CORS & Middleware
```

## Environment Variable Flow

```
Frontend .env Variables:
├─ VITE_STRIPE_PUBLISHABLE_KEY → stripe.ts → Stripe API
├─ VITE_GOOGLE_SHEETS_SHEET_ID → google-sheets.ts → Backend API
├─ VITE_API_BASE → All API calls → Backend URL
├─ VITE_SUCCESS_URL → TicketModal → Stripe redirect target
└─ VITE_CANCEL_URL → TicketModal → Stripe cancel target

Backend .env Variables:
├─ PORT → Express server
├─ STRIPE_SECRET_KEY → Stripe API calls (backend only)
├─ STRIPE_WEBHOOK_SECRET → Webhook verification
├─ GOOGLE_SHEETS_ID → Google Sheets API
├─ GOOGLE_SERVICE_ACCOUNT_* → Google authentication
├─ EMAIL_USER & EMAIL_PASSWORD → Email service
└─ FRONTEND_URL → CORS configuration
```

## Request/Response Cycles

### Create Checkout Session

```
Frontend:
POST /api/create-checkout-session
{
  "name": "John Smith",
  "email": "john@example.com",
  "phone": "+44 7700 900000",
  "quantity": 2,
  "ticketPrice": 10
}
        ↓
Backend:
1. Generate order_reference
2. Create Stripe session via Stripe API
3. Add row to Google Sheets
4. Return response
        ↓
Response:
{
  "url": "https://checkout.stripe.com/pay/cs_...",
  "sessionId": "cs_..."
}
        ↓
Frontend:
window.location.href = url
(redirects to Stripe Checkout)
```

### Stripe Webhook

```
Stripe Event:
checkout.session.completed
{
  "id": "evt_...",
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_...",
      "metadata": {
        "orderRef": "ORDER-...",
        "name": "John Smith"
      }
    }
  }
}
        ↓
Backend Webhook Handler:
1. Verify signature
2. Extract order reference
3. Update Google Sheet row (status: completed)
4. Send confirmation email
5. Return 200 OK
        ↓
Stripe:
Marks webhook as delivered
(retries if fails)
```

## Monitoring Points

### Frontend Monitoring
- [ ] API call success/failure rates
- [ ] Form submission errors
- [ ] Redirect to Stripe success rate
- [ ] Page load time

### Backend Monitoring
- [ ] API endpoint response times
- [ ] Google Sheets API rate limits
- [ ] Stripe API errors
- [ ] Webhook delivery success rate
- [ ] Email send success rate
- [ ] Database write success rate

### End-to-End Monitoring
- [ ] Payment completion rate
- [ ] Order confirmation email delivery
- [ ] Google Sheet data accuracy
- [ ] User success page loading

## Testing Scenarios

### Happy Path ✅
1. Fill form with valid data
2. Proceed to Stripe checkout
3. Complete payment with valid card
4. Receive success page
5. Check Google Sheet for entry
6. Receive confirmation email

### Payment Declined ❌
1. Fill form with valid data
2. Proceed to Stripe checkout
3. Use declined test card (4000 0000 0000 0002)
4. Payment fails
5. Receive error on Stripe checkout
6. Return to booking form
7. Google Sheet should have "failed" status

### Session Expired ⏱️
1. Fill form with valid data
2. Proceed to Stripe checkout
3. Close browser without completing
4. Stripe session expires
5. Webhook fires with checkout.session.expired
6. Google Sheet status updates to "failed"

### Network Error 🔌
1. Fill form with valid data
2. Disconnect network
3. Click proceed to payment
4. Receive error
5. Reconnect network
6. Try again
7. Should work normally

## Success Criteria

- [ ] Form validation works
- [ ] Stripe checkout launches
- [ ] Payment processes successfully
- [ ] Google Sheet updated with completion
- [ ] Confirmation email sent
- [ ] Success page displays correctly
- [ ] Order reference matches across all systems
- [ ] Webhook signature verification works
- [ ] Error handling displays user-friendly messages
- [ ] Performance is acceptable (<2s response times)
- [ ] Mobile responsive works
- [ ] CORS properly configured
