import { getAnalytics, logEvent, Analytics, setUserProperties, setUserId } from 'firebase/analytics';
import { getApps } from 'firebase/app';
import { db } from './firestore';
import { collection, doc, setDoc, getDocs, query, where, Timestamp, orderBy, limit } from 'firebase/firestore';

let analytics: Analytics | null = null;

// Initialize Analytics
export function initAnalytics() {
  try {
    if (typeof window !== 'undefined' && getApps().length > 0) {
      analytics = getAnalytics();
      return analytics;
    }
  } catch (error) {
    console.warn('Analytics initialization failed:', error);
  }
  return null;
}

// Get analytics instance
export function getAnalyticsInstance(): Analytics | null {
  if (!analytics) {
    analytics = initAnalytics();
  }
  return analytics;
}

// Track page view
export function trackPageView(pageName: string, pagePath?: string) {
  const analyticsInstance = getAnalyticsInstance();
  if (analyticsInstance) {
    logEvent(analyticsInstance, 'page_view', {
      page_title: pageName,
      page_location: pagePath || window.location.pathname,
      page_path: window.location.pathname,
    });
  }
  
  // Also store in Firestore for custom analytics
  storePageView(pageName, pagePath || window.location.pathname);
}

// Track custom event
export function trackEvent(eventName: string, eventParams?: Record<string, any>) {
  const analyticsInstance = getAnalyticsInstance();
  if (analyticsInstance) {
    logEvent(analyticsInstance, eventName, eventParams);
  }
  
  // Store in Firestore
  storeEvent(eventName, eventParams);
}

// Set user properties
export function setUserProperty(propertyName: string, value: string) {
  const analyticsInstance = getAnalyticsInstance();
  if (analyticsInstance) {
    setUserProperties(analyticsInstance, {
      [propertyName]: value,
    });
  }
}

// Set user ID
export function setAnalyticsUserId(userId: string) {
  const analyticsInstance = getAnalyticsInstance();
  if (analyticsInstance) {
    setUserId(analyticsInstance, userId);
  }
}

// Firestore collections for custom analytics
const PAGE_VIEWS_COLLECTION = 'page_views';
const EVENTS_COLLECTION = 'analytics_events';
const VISITORS_COLLECTION = 'visitors';

// Get visitor location from IP (using free IP geolocation API)
async function getVisitorLocation(): Promise<{ country?: string; city?: string; region?: string }> {
  try {
    // Using ip-api.com (free, no API key required, 45 req/min limit)
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        country: data.country_name || data.country_code,
        city: data.city,
        region: data.region || data.region_code,
      };
    }
  } catch (error) {
    // Fail silently - location is optional
    console.debug('Location lookup failed:', error);
  }
  return {};
}

// Store page view in Firestore
async function storePageView(pageName: string, pagePath: string) {
  try {
    const now = Timestamp.now();
    const visitorId = getOrCreateVisitorId();
    
    // Get location (non-blocking)
    const location = await getVisitorLocation();
    
    await setDoc(doc(db, PAGE_VIEWS_COLLECTION, `${Date.now()}-${Math.random()}`), {
      page_name: pageName,
      page_path: pagePath,
      visitor_id: visitorId,
      timestamp: now,
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      hour: new Date().getHours(),
      user_agent: navigator.userAgent,
      referrer: document.referrer || 'direct',
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      ...location, // Add location data
    });
    
    // Update visitor record with location
    await updateVisitorRecord(visitorId, pagePath, location);
  } catch (error) {
    console.error('Error storing page view:', error);
  }
}

// Store event in Firestore
async function storeEvent(eventName: string, eventParams?: Record<string, any>) {
  try {
    const now = Timestamp.now();
    const visitorId = getOrCreateVisitorId();
    
    await setDoc(doc(db, EVENTS_COLLECTION, `${Date.now()}-${Math.random()}`), {
      event_name: eventName,
      event_params: eventParams || {},
      visitor_id: visitorId,
      timestamp: now,
      date: new Date().toISOString().split('T')[0],
      hour: new Date().getHours(),
    });
  } catch (error) {
    console.error('Error storing event:', error);
  }
}

