// src/services/apiSlice.js

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// You can adjust BASE_URL to your backend API URL, e.g., from an environment variable:
const BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    // Global tag types for invalidation. For example:
    "userAppointments",
    "appointments",
    "timeslot",
    "timeslots",
    "Services",
    "appointment",
    "userAppointments",
    "User",
    "Users",
    "UserLocations",
    "history",
    "chatHeads",
    "serviceByID",
    "services",
  ],
  endpoints: (builder) => ({}), // initially empty; endpoints are injected elsewhere
});
