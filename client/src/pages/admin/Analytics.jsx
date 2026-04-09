import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line
} from 'recharts';
import regression from 'regression';
import OwnerLayout from '../../components/dashboard/OwnerLayout';
import TopProductsTable from '../../components/dashboard/TopProductsTable';
import AlertPanel from '../../components/dashboard/AlertPanel';
import { generateHybridReport } from '../../utils/reportGenerator';


/* ─── Empty-state illustration ─── */
const EmptyState = ({ icon, title, subtitle }) => (
    <div className="flex flex-col items-center justify-center py-16 text-slate-500">
        <span className="material-symbols-outlined text-5xl mb-3 opacity-30">{icon}</span>
        <p className="text-sm font-bold text-slate-500">{title}</p>
        {subtitle && <p className="text-xs mt-1 text-slate-500">{subtitle}</p>}
    </div>
);

/* ─── KPI Card (Bento Style) ─── */
const KpiCard = ({ icon, iconColor, label, value, prefix = '', change, isLarge = false }) => {
    return (
    <div className={`bg-white backdrop-blur-3xl border border-slate-200 p-7 rounded-[2rem] shadow-2xl hover:bg-slate-50 transition-all relative overflow-hidden group ${isLarge ? 'md:col-span-2' : ''}`}>
        {/* Ambient Glow */}
        <div className={`absolute -inset-4 bg-gradient-to-tr ${iconColor.replace('text-', 'from-').replace('400', '500/20')} to-transparent opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700 pointer-events-none rounded-[3rem]`}></div>
        
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
)};

/* ─── Progress ring for targets ─── */
const ProgressRing = ({ label, current, target, color }) => {
    const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                    <circle cx="40" cy="40" r="34" fill="none" stroke={color} strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={`${(pct / 100) * 213.6} 213.6`}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-black text-slate-900">{Math.round(pct)}%</span>
                </div>
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
            <span className="text-[11px] text-slate-500">${current.toLocaleString()} / ${target.toLocaleString()}</span>
        </div>
    );
};

