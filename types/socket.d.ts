// chat-backend/types/socket.d.ts
interface MessageData {
    content: string;
    sender: string;
    timestamp: string;
  }
  
  interface SavedMessage {
    id: number;
    attributes: {
      content: string;
      sender: string;
      timestamp: string;
      createdAt: string;
      updatedAt: string;
    };
  }