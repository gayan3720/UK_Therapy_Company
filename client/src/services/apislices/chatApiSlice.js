import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../utils/axiosBaseQuery";

export const chatApiSlice = createApi({
  reducerPath: "chatApi",
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
  tagTypes: ["history", "chatHeads"],

  endpoints: (builder) => ({
    getChatHistory: builder.query({
      query: (users) => ({
        url: `/chatoption/history/${users.userA}/${users.userB}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "history", id }],
    }),
    getChatHeads: builder.query({
      query: () => ({
        url: `/chatoption/chat-heads`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "chatHeads", id }],
    }),
  }),
});

export const { useLazyGetChatHistoryQuery, useLazyGetChatHeadsQuery } =
  chatApiSlice;
