import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getBaseURL } from "../../utils/baseURL";

export const postAPI = createApi({
  reducerPath: "postAPI",
  baseQuery: fetchBaseQuery({
    baseUrl: `${getBaseURL()}/api/posts`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Post"],
  endpoints: (builder) => ({
    createPost: builder.mutation<any, any>({
      query: (postData) => ({
        url: "/",
        method: "POST",
        body: postData,
      }),
      invalidatesTags: ["Post"],
    }),

    getPosts: builder.query<any[], void>({
      query: () => "/",
      providesTags: ["Post"],
    }),

    getPostById: builder.query<any, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Post" as const, id }],
    }),

    getPostByUserId: builder.query<any[], string>({
      query: (userId) => `/user/${userId}`,
      providesTags: (_result, _error, userId) => [{ type: "Post" as const, id: `user-${userId}` }],
    }),

    // This export is intentionally kept to match your CurrentPost.tsx usage
    getPostByUser: builder.query<any[], string>({
      query: (userId) => `/user/${userId}`,
      providesTags: (_result, _error, userId) => [{ type: "Post" as const, id: `user-posts-${userId}` }],
    }),

    getPostByUserIdRecent: builder.query<any[], string>({
      query: (userId) => `/user-recent/${userId}`,
      providesTags: (_result, _error, userId) => [{ type: "Post" as const, id: `user-recent-${userId}` }],
    }),

    editPost: builder.mutation<any, { id: string; other_details: any }>({
      query: ({ id, other_details }) => ({
        url: `/${id}`,
        method: "PUT",
        body: { other_details },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Post" as const, id }, "Post"],
    }),

    requestDeletePost: builder.mutation<any, string>({
      query: (id) => ({
        url: `/${id}/delete-request`,
        method: "PUT",
      }),
      invalidatesTags: (_result, _error, id) => [{ type: "Post" as const, id }, "Post"],
    }),

    updatePostStatus: builder.mutation<any, { id: string; post_status: any }>({
      query: ({ id, post_status }) => ({
        url: `/${id}/status`,
        method: "PUT",
        body: { post_status },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Post" as const, id }, "Post"],
    }),

    getAllDeleteRequestedPosts: builder.query<any[], void>({
      query: () => "/delete-requests",
      providesTags: ["Post"],
    }),

    deletePost: builder.mutation<any, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [{ type: "Post" as const, id }, "Post"],
    }),
  }),
});

export const {
  useCreatePostMutation,
  useGetPostsQuery,
  useGetPostByIdQuery,
  useGetPostByUserIdQuery,
  useGetPostByUserQuery,
  useGetPostByUserIdRecentQuery,
  useEditPostMutation,
  useRequestDeletePostMutation,
  useUpdatePostStatusMutation,
  useGetAllDeleteRequestedPostsQuery,
  useDeletePostMutation,
} = postAPI;