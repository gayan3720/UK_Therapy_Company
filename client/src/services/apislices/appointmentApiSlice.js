import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../utils/axiosBaseQuery";

export const appointmentApiSlice = createApi({
  reducerPath: "appointmentApi",
  baseQuery: axiosBaseQuery({
    baseUrl: process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem("token");
      if (token) {
        return {
          ...headers,
          Authorization: `Bearer ${token}`,
        };
      }
      return headers;
    },
  }),
  tagTypes: ["appointment", "userAppointments"],

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
  }),
});

export const { useGetAllAppointmentsQuery, useGetUserAppointmentsQuery } =
  appointmentApiSlice;
