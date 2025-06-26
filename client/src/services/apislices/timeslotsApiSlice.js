import { apiSlice } from "./apiSlice";

export const timeslotsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createTimeslot: builder.mutation({
      query: (slot) => ({
        url: "/timeslots/createTimeslot",
        method: "POST",
        body: slot,
      }),
      invalidatesTags: ["timeslot", "timeslots"],
    }),

    updateTimeslot: builder.mutation({
      query: (data) => ({
        url: `/timeslots/updateTimeslot`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["timeslot", "timeslots"],
    }),

    getAllTimeslots: builder.mutation({
      query: (data) => ({
        url: "/timeslots/getAllTimeslots",
        method: "POST",
        body: data,
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
