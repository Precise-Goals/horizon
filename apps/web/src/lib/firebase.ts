/**
 * Firebase Client Adapter for Horizon
 * Initialized exclusively via Zod-validated environment credentials.
 */
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getDatabase, type Database } from 'firebase/database';
import { env } from '../env';

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
  databaseURL: env.VITE_FIREBASE_DATABASE_URL,
};

let app: FirebaseApp;
let auth: Auth;
let rtdb: Database;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  rtdb = getDatabase(app);
} catch (error) {
  console.error('[Firebase Init Error]: Failed to initialize Firebase client with provided credentials.', error);
  throw error;
}

export const firebaseApp = app;
export const firebaseAuth = auth;
export const firebaseDatabase = rtdb;
