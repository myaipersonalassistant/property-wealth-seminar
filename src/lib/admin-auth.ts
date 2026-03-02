/**
 * Admin auth - Option B: uses backend API instead of direct Firestore
 */

const SESSION_STORAGE_KEY = 'admin_session';
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  last_login?: string;
}

export interface AdminSession {
  adminId: string;
  username: string;
  email: string;
  role: string;
  loginTime: string;
  token?: string;
}

/**
 * Login admin user via backend API
 */
export async function loginAdmin(username: string, password: string): Promise<AdminSession | null> {
  try {
    const res = await fetch(`${API_BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return null;
    }

    const session: AdminSession = {
      adminId: data.admin.id,
      username: data.admin.username,
      email: data.admin.email || '',
      role: data.admin.role || 'admin',
      loginTime: data.loginTime || new Date().toISOString(),
      token: data.token,
    };

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    return session;
  } catch {
    return null;
  }
}

/**
 * Logout admin user
 */
export function logoutAdmin(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

/**
 * Get current admin session
 */
export function getAdminSession(): AdminSession | null {
  try {
    const sessionData = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionData) return null;

    const session: AdminSession = JSON.parse(sessionData);

    // Check if session is still valid (24 hours)
    const loginTime = new Date(session.loginTime);
    const now = new Date();
    const hoursSinceLogin = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);

    if (hoursSinceLogin > 24) {
      logoutAdmin();
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAdminAuthenticated(): boolean {
  return getAdminSession() !== null;
}

/**
 * Get current admin user
 */
export function getCurrentAdmin(): AdminSession | null {
  return getAdminSession();
}
