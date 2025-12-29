import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare } from 'lucide-react';
import { ChatMessage, User } from '../types';
import { Backend } from '../services/api';
import { Button } from './Button';
import { Input } from './Input';

interface ChatWindowProps {
  ticketId: string;
  ticketTitle: string;
  currentUser: User;
  onClose: () => void;
  onNewMessage: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ ticketId, ticketTitle, currentUser, onClose, onNewMessage }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Poll for messages (Async)
  useEffect(() => {
    const fetchMessages = async () => {
      const msgs = await Backend.getMessages(ticketId);
      setMessages(prev => {
        if (msgs.length > prev.length && prev.length > 0) {
          const lastMsg = msgs[msgs.length - 1];
          if (lastMsg.senderId !== currentUser.id) {
             onNewMessage();
             setIsTyping(false); // Stop typing if message received
          }
        }
        return msgs;
      });
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);
  }, [ticketId, currentUser.id, onNewMessage]);

  // Simulate typing from "other user"
  useEffect(() => {
    const interval = setInterval(async () => {
      const msgs = await Backend.getMessages(ticketId);
      const lastMsg = msgs[msgs.length - 1];
      
      if (lastMsg && lastMsg.senderId === currentUser.id) {
        if (Math.random() > 0.6) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 2000 + Math.random() * 2000);
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [ticketId, currentUser.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await Backend.sendMessage(ticketId, currentUser.id, currentUser.fullName, newMessage);
    setNewMessage('');
    const msgs = await Backend.getMessages(ticketId);
    setMessages(msgs);
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col z-40 max-h-[600px] overflow-hidden transition-colors">
      <div className="bg-red-600 dark:bg-red-700 text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-1.5 rounded-lg">
             <MessageSquare className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
             <span className="font-bold text-sm">Chat: Ticket #{ticketId}</span>
             <span className="text-xs text-red-100 truncate w-48 opacity-90">{ticketTitle}</span>
          </div>
        </div>
        <button onClick={onClose} className="hover:bg-red-700 dark:hover:bg-red-600 p-1.5 rounded-full transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-slate-950 min-h-[350px] max-h-[450px]">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
             <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
             <p className="text-xs">Start the conversation...</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div key={msg.id} className={`flex flex-col mb-4 ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  isMe 
                    ? 'bg-red-600 text-white rounded-br-sm' 
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-sm'
                }`}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-1">
                  {isMe ? 'You' : msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            );
          })
        )}
        
        {isTyping && (
          <div className="flex items-start mb-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-sm shadow-sm px-4 py-3">
              <div className="flex space-x-1.5 h-2 items-center">
                <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex space-x-2">
        <input 
          className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 dark:text-white rounded-full text-sm focus:ring-2 focus:ring-red-500 focus:outline-none transition-shadow"
          placeholder="Type a message..."
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
        />
        <Button type="submit" size="sm" className="px-3 rounded-full h-10 w-10 flex items-center justify-center p-0 shadow-sm">
          <Send className="w-4 h-4 ml-0.5" />
        </Button>
      </form>
    </div>
  );
};