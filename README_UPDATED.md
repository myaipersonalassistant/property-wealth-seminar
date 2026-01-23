# Seminar Booking System - Updated Setup

## Overview

This is a modern React/TypeScript web application for seminar ticket booking with **Stripe payment integration** and **Google Sheets data storage**.

### Key Features

✅ Beautiful responsive UI with Tailwind CSS  
✅ Stripe payment processing  
✅ Google Sheets integration for ticket data  
✅ Automatic confirmation emails  
✅ Order tracking and status management  
✅ Countdown timer to event  
✅ FAQ accordion  
✅ Responsive design (mobile, tablet, desktop)  

## Quick Start

For a quick setup, see [QUICK_START.md](./QUICK_START.md)

## Full Documentation

- **[QUICK_START.md](./QUICK_START.md)** - 5-minute setup guide
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Complete migration from Supabase
- **[BACKEND_SETUP.md](./BACKEND_SETUP.md)** - Detailed backend implementation
- **[.env.example](./.env.example)** - Environment configuration template

## Architecture

### Frontend (React + TypeScript)

```
src/
├── components/
│   ├── AppLayout.tsx              # Main page layout
│   ├── TicketModal.tsx            # Booking form with Stripe
│   ├── PaymentSuccess.tsx         # Success page with Google Sheets
│   ├── CountdownTimer.tsx         # Event countdown
│   ├── FAQAccordion.tsx           # FAQ section
│   └── ui/                        # shadcn/ui components
├── lib/
│   ├── stripe.ts                  # Stripe integration
│   ├── google-sheets.ts           # Google Sheets integration
│   └── utils.ts                   # Utilities
├── contexts/
│   └── AppContext.tsx             # App state management
└── pages/
    ├── Index.tsx                  # Home page
    └── NotFound.tsx               # 404 page
```

### Backend (Node.js + Express)

```
backend/
├── server.js                      # Main server (sample provided)
├── .env                          # Environment variables
├── package.json
└── README.md
```

### Data Storage

**Google Sheets Columns:**
- `order_reference` - Unique order ID
- `customer_name` - Customer name
- `customer_email` - Email address
- `customer_phone` - Phone number (optional)
- `quantity` - Number of tickets
- `amount_total` - Total amount in pence
- `stripe_session_id` - Stripe session ID
- `stripe_payment_intent_id` - Payment intent ID
- `status` - pending/completed/failed
- `created_at` - Timestamp
- `updated_at` - Timestamp

## Installation

### Frontend Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your Stripe and Google Sheets credentials

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install express stripe google-spreadsheet google-auth-library nodemailer cors dotenv

# Copy sample server
cp ../server.js.sample server.js

# Create environment file
cp ../.env.example .env
# Edit .env with your credentials

# Start backend
node server.js
```

## Environment Variables

### Frontend (.env)

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
VITE_GOOGLE_SHEETS_SHEET_ID=xxxxx
VITE_API_BASE=https://your-backend.com
VITE_SUCCESS_URL=https://your-domain.com/payment-success
VITE_CANCEL_URL=https://your-domain.com/
```

### Backend (.env)

```env
NODE_ENV=production
PORT=3001
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
GOOGLE_SHEETS_ID=xxxxx
GOOGLE_SERVICE_ACCOUNT_EMAIL=xxxxx@iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=https://your-domain.com
```

See [.env.example](./.env.example) for detailed instructions on obtaining credentials.

## Payment Flow

1. **User initiates checkout** - Fills in booking details
2. **Frontend calls backend** - Creates Stripe checkout session
3. **Backend creates records** - Adds pending entry to Google Sheets
4. **User redirected to Stripe** - Completes payment on Stripe Checkout
5. **Stripe webhook fires** - Notifies backend of payment completion
6. **Backend updates data** - Marks as completed in Google Sheets
7. **Email sent** - Confirmation email to customer
8. **Success page shown** - Shows booking confirmation

## API Endpoints

### Payment
- `POST /api/create-checkout-session` - Create Stripe checkout
- `GET /api/verify-session/:sessionId` - Verify payment status

### Tickets
- `GET /api/tickets/:orderReference` - Get ticket details
- `POST /api/tickets` - Create ticket record
- `PATCH /api/tickets/:orderReference` - Update ticket record

### Webhooks
- `POST /api/webhooks/stripe` - Stripe webhook handler

See [BACKEND_SETUP.md](./BACKEND_SETUP.md) for detailed API documentation.

## Technologies Used

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Lucide React** - Icons
- **React Router** - Routing
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **Stripe** - Payment processing
- **Google Sheets API** - Data storage
- **Nodemailer** - Email service
- **JWT** - Authentication for Google

