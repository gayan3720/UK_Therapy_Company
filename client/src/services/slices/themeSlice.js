import { createSlice } from "@reduxjs/toolkit";

// Get theme from localStorage or default to 'light'
const initialState = {
  theme: localStorage.getItem("theme") || "light",
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem("theme", action.payload); // Save theme to localStorage
    },
  },
});

export const { toggleTheme } = themeSlice.actions;

export const getTheme = (state) => state.theme.theme;

export default themeSlice.reducer;
