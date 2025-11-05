import React, { useEffect, useState, useRef } from "react";
import { Users, Send, MessageSquare, TrendingUp, Clock, AlertTriangle } from "lucide-react";
import { useChatStore } from "../../store/chatStore";
import { useSocketStore } from "../../store/socketStore";
import useAuthStore from "../../store/authStore";
import api from "../utils/api";

const Representative = () => {
  const { messages, activeConversationId, setActiveConversation } = useChatStore();
  const { connect, sendMessage, connectionStatus, getConnectedUsers } = useSocketStore();
  const { user, accessToken } = useAuthStore();

  const [activeConversations, setActiveConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [text, setText] = useState("");
  const messageEndRef = useRef(null);

  const [analytics, setAnalytics] = useState({
    "summary": null,
    "sentiment": null,
    "loan_type": null,
    "lead_type": null,
    "rationale": null
  })


  // Fetch connected users when the component mounts
  useEffect(() => {
    if (user?.user_id) {
      getConnectedUsers(user.user_id)
        .then(data => {
          if (Array.isArray(data)) {
            setActiveConversations(data);
          }
        })
        .catch(error => console.error("Error fetching connected users:", error));
    }
  }, [user?.user_id, getConnectedUsers]);

  // Use this effect to manage the WebSocket connection whenever the active chat changes
  useEffect(() => {
    if (activeConversationId && accessToken) {
      connect(activeConversationId, accessToken);
    }
  }, [activeConversationId, accessToken, connect]);

  // Scroll to bottom on new message
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages[activeConversationId]]);

  const fetchAnalytics = async (conversationId) => {
    try {
      const response = await api(`/analytics/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json", 
          },
          body: JSON.stringify({messages: messages[conversationId] || []})
      });
      const data = await response.json();
      setAnalytics({
        summary: data.summary,
        sentiment: data.sentiment,
        loan_type: data.loan_type,
        lead_type: data.lead_type,
        rationale: data.rationale,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setAnalytics({
        summary: null,
        sentiment: null,
        loan_type: null,
        lead_type: null,
        rationale: null,
      });
    }
  };

  // Its only job is to update state. The useEffect above will handle the connection.
  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);
    setActiveConversation(chat.conversation_id);

    // to get analytics when re-loading previous chats
    // await fetchAnalytics(chat.conversation_id)
  };

  // Send message
  const handleSend = async () => {
    if (!text.trim() || !activeConversationId) return;
    sendMessage(activeConversationId, user.user_id, text.trim());
    setText("");
    // for real time analytics
    await fetchAnalytics(activeConversationId)
  };

  const chatMessages = activeConversationId ? messages[activeConversationId] || [] : [];

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
            className={`text-xs font-medium ${connectionStatus === "connected"
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
              className={`p-4 cursor-pointer border-b hover:bg-indigo-50 transition ${selectedChat?.conversation_id === chat.conversation_id
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
                    className={`flex ${message.sender === user.user_id
                        ? "justify-end"
                        : "justify-start"
                      }`}
                  >
                    <div
                      className={`max-w-md px-4 py-2 rounded-xl shadow-md ${message.sender === user.user_id
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
                  className={`p-3 rounded-lg text-white transition duration-150 shadow-md ${connectionStatus === "connected"
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
      <aside className="w-1/3 bg-gray-50 border-l border-gray-200 p-6 overflow-y-auto">
        <h2 className="text-base font-bold text-gray-800 mb-6 flex items-center">
          {/* <FileText className="w-5 h-5 mr-2 text-indigo-600" /> */}
          Chat Analytics
        </h2>

        <div className="space-y-5">
          {/* Summary */}
          <div className="p-4 bg-white rounded-xl shadow-sm border">
            {/* <FileText className="w-5 h-5 text-indigo-600 mb-2" /> */}
            <p className="text-base text-gray-500 mb-1 font-bold">Summary</p>
            <p className="text-gray-800 text-base leading-relaxed font-medium">
              {analytics.summary || "No summary available yet."}
            </p>
          </div>

          {/* Sentiment */}
          <div className="p-4 bg-white rounded-xl shadow-sm border flex items-center justify-between">
            <div>
              {/* <Smile className="w-5 h-5 text-indigo-600 mb-2" /> */}
              <p className="text-base text-gray-500 mb-1 font-bold">Sentiment</p>
              {/* <p className={`text-lg font-semibold capitalize ${sentimentColor}`}> */}
              <p className={`text-base font-medium capitalize`}>
                {analytics.sentiment || "No details"}
              </p>
            </div>
          </div>

          {/* Loan Type */}
          <div className="p-4 bg-white rounded-xl shadow-sm border">
            {/* <Briefcase className="w-5 h-5 text-indigo-600 mb-2" /> */}
            <p className="text-base text-gray-500 mb-1 font-bold">Loan Type</p>
            <p className="text-gray-800 text-base capitalize font-medium">
              {analytics.loan_type || "No details"}
            </p>
          </div>

          {/* Lead Type */}
          <div className="p-4 bg-white rounded-xl shadow-sm border">
            {/* <Flame className="w-5 h-5 text-indigo-600 mb-2" /> */}
            <p className="text-base text-gray-500 mb-1 font-bold">Lead Type</p>
            <span
              // className={`px-3 py-1 rounded-full text-sm font-medium ${leadColor}`}
              className={`rounded-full text-base font-medium capitalize`}
            >
              {analytics.lead_type || "No details"}
            </span>
          </div>

          {/* Rationale */}
          <div className="p-4 bg-white rounded-xl shadow-sm border">
            {/* <Info className="w-5 h-5 text-indigo-600 mb-2" /> */}
            <p className="text-base text-gray-500 mb-1 font-bold">Rationale</p>
            <p className="text-gray-800 text-base leading-relaxed font-medium">
              {analytics.rationale || "No rationale available."}
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Representative;
