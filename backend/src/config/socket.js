import { Server } from "socket.io";
import { handleChatbotMessage } from "../services/chatbot.service.js";

let io = null;

export const initSocket = (server) => {
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
  ];

  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ""));
  }

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Receive message
    socket.on("userMessage", async (data) => {
      try {
        const { text, user } = data;
        
        // Emitting typing indicator
        socket.emit("typing", true);

        // Process message via chatbot service
        const reply = await handleChatbotMessage(text, user);

        // Stop typing indicator
        socket.emit("typing", false);

        // Send reply back to this specific socket
        socket.emit("botReply", { text: reply });
      } catch (err) {
        console.error("Socket chat error:", err);
        socket.emit("typing", false);
        socket.emit("botReply", {
          text: "Xin lỗi, đã có lỗi xảy ra khi kết nối tới chatbot. Vui lòng thử lại sau.",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
