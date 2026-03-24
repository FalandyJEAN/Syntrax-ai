'use client';

import { useState, useRef, useEffect } from 'react';
import { FiMessageSquare, FiX, FiSend, FiUser, FiCpu, FiMinimize2 } from 'react-icons/fi';
import { useTranslation } from '@/lib/i18n';
import { T } from '@/lib/i18n';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { language } = useTranslation();

    // Predefined questions - function to get current language questions
    const getSuggestedQuestions = () => {
        return language === 'fr' ? [
            "Quels sont vos tarifs?",
            "Comment fonctionne l'extraction?",
            "Quels formats supportez-vous?",
            "Je veux parler à un humain"
        ] : [
            "What are your pricing plans?",
            "How does extraction work?",
            "What formats do you support?",
            "I want to speak to a human"
        ];
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (messageText?: string) => {
        const textToSend = messageText || input;
        if (!textToSend.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: textToSend };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`}/chat/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    language: language
                }),
            });

            const data = await response.json();
            const assistantMessage: Message = { role: 'assistant', content: data.message };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage: Message = {
                role: 'assistant',
                content: language === 'fr'
                    ? 'Désolé, une erreur s\'est produite. Nos agents sont notifiés.'
                    : 'Sorry, an error occurred. Our agents have been notified.'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[90vw] md:w-[400px] h-[600px] max-h-[80vh] flex flex-col bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 p-6 flex items-center justify-between border-b border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center p-0.5 shadow-lg shadow-indigo-500/20">
                                    <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                                        <img src="/logo.png" alt="AI" className="w-8 h-8 object-contain" />
                                    </div>
                                </div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black"></div>
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg"><T>Syntrax AI</T></h3>
                                <p className="text-xs text-indigo-300 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                    <T>Online & Ready</T>
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-zinc-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
                        >
                            <FiMinimize2 size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-transparent to-black/50 scrollbar-thin scrollbar-thumb-zinc-800">
                        {messages.length === 0 && (
                            <div className="text-center mt-8 animate-in fade-in zoom-in duration-500">
                                <p className="text-white/80 text-lg font-medium mb-2"><T>Hello there! 👋</T></p>
                                <p className="text-zinc-400 text-sm mb-8"><T>I can help you with pricing, API docs, or account setup.</T></p>

                                {/* Suggested Questions */}
                                <div className="grid gap-2">
                                    {getSuggestedQuestions().map((question, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => sendMessage(question)}
                                            className="text-left px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-indigo-500/30 text-zinc-300 hover:text-white rounded-xl text-sm transition-all duration-200 group"
                                        >
                                            <span className="group-hover:translate-x-1 transition-transform inline-block">{question}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
                            >
                                {msg.role === 'assistant' && (
                                    <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center shrink-0 mt-1 border border-white/10">
                                        <FiCpu size={14} className="text-indigo-400" />
                                    </div>
                                )}

                                <div
                                    className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${msg.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-br-sm'
                                        : 'bg-zinc-800/80 backdrop-blur-sm border border-white/5 text-zinc-200 rounded-bl-sm'
                                        }`}
                                >
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-3 justify-start animate-pulse">
                                <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center shrink-0 mt-1 border border-white/10">
                                    <FiCpu size={14} className="text-indigo-400" />
                                </div>
                                <div className="bg-zinc-800/50 p-4 rounded-2xl rounded-bl-sm border border-white/5">
                                    <div className="flex gap-1.5">
                                        <div className="w-2 h-2 bg-indigo-400/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-indigo-400/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-indigo-400/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-black/40 backdrop-blur-md border-t border-white/10">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={language === 'fr' ? 'Écrivez votre message...' : 'Type your message...'}
                                className="w-full bg-zinc-900/50 text-white pl-4 pr-12 py-3.5 rounded-xl border border-white/10 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none transition-all placeholder:text-zinc-600 shadow-inner"
                                disabled={isLoading}
                            />
                            <button
                                onClick={() => sendMessage()}
                                disabled={isLoading || !input.trim()}
                                className="absolute right-2 top-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-lg transition-all shadow-lg shadow-indigo-900/20"
                            >
                                <FiSend size={18} />
                            </button>
                        </div>
                        <div className="text-center mt-2">
                            <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-semibold">
                                Powered by Syntrax LLM
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`group relative flex items-center justify-center transition-all duration-300 shadow-2xl shadow-indigo-500/30 ${isOpen
                        ? 'w-12 h-12 bg-zinc-800 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-700'
                        : 'w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full text-white hover:scale-110'
                    }`}
            >
                {isOpen ? (
                    <FiX size={24} className="transition-transform duration-300 group-hover:rotate-90" />
                ) : (
                    <>
                        <FiMessageSquare size={28} className="animate-pulse" />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-black"></span>
                    </>
                )}
            </button>
        </div>
    );
}
