import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getBaseURL } from "../../utils/baseURL";

interface LikeResponse {
  success: boolean;
  message?: string;
}

export const postLikeAPI = createApi({
  reducerPath: "postLikeAPI",
  baseQuery: fetchBaseQuery({
    baseUrl: `${getBaseURL()}/api/likes`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
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
      // invalidatesTags receives (_result, _error, arg)
      invalidatesTags: (_result, _error, postId) => [{ type: "PostLikes" as const, id: postId }],
    }),
    getPostLikes: builder.query<string[], string>({
      query: (postId) => `/likes/${postId}`,
      providesTags: (_result, _error, postId) => [{ type: "PostLikes" as const, id: postId }],
    }),
  }),
});

export const {
  useLikePostMutation,
  useGetPostLikesQuery,
} = postLikeAPI;