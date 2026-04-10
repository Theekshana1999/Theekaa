import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
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

/* =========================
   ✅ REQUEST PERMISSION + TOKEN
========================= */
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    const supported = await isSupported();
    if (!supported) {
      console.log("❌ FCM not supported in this browser");
      return null;
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("❌ Notification permission denied");
      return null;
    }

    const messaging = getMessaging(app);

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    if (token) {
      console.log("✅ FCM Token:", token);
      return token;
    } else {
      console.log("❌ No token received");
      return null;
    }
  } catch (error) {
    console.error("❌ Error getting FCM token:", error);
    return null;
  }
};

/* =========================
   ✅ FOREGROUND MESSAGE LISTENER (SYNC)
========================= */
export const onForegroundMessage = (
  callback: (payload: any) => void
): (() => void) => {
  const messaging = getMessaging(app);

  return onMessage(messaging, (payload) => {
    console.log("📩 Foreground message:", payload);
    callback(payload);
  });
};

export default app;