// Get or create visitor ID
function getOrCreateVisitorId(): string {
  let visitorId = localStorage.getItem('visitor_id');
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('visitor_id', visitorId);
    localStorage.setItem('visitor_first_seen', new Date().toISOString());
  }
  return visitorId;
}

// Update visitor record
async function updateVisitorRecord(
  visitorId: string, 
  lastPagePath: string, 
  location?: { country?: string; city?: string; region?: string }
) {
  try {
    const visitorRef = doc(db, VISITORS_COLLECTION, visitorId);
    const firstSeen = localStorage.getItem('visitor_first_seen') || new Date().toISOString();
    
    // Get existing visitor data to preserve location if already set
    const existingVisitor = await getVisitorVisitCount(visitorId);
    const existingDoc = await (await import('firebase/firestore')).getDoc(visitorRef);
    const existingData = existingDoc.exists() ? existingDoc.data() : {};
    
    await setDoc(visitorRef, {
      visitor_id: visitorId,
      last_visit: Timestamp.now(),
      first_seen: Timestamp.fromDate(new Date(firstSeen)),
      last_page: lastPagePath,
      visit_count: (existingVisitor || 0) + 1,
      updated_at: Timestamp.now(),
      // Preserve existing location or use new location
      country: location?.country || existingData.country,
      city: location?.city || existingData.city,
      region: location?.region || existingData.region,
    }, { merge: true });
  } catch (error) {
    console.error('Error updating visitor record:', error);
  }
}

// Get visitor visit count
async function getVisitorVisitCount(visitorId: string): Promise<number> {
  try {
    const visitorRef = doc(db, VISITORS_COLLECTION, visitorId);
    const visitorSnap = await (await import('firebase/firestore')).getDoc(visitorRef);
    if (visitorSnap.exists()) {
      return visitorSnap.data().visit_count || 0;
    }
    return 0;
  } catch (error) {
    return 0;
  }
}

// Analytics data retrieval functions for admin dashboard
export interface PageViewData {
  page_name: string;
  page_path: string;
  timestamp: any;
  date: string;
  hour: number;
  visitor_id: string;
  country?: string;
  city?: string;
  region?: string;
}

export interface VisitorData {
  visitor_id: string;
  first_seen: any;
  last_visit: any;
  last_page: string;
  visit_count: number;
  country?: string;
  city?: string;
  region?: string;
}

export interface EventData {
  event_name: string;
  event_params: Record<string, any>;
  timestamp: any;
  date: string;
  hour: number;
  visitor_id: string;
}

// Get page views for date range
export async function getPageViews(startDate?: Date, endDate?: Date): Promise<PageViewData[]> {
  try {
    const q = query(
      collection(db, PAGE_VIEWS_COLLECTION),
      orderBy('timestamp', 'desc'),
      limit(10000) // Adjust as needed
    );
    
    const snapshot = await getDocs(q);
    let views = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];
    
    // Filter by date range if provided
    if (startDate || endDate) {
      views = views.filter(view => {
        const viewDate = view.timestamp?.toDate ? view.timestamp.toDate() : new Date(view.timestamp);
        if (startDate && viewDate < startDate) return false;
        if (endDate && viewDate > endDate) return false;
        return true;
      });
    }
    
    return views;
  } catch (error) {
    console.error('Error fetching page views:', error);
    return [];
  }
}

// Get all visitors
export async function getAllVisitors(): Promise<VisitorData[]> {
  try {
    const snapshot = await getDocs(collection(db, VISITORS_COLLECTION));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];
  } catch (error) {
    console.error('Error fetching visitors:', error);
    return [];
  }
}

// Get events for date range
export async function getEvents(startDate?: Date, endDate?: Date): Promise<EventData[]> {
  try {
    const q = query(
      collection(db, EVENTS_COLLECTION),
      orderBy('timestamp', 'desc'),
      limit(10000)
    );
    
    const snapshot = await getDocs(q);
    let events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];
    
    // Filter by date range if provided
    if (startDate || endDate) {
      events = events.filter(event => {
        const eventDate = event.timestamp?.toDate ? event.timestamp.toDate() : new Date(event.timestamp);
        if (startDate && eventDate < startDate) return false;
        if (endDate && eventDate > endDate) return false;
        return true;
      });
    }
    
    return events;
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

