import { apiSlice } from "./apiSlice";

export const appointmentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllAppointments: builder.query({
      query: () => ({
        url: "/appointments",
        method: "GET",
      }),
      providesTags: ["appointments"],
    }),

    getUserAppointments: builder.query({
      query: () => ({
        url: "/appointments/getUserAppointments ",
        method: "GET",
      }),
      providesTags: ["userAppointments"],
    }),

    createAppointment: builder.mutation({
      query: (payload) => ({
        url: "/appointments/saveAppointment", // adjust if your create route is POST /api/appointments
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["userAppointments", "appointments"],
    }),

    updateAppointment: builder.mutation({
      query: (payload) => ({
        url: "/appointments/update",
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["userAppointments", "appointments"],
    }),

    updateAppointmentStatus: builder.mutation({
      query: (payload) => ({
        url: "/appointments/update-status",
        method: "PUT",
        body: payload,
      }),
      // After changing status, refetch the user's appointments so UI updates
      invalidatesTags: ["userAppointments", "appointments"],
    }),
  }),
});

export const {
  useGetAllAppointmentsQuery,
  useGetUserAppointmentsQuery,
  useLazyGetUserAppointmentsQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  useUpdateAppointmentStatusMutation, // <-- new
} = appointmentApiSlice;
