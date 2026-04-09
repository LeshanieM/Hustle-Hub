import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import regression from 'regression';
import OwnerLayout from '../../components/dashboard/OwnerLayout';
import { generateHybridReport } from '../../utils/reportGenerator';

const EmptyState = ({ icon, title, subtitle }) => (
    <div className="flex flex-col items-center justify-center py-16 text-slate-500">
        <span className="material-symbols-outlined text-5xl mb-3 opacity-30">{icon}</span>
        <p className="text-sm font-bold text-slate-500">{title}</p>
        {subtitle && <p className="text-xs mt-1 text-slate-500">{subtitle}</p>}
    </div>
);

const KpiCard = ({ icon, iconColor, label, value, prefix = '', change, isLarge = false }) => (
    <div className={`bg-white/80 backdrop-blur-xl border border-slate-200 p-7 rounded-[2rem] shadow-xl relative overflow-hidden group ${isLarge ? 'md:col-span-2' : ''}`}>
        <div className={`absolute -inset-4 bg-gradient-to-tr ${iconColor.replace('text-', 'from-').replace('400', '500/20').replace('500', '600/20')} to-transparent opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700 pointer-events-none rounded-[3rem]`}></div>
        <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-8">
                <div className="p-3.5 rounded-2xl bg-slate-50 shadow-inner border border-slate-100">
                    <span className={`material-symbols-outlined text-[28px] ${iconColor}`}>{icon}</span>
                </div>
                {change !== undefined && (
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm backdrop-blur-md ${change >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                        {change > 0 ? '+' : ''}{change}%
                        <span className="material-symbols-outlined text-[14px]">{change >= 0 ? 'trending_up' : 'trending_down'}</span>
                    </span>
                )}
            </div>
            <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1.5">{label}</p>
                <h3 className={`${isLarge ? 'text-5xl' : 'text-3xl'} font-black text-slate-900 tracking-tight`}>
                    {prefix}{typeof value === 'number' ? value.toLocaleString(undefined, { minimumFractionDigits: prefix === '$' ? 2 : 0 }) : value}
                </h3>
            </div>
        </div>
    </div>
);

const OwnerReports = () => {
    const { user } = useAuth();
    const [reportType, setReportType] = useState('typical');
    const [kpis, setKpis] = useState(null);
    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const velocityChartRef = useRef(null);
    const projectionChartRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                if (!token) return;

                const [kpiRes, salesRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/analytics/owner/kpis', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('http://localhost:5000/api/analytics/owner/sales?period=weekly', { headers: { Authorization: `Bearer ${token}` } })
                ]);
                
                setKpis(kpiRes.data);
                
                if (salesRes.data && Array.isArray(salesRes.data)) {
                    setSalesData(salesRes.data.map((d) => ({
                        name: d.label || d.name || d._id || '',
                        sales: d.value ?? d.sales ?? 0,
                    })));
                } else {
                    setSalesData([]);
                }
            } catch (err) {
                console.error('Failed to fetch data for reports', err);
                setError('Failed to load report data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const calculatePrediction = () => {
        if (!salesData || salesData.length < 2) return null;
        const points = salesData.map((d, i) => [i, d.sales]);
        const result = regression.linear(points);
        const lastIndex = points.length - 1;
        const nextWeek = [];
        for (let i = 1; i <= 7; i++) {
            const pred = result.predict(lastIndex + i);
            nextWeek.push({ day: `Day +${i}`, predictedSales: Math.max(0, Math.round(pred[1])) });
        }
        return { equation: result.string, nextWeek };
    };

    const prediction = reportType === 'ai' ? calculatePrediction() : null;

    const hasSalesData = salesData.length > 0 && salesData.some(d => d.sales > 0);
    const hasPrediction = prediction && prediction.nextWeek?.length > 0;

    const handleDownloadReport = () => {
        let title = reportType === 'typical' ? 'Operational Summary' : 'Intelligent Forecast';
        let subtitle = `Store: ${user?.storeName || 'My Store'} | Generated: ${new Date().toLocaleDateString()}`;
        
        let summary = [];
        let headers = [];
        let reportData = [];
        let chartRefs = [];

        if (reportType === 'typical' && kpis) {
            summary = [
                { label: "Today's Revenue", value: `$${kpis.todayRevenue?.value || 0}` },
                { label: "Pending Orders", value: `${kpis.pendingOrders?.value || 0}` },
                { label: "Low Stock Items", value: `${kpis.lowStock?.value || 0}` },
                { label: "Active Customers", value: `${typeof kpis.activeCustomers === 'object' ? kpis.activeCustomers.value : (kpis.activeCustomers || 0)}` }
            ];

            headers = ['Top Performer Item', 'Units Sold'];
            reportData = (kpis.topItems || []).map(item => [item.name, `${item.sales}`]);
            if (reportData.length === 0) reportData = [['No data', '0']];
        } else if (reportType === 'ai') {
            summary = [];
            if (hasPrediction) {
                summary.push({ label: "Forecast Trajectory", value: `+${prediction.equation.split('x')[0].replace('y = ', '').trim()} sales/day` });
            }
            
            headers = ['Timeline', 'Historical Sales', 'Predicted Demand'];
            
            let combinedMap = new Map();
            salesData.forEach(s => combinedMap.set(s.name, [s.name, `${s.sales}`, '-']));
            if (prediction?.nextWeek) {
                prediction.nextWeek.forEach(p => combinedMap.set(p.day, [p.day, '-', `${p.predictedSales}`]));
            }
            reportData = Array.from(combinedMap.values());
            if (reportData.length === 0) reportData = [['No data', '0', '0']];
            
            if (velocityChartRef.current) chartRefs.push(velocityChartRef);
            if (projectionChartRef.current) chartRefs.push(projectionChartRef);
        }

        generateHybridReport({
            title,
            subtitle,
            headers,
            data: reportData,
            summary,
            chartRefs
        }, `${reportType === 'ai' ? 'AI_Insights' : 'Store'}_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    if (loading) {
        return (
            <OwnerLayout activeTab="reports">
                <div className="flex items-center justify-center min-h-[70vh]">
                    <div className="h-10 w-10 border-4 border-[#1111d4] border-t-transparent rounded-full animate-spin mb-4" />
                </div>
            </OwnerLayout>
        );
    }

    if (error && !kpis) {
        return (
            <OwnerLayout activeTab="reports">
                <div className="flex flex-col items-center justify-center min-h-[70vh]">
                    <span className="material-symbols-outlined text-5xl text-rose-400 mb-3">error</span>
                    <p className="text-sm text-slate-600 font-medium">{error}</p>
                </div>
            </OwnerLayout>
        );
    }

    return (
        <OwnerLayout activeTab="reports" theme="light">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight mb-2">Store Reports</h2>
                        <p className="text-slate-500 text-sm font-medium">Generate comprehensive insights into your store's performance.</p>
                    </div>
                </div>

                {/* Report Type Selector */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-8 inline-flex gap-2">
                    <button 
                        onClick={() => setReportType('typical')}
                        className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${reportType === 'typical' ? 'bg-[#1111d4] text-white shadow-lg shadow-[#1111d4]/30' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <span className="material-symbols-outlined text-[18px]">assessment</span>
                        Typical Report
                    </button>
                    <button 
                        onClick={() => setReportType('ai')}
                        className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${reportType === 'ai' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                        AI Insights Report
                    </button>
                </div>

                {/* Report Container */}
                <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100">
                    <div className="border-b border-slate-100 pb-6 mb-8 flex justify-between items-center">
                        <div>
                            <h3 className="text-3xl font-black tracking-tight text-slate-900">
                                {reportType === 'typical' ? 'Operational Summary' : 'Intelligent Forecast'}
                            </h3>
                            <p className="text-slate-500 mt-1">
                                Generated on {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                        <div className="text-right">
                            <h4 className="font-bold text-slate-800">{user?.storeName || 'My Store'}</h4>
                            <p className="text-sm text-slate-500">Owner: {user?.firstName} {user?.lastName}</p>
                        </div>
                    </div>

                    {reportType === 'typical' && kpis && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <KpiCard icon="payments" iconColor="text-emerald-500" label="Today's Revenue" prefix="$" value={kpis.todayRevenue?.value || 0} change={kpis.todayRevenue?.change} />
                                <KpiCard icon="shopping_bag" iconColor="text-amber-500" label="Pending Orders" value={kpis.pendingOrders?.value || 0} />
                                <KpiCard icon="inventory_2" iconColor="text-rose-500" label="Low Stock Items" value={kpis.lowStock?.value || 0} />
                                <KpiCard icon="group" iconColor="text-blue-500" label="Active Customers" value={typeof kpis.activeCustomers === 'object' ? kpis.activeCustomers.value : (kpis.activeCustomers || 0)} />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                                <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50">
                                    <h4 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-indigo-500">star</span> Top Performing Items
                                    </h4>
                                    {kpis.topItems && kpis.topItems.length > 0 ? (
                                        <ul className="space-y-3">
                                            {kpis.topItems.slice(0, 5).map((item, idx) => (
                                                <li key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                                    <span className="font-semibold text-slate-700">{item.name}</span>
                                                    <span className="text-emerald-600 font-bold px-3 py-1 bg-emerald-50 rounded-lg text-sm">{item.sales} sold</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-slate-500 text-sm">No top items data available yet.</p>
                                    )}
                                </div>
                                <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50">
                                    <h4 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-rose-500">warning</span> Attention Required
                                    </h4>
                                    {kpis.lowStock?.value > 0 ? (
                                       <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 text-rose-700 text-sm">
                                           You have {kpis.lowStock.value} items running low on stock. Review your inventory dashboard to replenish supplies and avoid missed sales.
                                       </div>
                                    ) : (
                                       <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-emerald-700 text-sm">
                                           Stock levels are healthy. No immediate action required.
                                       </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {reportType === 'ai' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
                                     <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-bl-full opacity-50 blur-3xl"></div>
                                     <div className="relative z-10">
                                         <h4 className="text-sm font-bold uppercase tracking-widest text-indigo-200 mb-2">Revenue Forecast</h4>
                                         <h3 className="text-5xl font-black mb-4">
                                            {hasPrediction ? `+${prediction.equation.split('x')[0].replace('y = ', '').trim()}` : '--'}
                                            <span className="text-xl font-bold text-indigo-200 tracking-normal ml-2">sales trajectory</span>
                                         </h3>
                                         <p className="text-indigo-100 leading-relaxed max-w-sm">
                                            Based on historical regression weighting, this represents the average daily growth projection for the upcoming 7-day period.
                                         </p>
                                     </div>
                                </div>
                                
                                <div className="border border-slate-200 rounded-[2rem] p-8 bg-white shadow-lg flex flex-col justify-center">
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">AI Demand Insight</h4>
                                    {hasSalesData ? (
                                        <div className="text-slate-700">
                                            <p className="mb-4">The linear trajectory suggests a <strong className="text-indigo-600">predictable continuation</strong> of recent volume. Adjust inventory purchasing schedules to match the slope indicator.</p>
                                            <div className="flex items-center gap-2 text-sm font-bold px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl inline-flex w-auto mt-2">
                                                <span className="material-symbols-outlined text-purple-500">timeline</span>
                                                Algorithm Confidence: High
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-slate-500">Insufficient data block to render a high-confidence demand insight.</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                                <div className="border border-slate-200 rounded-2xl p-6">
                                    <h4 className="font-bold text-lg text-slate-900 mb-6">Historical Velocity</h4>
                                    {hasSalesData ? (
                                        <div ref={velocityChartRef} className="pb-4">
                                            <ResponsiveContainer width="100%" height={240}>
                                                <AreaChart data={salesData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="salesColor" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} />
                                                    <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#salesColor)" isAnimationActive={false} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    ) : (
                                        <EmptyState icon="analytics" title="No history found" />
                                    )}
                                </div>

                                <div className="border border-slate-200 rounded-2xl p-6">
                                    <h4 className="font-bold text-lg text-slate-900 mb-6 flex items-center gap-2">
                                        DeepMind Linear Extrapolation
                                    </h4>
                                    {hasPrediction ? (
                                        <div ref={projectionChartRef} className="pb-4">
                                            <ResponsiveContainer width="100%" height={240}>
                                                <LineChart data={prediction.nextWeek} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} />
                                                    <Line type="monotone" dataKey="predictedSales" stroke="#a855f7" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} isAnimationActive={false} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    ) : (
                                        <EmptyState icon="batch_prediction" title="Insufficient history for projection" />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-10 flex justify-center pb-10">
                    <button 
                        onClick={handleDownloadReport}
                        className={`flex items-center gap-3 px-8 py-4 rounded-2xl shadow-xl hover:-translate-y-1 transition-all font-bold text-sm tracking-wide text-white ${reportType === 'ai' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-purple-500/25' : 'bg-[#1111d4] hover:shadow-[#1111d4]/25'}`}
                    >
                        <span className="material-symbols-outlined text-[20px]">download</span>
                        Download Document
                    </button>
                </div>
            </div>
        </OwnerLayout>
    );
};

export default OwnerReports;
