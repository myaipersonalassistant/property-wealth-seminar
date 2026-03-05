/**
 * Submit lead (name + email) to Firestore when user unlocks the 4 additional reasons
 */
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from './firestore';

const LEADS_COLLECTION = 'reasons_unlock_leads';

export async function submitReasonsUnlockLead(name: string, email: string): Promise<void> {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  await setDoc(doc(db, LEADS_COLLECTION, id), {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    created_at: Timestamp.now(),
    source: 'reasons_unlock',
  });
}
