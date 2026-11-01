import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { GuestWish } from '../types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: getFirestore with firestoreDatabaseId from firebase-applet-config.json
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Error handling types and helper as required by Firebase Integration Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on boot as required
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// --- Realtime Guestbook Wishes Functions ---
export function subscribeToWishes(onWishesUpdate: (wishes: GuestWish[]) => void): () => void {
  const path = 'wishes';
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: GuestWish[] = snapshot.docs.map((d) => {
          const data = d.data();
          let formattedTime = 'Vừa xong';
          if (data.createdDate) {
            formattedTime = data.createdDate;
          } else if (data.createdAt?.toDate) {
            const date = data.createdAt.toDate();
            formattedTime = date.toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            });
          }

          return {
            id: d.id,
            name: data.name || 'Khách quý',
            relation: data.relation || 'Khách mời',
            message: data.message || '',
            createdAt: formattedTime,
            likes: data.likes || 0,
          };
        });
        onWishesUpdate(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

export async function submitWishToFirebase(name: string, relation: string, message: string): Promise<string> {
  const path = 'wishes';
  try {
    const now = new Date();
    const formattedDate = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} · ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}`;

    const docRef = await addDoc(collection(db, path), {
      name: name.trim().slice(0, 100),
      relation: relation.trim().slice(0, 100),
      message: message.trim().slice(0, 1000),
      createdDate: formattedDate,
      createdAt: serverTimestamp(),
      likes: 0,
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

export async function likeWishInFirebase(wishId: string, currentLikes: number): Promise<void> {
  const path = `wishes/${wishId}`;
  try {
    const wishRef = doc(db, 'wishes', wishId);
    await updateDoc(wishRef, {
      likes: increment(1),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

// --- RSVP Confirmations Functions ---
export interface RsvpData {
  name: string;
  attending: boolean;
  guestsCount: number;
  relation: string;
  note?: string;
  dietary?: string;
}

export async function submitRsvpToFirebase(rsvp: RsvpData): Promise<string> {
  const path = 'rsvps';
  try {
    const docRef = await addDoc(collection(db, path), {
      name: rsvp.name.trim().slice(0, 100),
      attending: rsvp.attending,
      guestsCount: Number(rsvp.guestsCount) || 1,
      relation: (rsvp.relation || 'Khách mời').trim().slice(0, 100),
      note: (rsvp.note || '').trim().slice(0, 500),
      dietary: (rsvp.dietary || '').trim().slice(0, 200),
      createdAt: serverTimestamp(),
      submittedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

export function subscribeToRsvps(onRsvpUpdate: (rsvps: any[]) => void): () => void {
  const path = 'rsvps';
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        onRsvpUpdate(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}
