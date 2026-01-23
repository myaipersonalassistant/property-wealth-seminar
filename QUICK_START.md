# Quick Start Guide

## 5-Minute Setup Checklist

### Prerequisites
- Node.js 16+
- Stripe account
- Google account

### Step 1: Get Credentials (10 mins)

**Stripe:**
1. Sign up at stripe.com
2. Dashboard → Developers → API Keys
3. Copy Publishable Key (pk_...)
4. Copy Secret Key (sk_...)

**Google Sheets:**
1. Create project at console.cloud.google.com
2. Enable Google Sheets API
3. Create Service Account
4. Download JSON key file
5. Share a Google Sheet with service account

### Step 2: Configure Frontend (5 mins)

```bash
# Create .env file
cat > .env << EOF
VITE_STRIPE_PUBLISHABLE_KEY=pk_your_key_here
VITE_GOOGLE_SHEETS_SHEET_ID=your_sheet_id
VITE_API_BASE=http://localhost:3001
VITE_SUCCESS_URL=http://localhost:5173/payment-success?success=true
VITE_CANCEL_URL=http://localhost:5173/
EOF

# Install dependencies
npm install

# Start frontend
npm run dev
```

### Step 3: Set Up Backend (10 mins)

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install express stripe google-spreadsheet google-auth-library nodemailer cors dotenv

# Create .env file
cat > .env << EOF
NODE_ENV=development
PORT=3001
STRIPE_SECRET_KEY=sk_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_test_xxx
GOOGLE_SHEETS_ID=your_sheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=xxx@iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:5173
EOF

# Copy sample server
cp ../server.js.sample server.js

# Start backend
node server.js
```

### Step 4: Test (5 mins)

1. Open http://localhost:5173
2. Click "Book Your Seat"
3. Fill in test details
4. Use card: `4242 4242 4242 4242`, expiry: any future date, CVC: any 3 digits
5. Complete payment
6. Verify success page appears
7. Check Google Sheet for new entry

## Common Commands

### Frontend
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run linter
```

### Backend
```bash
node server.js              # Start server
npm run dev                 # Start with nodemon (auto-reload)
curl http://localhost:3001  # Test if running
```

## File Locations

| File | Purpose |
|------|---------|
| `src/lib/stripe.ts` | Stripe payment integration |
| `src/lib/google-sheets.ts` | Google Sheets data service |
| `src/components/TicketModal.tsx` | Booking form (updated) |
| `src/components/PaymentSuccess.tsx` | Success page (updated) |
| `server.js.sample` | Sample Node.js backend |
| `BACKEND_SETUP.md` | Detailed backend documentation |
| `MIGRATION_GUIDE.md` | Full migration instructions |
| `.env.example` | Environment variable template |

## Environment Variables

### Frontend (`.env`)
```env
VITE_STRIPE_PUBLISHABLE_KEY    # Stripe publishable key (pk_...)
VITE_GOOGLE_SHEETS_SHEET_ID    # Google Sheet ID from URL
VITE_API_BASE                  # Backend API URL
VITE_SUCCESS_URL               # Success redirect URL
VITE_CANCEL_URL                # Cancel redirect URL
```

### Backend (`.env`)
```env
PORT                           # Backend port (default 3001)
STRIPE_SECRET_KEY              # Stripe secret key (sk_...)
STRIPE_WEBHOOK_SECRET          # Stripe webhook secret (whsec_...)
GOOGLE_SHEETS_ID               # Google Sheet ID
GOOGLE_SERVICE_ACCOUNT_EMAIL   # Service account email
GOOGLE_SERVICE_ACCOUNT_KEY     # Service account JSON key
EMAIL_USER                     # Gmail address
EMAIL_PASSWORD                 # Gmail app password
FRONTEND_URL                   # Frontend URL for CORS
```

## Payment Flow

```
User fills form
        ↓
Clicks "Proceed to Payment"
        ↓
Frontend → POST /api/create-checkout-session
        ↓
Backend creates Stripe checkout & Google Sheet entry
        ↓
Returns Stripe checkout URL
        ↓
Frontend redirects to Stripe Checkout
        ↓
User completes payment
        ↓
Stripe webhook → Backend webhook handler
        ↓
Backend updates Google Sheet (status: completed)
        ↓
Backend sends confirmation email
        ↓
Frontend shows success page
```

## Testing with Stripe

### Test Cards
| Card | Result |
|------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Declined |
| 4000 2500 0000 3155 | Requires 3D Secure |

### Test Expiry
- Any date in the future (e.g., 12/25)

### Test CVC
- Any 3 digits (e.g., 123)

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Module not found" | Run `npm install` |
| Stripe key not found | Check `.env` file exists and has correct values |
| Backend not responding | Verify port 3001 is not in use, check firewall |
| Google Sheet not updating | Check service account has editor access |
| Email not sending | Verify Gmail app password (not regular password) |
| CORS error | Check `FRONTEND_URL` in backend `.env` |

## Useful Links

- [Stripe Dashboard](https://dashboard.stripe.com)
- [Google Cloud Console](https://console.cloud.google.com)
- [Google Sheets API Docs](https://developers.google.com/sheets/api)
- [Stripe API Docs](https://stripe.com/docs/api)

## Next Steps

1. Customize email templates in `server.js`
2. Add event details to success page
3. Set up admin dashboard to view purchases
4. Configure production Stripe keys
5. Deploy frontend and backend
6. Set up production webhook endpoint

## Getting Help

1. Check `.env.example` for credential setup
2. Read `MIGRATION_GUIDE.md` for detailed instructions
3. Read `BACKEND_SETUP.md` for API details
4. Review backend console logs for errors
5. Check Stripe and Google Sheets documentation
