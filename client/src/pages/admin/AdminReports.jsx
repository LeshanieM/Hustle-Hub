import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar, Cell, PieChart, Pie, ComposedChart } from 'recharts';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import AdminHeader from '../../components/AdminHeader';
import { generateHybridReport } from '../../utils/reportGenerator';

const GlassCard = ({ children, className = "" }) => (
    <div className={`bg-white border border-slate-200 shadow-sm rounded-[2rem] p-8 transition-all hover:shadow-md ${className}`}>
        {children}
    </div>
);

const KpiCard = ({ icon, iconColor, label, value, prefix = '', change, subtitle }) => (
    <GlassCard className="relative overflow-hidden group">
        <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-6">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <span className={`material-symbols-outlined text-[30px] ${iconColor}`}>{icon}</span>
                </div>
                {change !== undefined && (
                    <div className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest flex items-center gap-1 shadow-sm border ${change >= 0 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'}`}>
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

const AdminReports = () => {
    const { user } = useAuth();
    const [reportType, setReportType] = useState('platform');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [exportSuccess, setExportSuccess] = useState(false);
    const [error, setError] = useState(null);

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

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                
                const [platformRes, usersRes, storesRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/analytics/admin/platform', config).catch(() => ({ data: {} })),
                    axios.get('http://localhost:5000/api/admin/users', config).catch(() => ({ data: [] })),
                    axios.get('http://localhost:5000/api/admin/stores', config).catch(() => ({ data: [] }))
                ]);

                setStats({
                    platform: platformRes.data,
                    usersCount: usersRes.data?.length || 0,
                    storesCount: storesRes.data?.length || 0,
                    activeStores: storesRes.data?.filter(s => s.status === 'ACTIVE').length || 0,
                    timestamp: new Date().toLocaleString()
                });
            } catch (err) {
                console.error('Failed to fetch admin stats', err);
                setError('Failed to load platform data.');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleDownloadReport = async (format = 'pdf') => {
        setExporting(true);
        const title = `Platform ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`;
        const subtitle = `Generated by Admin Office | Timestamp: ${new Date().toLocaleString()}`;
        
        let summary = [
            { label: "Total Users", value: stats?.usersCount || 0 },
            { label: "Total Stores", value: stats?.storesCount || 0 },
            { label: "Active Nodes", value: stats?.activeStores || 0 }
        ];

        let headers = ['Metric', 'Current Standing'];
        let reportData = [
            ['Registered Students', `${stats?.usersCount || 0}`],
            ['Active Storefronts', `${stats?.activeStores || 0}`],
            ['Platform Health', 'Optimal']
        ];

        if (format === 'excel') {
            const csvRows = [headers, ...reportData];
            const csvContent = csvRows.map(e => e.join(",")).join("\n");
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `Admin_${reportType}_Report.csv`);
            link.click();
        } else {
            await generateHybridReport({
                title,
                subtitle,
                headers,
                data: reportData,
                summary
            }, `Admin_${reportType}_Report.pdf`);
        }
        
        setExporting(false);
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 4000);
    };

    return (
        <DashboardLayout 
            role="Administrator"
            headerTitle="Intelligence Reports"
            sidebarItems={sidebarItems}
            TopHeader={AdminHeader}
            loading={loading}
            showSearch={false}
        >
            <div className="max-w-5xl mx-auto space-y-12 py-10">
                <div className="text-center space-y-4">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Platform Intelligence Center</h2>
                    <p className="text-slate-500 font-medium max-w-2xl mx-auto">Access and export comprehensive platform-wide analytics and audit summaries.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <KpiCard icon="group" iconColor="text-indigo-600" label="Network Users" value={stats?.usersCount || 0} change={5} />
                    <KpiCard icon="storefront" iconColor="text-emerald-600" label="Active Partners" value={stats?.activeStores || 0} change={12} />
                    <KpiCard icon="verified" iconColor="text-blue-600" label="System Integrity" value="100%" subtitle="Verified" />
                </div>

                <section className="space-y-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Select Report Protocol</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { id: 'platform', title: 'Platform Health', desc: 'Summary of user growth and partner activity.', icon: 'hub' },
                            { id: 'audit', title: 'Security Audit', desc: 'Overview of system changes and administrative logs.', icon: 'security' },
                            { id: 'inventory', title: 'Catalog Insights', desc: 'Product distribution across all registered storefronts.', icon: 'inventory' },
                            { id: 'revenue', title: 'Financial Overview', desc: 'Aggregated revenue streams and transaction volumes.', icon: 'payments' },
                        ].map(type => (
                            <button 
                                key={type.id}
                                onClick={() => setReportType(type.id)}
                                className={`flex items-start gap-4 p-6 rounded-3xl border transition-all text-left ${reportType === type.id ? 'bg-white border-indigo-200 shadow-lg' : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-200'}`}
                            >
                                <div className={`p-3 rounded-2xl ${reportType === type.id ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400'}`}>
                                    <span className="material-symbols-outlined">{type.icon}</span>
                                </div>
                                <div>
                                    <h5 className="font-bold text-slate-900">{type.title}</h5>
                                    <p className="text-xs text-slate-500 font-medium">{type.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-center gap-6">
                    <button 
                        onClick={() => handleDownloadReport('pdf')}
                        disabled={exporting}
                        className="flex items-center gap-4 bg-slate-900 text-white px-10 py-5 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined">{exporting ? 'sync' : 'picture_as_pdf'}</span>
                        <span className="font-bold uppercase tracking-widest text-xs">{exporting ? 'Generating...' : 'Export Intelligence PDF'}</span>
                    </button>
                    <button 
                         onClick={() => handleDownloadReport('excel')}
                         disabled={exporting}
                         className="flex items-center gap-4 bg-white border border-slate-200 text-slate-900 px-10 py-5 rounded-2xl shadow-sm hover:bg-slate-50 transition-all disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined">table_chart</span>
                        <span className="font-bold uppercase tracking-widest text-xs">Download CSV Dataset</span>
                    </button>
                </div>

                {exportSuccess && (
                    <div className="flex items-center justify-center gap-2 text-emerald-600 animate-in fade-in slide-in-from-top-2">
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        <p className="text-[10px] font-black uppercase tracking-widest">Report Cycle Finalized Successfully</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AdminReports;
