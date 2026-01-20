/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL, defaults to '/' */
  readonly BASE_URL: string;
  /** Current mode that can be set to 'development' or 'production' */
  readonly MODE: string;
  /** Flag if app is run in development or production */
  readonly DEV: boolean;
  readonly PROD: boolean;
  /** Flag to indicate server-side rendering */
  readonly SSR: boolean;

  // Custom environment variables
  readonly VITE_STRIPE_PAYMENT_LINK?: string;
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  readonly VITE_ENCRYPTION_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