const Analytics = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [targets, setTargets] = useState({ daily: 0, monthly: 0, yearly: 0 });
    const [editingTargets, setEditingTargets] = useState(false);
    const [savingTargets, setSavingTargets] = useState(false);

    useEffect(() => {
        fetchAnalytics();
        fetchTargets();
    }, [user]);

    const fetchAnalytics = async () => {
        try {
            setError(null);
            const token = localStorage.getItem('token');
            const [kpiRes, salesRes] = await Promise.all([
                axios.get('http://localhost:5000/api/analytics/owner/kpis', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:5000/api/analytics/owner/sales?period=weekly', { headers: { Authorization: `Bearer ${token}` } })
            ]);

            const mapKpi = (raw) => {
                if (raw && typeof raw === 'object' && 'value' in raw) return raw;
                if (typeof raw === 'number') return { value: raw, change: 0 };
                return { value: 0, change: 0 };
            };

            const normalizeSales = (arr) => {
                if (!Array.isArray(arr) || arr.length === 0) return [];
                return arr.map((d) => ({
                    name: d.label || d.name || d._id || '',
                    sales: d.value ?? d.sales ?? 0,
                }));
            };

            const kpis = kpiRes.data;
            const totalRev = mapKpi(kpis.totalRevenue).value;
            const totalOrd = mapKpi(kpis.totalOrders).value;
            const avgOrderValue = totalOrd > 0 ? parseFloat((totalRev / totalOrd).toFixed(2)) : 0;
            const formattedData = {
                totalRevenue: mapKpi(kpis.totalRevenue),
                avgOrderValue: { value: avgOrderValue, change: 0 },
                customerCount: mapKpi(kpis.activeCustomers),
                netProfit: mapKpi(kpis.netProfit),
                salesData: normalizeSales(salesRes.data),
                topItems: Array.isArray(kpis.topItems) ? kpis.topItems : [],
            };

            setData(formattedData);
            calculatePrediction(formattedData.salesData);
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError('Could not load analytics. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const fetchTargets = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/analytics/targets', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data) {
                setTargets({
                    daily: res.data.daily || 0,
                    monthly: res.data.monthly || 0,
                    yearly: res.data.yearly || 0,
                });
            }
        } catch (err) {
            console.error('Failed to fetch targets:', err);
        }
    };

    const calculatePrediction = (salesData) => {
        if (!salesData || salesData.length < 2) return;
        const points = salesData.map((d, i) => [i, d.sales]);
        const result = regression.linear(points);
        const lastIndex = points.length - 1;
        const nextWeek = [];
        for (let i = 1; i <= 7; i++) {
            const pred = result.predict(lastIndex + i);
            nextWeek.push({ day: `Day +${i}`, predictedSales: Math.max(0, Math.round(pred[1])) });
        }
        setPrediction({ equation: result.string, nextWeek });
    };

    const handleTargetSave = async () => {
        try {
            setSavingTargets(true);
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/analytics/targets', targets, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEditingTargets(false);
        } catch (err) {
            console.error(err);
            alert('Failed to update targets');
        } finally {
            setSavingTargets(false);
        }
    };

    /* ─── Derived values ─── */
    const todayStr = new Date().toISOString().split('T')[0];
    const todaySales = data?.salesData?.find(d => d.name === todayStr)?.sales || 0;
    const hasSalesData = data?.salesData?.length > 0 && data.salesData.some(d => d.sales > 0);
    const hasTopItems = data?.topItems?.length > 0;
    const hasPrediction = prediction && prediction.nextWeek?.length > 0;

    const handleDownloadReport = () => {
        const title = 'Admin Analytics Report';
        const subtitle = `Generated on: ${new Date().toLocaleDateString()}`;
        
        const summary = [
            { label: "Total Revenue", value: `$${data?.totalRevenue?.value?.toLocaleString() || 0}` },
            { label: "Avg Order Value", value: `$${data?.avgOrderValue?.value?.toLocaleString() || 0}` },
            { label: "Total Customers", value: `${data?.customerCount?.value || 0}` },
            { label: "Net Profit", value: `$${data?.netProfit?.value?.toLocaleString() || 0}` }
        ];

        const headers = ['Top Items', 'Sales'];
        let reportData = (data?.topItems || []).map(item => [item._id || item.name || 'Unknown', `${item.totalQuantity || item.sales || 0}`]);
        if (reportData.length === 0) reportData = [['No data', '0']];
        
        generateHybridReport({
            title,
            subtitle,
            summary,
            headers,
            data: reportData
        }, 'Admin_Analytics_Report.pdf');
    };

    /* ─── Loading state ─── */
    if (loading) {
        return (
            <OwnerLayout activeTab="analytics">
                <div className="flex items-center justify-center min-h-[70vh]">
                    <div className="flex flex-col items-center">
                        <div className="h-10 w-10 border-4 border-[#1111d4] border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-sm text-slate-500 font-medium">Loading analytics…</p>
                    </div>
                </div>
            </OwnerLayout>
        );
    }

    /* ─── Error state ─── */
    if (error && !data) {
        return (
            <OwnerLayout activeTab="analytics">
                <div className="flex flex-col items-center justify-center min-h-[70vh]">
                    <span className="material-symbols-outlined text-5xl text-rose-400 mb-3">error</span>
                    <p className="text-sm text-slate-600 font-medium">{error}</p>
                    <button onClick={() => { setLoading(true); fetchAnalytics(); }} className="mt-4 px-5 py-2 bg-[#1111d4] text-slate-900 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity cursor-pointer border-none">
                        Retry
                    </button>
                </div>
            </OwnerLayout>
        );
    }

    return (
        <OwnerLayout activeTab="analytics" theme="white">
            <div className="px-2 pb-6 bg-white/50 rounded-3xl">
                {/* Bento Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 tracking-tight leading-tight mb-2">Insights Matrix</h2>
                    <p className="text-slate-500 text-sm font-medium">Real-time pulse of your performance metrics.</p>
                </div>
            </div>

            {/* ═══════════ KPI Grid (Bento) ═══════════ */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <KpiCard isLarge={true} icon="payments" iconColor="text-emerald-400" label="Total Revenue" prefix="$" value={data.totalRevenue.value} change={data.totalRevenue.change} />
                <KpiCard icon="receipt_long" iconColor="text-blue-400" label="Avg Order Value" prefix="$" value={data.avgOrderValue.value} change={data.avgOrderValue.change} />
                <KpiCard icon="group" iconColor="text-amber-400" label="Customers" value={data.customerCount.value} change={data.customerCount.change} />
                <KpiCard icon="savings" iconColor="text-violet-400" label="Net Profit" prefix="$" value={data.netProfit.value} change={data.netProfit.change} />
            </div>

                            {/* ═══════════ Bottom Row ═══════════ */}
                            <div className="grid grid-cols-1 max-w-3xl mx-auto gap-8">
                                {/* Target Settings */}
                                <div className="bg-white backdrop-blur-3xl rounded-[2rem] border border-slate-200 p-7 shadow-2xl flex flex-col relative overflow-hidden group">
                                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
                                            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                                <span className="material-symbols-outlined text-[20px] block">flag</span>
                                            </div>
                                            Revenue Goals
                                        </h3>
                                        {!editingTargets ? (
                                            <button onClick={() => setEditingTargets(true)} className="px-4 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer bg-white shadow-inner">
                                                Edit
                                            </button>
                                        ) : (
                                            <button onClick={handleTargetSave} disabled={savingTargets} className="px-4 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold hover:bg-emerald-500/30 transition-colors cursor-pointer disabled:opacity-50">
                                                {savingTargets ? 'Saving…' : 'Save'}
                                            </button>
                                        )}
                                    </div>

                                    {/* Progress rings */}
                                    <div className="flex justify-around py-4 mb-6">
                                        <ProgressRing label="Daily" current={todaySales} target={targets.daily} color="#38bdf8" />
                                        <ProgressRing label="Monthly" current={data.totalRevenue.value} target={targets.monthly} color="#a855f7" />
                                        <ProgressRing label="Yearly" current={data.totalRevenue.value} target={targets.yearly} color="#34d399" />
                                    </div>

                                    {/* Input fields */}
                                    <div className="space-y-4 flex-1">
                                        {[
                                            { key: 'daily', label: 'Daily Target', icon: 'today' },
                                            { key: 'monthly', label: 'Monthly Target', icon: 'calendar_month' },
                                            { key: 'yearly', label: 'Yearly Target', icon: 'date_range' },
                                        ].map(({ key, label, icon }) => (
                                            <div key={key} className="relative group/input">
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">{label}</label>
                                                <div className="relative">
                                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500/70 text-lg group-focus-within/input:text-emerald-400 transition-colors">{icon}</span>
                                                    <input
                                                        type="number"
                                                        disabled={!editingTargets}
                                                        value={targets[key]}
                                                        onChange={(e) => setTargets({ ...targets, [key]: Number(e.target.value) })}
                                                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-emerald-500/50 focus:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder-slate-400"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Inventory Alerts Deep Analysis Row */}
                            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 h-auto lg:h-[420px]">
                                <AlertPanel />
                                <div className="bg-white backdrop-blur-3xl rounded-[2rem] border border-slate-200 shadow-2xl relative overflow-hidden group flex flex-col justify-center items-center text-slate-500 h-full p-8 min-h-[300px]">
                                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
                                    <div className="w-20 h-20 rounded-3xl bg-white border border-slate-200 shadow-inner flex items-center justify-center mb-6 text-cyan-500/50">
                                        <span className="material-symbols-outlined text-4xl block">bolt</span>
                                    </div>
                                    <p className="text-lg font-bold text-slate-900 mb-2 tracking-tight">Peak Ordering Analysis</p>
                                    <p className="text-sm text-slate-500 max-w-sm text-center leading-relaxed">System requires at least 14 days of booking history to generate deep timing analyses and heatmaps.</p>
                                </div>
                            </div>
            </div>

            {/* ═══════════ Export Action ═══════════ */}
            <div className="mt-6 flex justify-center pb-8 border-t border-slate-100 pt-8 relative z-20">
                <button 
                    onClick={handleDownloadReport}
                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl shadow-xl hover:shadow-indigo-500/25 transition-all transform hover:-translate-y-1 font-bold text-sm tracking-wide"
                >
                    <span className="material-symbols-outlined text-[20px]">download</span>
                    Download Digital Report
                </button>
            </div>
        </OwnerLayout>
    );
};

export default Analytics;
