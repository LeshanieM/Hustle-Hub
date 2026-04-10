import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
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

const GlassCard = ({ children, className = "" }) => (
    <div className={`bg-white/70 backdrop-blur-3xl border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[2.5rem] p-8 transition-all hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] ${className}`}>
        {children}
    </div>
);

const KpiCard = ({ icon, iconColor, label, value, prefix = '', change, subtitle }) => (
    <GlassCard className="relative overflow-hidden group">
        <div className={`absolute -inset-4 bg-gradient-to-tr ${iconColor.replace('text-', 'from-').replace('400', '500/10').replace('500', '600/10')} to-transparent opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700 pointer-events-none rounded-[3rem]`}></div>
        <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-6">
                <div className="p-4 rounded-2xl bg-white shadow-sm border border-slate-100/50 flex items-center justify-center">
                    <span className={`material-symbols-outlined text-[30px] ${iconColor}`}>{icon}</span>
                </div>
                {change !== undefined && (
                    <div className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest flex items-center gap-1 shadow-sm border ${change >= 0 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                        {change > 0 ? '+' : ''}{change}%
                        <span className="material-symbols-outlined text-[14px]">{change >= 0 ? 'trending_up' : 'trending_down'}</span>
                    </div>
                )}
            </div>
            <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{label}</p>
                <div className="flex items-baseline gap-1">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">
                        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
                    </h3>
                    {subtitle && <span className="text-xs font-bold text-slate-400 ml-1">{subtitle}</span>}
                </div>
            </div>
        </div>
    </GlassCard>
);

const ProgressRing = ({ label, current, target, color, icon }) => {
    const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
    const isClose = pct >= 80;
    return (
        <div className="flex flex-col items-center text-center group/ring">
            <div className="relative h-24 w-24 mb-4 transition-all duration-700 group-hover/ring:scale-110">
                {isClose && <div className={`absolute inset-0 rounded-full blur-xl opacity-20 animate-pulse`} style={{ backgroundColor: color }}></div>}
                <svg className="w-24 h-24 -rotate-90 relative z-10" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                    <circle cx="40" cy="40" r="34" fill="none" stroke={color} strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={`${(pct / 100) * 213.6} 213.6`}
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                    <span className="text-lg font-black text-slate-900 leading-none">{Math.round(pct)}%</span>
                </div>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</span>
                <span className="text-[12px] font-black text-slate-900 tracking-tight">${current.toLocaleString()} / <span className="text-slate-400">${target.toLocaleString()}</span></span>
            </div>
        </div>
    );
};

const InsightCard = ({ title, text, icon, color }) => (
    <div className={`p-5 rounded-3xl border border-white/50 bg-white/40 shadow-sm flex items-start gap-4 hover:bg-white/60 transition-colors`}>
        <div className={`p-2.5 rounded-xl ${color} flex-shrink-0`}>
            <span className="material-symbols-outlined text-[20px] block">{icon}</span>
        </div>
        <div>
            <h5 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">{title}</h5>
            <p className="text-sm font-bold text-slate-700 leading-tight">{text}</p>
        </div>
    </div>
);

const OwnerReports = () => {
    const { user } = useAuth();
    const [reportType, setReportType] = useState('typical');
    const [kpis, setKpis] = useState(null);
    const [salesData, setSalesData] = useState([]);
    const [reportPeriod, setReportPeriod] = useState('weekly');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [targets, setTargets] = useState({ daily: 1000, monthly: 30000 });
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [exportSuccess, setExportSuccess] = useState(false);
    const [error, setError] = useState(null);
    const velocityChartRef = useRef(null);
    const projectionChartRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                if (!token) return;

                const [kpiRes, salesRes, targetRes] = await Promise.all([
                    axios.get(`http://localhost:5000/api/analytics/owner/kpis?period=${reportPeriod}`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`http://localhost:5000/api/analytics/owner/sales?period=${reportPeriod}`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`http://localhost:5000/api/analytics/targets?period=${reportPeriod}`, { headers: { Authorization: `Bearer ${token}` } })
                ]);
                
                setKpis(kpiRes.data);
                if (targetRes.data) setTargets(targetRes.data);
                
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
    }, [reportPeriod]);

    const profitData = kpis ? [
        { name: 'Net Profit', value: kpis.netProfit?.value || 0, color: '#10b981' },
        { name: 'Expenses', value: kpis.totalExpenses?.value || 0, color: '#f43f5e' }
    ] : [];

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

    const handleDownloadReport = async (type = 'pdf') => {
        setExporting(true);
        let title = reportType === 'typical' ? 'Operational Summary' : 'Intelligent Forecast';
        let periodLabel = kpis?.periodStats?.label || reportPeriod.charAt(0).toUpperCase() + reportPeriod.slice(1);
        let dateRange = kpis?.periodStats ? `${kpis.periodStats.startDate} - ${kpis.periodStats.endDate}` : '';
        let subtitle = `Store: ${user?.storeName || 'My Store'} | Configuration: ${periodLabel} (${dateRange})`;
        
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
        } else if (reportType === 'logistics' && kpis) {
            title = 'Inventory & Logistics Audit';
            summary = [
                { label: "SKU Count", value: `${(kpis.topItems || []).length}` },
                { label: "Critical Stock Alerts", value: `${kpis.lowStock?.value || 0}` }
            ];
            headers = ['Product Listing', 'Category', 'Sales Volume'];
            reportData = (kpis.topItems || []).map(item => [item.name, item.type || 'General', `${item.sales}`]);
        } else if (reportType === 'financial' && kpis) {
            title = 'Financial Performance Audit';
            summary = [
                { label: "Gross Revenue", value: `$${kpis.totalRevenue?.value || 0}` },
                { label: "Operational Expenses", value: `$${kpis.totalExpenses?.value || 0}` },
                { label: "Net Margin", value: `$${kpis.netProfit?.value || 0}` }
            ];
            headers = ['Financial Segment', 'Value Allocated'];
            reportData = [
                ['Net Profit', `$${kpis.netProfit?.value || 0}`],
                ['Operating Expenses', `$${kpis.totalExpenses?.value || 0}`],
                ['Gross Total', `$${kpis.totalRevenue?.value || 0}`]
            ];
        }

        if (type === 'excel') {
            const csvRows = [headers, ...reportData];
            const csvContent = csvRows.map(e => e.join(",")).join("\n");
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `${reportType}_${reportPeriod}_Report_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            await generateHybridReport({
                title,
                subtitle,
                headers,
                data: reportData,
                summary,
                chartRefs
            }, `${reportType}_${reportPeriod}_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        }
        setExporting(false);
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 4000);
    };

    const filteredTopItems = kpis?.topItems?.filter(item => 
        selectedCategory === 'All' || item.type === selectedCategory
    ) || [];

    return (
        <OwnerLayout activeTab="reports">
            <div className="max-w-4xl mx-auto px-4 pb-20 pt-10">
                {/* Header Section */}
                <div className="mb-12 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="h-1 w-10 bg-indigo-600 rounded-full"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">Secure Protocol</span>
                        <div className="h-1 w-10 bg-indigo-600 rounded-full"></div>
                    </div>
                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-4">Generation Center</h2>
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200">
                            {[
                                { id: 'typical', label: 'Operational' },
                                { id: 'ai', label: 'Predictive' },
                                { id: 'logistics', label: 'Logistics' },
                                { id: 'financial', label: 'Financial' }
                            ].find(r => r.id === reportType)?.label} Protocol
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                            {reportPeriod} Lifecycle
                        </span>
                        {kpis?.periodStats && (
                            <>
                                <span className="text-slate-300">•</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {kpis.periodStats.startDate} – {kpis.periodStats.endDate}
                                </span>
                            </>
                        )}
                    </div>
                    <p className="text-slate-500 text-lg font-medium max-w-xl mx-auto">
                        Configure and export bespoke intelligence reports for your business lifecycle.
                    </p>
                </div>

                <div className="space-y-10">
                    {/* Phase 1: Intelligence Selection */}
                    <section>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 block ml-2">Phase 01: Intelligence Selection</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { id: 'typical', title: 'Operational Summary', desc: 'Holistic overview of sales, customers, and order velocity.', icon: 'assessment', color: 'indigo', contents: ['Revenue Metrics', 'Order Volume', 'Customer Retention'] },
                                { id: 'ai', title: 'Predictive Insights', desc: 'AI-driven demand forecasting and trajectory analysis.', icon: 'auto_awesome', color: 'purple', contents: ['Forecast Trends', 'Growth Trajectory', 'Projection Logic'] },
                                { id: 'logistics', title: 'Inventory Logistics', desc: 'Stock audits, threshold warnings, and top SKU performance.', icon: 'inventory_2', color: 'amber', contents: ['Stock Levels', 'Threshold Alerts', 'SKU Velocity'] },
                                { id: 'financial', title: 'Financial Audit', desc: 'Profit vs Expense distribution and revenue reconciliation.', icon: 'account_balance_wallet', color: 'emerald', contents: ['Net Margin', 'Operational Costs', 'Tax Estimation'] },
                            ].map(type => (
                                <button 
                                    key={type.id}
                                    onClick={() => setReportType(type.id)}
                                    className={`group flex flex-col p-6 rounded-[2rem] border transition-all text-left ${reportType === type.id ? 'bg-white border-indigo-200 shadow-2xl shadow-indigo-500/10' : 'bg-white/50 border-white shadow-sm hover:border-slate-200 hover:bg-white'}`}
                                >
                                    <div className="flex items-start gap-5 mb-6">
                                        <div className={`p-4 rounded-2xl ${reportType === type.id ? `bg-${type.color}-600 text-white shadow-lg shadow-${type.color}-500/20` : 'bg-slate-100 text-slate-400'} transition-colors`}>
                                            <span className="material-symbols-outlined text-[28px]">{type.icon}</span>
                                        </div>
                                        <div>
                                            <h5 className={`font-black text-lg ${reportType === type.id ? 'text-slate-900' : 'text-slate-500'} mb-1`}>{type.title}</h5>
                                            <p className="text-xs font-bold text-slate-400 leading-snug">{type.desc}</p>
                                        </div>
                                    </div>
                                    <div className="mt-auto flex flex-wrap gap-2">
                                        {type.contents.map(c => (
                                            <span key={c} className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${reportType === type.id ? 'bg-indigo-50 text-indigo-500 border-indigo-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                                {c}
                                            </span>
                                        ))}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Phase 2: Chrono Configuration */}
                    <section>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 block ml-2">Phase 02: Lifecycle Configuration</h4>
                        <GlassCard className="flex flex-wrap items-center gap-4">
                            {['Daily', 'Weekly', 'Monthly', 'Annual'].map(p => (
                                <button 
                                    key={p} 
                                    onClick={() => setReportPeriod(p.toLowerCase())}
                                    className={`flex-1 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${reportPeriod === p.toLowerCase() ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/30' : 'bg-white border border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-900'}`}
                                >
                                    {p}
                                </button>
                            ))}
                        </GlassCard>
                    </section>

                    {/* Phase 3: Dataset Preview (Lightweight) */}
                    {kpis && !loading && (
                        <section className="animate-fade-in-up">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 block ml-2">Phase 03: Integrity Preview</h4>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl">
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Revenue</p>
                                    <p className="text-xl font-black text-slate-900">${(reportType === 'financial' ? kpis.totalRevenue?.value : kpis.totalRevenue?.value).toLocaleString()}</p>
                                </div>
                                <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl">
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Filtered Cycles</p>
                                    <p className="text-xl font-black text-slate-900">{kpis.topItems?.reduce((a, b) => a + b.sales, 0) || 0} Sold</p>
                                </div>
                                <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl">
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Dominant SKU</p>
                                    <p className="text-sm font-black text-slate-900 truncate">{kpis.topItems?.[0]?.name || 'N/A'}</p>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Phase 4: Protocol Export */}
                    <section className="pt-10 border-t border-slate-100">
                        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                            <button 
                                onClick={() => handleDownloadReport('pdf')}
                                disabled={loading || exporting}
                                className="group relative flex items-center gap-6 bg-slate-900 px-12 py-7 rounded-[2.5rem] shadow-2xl shadow-slate-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2.6rem] opacity-0 group-hover:opacity-20 blur-xl transition-opacity"></div>
                                <span className={`material-symbols-outlined text-white text-[28px] ${exporting ? 'animate-spin' : ''}`}>
                                    {exporting ? 'sync' : 'description'}
                                </span>
                                <div className="text-left">
                                    <p className="text-white font-black text-sm uppercase tracking-[0.2em] mb-0.5">
                                        {exporting ? 'Synchronizing...' : 'Initialize Protocol'}
                                    </p>
                                    <p className="text-slate-400 text-[10px] font-black tracking-widest uppercase">Format: Bespoke PDF</p>
                                </div>
                            </button>

                            <button 
                                onClick={() => handleDownloadReport('excel')}
                                disabled={loading || exporting}
                                className="flex items-center gap-6 bg-white border border-slate-200 px-12 py-7 rounded-[2.5rem] shadow-xl hover:bg-slate-50 transition-all disabled:opacity-50"
                            >
                                <span className={`material-symbols-outlined text-slate-600 text-[28px] ${exporting ? 'animate-spin' : ''}`}>
                                    {exporting ? 'sync' : 'table_chart'}
                                </span>
                                <div className="text-left">
                                    <p className="text-slate-900 font-black text-sm uppercase tracking-[0.2em] mb-0.5">
                                        {exporting ? 'Extracting...' : 'Export Dataset'}
                                    </p>
                                    <p className="text-slate-400 text-[10px] font-black tracking-widest uppercase">Format: Excel (.csv)</p>
                                </div>
                            </button>
                        </div>
                        
                        {exportSuccess && (
                            <div className="mt-8 flex items-center justify-center gap-3 animate-fade-in-up">
                                <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">Export Cycle Successfully Validated & Downloaded</p>
                            </div>
                        )}
                        
                        {loading && !exporting && (
                            <div className="mt-8 flex items-center justify-center gap-3">
                                <div className="h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">Synchronizing Data Integrity...</p>
                            </div>
                        )}
                        {error && <p className="mt-4 text-center text-rose-500 text-xs font-bold">{error}</p>}
                    </section>
                </div>

                {/* Secure Footer Note */}
                <div className="mt-20 flex items-center justify-center gap-3 opacity-30 grayscale pointer-events-none">
                    <span className="material-symbols-outlined text-sm">shield_lock</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.5em]">End-to-End Enterprise Encryption Active</span>
                </div>
            </div>
            
            {/* Hidden Chart Elements for Report Generation Rendering */}
            <div className="fixed bottom-[-2000px] left-[-2000px] opacity-0 pointer-events-none">
                <div ref={velocityChartRef} style={{ width: '800px', height: '400px' }}>
                     <AreaChart data={salesData}><Area dataKey="sales" /></AreaChart>
                </div>
                <div ref={projectionChartRef} style={{ width: '800px', height: '400px' }}>
                    <LineChart data={prediction?.nextWeek || []}><Line dataKey="predictedSales" /></LineChart>
                </div>
            </div>
        </OwnerLayout>
    );
};

export default OwnerReports;
