// src/pages/Representative.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  MessageSquare,
  Users,
  TrendingUp,
  Clock,
  AlertTriangle,
  Send,
} from "lucide-react";
import { useChatStore } from "../../store/chatStore";
import { useSocketStore } from "../../store/socketStore";

const Representative = ({ userId, token, activeConversations }) => {
  const { messages, addMessage, activeConversationId, setActiveConversation } =
    useChatStore();
  const { connect, sendMessage, connectionStatus } = useSocketStore();

  const [text, setText] = useState("");
  const messageEndRef = useRef(null);

  // Assume activeConversations is an array of customer conversations passed from parent
  const [selectedChat, setSelectedChat] = useState(
    activeConversations?.[0] || null
  );

  // Connect WebSocket on mount
  useEffect(() => {
    connect(userId, token);
  }, [userId, token, connect]);

  // When a chat is selected, update active conversation in store
  useEffect(() => {
    if (selectedChat) setActiveConversation(selectedChat.id);
  }, [selectedChat, setActiveConversation]);

  // Auto-scroll to the bottom when messages update
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages[activeConversationId]]);

  const handleSend = () => {
    if (!text.trim() || !activeConversationId) return;
    sendMessage(activeConversationId, userId, text.trim());
    setText("");
  };

  const chatMessages = messages[activeConversationId] || [];

  // Example Analytics (You can calculate dynamically later)
  const chatAnalytics = {
    responseTime: "25 sec",
    issueType: "General",
    totalMessages: chatMessages.length,
  };

  return (
    <div className="flex h-screen bg-gray-50 antialiased">
      {/* 1. Chat List (Left Section) */}
      <aside className="w-1/5 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <Users className="w-5 h-5 mr-2 text-indigo-600" />
            Active Chats
          </h2>
          <span
            className={`text-xs font-medium ${
              connectionStatus === "connected" ? "text-green-500" : "text-red-500"
            }`}
          >
            {connectionStatus === "connected" ? "Online" : "Offline"}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeConversations?.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`p-4 cursor-pointer border-b hover:bg-indigo-50 transition ${
                selectedChat?.id === chat.id
                  ? "bg-indigo-100 border-indigo-500 border-l-4"
                  : "border-l-4 border-transparent"
              }`}
            >
              <div className="flex justify-between items-center">
                <p className="font-semibold text-gray-800">{chat.name}</p>
                <span
                  className={`text-xs font-medium ${
                    chat.status === "Active"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {chat.time}
                </span>
              </div>
              <p className="text-sm text-gray-500 truncate">{chat.issue}</p>
              {chat.hasUnread && (
                <span className="mt-1 inline-block px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                  New
                </span>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* 2. Chat Window (Middle Section) */}
      <main className="flex flex-col flex-1 bg-white">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <header className="p-4 border-b border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800">
                {selectedChat.name}
              </h3>
              <p className="text-sm text-gray-500">
                Conversation ID: {selectedChat.id}
              </p>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {chatMessages.length === 0 && (
                <div className="text-center text-gray-500 text-sm">
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
                    className={`max-w-md px-4 py-2 rounded-xl shadow-md ${
                      message.sender === userId
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-white text-gray-800 rounded-tl-none border border-gray-200"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              ))}
              <div ref={messageEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Reply to customer..."
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleSend}
                  disabled={connectionStatus !== "connected"}
                  className={`p-3 rounded-lg text-white transition duration-150 shadow-md ${
                    connectionStatus === "connected"
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Press Enter to send.
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a chat to begin
          </div>
        )}
      </main>

      {/* 3. Analytics/Details Panel (Right Section) */}
      <aside className="w-1/4 bg-white border-l border-gray-200 p-4 flex flex-col space-y-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center border-b pb-2">
          <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
          Chat Analytics
        </h2>

        {/* Stats */}
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-blue-800">
                Avg. Response Time
              </p>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xl font-bold text-blue-900">
              {chatAnalytics.responseTime}
            </p>
          </div>

          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-yellow-800">Issue Type</p>
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
            </div>
            <p className="text-xl font-bold text-yellow-900">
              {chatAnalytics.issueType}
            </p>
          </div>

          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-green-800">
                Total Messages
              </p>
              <MessageSquare className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-xl font-bold text-green-900">
              {chatAnalytics.totalMessages}
            </p>
          </div>
        </div>

        {/* Customer Details / Notes */}
        <div className="flex-1 border-t pt-4">
          <h3 className="text-md font-semibold text-gray-700 mb-2">
            Customer Context
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              <span className="font-medium">Recent Orders:</span> 3
            </li>
            <li>
              <span className="font-medium">Total Lifetime Spend:</span> $450
            </li>
            <li>
              <span className="font-medium">Last Contact:</span> 2 days ago
            </li>
          </ul>

          <div className="mt-4 p-3 bg-gray-100 rounded-md text-sm text-gray-600">
            <p className="font-semibold mb-1">Agent Notes</p>
            <textarea
              placeholder="Add notes about this interaction..."
              className="w-full p-2 border rounded resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
              rows="3"
            />
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Representative;