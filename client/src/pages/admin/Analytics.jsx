import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line
} from 'recharts';
import regression from 'regression';
import OwnerHeader from '../../components/OwnerHeader';

/* ─── Empty-state illustration ─── */
const EmptyState = ({ icon, title, subtitle }) => (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <span className="material-symbols-outlined text-5xl mb-3 opacity-40">{icon}</span>
        <p className="text-sm font-bold text-slate-500">{title}</p>
        {subtitle && <p className="text-xs mt-1">{subtitle}</p>}
    </div>
);

/* ─── KPI Card ─── */
const KpiCard = ({ icon, iconBg, iconColor, label, value, prefix = '', change }) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-2.5 rounded-lg ${iconBg}`}>
                <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
            </div>
            {change !== undefined && (
                <span className={`text-xs font-bold flex items-center gap-0.5 ${change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {change > 0 ? '+' : ''}{change}%
                    <span className="material-symbols-outlined text-sm">{change >= 0 ? 'trending_up' : 'trending_down'}</span>
                </span>
            )}
        </div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{label}</p>
        <h3 className="text-2xl font-black text-slate-900 mt-1">{prefix}{typeof value === 'number' ? value.toLocaleString(undefined, { minimumFractionDigits: prefix === '$' ? 2 : 0 }) : value}</h3>
    </div>
);

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
            <span className="text-[11px] text-slate-400">${current.toLocaleString()} / ${target.toLocaleString()}</span>
        </div>
    );
};

