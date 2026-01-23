# Backend API Setup Guide

## Overview

This web app now uses:
- **Google Sheets** for storing ticket purchase data
- **Stripe** for payment processing

The frontend calls backend APIs to handle payments and data storage securely.

## Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Frontend Environment Variables
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key_here
VITE_GOOGLE_SHEETS_SHEET_ID=your_sheet_id_here
VITE_API_BASE=https://your-backend-domain.com
VITE_SUCCESS_URL=https://your-domain.com/payment-success
VITE_CANCEL_URL=https://your-domain.com/
```

## Backend API Endpoints

### 1. Create Checkout Session

**Endpoint:** `POST /api/create-checkout-session`

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "john@example.com",
  "phone": "+44 7700 900000",
  "quantity": 2,
  "ticketPrice": 10,
  "successUrl": "https://your-domain.com/payment-success",
  "cancelUrl": "https://your-domain.com/"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/pay/cs_...",
  "sessionId": "cs_..."
}
```

**Backend Implementation (Node.js/Express):**

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { GoogleSpreadsheet } = require('google-spreadsheet');

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { name, email, phone, quantity, ticketPrice, successUrl, cancelUrl } = req.body;

    // Generate order reference
    const orderRef = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'Seminar Tickets',
              description: `${quantity} ticket(s) for Friday, 14 March 2026`,
            },
            unit_amount: ticketPrice * 100, // Amount in pence
          },
          quantity: quantity,
        },
      ],
      mode: 'payment',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&order_ref=${orderRef}`,
      cancel_url: cancelUrl,
      customer_email: email,
      metadata: {
        orderRef,
        name,
        phone: phone || '',
      },
    });

    // Add initial record to Google Sheets with "pending" status
    await addToGoogleSheets({
      order_reference: orderRef,
      customer_name: name,
      customer_email: email,
      customer_phone: phone || '',
      quantity: quantity,
      amount_total: ticketPrice * quantity * 100,
      stripe_session_id: session.id,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    res.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      error: error.message || 'Failed to create checkout session',
    });
  }
});
```

### 2. Verify Payment Session

**Endpoint:** `GET /api/verify-session/:sessionId`

**Response:**
```json
{
  "sessionId": "cs_...",
  "status": "complete",
  "paymentStatus": "paid",
  "amountTotal": 2000,
  "customerEmail": "john@example.com"
}
```

**Backend Implementation:**

```javascript
app.get('/api/verify-session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    res.json({
      sessionId: session.id,
      status: session.payment_status,
      amountTotal: session.amount_total,
      customerEmail: session.customer_email,
      metadata: session.metadata,
    });
  } catch (error) {
    console.error('Error verifying session:', error);
    res.status(500).json({ error: error.message });
  }
});
```

### 3. Get Ticket Purchase

**Endpoint:** `GET /api/tickets/:orderReference`

**Response:**
```json
{
  "order_reference": "ORDER-...",
  "customer_name": "John Smith",
  "customer_email": "john@example.com",
  "quantity": 2,
  "amount_total": 2000,
  "status": "completed",
  "created_at": "2026-01-22T10:00:00Z"
}
```

### 4. Add Ticket Purchase

**Endpoint:** `POST /api/tickets`

**Request Body:**
```json
{
  "order_reference": "ORDER-...",
  "customer_name": "John Smith",
  "customer_email": "john@example.com",
  "customer_phone": "+44 7700 900000",
  "quantity": 2,
  "amount_total": 2000,
  "stripe_session_id": "cs_...",
  "status": "pending"
}
```

### 5. Update Ticket Purchase

**Endpoint:** `PATCH /api/tickets/:orderReference`

**Request Body:**
```json
{
  "status": "completed",
  "stripe_payment_intent_id": "pi_..."
}
```

## Stripe Webhook Setup

Set up a webhook endpoint to handle Stripe events:

**Endpoint:** `POST /api/webhooks/stripe`

**Backend Implementation:**

