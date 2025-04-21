// backend/src/index.ts

module.exports = {
  async bootstrap({ strapi }) {
    const io = require("socket.io")(strapi.server.httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true,
      },
    });

    io.on("connection", async (socket) => {
      console.log("New client connected:", socket.id);

      socket.on("message", async (messageData) => {
        try {
          // Generate a unique messageId for Strapi
          const permanentMessageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`;
          
          // Prepare data for Strapi with all required fields
          const dataToSave = {
            data: {
              content: messageData.content,
              sender: messageData.sender,
              senderName: messageData.senderName,
              timestamp: messageData.timestamp,
              messageId: permanentMessageId,
              tempMessageId: messageData.messageId,
              status: "sending"
            },
          };

          // Save message to Strapi database
          const savedMessage = await strapi.entityService.create(
            "api::message.message",
            dataToSave
          );

          if (!savedMessage) {
            throw new Error("Failed to save message");
          }

          // Transform the saved message for broadcasting
          const broadcastMessage = {
            messageId: savedMessage.id,
            content: savedMessage.content,
            sender: savedMessage.sender,
            senderName: savedMessage.senderName,
            timestamp: savedMessage.timestamp,
            createdAt: savedMessage.createdAt,
            updatedAt: savedMessage.updatedAt,
            publishedAt: savedMessage.publishedAt,
            status: "sent",
            tempMessageId: savedMessage.tempMessageId
          };

          // Broadcast to all clients including sender
          io.emit("newMessage", broadcastMessage);
          console.log("Message saved and broadcasted:", broadcastMessage);
        } catch (error) {
          console.error("Error saving message:", error);
          // Send error back to the sender
          socket.emit("messageError", { 
            messageId: messageData.messageId,
            error: "Failed to save message to database"
          });
        }
      });

      socket.on("typing", () => {
        socket.broadcast.emit("typing");
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });
  },
};