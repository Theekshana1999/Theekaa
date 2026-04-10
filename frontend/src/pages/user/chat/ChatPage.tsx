import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Chat from "./Chat";

// No Firebase auth needed — currentUserId comes from Redux in <Chat />

const ChatPage: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const otherUserId    = params.get("with")   ?? "";
  const otherUserName  = params.get("name")   ?? "User";
  const otherUserAvatar = params.get("avatar") ?? undefined;

  if (!otherUserId) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500 text-sm">
        No user selected. Go back and open a chat from your requests.
      </div>
    );
  }

  return (
    <Chat
      otherUserId={otherUserId}
      otherUserName={otherUserName}
      otherUserAvatar={otherUserAvatar}
      onBack={() => navigate(-1)}
    />
  );
};

export default ChatPage;
