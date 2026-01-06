// ============================================
// TICKET CHAT COMPONENT
// Real-time chat for In Progress tickets
// ============================================

'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from './Button';

interface ChatMessage {
    id: string;
    author: string;
    message: string;
    timestamp: Date;
    isCurrentUser: boolean;
}

interface TicketChatProps {
    ticketId: string;
    isOpen: boolean;
    onClose: () => void;
    currentUser: string;
}

export function TicketChat({ ticketId, isOpen, onClose, currentUser }: TicketChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            author: 'Support Agent',
            message: 'Hi! I\'m working on your ticket. How can I assist you further?',
            timestamp: new Date(Date.now() - 3600000),
            isCurrentUser: false,
        },
    ]);
    const [newMessage, setNewMessage] = useState('');
    const [isMinimized, setIsMinimized] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;

        const message: ChatMessage = {
            id: Date.now().toString(),
            author: currentUser,
            message: newMessage,
            timestamp: new Date(),
            isCurrentUser: true,
        };

        setMessages([...messages, message]);
        setNewMessage('');

        // TODO: Send to backend via WebSocket or API
        // await sendChatMessage(ticketId, newMessage);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    if (!isOpen) return null;

    return (
        <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
            isMinimized ? 'w-72' : 'w-96'
        }`}>
            <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="bg-[#D04A02] text-white px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="font-medium">Ticket #{ticketId} Chat</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setIsMinimized(!isMinimized)}
                            className="p-1 hover:bg-white/20 rounded"
                        >
                            {isMinimized ? (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            )}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-white/20 rounded"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {!isMinimized && (
                    <>
                        {/* Messages */}
                        <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.isCurrentUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[80%] ${
                                        msg.isCurrentUser 
                                            ? 'bg-[#D04A02] text-white' 
                                            : 'bg-white border border-gray-200'
                                    } rounded-lg px-4 py-2 shadow-sm`}>
                                        {!msg.isCurrentUser && (
                                            <p className="text-xs font-medium text-gray-500 mb-1">
                                                {msg.author}
                                            </p>
                                        )}
                                        <p className={`text-sm ${msg.isCurrentUser ? 'text-white' : 'text-gray-800'}`}>
                                            {msg.message}
                                        </p>
                                        <p className={`text-xs mt-1 ${
                                            msg.isCurrentUser ? 'text-white/70' : 'text-gray-400'
                                        }`}>
                                            {formatTime(msg.timestamp)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-3 border-t border-gray-200 bg-white">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type a message..."
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D04A02] focus:border-transparent text-sm"
                                />
                                <Button 
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim()}
                                    size="sm"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
