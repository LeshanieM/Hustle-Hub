import React, { useState } from 'react';
import axios from 'axios';
import { Sparkles, Send, Bot, AlertCircle, CheckCircle2, Lightbulb } from 'lucide-react';

const AdminAIAssistant = ({ dashboardData }) => {
    const [question, setQuestion] = useState('');
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const quickQuestions = [
        "How is the platform performing this month?",
        "What needs my attention right now?",
        "Are there suspicious businesses on the platform?",
        "How many pending verifications do we have?",
        "What trends do you see in registrations?"
    ];

    const handleAskAI = async (query = question) => {
        if (!query.trim()) return;
        
        setLoading(true);
        setError(null);
        setResponse(null);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/ai/admin-query', {
                question: query,
                role: 'admin',
                data: dashboardData
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setResponse(res.data.response);
        } catch (err) {
            console.error('AI Assistant Error:', err);
            const msg = err.response?.data?.details || err.response?.data?.error || err.message;
            setError(`AI Intelligence Error: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    const parseResponse = (text) => {
        if (!text) return null;
        
        const sections = {
            answer: '',
            reason: '',
            recommendation: ''
        };

        const answerMatch = text.match(/1\.\s*Answer:?\s*([\s\S]*?)(?=2\.\s*Reason|$)/i);
        const reasonMatch = text.match(/2\.\s*Reason:?\s*([\s\S]*?)(?=3\.\s*Recommendation|$)/i);
        const recommendationMatch = text.match(/3\.\s*Recommendation:?\s*([\s\S]*?)$/i);

        if (answerMatch) sections.answer = answerMatch[1].trim();
        if (reasonMatch) sections.reason = reasonMatch[1].trim();
        if (recommendationMatch) sections.recommendation = recommendationMatch[1].trim();

        // Fallback if regex fails due to formatting issues
        if (!sections.answer && !sections.reason && !sections.recommendation) {
            return { answer: text, reason: '', recommendation: '' };
        }

        return sections;
    };

    const parsedData = parseResponse(response);

    return (
        <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Bot size={120} />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">AI Command Center</h3>
                        <p className="text-slate-500 text-sm font-medium">Ask natural language questions about your platform status.</p>
                    </div>
                </div>

                {/* Input Area */}
                <div className="relative mb-8">
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                        placeholder="e.g., What needs my attention right now?"
                        className="w-full bg-white/60 border border-slate-200 rounded-2xl py-4 pl-6 pr-32 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all shadow-sm"
                    />
                    <button
                        onClick={() => handleAskAI()}
                        disabled={loading || !question.trim()}
                        className="absolute right-2 top-2 bottom-2 bg-indigo-600 text-white px-6 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <Send size={14} />
                                <span>Ask AI</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Quick Questions */}
                {!response && !loading && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {quickQuestions.map((q, idx) => (
                            <button
                                key={idx}
                                onClick={() => { setQuestion(q); handleAskAI(q); }}
                                className="px-4 py-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-full text-xs font-bold text-slate-600 transition-all border border-transparent hover:border-indigo-100"
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-600 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {/* Response Display */}
                {response && !loading && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Answer Card */}
                            <div className="bg-indigo-50/50 border border-indigo-100 p-6 rounded-3xl relative overflow-hidden group/card shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center gap-2 mb-3 text-indigo-600">
                                    <CheckCircle2 size={18} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">The Intelligence</span>
                                </div>
                                <p className="text-sm font-bold text-slate-800 leading-relaxed">{parsedData.answer}</p>
                            </div>

                            {/* Reason Card */}
                            <div className="bg-amber-50/50 border border-amber-100 p-6 rounded-3xl relative overflow-hidden group/card shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center gap-2 mb-3 text-amber-600">
                                    <Lightbulb size={18} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Reasoning Logic</span>
                                </div>
                                <p className="text-sm font-bold text-slate-800 leading-relaxed">{parsedData.reason}</p>
                            </div>

                            {/* Recommendation Card */}
                            <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-3xl relative overflow-hidden group/card shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center gap-2 mb-3 text-emerald-600">
                                    <Sparkles size={18} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Strategic Path</span>
                                </div>
                                <p className="text-sm font-bold text-slate-800 leading-relaxed">{parsedData.recommendation}</p>
                            </div>
                        </div>

                        <button 
                            onClick={() => { setResponse(null); setQuestion(''); }}
                            className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-2 mx-auto"
                        >
                            Reset Intelligence Session
                        </button>
                    </div>
                )}

                {/* Loading State Overlay for Response Area */}
                {loading && (
                    <div className="py-20 flex flex-col items-center justify-center space-y-4">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-indigo-100 rounded-full"></div>
                            <div className="absolute inset-0 w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-indigo-600 animate-pulse">Consulting Platform Intelligence...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAIAssistant;
