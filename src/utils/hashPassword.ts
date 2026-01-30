/**
 * Password Hash Utility
 * 
 * Use this to generate SHA-256 hashes for admin passwords.
 * Run this in the browser console or create a simple script to generate hashes.
 * 
 * Usage in browser console:
 * 1. Open browser console (F12)
 * 2. Copy and paste this function
 * 3. Call: hashPassword('Je5u5i5L0rd@').then(console.log)
 */

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate hash for a password (for use in browser console)
 * 
 * Example:
 * generatePasswordHash('Je5u5i5L0rd@').then(hash => {
 *   console.log('Password hash:', hash);
 *   console.log('Store this in Firestore as password_hash');
 * });
 */
export async function generatePasswordHash(password: string): Promise<void> {
  const hash = await hashPassword(password);
  console.log('='.repeat(50));
  console.log('Password:', password);
  console.log('SHA-256 Hash:', hash);
  console.log('='.repeat(50));
  console.log('Copy the hash above and store it in Firestore as password_hash');
  return Promise.resolve();
}

