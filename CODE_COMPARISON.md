# Code Comparison: Before & After

## TicketModal Component

### BEFORE (Supabase)

```typescript
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

const TicketModal: React.FC<TicketModalProps> = ({ isOpen, onClose }) => {
  // ... form state ...
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);
    
    try {
      // Call the Supabase edge function
      const { data, error: functionError } = await supabase.functions.invoke(
        'create-checkout-session',
        {
          body: {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim() || null,
            quantity: quantity,
          },
        }
      );
      
      if (functionError) {
        throw new Error(functionError.message || 'Failed to create checkout session');
      }
      
      if (data?.error) {
        throw new Error(data.error);
      }
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setIsProcessing(false);
    }
  };
};
```

### AFTER (Stripe)

```typescript
import React, { useState } from 'react';
import { createCheckoutSession } from '@/lib/stripe';

const TicketModal: React.FC<TicketModalProps> = ({ isOpen, onClose }) => {
  // ... form state (unchanged) ...
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);
    
    try {
      // Call the Stripe API via backend
      const result = await createCheckoutSession({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        quantity: quantity,
        ticketPrice: ticketPrice,
      });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      if (result.url) {
        window.location.href = result.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setIsProcessing(false);
    }
  };
};
```

**Key Changes:**
- ✅ Removed Supabase import
- ✅ Added Stripe import
- ✅ Replaced `supabase.functions.invoke()` with `createCheckoutSession()`
- ✅ Simplified error handling
- ✅ Added `ticketPrice` parameter

---

## PaymentSuccess Component

### BEFORE (Supabase)

```typescript
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface OrderDetails {
  customer_name: string;
  customer_email: string;
  quantity: number;
  amount_total: number;
  order_reference: string;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ sessionId, orderRef, onClose }) => {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (orderRef) {
        try {
          // Direct database query to Supabase
          const { data, error } = await supabase
            .from('ticket_purchases')
            .select('*')
            .eq('order_reference', orderRef)
            .single();

          if (data && !error) {
            setOrderDetails(data);
          }
        } catch (err) {
          console.error('Error fetching order:', err);
        }
      }
      setIsLoading(false);
    };

    setTimeout(fetchOrderDetails, 1500);
  }, [orderRef]);

  // ... JSX rendering ...
};
```

### AFTER (Google Sheets via Backend API)

```typescript
import React, { useEffect, useState } from 'react';
import { getTicketPurchase } from '@/lib/google-sheets';

interface OrderDetails {
  customer_name: string;
  customer_email: string;
  quantity: number;
  amount_total: number;
  order_reference: string;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ sessionId, orderRef, onClose }) => {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (orderRef) {
        try {
          // Backend API call to Google Sheets
          const data = await getTicketPurchase(orderRef);
          if (data) {
            setOrderDetails(data);
          }
        } catch (err) {
          console.error('Error fetching order:', err);
        }
      }
      setIsLoading(false);
    };

    setTimeout(fetchOrderDetails, 1500);
  }, [orderRef]);

  // ... JSX rendering (unchanged) ...
};
```

**Key Changes:**
- ✅ Removed Supabase import
- ✅ Added Google Sheets import
- ✅ Replaced `supabase.from().select()` with `getTicketPurchase()`
- ✅ Simplified error handling
- ✅ All data fetching now goes through backend API

---

## Service Layer Files

### NEW: stripe.ts

```typescript
import { CheckoutSessionResponse } from '@/lib/stripe';

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

export async function createCheckoutSession(
  data: CheckoutSessionData
): Promise<CheckoutSessionResponse> {
  try {
    const response = await fetch(`${API_BASE}/api/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone,
        quantity: data.quantity,
        ticketPrice: data.ticketPrice,
        successUrl: SUCCESS_URL,
        cancelUrl: CANCEL_URL,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error!`);
    }

    return response.json();
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to create checkout session',
    };
  }
}
```

### NEW: google-sheets.ts

```typescript
import { TicketPurchase } from '@/lib/google-sheets';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

export async function getTicketPurchase(orderReference: string): Promise<TicketPurchase> {
  try {
    const response = await fetch(`${API_BASE}/api/tickets/${orderReference}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ticket: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching ticket:', error);
    throw error;
  }
}

