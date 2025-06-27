import { createSlice } from "@reduxjs/toolkit";

// Get theme from localStorage or default to 'light'
const initialState = {
  theme: localStorage.getItem("theme") || "dark",
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem("theme", action.payload); // Save theme to localStorage
    },
  },
});

export const { setTheme } = themeSlice.actions;

export const getTheme = (state) => state.theme.theme;

export default themeSlice.reducer;
