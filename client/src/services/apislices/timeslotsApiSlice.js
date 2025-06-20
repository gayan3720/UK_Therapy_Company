import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../utils/axiosBaseQuery";

export const timeslotsApiSlice = createApi({
  reducerPath: "timeslotApi",
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
  tagTypes: ["timeslot", "timeslots"],

  endpoints: (builder) => ({
    createTimeslot: builder.mutation({
      query: (slot) => ({
        url: "/timeslots/createTimeslot",
        method: "POST",
        data: slot,
      }),
      invalidatesTags: ["timeslot", "timeslots"],
    }),

    updateTimeslot: builder.mutation({
      query: (data) => ({
        url: `/timeslots/updateTimeslot`,
        method: "POST",
        data: data,
      }),
      invalidatesTags: ["timeslot", "timeslots"],
    }),

    getAllTimeslots: builder.mutation({
      query: (data) => ({
        url: "/timeslots/getAllTimeslots",
        method: "POST",
        data: data,
      }),
    }),

    deleteTimeslot: builder.mutation({
      query: (id) => ({
        url: `/timeslots/deleteTimeslot/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["timeslot", "timeslots"],
    }),

    getTimeslotByID: builder.query({
      query: (id) => ({
        url: `/timeslots/getTimeslotByID/${id}`,
        method: "GET",
      }),
      providesTags: ["timeslot"],
    }),

    getTimeslotHistory: builder.query({
      query: () => ({
        url: "/timeslots/getTimeslotHistory",
        method: "GET",
      }),
      providesTags: ["timeslots"],
    }),
  }),
});

export const {
  useCreateTimeslotMutation,
  useUpdateTimeslotMutation,
  useGetAllTimeslotsMutation,
  useDeleteTimeslotMutation,
  useGetTimeslotByIDQuery,
  useGetTimeslotHistoryQuery,
} = timeslotsApiSlice;
