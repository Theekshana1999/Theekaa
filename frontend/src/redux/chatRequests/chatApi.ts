import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getBaseURL } from "../../utils/baseURL";

export const chatAPI = createApi({
  reducerPath: "chatAPI",
  baseQuery: fetchBaseQuery({
    baseUrl: `${getBaseURL()}/api/chat`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["SentRequests", "ReceivedRequests", "BlockedUsers"],
  endpoints: (builder) => ({
    makeRequest: builder.mutation({
      query: (requestData) => ({
        url: "/request",
        method: "POST",
        body: requestData,
      }),
      invalidatesTags: ["SentRequests", "ReceivedRequests"],
    }),

    getReceivedRequests: builder.query({
      query: (receiverId: string) => `/received/${receiverId}`,
      providesTags: ["ReceivedRequests"],
    }),

    getSentRequests: builder.query({
      query: (senderId: string) => `/sent/${senderId}`,
      providesTags: ["SentRequests"],
    }),

    updateRequestStatus: builder.mutation({
      query: ({ requestId, status }: { requestId: string; status: string }) => ({
        url: `/status/${requestId}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["ReceivedRequests", "SentRequests"],
    }),

    blockUser: builder.mutation({
      query: ({ blockerId, blockedId }: { blockerId: string; blockedId: string }) => ({
        url: "/block-user",
        method: "POST",
        body: { blockerId, blockedId },
      }),
      invalidatesTags: ["ReceivedRequests", "SentRequests", "BlockedUsers"],
    }),

    unblockUser: builder.mutation({
      query: ({ unblockerId, unblockedId }: { unblockerId: string; unblockedId: string }) => ({
        url: "/unblock-user",
        method: "POST",
        body: { unblockerId, unblockedId },
      }),
      invalidatesTags: ["ReceivedRequests", "SentRequests", "BlockedUsers"],
    }),

    getBlockedUsers: builder.query({
      query: (userId: string) => `/blocked-users/${userId}`,
      providesTags: ["BlockedUsers"],
    }),

    getConversations: builder.query({
      query: (userId: string) => `/conversations/${userId}`,
      providesTags: ["SentRequests"],
    }),

    // ✅ Fixed: Changed unused 'result' and 'error' to '_result' and '_error'
    getMessages: builder.query({
      query: ({ conversationId, page = 1, limit = 50 }: { conversationId: string; page?: number; limit?: number }) => 
        `/messages/${conversationId}?page=${page}&limit=${limit}`,
      providesTags: (_result, _error, { conversationId }) => [{ type: "SentRequests", id: conversationId }],
    }),

    sendMessage: builder.mutation({
      query: (messageData) => ({
        url: "/message",
        method: "POST",
        body: messageData,
      }),
      invalidatesTags: ["SentRequests"],
    }),

    deleteConversation: builder.mutation({
      query: (conversationId: string) => ({
        url: `/conversation/${conversationId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SentRequests"],
    }),

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