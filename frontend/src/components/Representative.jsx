// Representative.jsx
import React from 'react';
import { MessageSquare, Users, TrendingUp, Clock, AlertTriangle, Send } from 'lucide-react';

const Representative = () => {
  // Placeholder Data
  const activeChats = [
    { id: 1, name: 'Alice Johnson', status: 'Active', time: '2m ago', hasUnread: true, issue: 'Order Inquiry' },
    { id: 2, name: 'Bob Smith', status: 'Waiting', time: '15m ago', hasUnread: false, issue: 'Technical Issue' },
    { id: 3, name: 'Carol Danvers', status: 'Closed', time: '1h ago', hasUnread: false, issue: 'Refund Request' },
    // Add more...
  ];

  const currentChat = {
    customerName: 'Alice Johnson',
    ticketId: 'TKT-9012',
    messages: [
      { id: 1, text: "Hello, I have a question about my recent order.", sender: 'customer' },
      { id: 2, text: "Hi Alice. I see you're asking about #A123-XYZ. Let me check the status.", sender: 'representative' },
      { id: 3, text: "Thank you!", sender: 'customer' },
    ]
  };

  const chatAnalytics = {
    responseTime: '25 sec',
    customerRating: '4.8/5',
    totalMessages: 7,
    status: 'High Priority',
    issueType: 'Shipping',
  };

  return (
    <div className="flex h-screen bg-gray-50 antialiased">
      
      {/* 1. Chat List (Left Section: ~20% width) */}
      <aside className="w-1/5 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <Users className="w-5 h-5 mr-2 text-indigo-600" />
            Active Chats
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {activeChats.map(chat => (
            <div 
              key={chat.id} 
              className={`p-4 cursor-pointer border-b hover:bg-indigo-50 transition ${
                chat.id === 1 ? 'bg-indigo-100 border-indigo-500 border-l-4' : 'border-l-4 border-transparent'
              }`}
            >
              <div className="flex justify-between items-center">
                <p className="font-semibold text-gray-800">{chat.name}</p>
                <span className={`text-xs font-medium ${chat.status === 'Active' ? 'text-green-600' : 'text-yellow-600'}`}>
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

      {/* 2. Chat Window (Middle Section: ~55% width) */}
      <main className="flex flex-col flex-1 bg-white">
        {/* Chat Header */}
        <header className="p-4 border-b border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800">{currentChat.customerName}</h3>
          <p className="text-sm text-gray-500">Ticket ID: {currentChat.ticketId}</p>
        </header>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {currentChat.messages.map(message => (
            <div 
              key={message.id} 
              className={`flex ${message.sender === 'representative' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-md px-4 py-2 rounded-xl shadow-md ${
                  message.sender === 'representative'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
                }`}
              >
                <p className="text-sm">{message.text}</p>
              </div>
            </div>
          ))}
          {/* Container for message loading/placeholder */}
          <div className="text-center text-xs text-gray-400 pt-4">
            {currentChat.customerName} is currently typing...
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="Reply to customer..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-150">
              <Send className="w-5 h-5" />
            </button>
          </div>
          {/* Placeholder for quick reply buttons/macros */}
          <div className="text-xs text-gray-500 mt-2">
            Press Enter to send.
          </div>
        </div>
      </main>

      {/* 3. Analytics/Details Panel (Right Section: ~25% width) */}
      <aside className="w-1/4 bg-white border-l border-gray-200 p-4 flex flex-col space-y-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center border-b pb-2">
          <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
          Chat Analytics
        </h2>

        {/* Stats Cards */}
        <div className="space-y-3">
          {/* Response Time */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-blue-800">Avg. Response Time</p>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xl font-bold text-blue-900">{chatAnalytics.responseTime}</p>
          </div>

          {/* Issue Type */}
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-yellow-800">Issue Type</p>
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
            </div>
            <p className="text-xl font-bold text-yellow-900">{chatAnalytics.issueType}</p>
          </div>
          
          {/* Total Messages */}
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-green-800">Total Messages</p>
              <MessageSquare className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-xl font-bold text-green-900">{chatAnalytics.totalMessages}</p>
          </div>
        </div>
        
        {/* Placeholder for Customer Details and History */}
        <div className="flex-1 border-t pt-4">
            <h3 className="text-md font-semibold text-gray-700 mb-2">Customer Context</h3>
            <ul className="text-sm text-gray-600 space-y-1">
                <li><span className="font-medium">Recent Orders:</span> 3</li>
                <li><span className="font-medium">Total Lifetime Spend:</span> $450</li>
                <li><span className="font-medium">Last Contact:</span> 2 days ago</li>
            </ul>
            {/* Container for notes/CRM integration */}
            <div className='mt-4 p-3 bg-gray-100 rounded-md text-sm text-gray-600'>
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