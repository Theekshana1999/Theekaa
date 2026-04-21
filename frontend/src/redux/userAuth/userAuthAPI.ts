import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getBaseURL } from "../../utils/baseURL";

type SigninCredentials = {
  email?: string;
  phone?: string;
  password: string;
};

export const userAuthAPI = createApi({
  reducerPath: "userAuthAPI",
  baseQuery: fetchBaseQuery({
    baseUrl: `${getBaseURL()}/api/users`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    Signin: builder.mutation<any, SigninCredentials>({
      query: (credentials) => ({
        url: "/sign-in",
        method: "POST",
        body: credentials,
      }),
    }),
    Signup: builder.mutation<any, any>({
      query: (userData) => ({
        url: "/sign-up",
        method: "POST",
        body: userData,
      }),
    }),
    getUser: builder.query<any, string>({
      query: (id) => `/get-user/${id}`,
    }),
    getAllUser: builder.query<any[], void>({
      query: () => `/get-all-users`,
    }),
    UpdateProfile: builder.mutation<any, { id: string; [key: string]: any }>({
      query: ({ id, ...profileData }) => ({
        url: `/update-profile/${id}`,
        method: "PUT",
        body: profileData,
      }),
    }),
    forgotPassword: builder.mutation<any, { email: string }>({
      query: (email) => ({
        url: `/forgot-password`,
        method: "POST",
        body: email,
      }),
    }),
    resetPassword: builder.mutation<any, { email: string; otp: string; newPassword: string }>({
      query: ({ email, otp, newPassword }) => ({
        url: `/reset-password`,
        method: "POST",
        body: { email, otp, newPassword },
      }),
    }),
    deleteUserById: builder.mutation<any, string>({
      query: (id) => ({
        url: `/delete-user/${id}`,
        method: "DELETE",
      }),
    }),
    addProfilePicture: builder.mutation<any, { profilePictureUrl: string }>({
      query: ({ profilePictureUrl }) => ({
        url: `/add-profile-picture`,
        method: "POST",
        body: { profilePictureUrl },
      }),
    }),
    removeProfilePicture: builder.mutation<any, void>({
      query: () => ({
        url: `/remove-profile-picture`,
        method: "PUT",
      }),
    }),
    updateProfilePicture: builder.mutation<any, { profilePictureUrl: string }>({
      query: ({ profilePictureUrl }) => ({
        url: `/update-profile-picture`,
        method: "PUT",
        body: { profilePictureUrl },
      }),
    }),
    updateUserProfileStatus: builder.mutation<any, { userId: string; status: any }>({
      query: ({ userId, status }) => ({
        url: `/update-profile-status`,
        method: "PUT",
        body: { userId, status },
      }),
    }),
  }),
});

export const {
  useSigninMutation,
  useSignupMutation,
  useGetUserQuery,
  useGetAllUserQuery,
  useUpdateProfileMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useDeleteUserByIdMutation,
  useAddProfilePictureMutation,
  useRemoveProfilePictureMutation,
  useUpdateProfilePictureMutation,
  useUpdateUserProfileStatusMutation,
} = userAuthAPI;