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