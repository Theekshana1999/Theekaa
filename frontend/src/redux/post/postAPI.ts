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
    createPost: builder.mutation({
      query: (postData) => ({
        url: "/",
        method: "POST",
        body: postData,
      }),
      invalidatesTags: ["Post"],
    }),

    getPosts: builder.query({
      query: () => "/",
      providesTags: ["Post"],
    }),

    getPostById: builder.query({
      query: (id) => `/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Post", id }],
    }),

    getPostByUserId: builder.query({
      query: (userId) => `/user/${userId}`,
      providesTags: (_result, _error, userId) => [{ type: "Post", id: `user-${userId}` }],
    }),

    // ✅ This is the missing export that CurrentPost.tsx needs
    getPostByUser: builder.query({
      query: (userId) => `/user/${userId}`,
      providesTags: (_result, _error, userId) => [{ type: "Post", id: `user-posts-${userId}` }],
    }),

    getPostByUserIdRecent: builder.query({
      query: (userId) => `/user-recent/${userId}`,
      providesTags: (_result, _error, userId) => [{ type: "Post", id: `user-recent-${userId}` }],
    }),

    editPost: builder.mutation({
      query: ({ id, other_details }) => ({
        url: `/${id}`,
        method: "PUT",
        body: { other_details },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Post", id }, "Post"],
    }),

    requestDeletePost: builder.mutation({
      query: (id) => ({
        url: `/${id}/delete-request`,
        method: "PUT",
      }),
      invalidatesTags: (_result, _error, id) => [{ type: "Post", id }, "Post"],
    }),

    updatePostStatus: builder.mutation({
      query: ({ id, post_status }) => ({
        url: `/${id}/status`,
        method: "PUT",
        body: { post_status },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Post", id }, "Post"],
    }),

    getAllDeleteRequestedPosts: builder.query({
      query: () => "/delete-requests",
      providesTags: ["Post"],
    }),

    deletePost: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [{ type: "Post", id }, "Post"],
    }),
  }),
});

export const {
  useCreatePostMutation,
  useGetPostsQuery,
  useGetPostByIdQuery,
  useGetPostByUserIdQuery,
  useGetPostByUserQuery, // ✅ Added this export
  useGetPostByUserIdRecentQuery,
  useEditPostMutation,
  useRequestDeletePostMutation,
  useUpdatePostStatusMutation,
  useGetAllDeleteRequestedPostsQuery,
  useDeletePostMutation,
} = postAPI;