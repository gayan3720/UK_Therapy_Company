// src/services/slices/notificationsSlice.js
import { createSlice } from "@reduxjs/toolkit";

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: {
    list: [
      // Example notification object:
      // { id: string, appointmentId: number, message: string, timestamp: string, read: boolean }
    ],
    unreadCount: 0,
  },
  reducers: {
    addNotification: {
      reducer(state, action) {
        // Prepend so newest first
        state.list.unshift(action.payload);
        state.unreadCount += 1;
      },
      prepare({ appointmentId, message }) {
        return {
          payload: {
            id: Date.now().toString(), // or use uuid
            appointmentId,
            message,
            timestamp: new Date().toISOString(),
            read: false,
          },
        };
      },
    },
    markAllRead(state) {
      state.list = state.list.map((notif) => ({ ...notif, read: true }));
      state.unreadCount = 0;
    },
    markRead(state, action) {
      // action.payload: notification id
      const id = action.payload;
      const notif = state.list.find((n) => n.id === id);
      if (notif && !notif.read) {
        notif.read = true;
        state.unreadCount = Math.max(state.unreadCount - 1, 0);
      }
    },
    clearNotifications(state) {
      state.list = [];
      state.unreadCount = 0;
    },
  },
});

export const { addNotification, markAllRead, markRead, clearNotifications } =
  notificationsSlice.actions;

export const selectNotifications = (state) => state.notifications.list;
export const selectUnreadCount = (state) => state.notifications.unreadCount;

export default notificationsSlice.reducer;
