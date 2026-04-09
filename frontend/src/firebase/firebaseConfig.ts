import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  signInAnonymously,
  type User,
  type Auth,
} from "firebase/auth";
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth: Auth = getAuth(app);

/**
 * Ensure there's a Firebase user (anonymous sign-in).
 */
export const signInToFirebase = async (): Promise<void> => {
  try {
    const user: User | null = auth.currentUser;
    if (user) return;

    const cred = await signInAnonymously(auth);

    // Use cred.user (guaranteed) instead of auth.currentUser (may be null momentarily)
    console.log("Firebase anonymous auth OK:", cred.user.uid);
  } catch (error) {
    console.error("Firebase sign-in failed:", error);
  }
};

export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn("FCM not supported in this browser.");
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission denied.");
      return null;
    }

    if (!("serviceWorker" in navigator)) {
      console.warn("Service workers not supported.");
      return null;
    }

    const swRegistration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );
    await navigator.serviceWorker.ready;
    console.log("FCM service worker ready:", swRegistration.scope);

    const messaging = getMessaging(app);

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;
    if (!vapidKey) {
      console.warn("Missing VITE_FIREBASE_VAPID_KEY in env.");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: swRegistration,
    });

    if (!token) {
      console.warn("FCM getToken returned empty. Check VAPID key in .env");
      return null;
    }

    console.log("FCM token:", token.slice(0, 24) + "...");
    return token;
  } catch (error) {
    console.error("requestNotificationPermission error:", error);
    return null;
  }
};

export const onForegroundMessage = (callback: (payload: any) => void) => {
  const messaging = getMessaging(app);
  return onMessage(messaging, callback);
};

export default app;