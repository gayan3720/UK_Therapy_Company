import { configureStore } from "@reduxjs/toolkit";
import themeSlice from "../services/slices/themeSlice";
import authSlice from "../services/slices/authSlice";
import serviceSlice from "../services/slices/serviceSlice";
import appointmentSlice from "../services/slices/appointmentSlice";
import timeslotSlice from "../services/slices/timeslotSlice";
import { authApiSlice } from "../services/apislices/authApiSlice";
import { serviceApiSlice } from "../services/apislices/serviceApiSlice";
import { appointmentApiSlice } from "../services/apislices/appointmentApiSlice";
import { timeslotsApiSlice } from "../services/apislices/timeslotsApiSlice";

export const store = configureStore({
  reducer: {
    //api slices
    [authApiSlice.reducerPath]: authApiSlice.reducer,
    [serviceApiSlice.reducerPath]: serviceApiSlice.reducer,
    [appointmentApiSlice.reducerPath]: appointmentApiSlice.reducer,
    [timeslotsApiSlice.reducerPath]: timeslotsApiSlice.reducer,

    //slices
    theme: themeSlice,
    auth: authSlice,
    service: serviceSlice,
    appointment: appointmentSlice,
    timeslot: timeslotSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApiSlice.middleware,
      serviceApiSlice.middleware,
      appointmentApiSlice.middleware,
      timeslotsApiSlice.middleware
    ),
});
