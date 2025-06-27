import {
  handleChatMessage,
  handleDisconnect,
  handleTyping,
  joinRoom,
  registerUser,
} from "./socketChat.js";

export const registerSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);
    socket.on("register", (data) => registerUser(socket, data));
    socket.on("joinRoom", (data) => joinRoom(socket, data));
    socket.on("chatMessage", (data) => handleChatMessage(io, socket, data));
    socket.on("typing", (data) => handleTyping(socket, data));
    socket.on("disconnect", () => handleDisconnect(socket));
  });
};
