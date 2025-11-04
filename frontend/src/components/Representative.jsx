import React, { useEffect, useState, useRef } from "react";
import {
  Users,
  Send,
  MessageSquare,
  TrendingUp,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useChatStore } from "../../store/chatStore";
import { useSocketStore } from "../../store/socketStore";
import useAuthStore from "../../store/authStore";

const Representative = () => {
  const { messages, addMessage, activeConversationId, setActiveConversation } =
    useChatStore();
  const {
    connect,
    sendMessage,
    connectionStatus,
    getConnectedUsers,
  } = useSocketStore();
  const { user, accessToken } = useAuthStore();

  const [activeConversations, setActiveConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [text, setText] = useState("");
  const messageEndRef = useRef(null);

  // ✅ Fetch connected users when component mounts
  useEffect(() => {
    async function fetchChats() {
      try {
        const data = await getConnectedUsers(user.user_id);
        if (Array.isArray(data)) {
          setActiveConversations(data);
        }
      } catch (error) {
        console.error("Error fetching connected users:", error);
      }
    }
    fetchChats();
  }, [user.user_id]);

  // ✅ Scroll to bottom on new message
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeConversationId]);

  // ✅ Select chat and connect to WebSocket
  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setActiveConversation(chat.conversation_id);

    // Adjust based on your backend auth
    connect(chat.conversation_id, accessToken); // OR connect(chat.conversation_id);
  };

  // ✅ Send message
  const handleSend = () => {
    if (!text.trim() || !activeConversationId) return;
    sendMessage(activeConversationId, user.user_id, text.trim());
    setText("");
  };

  const chatMessages = messages[activeConversationId] || [];

  return (
    <div className="flex h-screen bg-gray-50 antialiased">
      {/* ---- LEFT SIDEBAR ---- */}
      <aside className="w-1/5 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b flex justify-between">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <Users className="w-5 h-5 mr-2 text-indigo-600" />
            Active Chats
          </h2>
          <span
            className={`text-xs font-medium ${
              connectionStatus === "connected"
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {connectionStatus === "connected" ? "Online" : "Offline"}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeConversations.length === 0 && (
            <p className="text-sm text-gray-500 text-center mt-4">
              No active conversations yet
            </p>
          )}

          {activeConversations.map((chat) => (
            <div
              key={chat.conversation_id}
              onClick={() => handleSelectChat(chat)}
              className={`p-4 cursor-pointer border-b hover:bg-indigo-50 transition ${
                selectedChat?.conversation_id === chat.conversation_id
                  ? "bg-indigo-100 border-indigo-500 border-l-4"
                  : "border-l-4 border-transparent"
              }`}
            >
              <p className="font-semibold text-gray-800">{chat.user_name}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* ---- MIDDLE CHAT WINDOW ---- */}
      <main className="flex flex-col flex-1 bg-white">
        {selectedChat ? (
          <>
            <header className="p-4 border-b border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800">
                {selectedChat.user_name}
              </h3>
              <p className="text-sm text-gray-500">
                Conversation ID: {selectedChat.conversation_id}
              </p>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-500 text-sm">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.sender === user.user_id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-md px-4 py-2 rounded-xl shadow-md ${
                        message.sender === user.user_id
                          ? "bg-indigo-600 text-white rounded-br-none"
                          : "bg-white text-gray-800 rounded-tl-none border border-gray-200"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messageEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message..."
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
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a chat to begin
          </div>
        )}
      </main>

      {/* ---- RIGHT ANALYTICS PANEL ---- */}
      <aside className="w-1/4 bg-gray-50 border-l border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
          Analytics
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-xl shadow-sm border">
            <Clock className="w-5 h-5 text-indigo-600 mb-2" />
            <p className="text-2xl font-semibold text-gray-800">12</p>
            <p className="text-sm text-gray-500">Active Chats</p>
          </div>

          <div className="p-4 bg-white rounded-xl shadow-sm border">
            <MessageSquare className="w-5 h-5 text-indigo-600 mb-2" />
            <p className="text-2xl font-semibold text-gray-800">156</p>
            <p className="text-sm text-gray-500">Messages Today</p>
          </div>

          <div className="p-4 bg-white rounded-xl shadow-sm border">
            <Users className="w-5 h-5 text-indigo-600 mb-2" />
            <p className="text-2xl font-semibold text-gray-800">42</p>
            <p className="text-sm text-gray-500">Unique Users</p>
          </div>

          <div className="p-4 bg-white rounded-xl shadow-sm border">
            <AlertTriangle className="w-5 h-5 text-indigo-600 mb-2" />
            <p className="text-2xl font-semibold text-gray-800">3</p>
            <p className="text-sm text-gray-500">Pending Issues</p>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Representative;
