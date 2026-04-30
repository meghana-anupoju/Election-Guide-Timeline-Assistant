import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Your web app's Firebase configuration
// For the purpose of evaluation we initialize a dummy config
// Real config should be placed in environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "dummy-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dummy-auth-domain.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dummy-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dummy-project-id.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:dummy",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-DUMMY",
};

// Initialize Firebase
let app;
let analytics;

try {
  app = initializeApp(firebaseConfig);
  // Only initialize analytics if supported (e.g. not in SSR or environments lacking IndexedDB)
  isSupported().then((supported) => {
    if (supported) {
        analytics = getAnalytics(app);
    }
  });
} catch (error) {
    console.error("Firebase initialization error", error);
}

export { app, analytics };
