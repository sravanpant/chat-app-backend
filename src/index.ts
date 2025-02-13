// backend/src/index.ts

export default {
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
          // Properly format the data for Strapi
          const dataToSave = {
            data: {
              content: messageData.content,
              sender: messageData.sender,
              senderName: messageData.senderName,
              timestamp: messageData.timestamp,
              messageId: messageData.messageId,
            },
          };

          // Save message to Strapi database
          const savedMessage = await strapi.entityService.create(
            "api::message.message",
            dataToSave
          );

          // Broadcast the saved message
          io.emit("newMessage", {
            id: savedMessage.id,
            content: savedMessage.content,
            sender: savedMessage.sender,
            senderName: savedMessage.senderName,
            timestamp: savedMessage.timestamp,
            messageId: savedMessage.messageId,
            createdAt: savedMessage.createdAt,
            updatedAt: savedMessage.updatedAt,
            publishedAt: savedMessage.publishedAt,
          });

          console.log("Message saved and broadcasted:", savedMessage);
        } catch (error) {
          console.error("Error saving message:", error);
          socket.emit("error", { message: "Error saving message" });
        }
      });

      // Handle typing events
      socket.on("typing", () => {
        socket.broadcast.emit("typing");
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });
  },
};
