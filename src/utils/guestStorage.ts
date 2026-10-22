import { RsvpData } from '../types';

const DB_NAME = 'wedding_guest_db';
const DB_VERSION = 1;
const STORE_NAME = 'rsvps';
const LOCAL_STORAGE_KEY = 'wedding_rsvps';

// One-time cleanup of all previous mock/test data so the app starts completely clean for real guests
if (typeof window !== 'undefined') {
  const PRODUCTION_CLEAN_KEY = 'wedding_data_cleaned_production_ready_v1';
  if (!localStorage.getItem(PRODUCTION_CLEAN_KEY)) {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem('wedding_wishes');
      localStorage.setItem(PRODUCTION_CLEAN_KEY, 'true');

      if (window.indexedDB) {
        const req = window.indexedDB.open(DB_NAME, DB_VERSION);
        req.onsuccess = () => {
          const db = req.result;
          if (db.objectStoreNames.contains(STORE_NAME)) {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).clear();
          }
        };
      }
    } catch (e) {
      console.warn('Production cleanup warning:', e);
    }
  }
}

/**
 * Open or create the IndexedDB database
 * Designed to safely store thousands of guest RSVP records
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Synchronous initial load from localStorage for zero-latency initial UI rendering
 */
export function getInitialGuestRsvps(): RsvpData[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read from localStorage:', err);
  }
  return [];
}

/**
 * Load all RSVP records from IndexedDB (with localStorage backup & migration)
 * Capable of handling 1,000+ guest responses reliably
 */
export async function loadAllGuestRsvps(): Promise<RsvpData[]> {
  try {
    const db = await openDB();
    const records = await new Promise<RsvpData[]>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve((request.result as RsvpData[]) || []);
      request.onerror = () => reject(request.error);
    });

    if (records.length > 0) {
      // Sort newest first
      return records.reverse();
    }

    // If IndexedDB is empty, check localStorage to migrate existing data
    const localData = getInitialGuestRsvps();
    if (localData.length > 0) {
      // Migrate local data into IndexedDB
      const writeTx = db.transaction(STORE_NAME, 'readwrite');
      const writeStore = writeTx.objectStore(STORE_NAME);
      for (const item of localData) {
        writeStore.put(item);
      }
      return localData;
    }

    return [];
  } catch (err) {
    console.warn('IndexedDB unavailable, falling back to localStorage:', err);
    return getInitialGuestRsvps();
  }
}

/**
 * Save a newly submitted guest RSVP into persistent storage
 * Saves directly into IndexedDB (high capacity) and mirrors to localStorage
 */
export async function saveGuestRsvp(rsvp: RsvpData): Promise<RsvpData[]> {
  // 1. Mirror to localStorage safely
  try {
    const existing = getInitialGuestRsvps();
    const updated = [rsvp, ...existing.filter((item) => item.id !== rsvp.id)];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('localStorage save failed (quota exceeded?), relying on IndexedDB:', err);
  }

  // 2. Persist to IndexedDB (stores 1,000+ guests without quota limitations)
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(rsvp);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Error saving to IndexedDB:', err);
  }

  // Dispatch custom window event so open admin modal updates immediately
  try {
    window.dispatchEvent(new CustomEvent('wedding_rsvp_updated', { detail: rsvp }));
  } catch {
    // ignore
  }

  return loadAllGuestRsvps();
}
