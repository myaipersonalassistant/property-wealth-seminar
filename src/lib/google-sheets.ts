/**
 * Google Sheets Integration
 * 
 * This module provides functions to interact with Google Sheets for storing ticket purchases.
 * 
 * Setup Instructions:
 * 1. Create a Google Cloud Project and enable the Google Sheets API
 * 2. Create a service account and download the JSON key file
 * 3. Create a Google Sheet for ticket_purchases with these columns:
 *    - order_reference (e.g., ORDER-123456)
 *    - customer_name
 *    - customer_email
 *    - customer_phone
 *    - quantity
 *    - amount_total
 *    - stripe_session_id
 *    - stripe_payment_intent_id
 *    - status (pending, completed, failed)
 *    - created_at
 *    - updated_at
 * 
 * Environment Variables Needed:
 * - VITE_GOOGLE_SHEETS_SHEET_ID: The ID of your Google Sheet
 * - Backend API endpoint should handle Google Sheets authentication
 */

export interface TicketPurchase {
  order_reference: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  quantity: number;
  amount_total: number;
  stripe_session_id?: string;
  stripe_payment_intent_id?: string;
  status: 'pending' | 'completed' | 'failed';
  product_type?: 'ticket' | 'book';
  shipping_address?: string;
  shipping_city?: string;
  shipping_postcode?: string;
  created_at: string;
  updated_at: string;
}

const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEETS_SHEET_ID || '';
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

/**
 * Add a new ticket purchase record to Google Sheets
 */
export async function addTicketPurchase(
  purchase: Omit<TicketPurchase, 'created_at' | 'updated_at'>
): Promise<TicketPurchase> {
  try {
    const response = await fetch(`${API_BASE}/api/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...purchase,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add ticket purchase: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error adding ticket purchase:', error);
    throw error;
  }
}

/**
 * Get a specific ticket purchase by order reference
 */
export async function getTicketPurchase(orderReference: string): Promise<TicketPurchase> {
  try {
    const response = await fetch(`${API_BASE}/api/tickets/${orderReference}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ticket purchase: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching ticket purchase:', error);
    throw error;
  }
}

/**
 * Update a ticket purchase record in Google Sheets
 */
export async function updateTicketPurchase(
  orderReference: string,
  updates: Partial<TicketPurchase>
): Promise<TicketPurchase> {
  try {
    const response = await fetch(`${API_BASE}/api/tickets/${orderReference}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...updates,
        updated_at: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update ticket purchase: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error updating ticket purchase:', error);
    throw error;
  }
}

/**
 * Get all ticket purchases
 */
export async function getAllTicketPurchases(): Promise<TicketPurchase[]> {
  try {
    const response = await fetch(`${API_BASE}/api/tickets`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ticket purchases: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching ticket purchases:', error);
    throw error;
  }
}
