import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import AdminHeader from '../../components/AdminHeader';

const AuditLogs = () => {
    const { user: currentAdmin } = useAuth();
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error("No token");
                const config = { headers: { Authorization: `Bearer ${token}` } };

                // Fetch real audit logs from the new backend endpoint
                const response = await axios.get('http://localhost:5000/api/admin/audit-logs', config);

                const logs = (response.data || []).map(l => ({
                    ...l,
                    time: new Date(l.time) // Re-hydrate Date object
                }));

                setAuditLogs(logs);
            } catch (error) {
                console.error('Failed to fetch audit records:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [currentAdmin]);

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

    const filtered = auditLogs.filter(log => {
        const matchesSearch = log.target.toLowerCase().includes(searchTerm.toLowerCase()) || log.action.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    return (
        <DashboardLayout role="Administrator"
            headerTitle="Security & Activity Logs"
            sidebarItems={sidebarItems}
            TopHeader={AdminHeader}
            loading={loading}

            showSearch={false}>
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in py-4">
                {/* Header Profile */}
                <div className="relative overflow-hidden bg-slate-900 rounded-[32px] p-8 md:p-12 text-white shadow-xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-indigo-400">policy</span>
                                <span className="text-xs font-black uppercase tracking-widest text-indigo-300">System Trace</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black mb-2">Audit Logs</h1>
                            <p className="text-slate-400 max-w-lg leading-relaxed">Immutable ledger of platform activities, role provisioning, and critical state changes across the network.</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center px-8">
                            <span className="text-3xl font-black">{auditLogs.length}</span>
                            <span className="block text-[10px] uppercase font-bold text-slate-400 mt-1">Total Records</span>
                        </div>
                    </div>
                </div>

                {/* Filter */}
                <div className="bg-white p-2 rounded-2xl border border-slate-200">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            placeholder="Search logs by action or target..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border-transparent rounded-xl py-3 pl-12 pr-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 outline-none"
                        />
                    </div>
                </div>

                {/* Log Stream */}
                <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-4 md:p-8">
                    <div className="relative">
                        {/* Vertical timeline line */}
                        <div className="absolute left-6 top-4 bottom-4 w-px bg-slate-100 hidden sm:block"></div>

                        <div className="space-y-6 relative">
                            {filtered.length > 0 ? filtered.map((log) => (
                                <div key={log.id} className="flex gap-6 group">
                                    {/* Timeline dot */}
                                    <div className="hidden sm:flex flex-col items-center shrink-0 w-12 pt-1">
                                        <div className="w-10 h-10 rounded-full bg-slate-50 border-2 border-slate-200 flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-200 group-hover:text-indigo-600 transition-colors z-10">
                                            <span className="material-symbols-outlined text-sm">{log.icon}</span>
                                        </div>
                                    </div>

                                    {/* Log Content */}
                                    <div className="flex-1 bg-slate-50 group-hover:bg-indigo-50/30 rounded-2xl p-4 md:p-6 border border-slate-100 transition-colors">
                                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded text-[10px] uppercase tracking-widest font-black ${log.type === 'STORE' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                                                    }`}>{log.type}</span>
                                                <h4 className="font-black text-slate-900 text-sm">{log.action}</h4>
                                            </div>
                                            <time className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">schedule</span>
                                                {log.time.toLocaleDateString()} {log.time.toLocaleTimeString()}
                                            </time>
                                        </div>
                                        <p className="text-sm font-medium text-slate-600">
                                            Target Identity: <span className="font-bold text-slate-900">{log.target}</span>
                                        </p>
                                        <div className="mt-3 text-xs font-bold text-slate-400 flex items-center gap-2">
                                            <span>Authored by <span className="text-slate-600">{log.admin}</span></span>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-20">
                                    <span className="material-symbols-outlined text-5xl text-slate-200 block mb-2">find_in_page</span>
                                    <h3 className="font-black text-slate-900">No logs match</h3>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
};

export default AuditLogs;
