import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import OwnerLayout from '../../components/dashboard/OwnerLayout';
import LowStockWidget from '../../components/dashboard/LowStockWidget';
import RecentOrdersList from '../../components/dashboard/RecentOrdersList';

const OwnerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [kpis, setKpis] = useState(null);


    useEffect(() => {
        const fetchKpis = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const res = await axios.get('http://localhost:5000/api/analytics/owner/kpis', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setKpis(res.data);
            } catch (error) {
                console.error('Failed to fetch KPIs', error);
                setKpis({
                    todayRevenue: { value: 0 },
                    pendingOrders: { value: 0 },
                    lowStock: { value: 0 }
                });
            }
        };
        fetchKpis();
    }, []);

    return (
        <OwnerLayout activeTab="dashboard">
            <div className="pb-6 bg-slate-50/50 rounded-3xl p-2">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold">Operational Overview</h2>
                        <p className="text-slate-500 text-sm">Welcome back, {user?.firstName || 'Alex'}. Here's what needs your attention today.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            to="/analytics"
                            className="flex items-center gap-2 px-4 py-2 bg-[#1111d4] text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
                        >
                            <span className="material-symbols-outlined text-lg">insights</span>
                            Deep Dive Analytics
                        </Link>
                        <button
                            onClick={() => navigate('/owner/products/add')}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-[#1111d4] rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">add_box</span>
                            New Item
                        </button>
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {/* Today's Revenue */}
                    <div className="bg-white backdrop-blur-3xl border border-slate-200 p-7 rounded-[2rem] shadow-2xl hover:bg-slate-50 transition-all relative overflow-hidden group flex flex-col justify-between">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700 pointer-events-none rounded-[3rem]"></div>
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3.5 rounded-2xl bg-slate-50 shadow-inner border border-slate-100">
                                    <span className="material-symbols-outlined text-[28px] text-emerald-500">payments</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1.5">Today's Revenue</p>
                                <h3 className="text-4xl font-black text-slate-900 tracking-tight">
                                    ${kpis?.todayRevenue?.value?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
                                </h3>
                                {kpis?.todayRevenue?.change > 0
                                    ? <span className="text-xs font-bold text-emerald-600 mt-2 inline-block">+{kpis.todayRevenue.change}% vs yesterday</span>
                                    : <span className="text-xs font-bold text-slate-400 mt-2 inline-block">Today so far</span>
                                }
                            </div>
                        </div>
                    </div>

                    {/* Pending Orders */}
                    <div className="bg-white backdrop-blur-3xl border border-slate-200 p-7 rounded-[2rem] shadow-2xl hover:bg-slate-50 transition-all relative overflow-hidden group flex flex-col justify-between">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700 pointer-events-none rounded-[3rem]"></div>
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3.5 rounded-2xl bg-slate-50 shadow-inner border border-slate-100">
                                    <span className="material-symbols-outlined text-[28px] text-amber-500">shopping_bag</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1.5">Pending Orders</p>
                                <h3 className="text-4xl font-black text-slate-900 tracking-tight">
                                    {kpis?.pendingOrders?.value?.toLocaleString() || '0'}
                                </h3>
                                {kpis?.pendingOrders?.value > 0
                                    ? <span className="text-xs font-bold text-amber-600 mt-2 inline-block">Requires fulfillment</span>
                                    : <span className="text-xs font-bold text-slate-400 mt-2 inline-block">All caught up</span>
                                }
                            </div>
                        </div>
                    </div>

                    {/* Low Stock Alerts */}
                    <div className="bg-white backdrop-blur-3xl border border-slate-200 p-7 rounded-[2rem] shadow-2xl hover:bg-slate-50 transition-all relative overflow-hidden group flex flex-col justify-between">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-rose-500/20 to-transparent opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700 pointer-events-none rounded-[3rem]"></div>
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3.5 rounded-2xl bg-slate-50 shadow-inner border border-slate-100">
                                    <span className="material-symbols-outlined text-[28px] text-rose-500">inventory_2</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1.5">Low Stock</p>
                                <h3 className="text-4xl font-black text-slate-900 tracking-tight">
                                    {kpis?.lowStock?.value?.toLocaleString() || '0'}
                                </h3>
                                {kpis?.lowStock?.value > 0
                                    ? <span className="text-xs font-bold text-rose-600 mt-2 inline-block">Action recommended</span>
                                    : <span className="text-xs font-bold text-slate-400 mt-2 inline-block">Stock healthy</span>
                                }
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-[#1111d4] text-white p-7 rounded-[2rem] shadow-2xl shadow-[#1111d4]/20 relative overflow-hidden group flex flex-col justify-between h-full">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full opacity-50 blur-xl"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md">
                                    <span className="material-symbols-outlined text-[28px] text-white">rocket_launch</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-4">Quick Actions</p>
                                <div className="flex flex-col gap-2.5">
                                    <Link to="/store-editor" className="flex items-center gap-3 text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2.5 rounded-xl transition-all w-full">
                                        <span className="material-symbols-outlined text-[18px]">storefront</span>
                                        Edit Storefront
                                    </Link>
                                    <Link to="/owner/products" className="flex items-center gap-3 text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2.5 rounded-xl transition-all w-full">
                                        <span className="material-symbols-outlined text-[18px]">inventory</span>
                                        Manage Products
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Interaction Area */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[450px]">
                    <RecentOrdersList />
                    <LowStockWidget />
                </div>
            </div>

        </OwnerLayout>
    );
};

export default OwnerDashboard;