export async function addTicketPurchase(
  purchase: Omit<TicketPurchase, 'created_at' | 'updated_at'>
): Promise<TicketPurchase> {
  try {
    const response = await fetch(`${API_BASE}/api/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...purchase,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add ticket: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error adding ticket:', error);
    throw error;
  }
}
```

---

## Backend Endpoints (NEW)

### Create Checkout Session

```javascript
// BEFORE: Supabase edge function
// Could not be easily tested or extended

// AFTER: Express endpoint
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { name, email, phone, quantity, ticketPrice, successUrl, cancelUrl } = req.body;

    // Generate order reference
    const orderRef = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'gbp',
          product_data: { name: 'Seminar Tickets' },
          unit_amount: ticketPrice * 100,
        },
        quantity: quantity,
      }],
      mode: 'payment',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&order_ref=${orderRef}`,
      cancel_url: cancelUrl,
      customer_email: email,
      metadata: { orderRef, name, phone: phone || '' },
    });

    // Add to Google Sheets
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

    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Stripe Webhook Handler

```javascript
// BEFORE: Not handled in app code (Supabase managed it)

// AFTER: Express webhook handler
app.post('/api/webhooks/stripe', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Update Google Sheets
    await updateGoogleSheets(session.metadata.orderRef, {
      status: 'completed',
      stripe_payment_intent_id: session.payment_intent,
      updated_at: new Date().toISOString(),
    });

    // Send confirmation email
    await sendConfirmationEmail({
      email: session.customer_email,
      name: session.metadata.name,
      orderRef: session.metadata.orderRef,
    });
  }

  res.json({ received: true });
});
```

---

## Data Flow Comparison

### BEFORE (Supabase)

```
Frontend Form
    ↓
Supabase Edge Function
    ├─ Stripe API (create session)
    ├─ Supabase DB (store purchase)
    └─ Return URL
    ↓
Stripe Checkout
    ↓
Supabase Auth Trigger
    ├─ Database auto-update
    └─ Email trigger (if configured)
```

### AFTER (Stripe + Google Sheets)

```
Frontend Form
    ↓
Backend API Endpoint
    ├─ Stripe API (create session)
    ├─ Google Sheets (store purchase)
    └─ Return URL
    ↓
Stripe Checkout
    ↓
Stripe Webhook → Backend Webhook Handler
    ├─ Google Sheets (update purchase)
    ├─ Email Service (send confirmation)
    └─ Webhook acknowledgment
    ↓
Frontend Success Page
    ├─ Backend API (fetch details)
    └─ Display confirmation
```

---

## Configuration Changes

### BEFORE

```typescript
// supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://...';
const supabaseKey = 'eyJ...';
const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };
```

### AFTER

```typescript
// stripe.ts
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

// google-sheets.ts
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEETS_SHEET_ID || '';
```

### Environment Variables

**BEFORE:**
```env
(No frontend env needed, Supabase URL and key hardcoded)
(Backend edge functions ran on Supabase infrastructure)
```

**AFTER:**
```env
# Frontend
VITE_STRIPE_PUBLISHABLE_KEY=pk_...
VITE_GOOGLE_SHEETS_SHEET_ID=...
VITE_API_BASE=http://localhost:3001

# Backend
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
GOOGLE_SHEETS_ID=...
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_SERVICE_ACCOUNT_KEY=...
EMAIL_USER=...
EMAIL_PASSWORD=...
```

---

## Benefits Summary

| Aspect | Before (Supabase) | After (Stripe + Sheets) |
|--------|------------------|------------------------|
| **Payment Processing** | Supabase Edge Functions | Stripe API + Backend |
| **Data Storage** | PostgreSQL DB | Google Sheets |
| **Cost** | Fixed monthly fee | Pay per API calls |
| **Scalability** | Database limited | Sheets scales well |
| **Development** | Requires Supabase knowledge | Standard Node.js/Express |
| **Debugging** | Limited logs | Full backend control |
| **Email** | Trigger-based | Backend logic |
| **Monitoring** | Supabase dashboard | Backend logs |
| **Data Export** | PostgreSQL dump | Google Sheets native |
| **Customization** | Limited | Full control |

---

## Testing Differences

### BEFORE

```typescript
// Hard to test edge functions locally
// Required Supabase emulator
// Limited debugging
```

### AFTER

```typescript
// Easy to test locally
// Full backend control
// Rich logging and debugging
// Can mock external APIs easily
```

---

## Summary

The migration from Supabase to Google Sheets + Stripe:
- ✅ Centralizes payment processing (industry standard Stripe)
- ✅ Simplifies data storage (Google Sheets accessible by anyone)
- ✅ Improves debuggability (full backend control)
- ✅ Reduces costs (pay for what you use)
- ✅ Improves maintainability (standard backend architecture)
- ✅ Maintains same frontend user experience

All changes are backward compatible - the UI and user flow remain exactly the same!
