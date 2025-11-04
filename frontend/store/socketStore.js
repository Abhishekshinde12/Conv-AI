import { create } from "zustand";
import { useChatStore } from "./chatStore";
import api from '../src/utils/api';

let socketRef = { current: null };

export const useSocketStore = create((set, get) => ({
  // --- STATE ---
  connectionStatus: "disconnected",

  // --- ACTIONS ---
  getConversationID: async (customer_id) => {
    const url = `/chat/get_conversation_id/${customer_id}/`;
    const response = await api(url, { method: "GET" });
    const data = await response.json();
    // Standardizing on 'conversation_id'
    return data.conversation_id;
  },

  getConnectedUsers: async (representative_id) => {
    const url = `/chat/get_connected_users/${representative_id}/`;
    const response = await api(url, { method: "GET" });
    const data = await response.json();
    return data;
  },

  connect: (room_id, accessToken) => {
    if (!room_id) {
      console.warn("Connect called with no room_id.");
      return;
    }

    // --- FIX: ALWAYS CLOSE THE PREVIOUS CONNECTION ---
    // This is the key to allowing the representative to switch between chats.
    if (socketRef.current) {
      socketRef.current.close();
    }

    const wsUrl = `ws://${window.location.host}/ws/chat/${room_id}/?token=${accessToken}`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log(`✅ WebSocket connected to room: ${room_id}`);
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
          useChatStore.getState().addMessage(data.conversation_id, {
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
      conversation_id: conversationId,
      sender,
      text,
    });

    socket.send(message);
    // Correctly removed the local addMessage call here.
  },

  disconnect: () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    set({ connectionStatus: "disconnected" });
  },
}));