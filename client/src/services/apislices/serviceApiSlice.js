import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../utils/axiosBaseQuery";

export const serviceApiSlice = createApi({
  reducerPath: "serviceApi",
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
  tagTypes: ["service", "services"],

  endpoints: (builder) => ({
    createService: builder.mutation({
      query: (data) => ({
        url: "/services",
        method: "POST",
        data: data,
      }),
      invalidatesTags: ["services"],
    }),
    getAllServices: builder.query({
      query: () => ({
        url: "/services",
        method: "GET",
      }),
      providesTags: ["services"],
    }),
    updateService: builder.mutation({
      query: (data, id) => ({
        url: `/services/${data.id}`,
        method: "PUT",
        data: data,
      }),
      invalidatesTags: ["services"],
    }),
    deleteService: builder.mutation({
      query: (id) => ({
        url: `/services/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["services"],
    }),
  }),
});

export const {
  useCreateServiceMutation,
  useGetAllServicesQuery,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} = serviceApiSlice;
