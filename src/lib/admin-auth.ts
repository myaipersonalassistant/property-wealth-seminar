import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firestore';

const ADMINS_COLLECTION = 'admin';
const SESSION_STORAGE_KEY = 'admin_session';

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
}

/**
 * Simple hash function for password verification
 * In production, use proper password hashing (bcrypt, argon2, etc.)
 * This is a basic implementation - you should hash passwords server-side
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Login admin user
 */
export async function loginAdmin(username: string, password: string): Promise<AdminSession | null> {
  try {
    // Hash the provided password
    const passwordHash = await hashPassword(password);

    // Query Firestore for admin with matching username
    const q = query(
      collection(db, ADMINS_COLLECTION),
      where('username', '==', username)
    );
    
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const adminDoc = querySnapshot.docs[0];
    const adminData = adminDoc.data();

    // Verify password hash
    // Note: In production, use proper password comparison (bcrypt.compare)
    // First check if stored value is a hash (64 chars for SHA-256)
    // Trim whitespace in case it was accidentally added
    const storedHash = (adminData.password_hash || '').trim();
    const isStoredHash = storedHash.length === 64 && /^[a-f0-9]{64}$/i.test(storedHash);
    
    if (isStoredHash) {
      // Compare hashed passwords (case-insensitive comparison)
      const storedHashLower = storedHash.toLowerCase();
      const passwordHashLower = passwordHash.toLowerCase();
      
      if (storedHashLower !== passwordHashLower) {
        return null;
      }
    } else {
      // Fallback: compare plain password (for initial setup)
      if (storedHash !== password) {
        return null;
      }
    }

    // Update last login
    const adminRef = doc(db, ADMINS_COLLECTION, adminDoc.id);
    await updateDoc(adminRef, {
      last_login: Timestamp.now(),
    });

    // Create session
    const session: AdminSession = {
      adminId: adminDoc.id,
      username: adminData.username,
      email: adminData.email || '',
      role: adminData.role || 'admin',
      loginTime: new Date().toISOString(),
    };

    // Store session in localStorage
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));

    return session;
  } catch (error) {
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
    if (!sessionData) {
      return null;
    }

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
  } catch (error) {
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

