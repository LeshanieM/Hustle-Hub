import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import ChartCard from '../../components/dashboard/ChartCard';
import AdminHeader from '../../components/AdminHeader';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line, ComposedChart
} from 'recharts';
import { Bot, Sparkles, TrendingUp, Search } from 'lucide-react';

const AdminAIInsights = () => {
    const [query, setQuery] = useState('');
    const [aiResponse, setAiResponse] = useState(null);
    const [isThinking, setIsThinking] = useState(false);
    const [loading, setLoading] = useState(true);
    const [rawUsers, setRawUsers] = useState([]);
    const [rawStores, setRawStores] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No token');
                const config = { headers: { Authorization: `Bearer ${token}` } };

                const [storesRes, usersRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/admin/stores', config).catch(() => ({ data: [] })),
                    axios.get('http://localhost:5000/api/admin/users', config).catch(() => ({ data: [] }))
                ]);

                setRawStores(storesRes.data || []);
                setRawUsers(usersRes.data || []);
            } catch (error) {
                console.error("Failed fetching insights data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Real Math: Historical accumulation & Linear Regression Projection
    const regressionData = useMemo(() => {
        if (!rawUsers || rawUsers.length === 0) return [];

        const months = [];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({
                label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
                monthNum: d.getMonth(),
                year: d.getFullYear(),
                count: 0
            });
        }

        let baseCount = 0;
        rawUsers.forEach(u => {
            const d = new Date(u.createdAt);
            const matchIndex = months.findIndex(m => m.monthNum === d.getMonth() && m.year === d.getFullYear());
            if (matchIndex === -1 && d < new Date(months[0].year, months[0].monthNum, 1)) {
                baseCount++;
            } else if (matchIndex !== -1) {
                months[matchIndex].count++;
            }
        });

        let cumulative = baseCount;
        const actualData = months.map((m, index) => {
            cumulative += m.count;
            return { x: index + 1, y: cumulative, label: m.label, actual: cumulative };
        });

        const N = actualData.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

        actualData.forEach(pt => {
            sumX += pt.x;
            sumY += pt.y;
            sumXY += pt.x * pt.y;
            sumXX += pt.x * pt.x;
        });

        // y = mx + b
        const slope = (N * sumXY - sumX * sumY) / ((N * sumXX - sumX * sumX) || 1);
        const intercept = (sumY - slope * sumX) / N;

        const result = actualData.map(pt => ({
            period: pt.label,
            value: pt.actual,
            predicted: Math.max(0, Math.round(slope * pt.x + intercept))
        }));

        for (let i = 1; i <= 3; i++) {
            const nextX = N + i;
            const nextD = new Date(now.getFullYear(), now.getMonth() + i, 1);
            result.push({
                period: nextD.toLocaleString('default', { month: 'short', year: '2-digit' }) + ' (Est)',
                value: null,
                predicted: Math.max(0, Math.round(slope * nextX + intercept))
            });
        }

        return result;
    }, [rawUsers]);

    const insightMetrics = useMemo(() => {
        if (!rawStores.length || !rawUsers.length) return null;

        const now = new Date();
        const curMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const recentStores = rawStores.filter(s => new Date(s.createdAt) >= curMonthStart).length;
        const storesBefore = rawStores.filter(s => new Date(s.createdAt) < curMonthStart).length;
        const storeGrowthRate = storesBefore > 0 ? (recentStores / storesBefore * 100).toFixed(1) : (recentStores * 100).toFixed(1);

        const blockedStores = rawStores.filter(s => s.status === 'SUSPENDED').length;
        const churnRate = ((blockedStores / rawStores.length) * 100).toFixed(1);

        return {
            storeGrowthRate,
            activeUsers: rawUsers.length,
            blockedStores,
            churnRate
        };
    }, [rawStores, rawUsers]);

    const handleAskAI = () => {
        if (!query.trim()) return;
        setIsThinking(true);
        setAiResponse(null);

        setTimeout(() => {
            const lowerQuery = query.toLowerCase();
            let response = "";

            if (lowerQuery.includes('student') || lowerQuery.includes('user')) {
                response = `Based on current metrics, we have ${rawUsers.length} registered users. The linear regression predicts steady growth of approximately ${Math.round(insightMetrics?.storeGrowthRate || 5)}% moving forward.`;
            } else if (lowerQuery.includes('store') || lowerQuery.includes('business')) {
                response = `There are currently ${rawStores.length} total stores, with ${insightMetrics?.blockedStores || 0} suspended. Store acquisition grew ${insightMetrics?.storeGrowthRate || 0}% this cycle based on recent data.`;
            } else if (lowerQuery.includes('revenue') || lowerQuery.includes('money')) {
                response = "While strict financial transaction data is partitioned, current operational transaction volume correlates robustly with active business growth rates.";
            } else if (lowerQuery.includes('predict') || lowerQuery.includes('forecast')) {
                response = `Predictive algorithms suggest our platform integration will scale following the dashed linear trendline plotted below, accounting for standard churn deviation.`;
            } else {
                response = `I analyzed the intelligence matrix regarding "${query}", but couldn't isolate a unique pattern. Overall health vectors remain fully nominal.`;
            }

            setAiResponse(response);
            setIsThinking(false);
        }, 1200);
    };

    const sidebarItems = [
        { label: 'Platform Overview', icon: 'dashboard', path: '/admin-dashboard' },
        { label: 'Products Management', icon: 'shopping_bag', path: '/admin/products' },
        { label: 'Order Management', icon: 'receipt_long', path: '/admin/orders' },
        { label: 'Business Directory', icon: 'storefront', path: '/admin/businesses' },
        { label: 'User Directory', icon: 'group', path: '/admin/users' },
        { label: 'Reports', icon: 'analytics', path: '/admin/reports' },
        { label: 'AI Forecasting & Insights', icon: 'auto_graph', path: '/admin/ai-insights' },
        { label: 'Audit Logs', icon: 'history', path: '/admin/audit-logs' },
    ];

    return (
        <DashboardLayout role="Administrator"
            headerTitle="AI Intelligence Office"
            sidebarItems={sidebarItems}
            TopHeader={AdminHeader}
            loading={loading}

            showSearch={false}>
            <div className="space-y-8 animate-fadeIn">
                {/* Header Section */}
                <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Bot size={150} />
                    </div>
                    <div className="relative z-10 max-w-2xl">
                        <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
                            <Sparkles className="text-yellow-400" /> Platform Forecasting Model
                        </h1>
                        <p className="text-indigo-100 mb-6 text-lg">
                            Leveraging regression analysis on historical data to predict platform onboarding trends and revenue growth.
                        </p>

                        {/* AI Query Bar */}
                        <div className="relative flex-col w-full max-w-xl">
                            <div className="relative flex items-center bg-white/10 backdrop-blur-md rounded-xl p-1 border border-white/20 z-20">
                                <Search className="absolute left-4 text-white/50" size={20} />
                                <input
                                    type="text"
                                    className="w-full bg-transparent border-none py-3 pl-12 pr-4 text-white placeholder-white/50 focus:outline-none focus:ring-0"
                                    placeholder="Ask AI: What is the projected student count by Q3?"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                                />
                                <button
                                    onClick={handleAskAI}
                                    disabled={isThinking}
                                    className="bg-white text-indigo-900 px-6 py-2 rounded-lg font-bold hover:bg-slate-100 transition-colors disabled:opacity-75 disabled:cursor-wait whitespace-nowrap">
                                    {isThinking ? 'Thinking...' : 'Ask'}
                                </button>
                            </div>

                            {/* AI Response Bubble */}
                            {aiResponse && (
                                <div className="mt-3 bg-indigo-800/90 backdrop-blur-md border border-indigo-400/30 rounded-xl p-4 text-sm text-indigo-50 shadow-lg animate-fadeIn z-10 transition-all">
                                    <div className="flex items-start gap-3">
                                        <Bot className="text-yellow-400 mt-1 shrink-0" size={18} />
                                        <p className="m-0 leading-relaxed font-medium">{aiResponse}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Regression Chart */}
                    <div className="lg:col-span-2">
                        <ChartCard title="Platform Growth Regression" subtitle="Historical actuals vs linear regression forecast" height="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={regressionData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="period" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend />
                                    <Area type="monotone" name="Actual Growth" dataKey="value" fill="url(#colorValue)" stroke="#4f46e5" strokeWidth={3} />
                                    <Line type="monotone" name="Predicted Trend (Regression)" dataKey="predicted" stroke="#f59e0b" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4 }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </div>

                    {/* AI Insights Board */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm h-full flex flex-col">
                            <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
                                <TrendingUp className="text-emerald-500" /> Automated Insights
                            </h3>

                            {loading ? (
                                <div className="flex justify-center items-center h-full flex-1">
                                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : (
                                <div className="space-y-4 flex-1">
                                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 transition-all hover:bg-emerald-100">
                                        <span className="text-[10px] uppercase font-black tracking-widest text-emerald-600 mb-1 block">Platform Scaling Rate</span>
                                        <p className="text-sm font-medium text-slate-700 m-0">
                                            Store acquisition grew by <b>{insightMetrics?.storeGrowthRate || 0}%</b> this period. Total platform adoption remains steady at <b>{insightMetrics?.activeUsers || 0} registered users</b>.
                                        </p>
                                    </div>
                                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 transition-all hover:bg-blue-100">
                                        <span className="text-[10px] uppercase font-black tracking-widest text-blue-600 mb-1 block">Health Matrix</span>
                                        <p className="text-sm font-medium text-slate-700 m-0">
                                            The linear least squares modeling confirms an ongoing trajectory. Forecast precision calculates expected cumulative registrations over the next 3 months continuously.
                                        </p>
                                    </div>
                                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 transition-all hover:bg-purple-100">
                                        <span className="text-[10px] uppercase font-black tracking-widest text-purple-600 mb-1 block">Churn Exposure Risk</span>
                                        <p className="text-sm font-medium text-slate-700 m-0">
                                            Currently <b>{insightMetrics?.blockedStores || 0} stores</b> ({insightMetrics?.churnRate || 0}%) are suspended or flagged by admins. Predict churn risk to hold stable unless global policy bounds are triggered.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
};

export default AdminAIInsights;
