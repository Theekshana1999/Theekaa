// types/chat.types.ts

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: any;
  read: boolean;
  status: "sent" | "delivered" | "read";
  // optional extra fields you may add later
  deleted?: boolean;
}

export interface ChatRoom {
  participants: string[];
  lastMessage: string;
  lastMessageAt: string;
  lastSenderId: string;
}

export interface ChatUser {
  _id: string;
  first_name: string;
  last_name: string;
  ProfilePicture?: string;
}

/** Backward-compatible aliases (fix imports expecting I-prefixed names) */
export type IChatMessage = Message;
export type IChatRoom = ChatRoom;

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