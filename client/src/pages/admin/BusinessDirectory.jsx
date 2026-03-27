import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import AdminHeader from '../../components/AdminHeader';

const BusinessDirectory = () => {
    const { user } = useAuth();
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    useEffect(() => {
        const fetchBusinesses = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                const res = await axios.get('http://localhost:5000/api/admin/stores', config);
                if (res.data) setBusinesses(res.data);
            } catch (error) {
                console.error('Failed to fetch businesses:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBusinesses();
    }, [user]);

    const toggleStatus = async (id, currentStatus) => {
        const newStatusMap = {
            'ACTIVE': 'SUSPENDED',
            'SUSPENDED': 'ACTIVE',
            'PENDING_APPROVAL': 'ACTIVE'
        };
        const newStatus = newStatusMap[currentStatus] || 'ACTIVE';
        
        if (!window.confirm(`Change business status to ${newStatus}?`)) return;
        
        try {
            const token = localStorage.getItem('token');
            if (token) {
                await axios.put(`http://localhost:5000/api/admin/stores/${id}/status`, { status: newStatus }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setBusinesses(prev => prev.map(b => b._id === id ? { ...b, status: newStatus } : b));
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update store status.');
        }
    };

    const sidebarItems = [
        { label: 'Platform Overview', icon: 'dashboard', path: '/admin-dashboard' },
        { label: 'Business Directory', icon: 'storefront', path: '/admin/businesses' },
        { label: 'User Directory', icon: 'group', path: '/admin/users' },
        { label: 'System Health', icon: 'monitor_heart', path: '/admin/system-health' }, 
        { label: 'Audit Logs', icon: 'history', path: '/admin/audit-logs' }, 
    ];

    const filtered = businesses.filter(b => {
        const matchesSearch = b.storeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (b.ownerId?.firstName + ' ' + b.ownerId?.lastName).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'ALL' || b.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#1111d4] border-t-transparent rounded-full animate-spin"></div>
                <p className="font-bold text-slate-400 tracking-wider uppercase text-xs">Loading Directory...</p>
            </div>
        </div>
    );

    return (
        <DashboardLayout 
            role="Administrator" 
            headerTitle="Business Directory"
            sidebarItems={sidebarItems}
            TopHeader={AdminHeader}
        >
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header section with elegant glassmorphism */}
                <div className="relative overflow-hidden bg-slate-900 rounded-[32px] p-8 md:p-12 text-white shadow-2xl border border-slate-800">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-fuchsia-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 mix-blend-screen animate-pulse duration-[4000ms]"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 mix-blend-screen"></div>
                    <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div>
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-xl rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-white/10 text-slate-300">
                                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                                Global Store Network
                            </span>
                            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
                                Business Directory
                            </h1>
                            <p className="text-slate-400 max-w-xl text-lg font-medium leading-relaxed">
                                Manage, verify, and monitor the verified merchants actively operating within the Hustle-Hub ecosystem.
                            </p>
                        </div>
                        
                        {/* Summary Stats */}
                        <div className="flex gap-4 p-5 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-inner shadow-white/5 mx-auto md:mx-0">
                            <div className="text-center px-6 border-r border-white/10">
                                <div className="text-4xl font-black text-white">{businesses.length}</div>
                                <div className="text-[9px] uppercase tracking-widest font-black text-slate-400 mt-2">Total Stores</div>
                            </div>
                            <div className="text-center px-6">
                                <div className="text-4xl font-black text-cyan-400">{businesses.filter(b => b.status === 'ACTIVE').length}</div>
                                <div className="text-[9px] uppercase tracking-widest font-black text-slate-400 mt-2">Active</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm z-20 relative">
                    <div className="relative w-full sm:w-96">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input 
                            type="text" 
                            placeholder="Search by store or owner name..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-[#1111d4]/50 outline-none transition-all"
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                        {['ALL', 'ACTIVE', 'PENDING_APPROVAL', 'SUSPENDED'].map(status => (
                            <button 
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap border ${
                                    filterStatus === status 
                                    ? 'bg-[#1111d4] text-white border-[#1111d4] shadow-md shadow-[#1111d4]/20' 
                                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                {status.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Unified Business Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-4">
                    {filtered.map(biz => (
                        <div key={biz._id} className="group relative bg-white rounded-[28px] border border-slate-100 p-6 shadow-sm hover:shadow-2xl hover:shadow-[#1111d4]/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                            {/* Decorative background circle */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700 ease-out z-0"></div>
                            
                            <div className="relative z-10">
                                {/* Header / Banner Area */}
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-slate-100 flex items-center justify-center overflow-hidden shadow-inner shrink-0 group-hover:border-[#1111d4]/20 transition-colors">
                                            {biz.logoUrl ? (
                                                <img src={biz.logoUrl} alt={biz.storeName} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-2xl font-black text-[#1111d4]/50">{biz.storeName.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 text-lg leading-tight line-clamp-1 group-hover:text-[#1111d4] transition-colors">{biz.storeName}</h3>
                                            <p className="text-xs font-bold text-slate-400 mt-1 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">person</span>
                                                {biz.ownerId?.firstName} {biz.ownerId?.lastName}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* Status Pill */}
                                    <div className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shrink-0 shadow-sm border ${
                                        biz.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                        biz.status === 'PENDING_APPROVAL' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                        'bg-rose-50 text-rose-600 border-rose-100'
                                    }`}>
                                        {biz.status?.replace('_', ' ')}
                                    </div>
                                </div>

                                {/* Body / Stats Layout */}
                                <div className="bg-slate-50/50 rounded-2xl p-4 mb-6 border border-slate-100/50">
                                    <p className="text-xs font-medium text-slate-500 line-clamp-2 leading-relaxed h-10 mb-4">
                                        {biz.description || "No description provided for this store yet."}
                                    </p>
                                    <div className="flex items-center gap-6 pt-4 border-t border-slate-200/50">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Theme</p>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-4 h-4 rounded-md shadow-inner" style={{ backgroundColor: biz.themeSettings?.primaryColor || '#1111d4' }}></div>
                                                <span className="text-xs font-bold text-slate-700">{biz.themeSettings?.primaryColor || '#1111d4'}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Joined</p>
                                            <p className="text-xs font-bold text-slate-700">{new Date(biz.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action bar */}
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => toggleStatus(biz._id, biz.status)}
                                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
                                            biz.status === 'ACTIVE' 
                                            ? 'bg-white border border-rose-200 text-rose-500 hover:bg-rose-500 hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-rose-500/20' 
                                            : 'bg-[#1111d4] text-white hover:bg-indigo-700 hover:shadow-lg hover:shadow-[#1111d4]/30'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-sm">
                                            {biz.status === 'ACTIVE' ? 'block' : 'check_circle'}
                                        </span>
                                        {biz.status === 'ACTIVE' ? 'Suspend' : 'Approve'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filtered.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                            <span className="material-symbols-outlined text-5xl text-slate-200 mb-4 block">store_off</span>
                            <h3 className="text-lg font-black text-slate-900 mb-2">No businesses found</h3>
                            <p className="text-slate-500 font-medium text-sm">Adjust your filters or search query to find what you're looking for.</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default BusinessDirectory;
