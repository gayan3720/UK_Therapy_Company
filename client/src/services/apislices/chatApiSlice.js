import { apiSlice } from "./apiSlice";

export const chatApiSlice = apiSlice.injectEndpoints({
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
