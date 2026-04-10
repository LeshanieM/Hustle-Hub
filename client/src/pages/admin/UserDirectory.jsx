import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import AdminHeader from '../../components/AdminHeader';

const UserDirectory = () => {
    const { user: currentAdmin } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                const res = await axios.get('http://localhost:5000/api/admin/users', config);
                if (res.data) setUsers(res.data);
            } catch (error) {
                console.error('Failed to fetch users:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [currentAdmin]);

    const sidebarItems = [
        { label: 'Platform Overview', icon: 'dashboard', path: '/admin-dashboard' },
        { label: 'Products Management', icon: 'shopping_bag', path: '/admin/products' },
        { label: 'Order Management', icon: 'receipt_long', path: '/admin/orders' },
        { label: 'Business Directory', icon: 'storefront', path: '/admin/businesses' },
        { label: 'User Directory', icon: 'group', path: '/admin/users' },
        { label: 'FAQ Management', icon: 'quiz', path: '/admin/faqs' },
        { label: 'Reports', icon: 'analytics', path: '/admin/reports' },
        { label: 'AI Forecasting & Insights', icon: 'auto_graph', path: '/admin/ai-insights' },
        { label: 'Audit Logs', icon: 'history', path: '/admin/audit-logs' },
    ];

    const filtered = users.filter(u => {
        const matchesSearch =
            (u.firstName + ' ' + u.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.studentEmail.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const getInitials = (f, l) => `${f?.charAt(0) || ''}${l?.charAt(0) || ''}`.toUpperCase();

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#1111d4] border-t-transparent rounded-full animate-spin"></div>
                <p className="font-bold text-slate-400 tracking-wider uppercase text-xs">Loading Users...</p>
            </div>
        </div>
    );

    return (
        <DashboardLayout role="Administrator"
            headerTitle="User Directory"
            sidebarItems={sidebarItems}
            TopHeader={AdminHeader}

            showSearch={false}>
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Modern Hero Header */}
                <div className="relative overflow-hidden bg-slate-900 rounded-[32px] p-8 md:p-12 text-white shadow-xl shadow-slate-900/10">
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#1111d4]/40 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="max-w-xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white">group</span>
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest text-slate-300">Identity Management</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
                                User Directory
                            </h1>
                            <p className="text-slate-400 text-lg font-medium leading-relaxed">
                                View and manage all platform accounts including customers, business owners, and administrators.
                            </p>
                        </div>

                        {/* Contextual Stats Glass Card */}
                        <div className="flex flex-wrap md:flex-nowrap gap-3 bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-3xl w-full md:w-auto">
                            {[
                                { label: 'Total', count: users.length, color: 'text-white' },
                                { label: 'Customers', count: users.filter(u => u.role === 'CUSTOMER').length, color: 'text-slate-300' },
                                { label: 'Owners', count: users.filter(u => u.role === 'OWNER').length, color: 'text-blue-400' },
                                { label: 'Admins', count: users.filter(u => u.role === 'ADMIN').length, color: 'text-purple-400' }
                            ].map(s => (
                                <div key={s.label} className="flex-1 min-w-[80px] text-center px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
                                    <div className={`text-2xl font-black ${s.color}`}>{s.count}</div>
                                    <div className="text-[9px] uppercase tracking-widest font-bold text-slate-400 mt-1">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="relative w-full sm:w-96">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                        <input
                            type="text"
                            placeholder="Find by name, username, or email..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border-transparent rounded-xl py-3 pl-11 pr-4 text-sm font-bold text-slate-700 focus:bg-white focus:border-[#1111d4]/30 focus:ring-4 focus:ring-[#1111d4]/10 transition-all outline-none"
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                        {['ALL', 'CUSTOMER', 'OWNER', 'ADMIN'].map(role => (
                            <button
                                key={role}
                                onClick={() => setRoleFilter(role)}
                                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap border ${roleFilter === role
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-800 border-dashed'
                                    }`}
                            >
                                {role === 'ALL' ? 'All Roles' : role}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Ultimate Data List Layout */}
                <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                    {/* Header Row */}
                    <div className="grid grid-cols-12 gap-4 px-8 py-5 bg-slate-50/80 border-b border-slate-200 text-xs font-black text-slate-400 uppercase tracking-widest">
                        <div className="col-span-5 md:col-span-4">User Profile</div>
                        <div className="hidden md:block col-span-3">Contact Email</div>
                        <div className="col-span-3 md:col-span-2 text-center">System Role</div>
                        <div className="col-span-4 md:col-span-3 text-right">Account Status</div>
                    </div>

                    {/* Data Rows */}
                    <div className="divide-y divide-slate-100">
                        {filtered.length > 0 ? filtered.map(user => (
                            <div key={user._id} className="grid grid-cols-12 gap-4 px-8 py-5 items-center hover:bg-slate-50/50 transition-colors group cursor-default">
                                {/* Profile */}
                                <div className="col-span-5 md:col-span-4 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-50 border border-slate-200 flex items-center justify-center shrink-0 group-hover:border-[#1111d4]/30 transition-colors shadow-inner">
                                        <span className="font-black text-[#1111d4]">{getInitials(user.firstName, user.lastName)}</span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-black text-slate-900 text-sm truncate">{user.firstName} {user.lastName}</p>
                                        <p className="text-xs font-bold text-slate-400 truncate mt-0.5">@{user.username}</p>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="hidden md:block col-span-3">
                                    <p className="text-sm font-medium text-slate-600 truncate">{user.studentEmail}</p>
                                </div>

                                {/* Role */}
                                <div className="col-span-3 md:col-span-2 flex justify-center">
                                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${user.role === 'ADMIN' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                                            user.role === 'OWNER' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                                'bg-slate-100 text-slate-600 border border-slate-200'
                                        }`}>
                                        <span className="material-symbols-outlined text-[14px]">
                                            {user.role === 'ADMIN' ? 'shield_person' : user.role === 'OWNER' ? 'storefront' : 'person'}
                                        </span>
                                        {user.role}
                                    </span>
                                </div>

                                {/* Status */}
                                <div className="col-span-4 md:col-span-3 flex justify-end items-center gap-2">
                                    {user.isVerified ? (
                                        <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 text-emerald-600">
                                            <span className="material-symbols-outlined text-[14px]">verified</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Verified</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100 text-amber-600">
                                            <span className="material-symbols-outlined text-[14px]">pending</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Pending</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <div className="py-24 text-center">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                    <span className="material-symbols-outlined text-4xl text-slate-300">search_off</span>
                                </div>
                                <h3 className="text-lg font-black text-slate-900 mb-1">No users found</h3>
                                <p className="text-sm font-medium text-slate-500">Try adjusting your search criteria and filters.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
};

export default UserDirectory;
