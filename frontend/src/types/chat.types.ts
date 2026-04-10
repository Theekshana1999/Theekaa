export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: any;
  read: boolean;
  status: "sent" | "delivered" | "read";
  deleted?: boolean;
}

export interface ChatRoom {
  participants: string[];
  lastMessage: string;
  lastMessageAt: string;
  lastSenderId: string;
}

export type ChatRoomWithId = ChatRoom & { id: string };

export type IChatMessage = Message;
export type IChatRoom = ChatRoomWithId;

export interface IChatContextType {
  currentChatRoom: IChatRoom | null;
  messages: IChatMessage[];
  loading: boolean;
  error: string | null;
  openChat: (otherUserId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  muteChat: (chatRoomId: string) => Promise<void>;
  unmuteChat: (chatRoomId: string) => Promise<void>;
  archiveChat: (chatRoomId: string) => Promise<void>;
  unarchiveChat: (chatRoomId: string) => Promise<void>;
}
