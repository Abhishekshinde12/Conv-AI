import { create } from "zustand";

export const useChatStore = create((set, get) => ({

  activeConversationId: null,
  messages: {}, // { conversationId: [msg1, msg2, ...] }

  // Set active conversation
  setActiveConversation: (conversationId) => set({ activeConversationId: conversationId }),

  // Add messages to a conversation
  addMessage: (conversationId, message) => {
    const prevMessages = get().messages[conversationId] || [];
    set({
      messages: {
        ...get().messages,
        [conversationId]: [...prevMessages, message],
      },
    });
  },

  // Load full message history for a conversation
  setMessages: (conversationId, messages) =>
    set({
      messages: {
        ...get().messages,
        [conversationId]: messages,
      },
    }),

  // Clear all chat data (useful on logout)
  clearChat: () => set({ activeConversationId: null, messages: {} }),
}));
