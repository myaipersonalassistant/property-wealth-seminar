/**
 * Password Debug Utility
 * 
 * Use this in browser console to debug password hashing issues
 * 
 * Usage:
 * 1. Open browser console (F12)
 * 2. Import or paste this function
 * 3. Call: debugPasswordHash('Je5u5i5L0rd@')
 */

export async function debugPasswordHash(password: string): Promise<void> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  console.log('='.repeat(70));
  console.log('🔐 PASSWORD HASH DEBUG');
  console.log('='.repeat(70));
  console.log('Password:', password);
  console.log('Password length:', password.length);
  console.log('SHA-256 Hash:', hash);
  console.log('Hash length:', hash.length);
  console.log('Hash (lowercase):', hash.toLowerCase());
  console.log('='.repeat(70));
  console.log('📋 Copy this hash to Firestore:');
  console.log(hash.toLowerCase());
  console.log('='.repeat(70));
  
  return Promise.resolve();
}

/**
 * Compare password with stored hash
 */
export async function comparePasswordHash(password: string, storedHash: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  const match = computedHash.toLowerCase() === storedHash.toLowerCase();
  
  console.log('='.repeat(70));
  console.log('🔍 PASSWORD COMPARISON');
  console.log('='.repeat(70));
  console.log('Password:', password);
  console.log('Stored hash:', storedHash);
  console.log('Computed hash:', computedHash);
  console.log('Match:', match ? '✅ YES' : '❌ NO');
  if (!match) {
    console.log('Stored (first 20):', storedHash.substring(0, 20));
    console.log('Computed (first 20):', computedHash.substring(0, 20));
  }
  console.log('='.repeat(70));
  
  return match;
}

