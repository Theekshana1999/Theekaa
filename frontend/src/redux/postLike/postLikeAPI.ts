import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getBaseURL } from "../../utils/baseURL";

interface LikeResponse {
  success: boolean;
  message?: string;
}

export interface PostLikesResponse {
  likedByUser: boolean;
  totalLikes: number;
  likedUsers: string[]; // adjust to { _id: string; name?: string }[] if your backend returns objects
}

export const postLikeAPI = createApi({
  reducerPath: "postLikeAPI",
  baseQuery: fetchBaseQuery({
    baseUrl: `${getBaseURL()}/api/likes`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["PostLikes"],
  endpoints: (builder) => ({
    likePost: builder.mutation<LikeResponse, string>({
      query: (postId) => ({
        url: `/like/${postId}`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, postId) => [{ type: "PostLikes" as const, id: postId }],
    }),
    getPostLikes: builder.query<PostLikesResponse, string>({
      query: (postId) => `/likes/${postId}`,
      providesTags: (_result, _error, postId) => [{ type: "PostLikes" as const, id: postId }],
    }),
  }),
});

export const { useLikePostMutation, useGetPostLikesQuery } = postLikeAPI;