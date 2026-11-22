/* Konfiguration aus den Umgebungsvariablen beim Bauen (.env.local, siehe .env.example).
   Ohne sie startet die App in der Vorschau ohne Anmeldung. Alle Werte sind keine Geheimnisse. */
import type { FirebaseOptions } from 'firebase/app';

export interface FirebaseEnv {
  options: FirebaseOptions;
  tenantId: string; // Microsoft-365-Tenant des Vereins
}

export function firebaseEnv(): FirebaseEnv | null {
  const e = import.meta.env;
  if (!e.VITE_FIREBASE_API_KEY || !e.VITE_FIREBASE_PROJECT_ID || !e.VITE_MS_TENANT_ID) return null;
  return {
    options: {
      apiKey: e.VITE_FIREBASE_API_KEY,
      authDomain: e.VITE_FIREBASE_AUTH_DOMAIN || `${e.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: e.VITE_FIREBASE_PROJECT_ID,
      storageBucket: e.VITE_FIREBASE_STORAGE_BUCKET || `${e.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
      appId: e.VITE_FIREBASE_APP_ID,
    },
    tenantId: e.VITE_MS_TENANT_ID,
  };
}