### DevOps
- **Vite** - Frontend build
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Tailwind CSS** - Utility-first CSS

## Development

### Start Development Servers

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd backend
node server.js
```

### Testing

**Test Payment:**
1. Navigate to http://localhost:5173
2. Click "Book Your Seat"
3. Fill in test details
4. Use Stripe test card: `4242 4242 4242 4242`
5. Verify success page and Google Sheet entry

**Test Email:**
- Check inbox for confirmation email
- Review email content and links

### Building

```bash
# Frontend build
npm run build

# Start preview server
npm run preview
```

## Deployment

### Frontend Deployment

**Vercel (Recommended)**
```bash
npm i -g vercel
vercel
```

**Netlify**
- Connect your Git repository
- Set build command: `npm run build`
- Set publish directory: `dist`

**Other platforms**
```bash
npm run build
# Deploy the `dist` folder
```

### Backend Deployment

**Heroku**
```bash
heroku create your-app-name
git push heroku main
```

**Railway, Render, Fly.io**
- Connect Git repository
- Set environment variables
- Deploy

### Environment Variables on Production

Set these environment variables on your hosting platform:
- Frontend: Stripe public key, API base URL
- Backend: Stripe secret key, webhook secret, Google credentials, email credentials

## Troubleshooting

### Common Issues

**"Stripe publishable key is not configured"**
- Check .env file has `VITE_STRIPE_PUBLISHABLE_KEY`
- Restart dev server
- Verify key starts with `pk_`

**"Failed to create checkout session"**
- Verify backend is running
- Check `VITE_API_BASE` in .env
- Review backend logs

**"Google Sheet not updating"**
- Verify service account has editor access
- Check sheet column names match exactly
- Review backend logs

**"Email not sending"**
- Verify Gmail app-specific password (not regular password)
- Check email configuration in backend

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for more troubleshooting.

## Project Structure

```
seminar/
├── public/                      # Static assets
├── src/
│   ├── components/             # React components
│   ├── contexts/               # React context
│   ├── hooks/                  # Custom hooks
│   ├── lib/                    # Utilities & services
│   ├── pages/                  # Page components
│   ├── App.tsx                 # Root component
│   ├── main.tsx                # Entry point
│   ├── index.css               # Global styles
│   └── App.css                 # App styles
├── backend/                    # Backend code (copy server.js here)
├── BACKEND_SETUP.md           # Backend documentation
├── MIGRATION_GUIDE.md         # Migration guide
├── QUICK_START.md             # Quick start guide
├── .env.example               # Environment template
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.ts         # Tailwind configuration
├── postcss.config.js          # PostCSS configuration
├── eslint.config.js           # ESLint configuration
└── package.json               # Dependencies & scripts
```

## Security

### Best Practices

- ✅ Never commit `.env` files to Git
- ✅ Use HTTPS for all API calls
- ✅ Verify Stripe webhook signatures
- ✅ Store API keys only on backend
- ✅ Use environment variables for all secrets
- ✅ Implement CORS properly
- ✅ Validate inputs on backend
- ✅ Use rate limiting on APIs

### Security Checklist

- [ ] Stripe keys configured (public on frontend, secret on backend)
- [ ] Google Sheets credentials secured on backend
- [ ] Email credentials secured on backend
- [ ] HTTPS enabled for all endpoints
- [ ] CORS configured for your domain
- [ ] Webhook signature verification enabled
- [ ] Input validation on all endpoints
- [ ] Rate limiting configured
- [ ] Error messages don't leak sensitive info

## Performance

### Frontend Optimization
- React code splitting
- Lazy loading of components
- Image optimization
- CSS minification
- JavaScript minification

### Backend Optimization
- Request caching
- Database query optimization
- Connection pooling
- Batch operations

## Future Enhancements

- [ ] Admin dashboard for viewing purchases
- [ ] Email reminders before event
- [ ] SMS notifications (Twilio)
- [ ] Ticket transfer functionality
- [ ] Analytics and reporting
- [ ] Multiple payment methods
- [ ] Refund management
- [ ] Bulk ticket management

## Support & Documentation

- [Stripe Documentation](https://stripe.com/docs)
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [React Documentation](https://react.dev)
- [Express.js Documentation](https://expressjs.com)

## License

This project is created for seminar ticket booking. Modify and use as needed.

## Contact

For questions or support, refer to the detailed documentation in:
- [QUICK_START.md](./QUICK_START.md) - Quick setup
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Detailed migration
- [BACKEND_SETUP.md](./BACKEND_SETUP.md) - Backend specifics

---

**Last Updated:** January 22, 2026  
**Version:** 2.0 (Google Sheets + Stripe Integration)
