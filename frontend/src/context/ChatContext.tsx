import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useSelector } from "react-redux";

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

import type { IChatRoom, IChatMessage, IChatContextType } from "../types/chat.types";

const ChatContext = createContext<IChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentChatRoom, setCurrentChatRoom] = useState<IChatRoom | null>(null);
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeOtherUserId, setActiveOtherUserId] = useState<string>("");

  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Pull currentUserId from Redux — no Firebase Auth needed
  const currentUserId: string =
    useSelector((state: any) => state.user.user?._id) ?? "";

  const openChat = useCallback(
    async (otherUserId: string) => {
      setLoading(true);
      setError(null);

      try {
        setActiveOtherUserId(otherUserId);

        const chatRoom = await getOrCreateChatRoom(currentUserId, otherUserId);
        setCurrentChatRoom(chatRoom);

        unsubscribeRef.current?.();

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
    async (content: string) => {
      if (!currentChatRoom) { setError("No chat room selected"); return; }
      if (!activeOtherUserId) { setError("No receiver selected"); return; }

      setLoading(true);
      setError(null);

      try {
        await sendMessageService(
          currentChatRoom.id,
          currentUserId,
          activeOtherUserId,
          content
        );
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
      try {
        await editMessageService(currentChatRoom.id, messageId, newContent);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to edit message");
      }
    },
    [currentChatRoom]
  );

  const deleteChatMessage = useCallback(
    async (messageId: string) => {
      if (!currentChatRoom) return;
      try {
        await deleteMessageService(currentChatRoom.id, messageId);
      } catch (err) {
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
