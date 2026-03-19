import { useState, useEffect, useRef } from 'react';

import { Sparkles } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

import ChatbotWidget from '../components/ChatbotWidget';

const AIInsights = () => {

    return (
        <div className="flex-1 flex flex-col h-screen bg-[#f4f7f6] overflow-hidden">


            <div className="flex-1 flex flex-col w-full overflow-hidden">
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden mb-4">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#0a2e2a] flex items-center justify-center text-[#bbed3b] shadow-inner">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 leading-none">Sanjeevani AI Assistant</h3>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Systems Online</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gray-50/30">
                        <ChatbotWidget />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIInsights;
