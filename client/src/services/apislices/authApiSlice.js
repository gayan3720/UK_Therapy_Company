import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../utils/axiosBaseQuery";

export const authApiSlice = createApi({
  reducerPath: "authApi",
  baseQuery: axiosBaseQuery({
    baseUrl: process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api",
  }),
  prepareHeaders: (headers, { getState }) => {
    // Retrieve the token from local storage (or you could also use getState if stored in Redux)
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
  tagTypes: ["User", "Users"],

  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (userData) => ({
        url: "/users/register",
        method: "POST",
        data: userData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "User", id },
        { type: "Users" },
      ],
    }),

    loginUser: builder.mutation({
      query: (userData) => ({
        url: "/users/login",
        method: "POST",
        data: userData,
      }),
    }),

    updateUserRole: builder.mutation({
      query: (userData) => ({
        url: `/users/updaterole/${userData.id}`,
        method: "PUT",
        data: userData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "User", id },
        { type: "Users" },
      ],
    }),

    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "User", id },
        { type: "Users" },
      ],
    }),
    // GET endpoint to fetch a user by ID
    getUserById: builder.query({
      query: (id) => ({ url: `/users/${id}`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),
    // GET endpoint to fetch all users
    getAllUsers: builder.query({
      query: () => ({ url: "/users", method: "GET" }),
      providesTags: (result, error, id) => [{ type: "Users" }],
    }),
  }),
});

export const {
  useUpdateUserRoleMutation,
  useRegisterUserMutation,
  useLoginUserMutation,
  useGetAllUsersQuery,
  useLazyGetUserByIdQuery,
  useDeleteUserMutation,
} = authApiSlice;
