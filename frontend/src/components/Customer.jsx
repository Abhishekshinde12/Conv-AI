// Customer.jsx
import React from 'react';
import { Send, User } from 'lucide-react';

const Customer = () => {
  // Placeholder data for messages
  const messages = [
    { id: 1, text: "Hello, I have a question about my recent order.", sender: 'customer' },
    { id: 2, text: "Hi! I'd be happy to help. What is your order number?", sender: 'representative' },
    { id: 3, text: "It is #A123-XYZ. The tracking hasn't updated in three days.", sender: 'customer' },
  ];

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
        <span className="text-sm text-green-500 font-medium">Online</span>
      </header>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`flex ${message.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl text-white shadow-lg ${
                message.sender === 'customer'
                  ? 'bg-indigo-600 rounded-br-none'
                  : 'bg-gray-600 rounded-tl-none'
              }`}
            >
              <p className="text-sm">{message.text}</p>
            </div>
          </div>
        ))}
        {/* Placeholder for new incoming message notification */}
        <div className="text-center text-xs text-gray-500 pt-4">
            — You are now connected to a representative —
        </div>
      </div>

      {/* Message Input Container */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            placeholder="Type your message here..."
            className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
          />
          <button className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition duration-150 shadow-md">
            <Send className="w-5 h-5" />
          </button>
        </div>
        {/* Placeholder for file upload or other controls can go here */}
        <div className="mt-2 text-xs text-gray-500 text-center">
            Messages are end-to-end encrypted.
        </div>
      </div>
    </div>
  );
};

export default Customer;