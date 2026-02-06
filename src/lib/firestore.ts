import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where,
  Timestamp 
} from 'firebase/firestore';

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
  // Email tracking fields
  email_sent?: boolean;
  email_sent_at?: string;
  email_sent_count?: number;
  email_last_attempt?: string;
  email_status?: 'pending' | 'sent' | 'failed';
}

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
let app: FirebaseApp;
let db: Firestore;

try {
  // Validate required environment variables
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error(
      'Firebase configuration is missing. Please set VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID environment variables.'
    );
  }

  // Check if Firebase is already initialized
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  db = getFirestore(app);
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

// Export db and app for use in other modules
export { db, app };

const COLLECTION_NAME = 'ticket_purchases';

/**
 * Convert Firestore timestamp to ISO string
 */
function timestampToISO(timestamp: any): string {
  if (timestamp?.toDate) {
    return timestamp.toDate().toISOString();
  }
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  if (typeof timestamp === 'string') {
    return timestamp;
  }
  return new Date().toISOString();
}

/**
 * Convert Firestore document to TicketPurchase
 */
function docToTicketPurchase(docData: any, id: string): TicketPurchase {
  return {
    order_reference: docData.order_reference || id,
    customer_name: docData.customer_name || '',
    customer_email: docData.customer_email || '',
    customer_phone: docData.customer_phone,
    quantity: docData.quantity || 0,
    amount_total: docData.amount_total || 0,
    stripe_session_id: docData.stripe_session_id,
    stripe_payment_intent_id: docData.stripe_payment_intent_id,
    status: docData.status || 'pending',
    product_type: docData.product_type,
    shipping_address: docData.shipping_address,
    shipping_city: docData.shipping_city,
    shipping_postcode: docData.shipping_postcode,
    created_at: timestampToISO(docData.created_at),
    updated_at: timestampToISO(docData.updated_at),
    email_sent: docData.email_sent || false,
    email_sent_at: docData.email_sent_at ? timestampToISO(docData.email_sent_at) : undefined,
    email_sent_count: docData.email_sent_count || 0,
    email_last_attempt: docData.email_last_attempt ? timestampToISO(docData.email_last_attempt) : undefined,
    email_status: docData.email_status || 'pending',
  };
}

/**
 * Add a new ticket purchase record to Firestore
 */
export async function addTicketPurchase(
  purchase: Omit<TicketPurchase, 'created_at' | 'updated_at'>
): Promise<TicketPurchase> {
  try {
    const now = new Date().toISOString();
    const purchaseData = {
      ...purchase,
      created_at: Timestamp.fromDate(new Date()),
      updated_at: Timestamp.fromDate(new Date()),
    };

    // Use order_reference as the document ID for easy lookup
    const docRef = doc(db, COLLECTION_NAME, purchase.order_reference);
    await setDoc(docRef, purchaseData);

    return {
      ...purchase,
      created_at: now,
      updated_at: now,
    };
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
    const docRef = doc(db, COLLECTION_NAME, orderReference);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      // Try querying by order_reference field as fallback
      const q = query(
        collection(db, COLLECTION_NAME),
        where('order_reference', '==', orderReference)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error(`Ticket purchase with order reference ${orderReference} not found`);
      }

      const firstDoc = querySnapshot.docs[0];
      return docToTicketPurchase(firstDoc.data(), firstDoc.id);
    }

    return docToTicketPurchase(docSnap.data(), docSnap.id);
  } catch (error) {
    console.error('Error fetching ticket purchase:', error);
    throw error;
  }
}

/**
 * Update a ticket purchase record in Firestore
 */
export async function updateTicketPurchase(
  orderReference: string,
  updates: Partial<TicketPurchase>
): Promise<TicketPurchase> {
  try {
    const docRef = doc(db, COLLECTION_NAME, orderReference);
    
    // Check if document exists
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      // Try querying by order_reference field
      const q = query(
        collection(db, COLLECTION_NAME),
        where('order_reference', '==', orderReference)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error(`Ticket purchase with order reference ${orderReference} not found`);
      }

      const firstDoc = querySnapshot.docs[0];
      const updateRef = doc(db, COLLECTION_NAME, firstDoc.id);
      
      const updateData: any = {
        ...updates,
        updated_at: Timestamp.fromDate(new Date()),
      };
      
      // Remove created_at and updated_at from updates if they exist (they're handled separately)
      delete updateData.created_at;
      
      await updateDoc(updateRef, updateData);
      
      const updatedDoc = await getDoc(updateRef);
      return docToTicketPurchase(updatedDoc.data(), updatedDoc.id);
    }

    const updateData: any = {
      ...updates,
      updated_at: Timestamp.fromDate(new Date()),
    };
    
    // Remove created_at and updated_at from updates if they exist
    delete updateData.created_at;
    
    await updateDoc(docRef, updateData);
    
    const updatedDoc = await getDoc(docRef);
    return docToTicketPurchase(updatedDoc.data(), updatedDoc.id);
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
    const q = collection(db, COLLECTION_NAME);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc) => 
      docToTicketPurchase(doc.data(), doc.id)
    );
  } catch (error) {
    console.error('Error fetching ticket purchases:', error);
    throw error;
  }
}

