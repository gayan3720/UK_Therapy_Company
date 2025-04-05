import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: {},
  userList: [],
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
});

export const { setUser } = authSlice.actions;

export const getUserList = (state) => state.auth.userList;
export const getUser = (state) => state.auth.user;

export default authSlice.reducer;
