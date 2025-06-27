import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  appointment: {},
  appointmentList: [],
};

const appointmentSlice = createSlice({
  name: "appointment",
  initialState,
  reducers: {
    setAppointmentList: (state, action) => {
      state.user = action.payload;
    },
  },
});

export const { setAppointmentList } = appointmentSlice.actions;

export const getAppointmentList = (state) => state.appointment.appointmentList;
export const getAppointment = (state) => state.appointment.appointment;

export default appointmentSlice.reducer;
