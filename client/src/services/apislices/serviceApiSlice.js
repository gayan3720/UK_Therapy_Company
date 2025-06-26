import { apiSlice } from "./apiSlice";

export const serviceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createService: builder.mutation({
      query: (data) => ({
        url: "/services",
        method: "POST",
        data: data,
      }),
      invalidatesTags: ["services", "serviceByID"],
    }),
    getAllServices: builder.query({
      query: () => ({
        url: "/services",
        method: "GET",
      }),
      providesTags: ["services"],
    }),
    getServiceById: builder.query({
      query: (id) => ({
        url: `/services/${id}`,
        method: "GET",
      }),
      providesTags: ["serviceByID"],
    }),
    updateService: builder.mutation({
      query: (data, id) => ({
        url: `/services/${data.id}`,
        method: "PUT",
        data: data,
      }),
      invalidatesTags: ["services", "serviceByID"],
    }),
    deleteService: builder.mutation({
      query: (id) => ({
        url: `/services/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["services", "serviceByID"],
    }),
  }),
});

export const {
  useCreateServiceMutation,
  useGetAllServicesQuery,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useLazyGetServiceByIdQuery,
} = serviceApiSlice;
