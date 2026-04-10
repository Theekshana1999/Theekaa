import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getBaseURL } from "../../utils/baseURL";

export const userAuthAPI = createApi({
    reducerPath: "userAuthAPI",
    baseQuery: fetchBaseQuery({ 
        baseUrl: `${getBaseURL()}/api/users`,
        prepareHeaders: (headers) => {
            // Get token from localStorage
            const token = localStorage.getItem("token");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        Signin: builder.mutation({
            query: (credentials) => ({
                url: "/sign-in",
                method: "POST",
                body: credentials,
            }),
        }),
        Signup: builder.mutation({
            query: (userData) => ({
                url: "/sign-up",
                method: "POST",
                body: userData,
            }),
        }),
        getUser: builder.query({
            query: (id) => ({
                url: `/get-user/${id}`,
                method: "GET",
            }),
        }),
        getAllUser: builder.query({
            query: () => ({
                url: `/get-all-users`,
                method: "GET",
            }),
        }),
        UpdateProfile: builder.mutation({
            query: ({ id, ...profileData }) => ({
                url: `/update-profile/${id}`,
                method: "PUT",
                body: profileData,
            }),
        }),
        forgotPassword: builder.mutation({
            query: (email) => ({
                url: `/forgot-password`,
                method: "POST",
                body: email,
            }),
        }),
        resetPassword: builder.mutation({
            query: ({ email, otp, newPassword }) => ({
                url: `/reset-password`,
                method: "POST",
                body: { email, otp, newPassword },
            }),   
        }),
        deleteUserById: builder.mutation({
            query: (id) => ({
                url: `/delete-user/${id}`,
                method: "DELETE",
            }),
        }),
        addProfilePicture: builder.mutation({
            query: ({profilePictureUrl}) => ({
                url: `/add-profile-picture`,
                method: "POST",
                body: { profilePictureUrl },
            }),
        }),
        removeProfilePicture: builder.mutation({
            query: () => ({
                url: `/remove-profile-picture`,
                method: "PUT",
            }),
        }),
        updateProfilePicture: builder.mutation({
            query: ({ profilePictureUrl }) => ({
                url: `/update-profile-picture`,
                method: "PUT",
                body: { profilePictureUrl },
            }),
        }),
        updateUserProfileStatus: builder.mutation({
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