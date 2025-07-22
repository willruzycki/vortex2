import React, { useState, useEffect } from "react";
import { Conversation, Message, User } from "@/api/entities";
import { motion } from "framer-motion";
import { Send, Search, Plus, User as UserIcon } from "lucide-react";
import { format } from "date-fns";
import { useSidebar } from "@/components/SidebarContext";

export default function Messages() {
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { isDesktopSidebarOpen } = useSidebar();

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (activeConversation) {
      loadMessages();
    }
  }, [activeConversation]);

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      console.error("User not authenticated");
    }
  };

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const allConversations = await Conversation.list("-last_message_time");
      const userConversations = allConversations.filter(conv => 
        conv.participants.includes(user.id)
      );
      setConversations(userConversations);
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
    setIsLoading(false);
  };

  const loadMessages = async () => {
    try {
      const conversationMessages = await Message.filter(
        { conversation_id: activeConversation.id },
        "-created_date"
      );
      setMessages(conversationMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;

    try {
      const message = await Message.create({
        conversation_id: activeConversation.id,
        sender_id: user.id,
        content: newMessage,
        message_type: 'text'
      });

      // Update conversation with last message
      await Conversation.update(activeConversation.id, {
        last_message: newMessage,
        last_message_time: new Date().toISOString()
      });

      setMessages(prev => [...prev, message]);
      setNewMessage('');
      loadConversations(); // Refresh conversation list
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const startNewConversation = async (recipientId) => {
    try {
      const existingConv = conversations.find(conv => 
        conv.participants.includes(recipientId) && conv.participants.length === 2
      );

      if (existingConv) {
        setActiveConversation(existingConv);
        return;
      }

      const newConversation = await Conversation.create({
        participants: [user.id, recipientId],
        last_message: '',
        last_message_time: new Date().toISOString()
      });

      setActiveConversation(newConversation);
      loadConversations();
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-800 text-lg">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 flex">
      {/* Conversations Sidebar */}
      <div className={`bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ${
        isDesktopSidebarOpen ? 'w-80' : 'w-full md:w-80'
      } ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-200">
          <h1 className="text-xl font-bold text-slate-900 mb-4">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>No conversations yet</p>
              <p className="text-sm">Start messaging other creators!</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${
                  activeConversation?.id === conversation.id ? 'bg-red-50 border-red-200' : ''
                }`}
                onClick={() => setActiveConversation(conversation)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-purple-600 rounded-full flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900">User Conversation</p>
                    <p className="text-sm text-gray-600 truncate">{conversation.last_message || 'No messages yet'}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {conversation.last_message_time && format(new Date(conversation.last_message_time), 'MMM d')}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Message Area */}
      <div className={`flex-1 flex flex-col ${activeConversation ? 'flex' : 'hidden md:flex'}`}>
        {activeConversation ? (
          <>
            {/* Message Header */}
            <div className="bg-white p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveConversation(null)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  ←
                </button>
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-purple-600 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">Conversation</h2>
                  <p className="text-sm text-gray-600">Active now</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    message.sender_id === user.id
                      ? 'bg-red-500 text-white'
                      : 'bg-slate-200 text-slate-900'
                  }`}>
                    <p>{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender_id === user.id ? 'text-red-100' : 'text-gray-500'
                    }`}>
                      {format(new Date(message.created_date), 'h:mm a')}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Message Input */}
            <div className="bg-white p-4 border-t border-slate-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Select a conversation</h3>
              <p className="text-gray-600">Choose a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}