const Analytics = () => {
    const { user, logout } = useAuth();
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
            const formattedData = {
                totalRevenue: mapKpi(kpis.totalRevenue),
                totalOrders: mapKpi(kpis.totalOrders),
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

    const handleLogout = () => {
        if (logout) logout();
        else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        navigate('/login');
    };

    /* ─── Derived values ─── */
    const todayStr = new Date().toISOString().split('T')[0];
    const todaySales = data?.salesData?.find(d => d.name === todayStr)?.sales || 0;
    const hasSalesData = data?.salesData?.length > 0 && data.salesData.some(d => d.sales > 0);
    const hasTopItems = data?.topItems?.length > 0;
    const hasPrediction = prediction && prediction.nextWeek?.length > 0;

    /* ─── Loading state ─── */
    if (loading) {
        return (
            <div className="bg-[#f6f6f8] text-slate-900 font-sans min-h-screen">
                <OwnerHeader />
                <div className="flex items-center justify-center min-h-[70vh]">
                    <div className="flex flex-col items-center">
                        <div className="h-10 w-10 border-4 border-[#1111d4] border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-sm text-slate-500 font-medium">Loading analytics…</p>
                    </div>
                </div>
            </div>
        );
    }

    /* ─── Error state ─── */
    if (error && !data) {
        return (
            <div className="bg-[#f6f6f8] text-slate-900 font-sans min-h-screen">
                <OwnerHeader />
                <div className="flex flex-col items-center justify-center min-h-[70vh]">
                    <span className="material-symbols-outlined text-5xl text-rose-400 mb-3">error</span>
                    <p className="text-sm text-slate-600 font-medium">{error}</p>
                    <button onClick={() => { setLoading(true); fetchAnalytics(); }} className="mt-4 px-5 py-2 bg-[#1111d4] text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity cursor-pointer border-none">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#f6f6f8] text-slate-900 font-sans min-h-screen">
            <OwnerHeader />
            <div className="flex h-screen overflow-hidden pt-[66px]">

                {/* ═══════════ Sidebar — same as OwnerDashboard ═══════════ */}
                <aside className="w-64 flex-shrink-0 flex flex-col bg-white border-r border-slate-200">
                    <div className="pt-6"></div>
                    <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                        <Link className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors" to="/owner-dashboard">
                            <span className="material-icons-filled">dashboard</span>
                            <span>Dashboard</span>
                        </Link>
                        <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors" href="#">
                            <span className="material-symbols-outlined">inventory_2</span>
                            <span>Products</span>
                        </a>
                        <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors" href="#">
                            <span className="material-symbols-outlined">shopping_cart</span>
                            <span>Orders</span>
                        </a>
                        <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors" href="#">
                            <span className="material-symbols-outlined">bar_chart</span>
                            <span>Reports</span>
                        </a>
                        <Link className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#1111d4]/10 text-[#1111d4] font-bold" to="/analytics">
                            <span className="material-symbols-outlined">analytics</span>
                            <span>Analytics</span>
                        </Link>
                    </nav>
                    <div className="p-4 border-t border-slate-200 space-y-3">
                        <button onClick={() => navigate('/owner/products/add')} className="w-full flex items-center justify-center gap-2 bg-[#1111d4] text-white py-2.5 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer border-none">
                            <span className="material-symbols-outlined text-sm">add</span>
                            <span>Add Product</span>
                        </button>
                        <div className="pt-4 space-y-1">
                            <Link className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-sm transition-colors" to="/store-editor">
                                <span className="material-symbols-outlined text-base">brush</span>
                                <span>Store Editor</span>
                            </Link>
                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 text-sm cursor-pointer border-none bg-transparent">
                                <span className="material-symbols-outlined text-base">logout</span>
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* ═══════════ Main Content ═══════════ */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    {/* Top bar */}
                    <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-slate-200">
                        <div className="flex-1 max-w-xl">
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1111d4] transition-colors">search</span>
                                <input className="w-full bg-slate-100 border-none rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-[#1111d4] transition-all text-sm outline-none" placeholder="Search analytics..." type="text" />
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3 pl-2">
                                <div className="text-right hidden md:block">
                                    <p className="text-sm font-semibold">{user?.firstName ? `${user.firstName} ${user.lastName}` : "Owner"}</p>
                                    <p className="text-xs text-slate-500">Shop Owner</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-slate-200 border border-[#1111d4]/20 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.firstName || 'Owner'}&backgroundColor=b6e3f4')` }}></div>
                            </div>
                        </div>
                    </header>

                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto bg-[#f6f6f8]">
                        <div className="p-8 animate-fade-in-up">

                            {/* Page title */}
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold">Analytics & Growth</h2>
                                <p className="text-slate-500 text-sm">Track your store performance and set revenue goals.</p>
                            </div>

                            {/* ═══════════ KPI Cards ═══════════ */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <KpiCard icon="payments" iconBg="bg-emerald-100" iconColor="text-emerald-600" label="Total Revenue" prefix="$" value={data.totalRevenue.value} change={data.totalRevenue.change} />
                                <KpiCard icon="shopping_cart" iconBg="bg-blue-100" iconColor="text-blue-600" label="Total Orders" value={data.totalOrders.value} change={data.totalOrders.change} />
                                <KpiCard icon="group" iconBg="bg-amber-100" iconColor="text-amber-600" label="Customers" value={data.customerCount.value} change={data.customerCount.change} />
                                <KpiCard icon="savings" iconBg="bg-violet-100" iconColor="text-violet-600" label="Net Profit" prefix="$" value={data.netProfit.value} change={data.netProfit.change} />
                            </div>

                            {/* ═══════════ Charts Row ═══════════ */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                                {/* Sales Trend */}
                                <div className="bg-white rounded-xl border border-slate-200 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[#1111d4]">show_chart</span>
                                            Sales Trend
                                        </h3>
                                    </div>
                                    {hasSalesData ? (
                                        <ResponsiveContainer width="100%" height={280}>
                                            <AreaChart data={data.salesData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#1111d4" stopOpacity={0.15} />
                                                        <stop offset="95%" stopColor="#1111d4" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '13px' }}
                                                    itemStyle={{ color: '#1111d4', fontWeight: 700 }}
                                                    formatter={(val) => [`$${val.toLocaleString()}`, 'Revenue']}
                                                />
                                                <Area type="monotone" dataKey="sales" stroke="#1111d4" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad)" dot={false} activeDot={{ r: 5, fill: '#1111d4', stroke: '#fff', strokeWidth: 2 }} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <EmptyState icon="bar_chart" title="No sales data yet" subtitle="Sales will appear here once you start receiving orders" />
                                    )}
                                </div>

                                {/* Growth Forecast */}
                                <div className="bg-white rounded-xl border border-slate-200 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-violet-600">trending_up</span>
                                            Growth Forecast
                                        </h3>
                                        {hasPrediction && (
                                            <span className="px-3 py-1 bg-violet-50 border border-violet-200 rounded-full text-[11px] font-bold text-violet-600 tracking-wide">
                                                Linear Regression
                                            </span>
                                        )}
                                    </div>
                                    {hasPrediction ? (
                                        <>
                                            <p className="text-xs text-slate-400 mb-4 font-medium">
                                                Trend: <span className="text-slate-600 font-bold">{prediction.equation}</span>
                                            </p>
                                            <ResponsiveContainer width="100%" height={240}>
                                                <LineChart data={prediction.nextWeek} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} dy={10} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                                                    <Tooltip
                                                        contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '13px' }}
                                                        formatter={(val) => [`$${val.toLocaleString()}`, 'Predicted']}
                                                    />
                                                    <Line type="monotone" dataKey="predictedSales" stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 4, fill: '#7c3aed', stroke: '#fff', strokeWidth: 2 }} name="Predicted Sales ($)" />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </>
                                    ) : (
                                        <EmptyState icon="insights" title="Not enough data for predictions" subtitle="Add more sales data so we can forecast growth trends" />
                                    )}
                                </div>
                            </div>

                            {/* ═══════════ Bottom Row ═══════════ */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Top Selling Products */}
                                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
                                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-amber-500">emoji_events</span>
                                            Top Selling Products
                                        </h3>
                                        {hasTopItems && (
                                            <span className="text-xs font-bold text-slate-400 uppercase">{data.topItems.length} Products</span>
                                        )}
                                    </div>
                                    {hasTopItems ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider">
                                                    <tr>
                                                        <th className="px-6 py-3.5 font-bold">#</th>
                                                        <th className="px-6 py-3.5 font-bold">Product</th>
                                                        <th className="px-6 py-3.5 font-bold text-center">Units Sold</th>
                                                        <th className="px-6 py-3.5 font-bold text-right">Revenue</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {data.topItems.map((item, idx) => (
                                                        <tr key={item._id || idx} className="hover:bg-slate-50/50 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black
                                                                    ${idx === 0 ? 'bg-amber-100 text-amber-700' : idx === 1 ? 'bg-slate-200 text-slate-600' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'}`}>
                                                                    {idx + 1}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 font-bold text-slate-900 text-sm">{item.title || item.name || 'Unnamed'}</td>
                                                            <td className="px-6 py-4 text-center text-sm font-medium text-slate-600">{(item.totalSold ?? item.quantity ?? 0).toLocaleString()}</td>
                                                            <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">${(item.revenue ?? 0).toLocaleString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <EmptyState icon="inventory_2" title="No product data yet" subtitle="Product rankings will show up once orders come in" />
                                    )}
                                </div>

                                {/* Target Settings */}
                                <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[#1111d4]">flag</span>
                                            Revenue Goals
                                        </h3>
                                        {!editingTargets ? (
                                            <button onClick={() => setEditingTargets(true)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer bg-transparent">
                                                Edit
                                            </button>
                                        ) : (
                                            <button onClick={handleTargetSave} disabled={savingTargets} className="px-3 py-1.5 bg-[#1111d4] text-white rounded-lg text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer border-none disabled:opacity-50">
                                                {savingTargets ? 'Saving…' : 'Save'}
                                            </button>
                                        )}
                                    </div>

                                    {/* Progress rings */}
                                    <div className="flex justify-around py-4 mb-6">
                                        <ProgressRing label="Daily" current={todaySales} target={targets.daily} color="#1111d4" />
                                        <ProgressRing label="Monthly" current={data.totalRevenue.value} target={targets.monthly} color="#7c3aed" />
                                        <ProgressRing label="Yearly" current={data.totalRevenue.value} target={targets.yearly} color="#059669" />
                                    </div>

                                    {/* Input fields */}
                                    <div className="space-y-3 flex-1">
                                        {[
                                            { key: 'daily', label: 'Daily Target', icon: 'today' },
                                            { key: 'monthly', label: 'Monthly Target', icon: 'calendar_month' },
                                            { key: 'yearly', label: 'Yearly Target', icon: 'date_range' },
                                        ].map(({ key, label, icon }) => (
                                            <div key={key} className="relative">
                                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
                                                <div className="relative">
                                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">{icon}</span>
                                                    <input
                                                        type="number"
                                                        disabled={!editingTargets}
                                                        value={targets[key]}
                                                        onChange={(e) => setTargets({ ...targets, [key]: Number(e.target.value) })}
                                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 outline-none focus:ring-1 focus:ring-[#1111d4] focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Analytics;