```javascript
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

app.post('/api/webhooks/stripe', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      
      // Update Google Sheets with completed status
      await updateGoogleSheets(session.metadata.orderRef, {
        status: 'completed',
        stripe_payment_intent_id: session.payment_intent,
        updated_at: new Date().toISOString(),
      });

      // Send confirmation email to customer
      await sendConfirmationEmail({
        email: session.customer_email,
        name: session.metadata.name,
        orderRef: session.metadata.orderRef,
        quantity: session.metadata.quantity,
      });

      break;

    case 'checkout.session.expired':
      const expiredSession = event.data.object;
      
      // Update status to failed
      await updateGoogleSheets(expiredSession.metadata.orderRef, {
        status: 'failed',
        updated_at: new Date().toISOString(),
      });

      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({received: true});
});
```

## Google Sheets Setup

### Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Google Sheets API
4. Create a service account and download the JSON key file

### Create Spreadsheet

Create a Google Sheet with these columns:

| Column | Type | Description |
|--------|------|-------------|
| order_reference | Text | Unique order ID |
| customer_name | Text | Customer's full name |
| customer_email | Email | Customer's email |
| customer_phone | Text | Customer's phone number |
| quantity | Number | Number of tickets |
| amount_total | Number | Total amount in pence |
| stripe_session_id | Text | Stripe session ID |
| stripe_payment_intent_id | Text | Stripe payment intent ID |
| status | Text | pending/completed/failed |
| created_at | Timestamp | Record creation time |
| updated_at | Timestamp | Last update time |

### Backend Google Sheets Integration

```javascript
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_ID, serviceAccountAuth);

async function addToGoogleSheets(data) {
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];
  
  await sheet.addRow({
    order_reference: data.order_reference,
    customer_name: data.customer_name,
    customer_email: data.customer_email,
    customer_phone: data.customer_phone,
    quantity: data.quantity,
    amount_total: data.amount_total,
    stripe_session_id: data.stripe_session_id || '',
    stripe_payment_intent_id: data.stripe_payment_intent_id || '',
    status: data.status,
    created_at: data.created_at,
    updated_at: data.updated_at,
  });
}

async function updateGoogleSheets(orderRef, updates) {
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];
  const rows = await sheet.getRows();
  
  const row = rows.find(r => r.order_reference === orderRef);
  if (row) {
    for (const [key, value] of Object.entries(updates)) {
      row[key] = value;
    }
    await row.save();
  }
}

async function getFromGoogleSheets(orderRef) {
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];
  const rows = await sheet.getRows();
  
  return rows.find(r => r.order_reference === orderRef);
}
```

## Environment Setup Checklist

- [ ] Create Stripe account and get API keys
- [ ] Create Google Cloud Project and service account
- [ ] Create Google Sheet for ticket purchases
- [ ] Set up backend API endpoints
- [ ] Configure environment variables
- [ ] Set up Stripe webhook endpoint
- [ ] Set up email confirmation service
- [ ] Test the complete payment flow

## Testing

### Test Payment Flow

1. Start the dev server: `npm run dev`
2. Click "Book Your Seat" button
3. Fill in test details
4. Use Stripe test card: `4242 4242 4242 4242`
5. Verify payment success page appears
6. Check Google Sheet for new entry

### Stripe Test Cards

- **Success:** `4242 4242 4242 4242`
- **Declined:** `4000 0000 0000 0002`
- **Auth Required:** `4000 2500 0000 3155`

## Security Considerations

1. **Never expose Stripe Secret Key** - Keep it only on the backend
2. **Use HTTPS** - All API calls must use HTTPS
3. **Validate requests** - Verify webhook signatures from Stripe
4. **Secure credentials** - Store Google Sheets credentials securely
5. **Rate limiting** - Implement rate limiting on API endpoints
6. **CORS** - Configure CORS properly for your domain

## Support

For issues or questions:
- Stripe Docs: https://stripe.com/docs
- Google Sheets API: https://developers.google.com/sheets/api
- Contact backend team for API support
