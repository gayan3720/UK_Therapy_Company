import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  service: {},
  serviceList: [],
};

const serviceSlice = createSlice({
  name: "service",
  initialState,
  reducers: {
    setService: (state, action) => {
      state.service = action.payload;
    },
    setServiceList: (state, action) => {
      state.serviceList = action.payload;
    },
  },
});

export const { setService } = serviceSlice.actions;
export const { setServiceList } = serviceSlice.actions;

export const getService = (state) => state.service.service;
export const getServicelist = (state) => state.service.serviceList;

export default serviceSlice.reducer;
