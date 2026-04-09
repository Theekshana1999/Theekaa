import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  where,
  getDocs,
} from "firebase/firestore";
import type { Unsubscribe } from "firebase/firestore";

import { db } from "../../firebase/firebaseConfig";
import type { Message, ChatRoom } from "../../types/chat.types";

export const getRoomId = (a: string, b: string): string => [a, b].sort().join("_");

export const subscribeToMessages = (
  roomId: string,
  onUpdate: (messages: Message[]) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  const q = query(collection(db, "chats", roomId, "messages"), orderBy("createdAt", "asc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const msgs: Message[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Message, "id">),
        createdAt: docSnap.data().createdAt?.toDate?.() ?? new Date(),
      }));

      onUpdate(msgs);
    },
    (error) => {
      console.error("Firestore onSnapshot error:", error.code, error.message);
      onError?.(error);
    }
  );
};

export const sendMessage = async (
  roomId: string,
  senderId: string,
  receiverId: string,
  text: string
): Promise<string> => {
  const msgRef = await addDoc(collection(db, "chats", roomId, "messages"), {
    senderId,
    receiverId,
    text,
    createdAt: serverTimestamp(),
    read: false,
    status: "sent",
  });

  await setDoc(
    doc(db, "chats", roomId),
    {
      participants: [senderId, receiverId],
      lastMessage: text,
      lastMessageAt: new Date().toISOString(),
      lastSenderId: senderId,
    } satisfies ChatRoom,
    { merge: true }
  );

  return msgRef.id;
};

export const markMessagesAsRead = async (roomId: string, currentUserId: string): Promise<void> => {
  const q = query(
    collection(db, "chats", roomId, "messages"),
    where("receiverId", "==", currentUserId),
    where("read", "==", false)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return;

  await Promise.all(snapshot.docs.map((msgDoc) => updateDoc(msgDoc.ref, { read: true, status: "read" })));
};

/* ------------------------------------------------------------------ */
/* Compatibility exports used by src/context/ChatContext.tsx            */
/* ------------------------------------------------------------------ */

export const getOrCreateChatRoom = async (
  currentUserId: string,
  otherUserId: string
): Promise<{ id: string } & Partial<ChatRoom>> => {
  const roomId = getRoomId(currentUserId, otherUserId);

  await setDoc(
    doc(db, "chats", roomId),
    {
      participants: [currentUserId, otherUserId],
      lastMessage: "",
      lastMessageAt: new Date().toISOString(),
      lastSenderId: "",
    },
    { merge: true }
  );

  return { id: roomId };
};

export const fetchMessages = async (_roomId: string): Promise<Message[]> => {
  // Not needed if you use realtime onSnapshot
  return [];
};

export const editMessage = async (roomId: string, messageId: string, newText: string): Promise<void> => {
  await updateDoc(doc(db, "chats", roomId, "messages", messageId), { text: newText });
};

export const deleteMessage = async (roomId: string, messageId: string): Promise<void> => {
  // If you want true deletion, you can use deleteDoc() from firebase/firestore.
  // This soft-delete avoids changing imports.
  await updateDoc(doc(db, "chats", roomId, "messages", messageId), { text: "", deleted: true });
};

export const markMessageAsRead = async (roomId: string, currentUserId: string): Promise<void> => {
  await markMessagesAsRead(roomId, currentUserId);
};

export const muteChat = async (
  _currentUserId: string,
  _chatRoomId: string,
  _mute: boolean
): Promise<void> => {
  // No-op until you implement mute state in Firestore
};

export const archiveChat = async (
  _currentUserId: string,
  _chatRoomId: string,
  _archive: boolean
): Promise<void> => {
  // No-op until you implement archive state in Firestore
};

export const updateChatMetadata = async (
  _currentUserId: string,
  _chatRoomId: string,
  _metadata: Record<string, unknown>
): Promise<void> => {
  // No-op until you implement metadata in Firestore
};