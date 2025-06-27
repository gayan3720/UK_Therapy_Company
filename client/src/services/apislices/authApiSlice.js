import { apiSlice } from "./apiSlice";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (payload) => ({
        url: "/users/register",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["User", "Users", "UserLocations"],
    }),

    loginUser: builder.mutation({
      query: (payload) => ({
        url: "/users/login",
        method: "POST",
        body: payload,
      }),
    }),

    updateUserRole: builder.mutation({
      query: (payload) => ({
        url: `/users/updaterole/${payload.id}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["User", "Users", "UserLocations"],
    }),

    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User", "Users", "UserLocations"],
    }),

    // GET endpoint to fetch a user by ID
    getUserById: builder.query({
      query: (id) => ({ url: `/users/${id}`, method: "GET" }),
      providesTags: ["User"],
    }),

    // GET endpoint to fetch all users
    getAllUsers: builder.query({
      query: () => ({ url: "/users", method: "GET" }),
      providesTags: ["Users"],
    }),

    getLocationsOfUsersAppointmentCompleted: builder.query({
      query: () => ({
        url: "/users/getuserlocationsforcompletedappointments",
        method: "GET",
      }),
      providesTags: ["UserLocations"],
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
  useGetLocationsOfUsersAppointmentCompletedQuery,
} = authApiSlice;
