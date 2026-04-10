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
      providesTags: (result, error, id) => [{ type: "Post", id }],
    }),

    getPostByUserId: builder.query({
      query: (userId) => `/user/${userId}`,
      providesTags: (result, error, userId) => [{ type: "Post", id: `user-${userId}` }],
    }),

    getPostByUserIdRecent: builder.query({
      query: (userId) => `/user-recent/${userId}`,
      providesTags: (result, error, userId) => [{ type: "Post", id: `user-recent-${userId}` }],
    }),

    editPost: builder.mutation({
      query: ({ id, other_details }) => ({
        url: `/${id}`,
        method: "PUT",
        body: { other_details },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Post", id }, "Post"],
    }),

    requestDeletePost: builder.mutation({
      query: (id) => ({
        url: `/${id}/delete-request`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Post", id }, "Post"],
    }),

    updatePostStatus: builder.mutation({
      query: ({ id, post_status }) => ({
        url: `/${id}/status`,
        method: "PUT",
        body: { post_status },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Post", id }, "Post"],
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
      invalidatesTags: (result, error, id) => [{ type: "Post", id }, "Post"],
    }),
  }),
});

export const {
  useCreatePostMutation,
  useGetPostsQuery,
  useGetPostByIdQuery,
  useGetPostByUserIdQuery,
  useGetPostByUserIdRecentQuery,
  useEditPostMutation,
  useRequestDeletePostMutation,
  useUpdatePostStatusMutation,
  useGetAllDeleteRequestedPostsQuery,
  useDeletePostMutation,
} = postAPI;