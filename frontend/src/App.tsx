import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import useInitFCM from "./hooks/useInitFCM";
import { onForegroundMessage } from "./firebase/firebaseConfig";

const App = () => {
  const userId = useSelector((state: any) => state.user.user?._id);

  useInitFCM(userId);

  useEffect(() => {
    const unsubscribe = onForegroundMessage((payload) => {
      const title = payload.notification?.title ?? "New message";
      const body = payload.notification?.body ?? "";

      if (Notification.permission === "granted") {
        new Notification(title, {
          body,
          icon: "/logo.png",
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 pt-16 pb-32">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default App;