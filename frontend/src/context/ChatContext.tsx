import { createContext, useCallback, useContext, useRef, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";
import {
  getOrCreateChatRoom,
  sendMessage as sendMessageService,
  editMessage as editMessageService,
  deleteMessage as deleteMessageService,
  markMessageAsRead as markMessageAsReadService,
  muteChat as muteChatService,
  archiveChat as archiveChatService,
  updateChatMetadata,
} from "../services/firebase/chatService";

import type { IChatRoom, IChatMessage } from "../types/chat.types";

// Define the context type locally or import from types
export interface IChatContextType {
  currentChatRoom: IChatRoom | null;
  messages: IChatMessage[];
  loading: boolean;
  error: string | null;
  openChat: (otherUserId: string) => Promise<void>;
  sendMessage: (content: string, images?: File[]) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  muteChat: (chatRoomId: string) => Promise<void>;
  unmuteChat: (chatRoomId: string) => Promise<void>;
  archiveChat: (chatRoomId: string) => Promise<void>;
  unarchiveChat: (chatRoomId: string) => Promise<void>;
}

const ChatContext = createContext<IChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentChatRoom, setCurrentChatRoom] = useState<IChatRoom | null>(null);
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // track the user you're chatting with (needed because sendMessage needs receiverId)
  const [activeOtherUserId, setActiveOtherUserId] = useState<string>("");

  const unsubscribeRef = useRef<(() => void) | null>(null);

  // TODO: Replace with real auth value (Redux/Firebase Auth/etc.)
  const currentUserId = "";

  const openChat = useCallback(
    async (otherUserId: string) => {
      setLoading(true);
      setError(null);

      try {
        setActiveOtherUserId(otherUserId);

        // Ensure room exists + get room (includes id)
        const chatRoom = await getOrCreateChatRoom(currentUserId, otherUserId);
        setCurrentChatRoom(chatRoom);

        // Stop previous listener
        if (unsubscribeRef.current) unsubscribeRef.current();

        // Listen to messages under: chats/{roomId}/messages
        const msgsQuery = query(
          collection(db, "chats", chatRoom.id, "messages"),
          orderBy("createdAt", "asc")
        );

        unsubscribeRef.current = onSnapshot(msgsQuery, (snapshot) => {
          const fetched = snapshot.docs.map((d) => {
            const data = d.data() as any;
            return {
              id: d.id,
              ...data,
              createdAt: data?.createdAt?.toDate?.() ?? new Date(),
            } as IChatMessage;
          });

          setMessages(fetched);
        });

        // optional metadata (currently no-op in service until you implement it)
        await updateChatMetadata(currentUserId, chatRoom.id, {
          unreadCount: 0,
          lastReadTime: new Date(),
        });
      } catch (err) {
        console.error("Error opening chat:", err);
        setError(err instanceof Error ? err.message : "Failed to open chat");
      } finally {
        setLoading(false);
      }
    },
    [currentUserId]
  );

  const sendChatMessage = useCallback(
    async (content: string, _images?: File[]) => {
      if (!currentChatRoom) {
        setError("No chat room selected");
        return;
      }
      if (!activeOtherUserId) {
        setError("No receiver selected");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // sendMessage(roomId, senderId, receiverId, text)
        await sendMessageService(currentChatRoom.id, currentUserId, activeOtherUserId, content);
      } catch (err) {
        console.error("Error sending message:", err);
        setError(err instanceof Error ? err.message : "Failed to send message");
      } finally {
        setLoading(false);
      }
    },
    [currentChatRoom, currentUserId, activeOtherUserId]
  );

  const editChatMessage = useCallback(
    async (messageId: string, newContent: string) => {
      if (!currentChatRoom) return;
      setError(null);

      try {
        await editMessageService(currentChatRoom.id, messageId, newContent);
      } catch (err) {
        console.error("Error editing message:", err);
        setError(err instanceof Error ? err.message : "Failed to edit message");
      }
    },
    [currentChatRoom]
  );

  const deleteChatMessage = useCallback(
    async (messageId: string) => {
      if (!currentChatRoom) return;
      setError(null);

      try {
        await deleteMessageService(currentChatRoom.id, messageId);
      } catch (err) {
        console.error("Error deleting message:", err);
        setError(err instanceof Error ? err.message : "Failed to delete message");
      }
    },
    [currentChatRoom]
  );

  const markAsRead = useCallback(
    async (_messageId: string) => {
      if (!currentChatRoom) return;
      try {
        await markMessageAsReadService(currentChatRoom.id, currentUserId);
      } catch (err) {
        console.error("Error marking as read:", err);
      }
    },
    [currentChatRoom, currentUserId]
  );

  const muteChatRoom = useCallback(
    async (chatRoomId: string) => {
      try {
        await muteChatService(currentUserId, chatRoomId, true);
      } catch (err) {
        console.error("Error muting chat:", err);
        setError(err instanceof Error ? err.message : "Failed to mute chat");
      }
    },
    [currentUserId]
  );

  const unmuteChatRoom = useCallback(
    async (chatRoomId: string) => {
      try {
        await muteChatService(currentUserId, chatRoomId, false);
      } catch (err) {
        console.error("Error unmuting chat:", err);
        setError(err instanceof Error ? err.message : "Failed to unmute chat");
      }
    },
    [currentUserId]
  );

  const archiveChatRoom = useCallback(
    async (chatRoomId: string) => {
      try {
        await archiveChatService(currentUserId, chatRoomId, true);
      } catch (err) {
        console.error("Error archiving chat:", err);
        setError(err instanceof Error ? err.message : "Failed to archive chat");
      }
    },
    [currentUserId]
  );

  const unarchiveChatRoom = useCallback(
    async (chatRoomId: string) => {
      try {
        await archiveChatService(currentUserId, chatRoomId, false);
      } catch (err) {
        console.error("Error unarchiving chat:", err);
        setError(err instanceof Error ? err.message : "Failed to unarchive chat");
      }
    },
    [currentUserId]
  );

  const value: IChatContextType = {
    currentChatRoom,
    messages,
    loading,
    error,
    openChat,
    sendMessage: sendChatMessage,
    editMessage: editChatMessage,
    deleteMessage: deleteChatMessage,
    markAsRead,
    muteChat: muteChatRoom,
    unmuteChat: unmuteChatRoom,
    archiveChat: archiveChatRoom,
    unarchiveChat: unarchiveChatRoom,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = (): IChatContextType => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within ChatProvider");
  return context;
};

export default ChatContext;
