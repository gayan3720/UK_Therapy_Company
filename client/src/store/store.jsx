import { configureStore } from "@reduxjs/toolkit";
import themeSlice from "../services/slices/themeSlice";
import authSlice from "../services/slices/authSlice";
import serviceSlice from "../services/slices/serviceSlice";
import appointmentSlice from "../services/slices/appointmentSlice";
import timeslotSlice from "../services/slices/timeslotSlice";
import notificationsSlice from "../services/slices/notificationSlice";

import { apiSlice } from "../services/apislices/apiSlice";

export const store = configureStore({
  reducer: {
    //api slices
    [apiSlice.reducerPath]: apiSlice.reducer,

    //slices
    theme: themeSlice,
    auth: authSlice,
    service: serviceSlice,
    appointment: appointmentSlice,
    timeslot: timeslotSlice,
    notifications: notificationsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});
