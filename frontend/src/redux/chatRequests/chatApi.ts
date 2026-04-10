import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getBaseURL } from "../../utils/baseURL";

export const chatAPI = createApi({
  reducerPath: "chatAPI",
  baseQuery: fetchBaseQuery({
    baseUrl: `${getBaseURL()}/api/chat`,
    prepareHeaders: (headers) => {
      // ✅ Get token from localStorage
      const token = localStorage.getItem("token");
      
      console.log("Chat API - Token from localStorage:", token); // Debug log
      
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
        console.log("Chat API - Authorization header set"); // Debug log
      } else {
        console.warn("Chat API - No token found in localStorage");
      }
      return headers;
    },
  }),
  tagTypes: ["SentRequests", "ReceivedRequests", "BlockedUsers"],
  endpoints: (builder) => ({

    // ✅ Make a chat request
    makeRequest: builder.mutation({
      query: (requestData) => ({
        url: "/request",
        method: "POST",
        body: requestData,
      }),
      invalidatesTags: ["SentRequests", "ReceivedRequests"],
    }),

    // ✅ Get received chat requests
    getReceivedRequests: builder.query({
      query: (receiverId: string) => `/received/${receiverId}`,
      providesTags: ["ReceivedRequests"],
    }),

    // ✅ Get sent chat requests
    getSentRequests: builder.query({
      query: (senderId: string) => `/sent/${senderId}`,
      providesTags: ["SentRequests"],
    }),

    // ✅ Update request status (Accept/Reject/Cancel)
    updateRequestStatus: builder.mutation({
      query: ({ requestId, status }: { requestId: string; status: string }) => ({
        url: `/status/${requestId}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["ReceivedRequests", "SentRequests"],
    }),

    // ✅ Block a user
    blockUser: builder.mutation({
      query: ({ blockerId, blockedId }: { blockerId: string; blockedId: string }) => ({
        url: "/block-user",
        method: "POST",
        body: { blockerId, blockedId },
      }),
      invalidatesTags: ["ReceivedRequests", "SentRequests", "BlockedUsers"],
    }),

    // ✅ Unblock a user
    unblockUser: builder.mutation({
      query: ({ unblockerId, unblockedId }: { unblockerId: string; unblockedId: string }) => ({
        url: "/unblock-user",
        method: "POST",
        body: { unblockerId, unblockedId },
      }),
      invalidatesTags: ["ReceivedRequests", "SentRequests", "BlockedUsers"],
    }),

    // ✅ Get blocked users list
    getBlockedUsers: builder.query({
      query: (userId: string) => `/blocked-users/${userId}`,
      providesTags: ["BlockedUsers"],
    }),

    // ✅ Get all conversations
    getConversations: builder.query({
      query: (userId: string) => `/conversations/${userId}`,
      providesTags: ["SentRequests"],
    }),

    // ✅ Get messages in a conversation
    getMessages: builder.query({
      query: ({ conversationId, page = 1, limit = 50 }: { conversationId: string; page?: number; limit?: number }) => 
        `/messages/${conversationId}?page=${page}&limit=${limit}`,
      providesTags: (result, error, { conversationId }) => [{ type: "SentRequests", id: conversationId }],
    }),

    // ✅ Send a message
    sendMessage: builder.mutation({
      query: (messageData) => ({
        url: "/message",
        method: "POST",
        body: messageData,
      }),
      invalidatesTags: ["SentRequests"],
    }),

    // ✅ Delete a conversation
    deleteConversation: builder.mutation({
      query: (conversationId: string) => ({
        url: `/conversation/${conversationId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SentRequests"],
    }),

    // ✅ Mark messages as read
    markAsRead: builder.mutation({
      query: (conversationId: string) => ({
        url: `/mark-read/${conversationId}`,
        method: "PUT",
      }),
      invalidatesTags: ["SentRequests"],
    }),
  }),
});

export const {
  useMakeRequestMutation,
  useGetReceivedRequestsQuery,
  useGetSentRequestsQuery,
  useUpdateRequestStatusMutation,
  useBlockUserMutation,
  useUnblockUserMutation,
  useGetBlockedUsersQuery,
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useDeleteConversationMutation,
  useMarkAsReadMutation,
} = chatAPI;