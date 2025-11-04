import { create } from "zustand";
import { useChatStore } from "./chatStore";
import api from '../src/utils/api'

let socketRef = { current: null };

export const useSocketStore = create((set, get) => ({
  // --- STATE ---
  connectionStatus: "disconnected",

  // --- ACTIONS ---

  // for user
  getConversationID: async (customer_id) => {
    const url = `/chat/get_conversation_id/${customer_id}/`
    const response = await api(url, {
      method: "GET"
    })
    const data = await response.json()
    return data.conversation_id
  },

  getConnectedUsers: async (representative_id) => {
    const url = `/chat/get_connected_users/${representative_id}/`
    const response = await api(url, {
      method: "GET"
    })
    const data = await response.json()
    return data
  },

  connect: (room_id, accessToken) => {
    console.log(room_id, typeof(room_id))
    // const conv_id = convData.conversation_id
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) return;

    console.log("connect called")

    const wsUrl = `ws://${window.location.host}/ws/chat/${room_id}/?token=${accessToken}`;

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
        // This condition is TRUE, because the backend sent back the original object.
        if (data.type === "chat.message") {
          // THE CRITICAL BUG IS HERE!
          // You are trying to add the message to the chat store,
          // but the `addMessage` function is not receiving the correct payload.
          useChatStore
            .getState()
            .addMessage(data.conversation_id, { // This part is correct
              // But the object you are passing is what is inside 'data'
              sender: data.sender,
              text: data.text,
              timestamp: data.timestamp, // `data.timestamp` is UNDEFINED! You never sent it.
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

    // This is the raw data you are sending TO the backend
    const message = JSON.stringify({
      conversation_id: conversationId,
      sender,
      text,
    });

    socket.send(message)
  },

  disconnect: () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    set({ connectionStatus: "disconnected" });
  },
}));
