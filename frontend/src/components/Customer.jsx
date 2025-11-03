// src/pages/Customer.jsx
import React, { useEffect, useState, useRef } from "react";
import { Send, User } from "lucide-react";
import { useChatStore } from "../../store/chatStore";
import { useSocketStore } from "../../store/socketStore";
import useAuthStore from "../../store/authStore";

const Customer = ({ userId, token, conversationId }) => {
  const { messages, addMessage, activeConversationId, setActiveConversation } = useChatStore();
  const { connect, sendMessage, connectionStatus, getConversationID } = useSocketStore();
  const {user, accessToken} = useAuthStore()

  const [text, setText] = useState("");
  const messageEndRef = useRef(null);

  // Connect WebSocket and set conversation on mount
  useEffect(() => {
    async function fetchConvID (){
      const conv_id = await getConversationID(user.user_id);
      console.log(conv_id)
      await connect(conv_id, accessToken)
    }
    fetchConvID()

    // setActiveConversation(getConversationID);
  }, [userId, token, conversationId, connect, setActiveConversation]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages[conversationId]]);

  // Handle sending a message
  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(conversationId, userId, text.trim());
    setText("");
  };

  const chatMessages = messages[conversationId] || [];

  return (
    <div className="flex flex-col h-screen bg-gray-100 antialiased">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white shadow-md">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-500 rounded-full text-white">
            <User className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-semibold text-gray-800">Live Support Chat</h1>
        </div>
        <span
          className={`text-sm font-medium ${
            connectionStatus === "connected" ? "text-green-500" : "text-red-500"
          }`}
        >
          {connectionStatus === "connected" ? "Online" : "Offline"}
        </span>
      </header>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.length === 0 && (
          <div className="text-center text-sm text-gray-500 mt-4">
            No messages yet. Start the conversation!
          </div>
        )}

        {chatMessages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.sender === userId ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl text-white shadow-lg ${
                message.sender === userId
                  ? "bg-indigo-600 rounded-br-none"
                  : "bg-gray-600 rounded-tl-none"
              }`}
            >
              <p className="text-sm">{message.text}</p>
            </div>
          </div>
        ))}

        {/* Scroll anchor */}
        <div ref={messageEndRef} />

        {/* Connection notice */}
        {connectionStatus === "connected" && (
          <div className="text-center text-xs text-gray-500 pt-4">
            — You are now connected to a representative —
          </div>
        )}
      </div>

      {/* Message Input Container */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={connectionStatus !== "connected"}
            className={`p-3 rounded-full text-white transition duration-150 shadow-md ${
              connectionStatus === "connected"
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-500 text-center">
          Messages are end-to-end encrypted.
        </div>
      </div>
    </div>
  );
};

export default Customer;
