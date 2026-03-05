/**
 * API client for backend (Option B - secure Firestore migration)
 */

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

export interface Order {
  order_reference: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  quantity: number;
  amount_total: number;
  status: 'pending' | 'completed' | 'failed';
  product_type?: 'ticket' | 'book';
  shipping_address?: string;
  shipping_city?: string;
  shipping_postcode?: string;
  created_at: string;
  updated_at: string;
  email_sent?: boolean;
  email_sent_at?: string;
  email_sent_count?: number;
  email_last_attempt?: string;
  email_status?: string;
}

export interface PageViewData {
  id?: string;
  page_name: string;
  page_path: string;
  timestamp: string | { toDate?: () => Date };
  date?: string;
  hour?: number;
  visitor_id: string;
  country?: string;
  city?: string;
  region?: string;
}

export interface VisitorData {
  id?: string;
  visitor_id: string;
  first_seen: string | { toDate?: () => Date };
  last_visit: string | { toDate?: () => Date };
  last_page: string;
  visit_count: number;
  country?: string;
  city?: string;
  region?: string;
}

export interface EventData {
  id?: string;
  event_name: string;
  event_params?: Record<string, unknown>;
  timestamp: string | { toDate?: () => Date };
  date?: string;
  hour?: number;
  visitor_id: string;
}

export function getApiBase() {
  return API_BASE;
}

/**
 * Get auth headers for admin API calls
 */
export function getAuthHeaders(): HeadersInit {
  const sessionData = localStorage.getItem('admin_session');
  if (!sessionData) return { 'Content-Type': 'application/json' };
  try {
    const session = JSON.parse(sessionData);
    const token = session.token;
    if (!token) return { 'Content-Type': 'application/json' };
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  } catch {
    return { 'Content-Type': 'application/json' };
  }
}

/**
 * Fetch order by reference (public - for payment success page)
 */
export async function fetchOrder(orderReference: string) {
  const res = await fetch(`${API_BASE}/api/tickets/${encodeURIComponent(orderReference)}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error('Order not found');
    throw new Error(res.statusText || 'Failed to fetch order');
  }
  return res.json();
}

/**
 * Fetch all orders (admin only)
 */
export async function fetchAllOrders() {
  const res = await fetch(`${API_BASE}/api/tickets`, { headers: getAuthHeaders() });
  if (!res.ok) {
    if (res.status === 401) throw new Error('Unauthorized');
    throw new Error(res.statusText || 'Failed to fetch orders');
  }
  return res.json();
}

/**
 * Update order (admin only)
 */
export async function updateOrder(orderReference: string, updates: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/api/tickets/${encodeURIComponent(orderReference)}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('Unauthorized');
    throw new Error(res.statusText || 'Failed to update order');
  }
  return res.json();
}

/**
 * Send confirmation email (admin only)
 */
export async function sendOrderEmail(orderReference: string) {
  const res = await fetch(`${API_BASE}/api/send-email/${encodeURIComponent(orderReference)}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || 'Failed to send email');
  }
  return res.json();
}

/**
 * Fetch analytics data (admin only)
 */
export async function fetchPageViews(startDate?: Date, endDate?: Date) {
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate.toISOString());
  if (endDate) params.set('endDate', endDate.toISOString());
  const qs = params.toString();
  const res = await fetch(
    `${API_BASE}/api/admin/analytics/page-views${qs ? `?${qs}` : ''}`,
    { headers: getAuthHeaders() }
  );
  if (!res.ok) {
    if (res.status === 401) throw new Error('Unauthorized');
    throw new Error(res.statusText || 'Failed to fetch page views');
  }
  return res.json();
}

export async function fetchVisitors() {
  const res = await fetch(`${API_BASE}/api/admin/analytics/visitors`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('Unauthorized');
    throw new Error(res.statusText || 'Failed to fetch visitors');
  }
  return res.json();
}

export async function fetchLeads() {
  const res = await fetch(`${API_BASE}/api/admin/leads`, { headers: getAuthHeaders() });
  if (!res.ok) {
    if (res.status === 401) throw new Error('Unauthorized');
    throw new Error(res.statusText || 'Failed to fetch leads');
  }
  return res.json();
}

export async function fetchEvents(startDate?: Date, endDate?: Date) {
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate.toISOString());
  if (endDate) params.set('endDate', endDate.toISOString());
  const qs = params.toString();
  const res = await fetch(
    `${API_BASE}/api/admin/analytics/events${qs ? `?${qs}` : ''}`,
    { headers: getAuthHeaders() }
  );
  if (!res.ok) {
    if (res.status === 401) throw new Error('Unauthorized');
    throw new Error(res.statusText || 'Failed to fetch events');
  }
  return res.json();
}
