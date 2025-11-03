import { create } from "zustand";
import { useChatStore } from "./chatStore";
import api from '../src/utils/api'
import useAuthStore from "./authStore";

let socketRef = { current: null };

export const useSocketStore = create((set, get) => ({
  // --- STATE ---
  connectionStatus: "disconnected",

  // --- ACTIONS ---
  getConversationID: async (customer_id) => {
    const url = `/chat/get_conversation_id/${customer_id}`
    const response = await api(url, {
      method: "GET"
    })
    const data = await response.json()
    return data
  },

  connect: (convData, accessToken) => {
    const conv_id = convData.conversation_id
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) return;
    console.log("connect called")
    const wsUrl = `/ws/chat/${conv_id}/?token=${accessToken}`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
      set({ connectionStatus: "connected" });
    };

    socket.onclose = () => {
      console.log("❌ WebSocket disconnected");
      set({ connectionStatus: "disconnected" });
    };

    socket.onerror = (err) => {
      console.error("⚠️ WebSocket error:", err);
      set({ connectionStatus: "error" });
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "chat.message") {
          useChatStore
            .getState()
            .addMessage(data.conversation_id, {
              sender: data.sender,
              text: data.text,
              timestamp: data.timestamp,
            });
        }
      } catch (err) {
        console.error("Error parsing message:", err);
      }
    };
  },

  sendMessage: (conversationId, sender, text) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.warn("Socket not connected");
      return;
    }

    const message = JSON.stringify({
      type: "chat.message",
      conversation_id: conversationId,
      sender,
      text,
    });

    socket.send(message);
    useChatStore.getState().addMessage(conversationId, {
      sender,
      text,
      timestamp: new Date().toISOString(),
    });
  },

  disconnect: () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    set({ connectionStatus: "disconnected" });
  },
}));
