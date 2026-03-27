import React from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import AdminHeader from '../../components/AdminHeader';

const SystemHealth = () => {
    const sidebarItems = [
        { label: 'Platform Overview', icon: 'dashboard', path: '/admin-dashboard' },
        { label: 'Business Directory', icon: 'storefront', path: '/admin/businesses' },
        { label: 'User Directory', icon: 'group', path: '/admin/users' },
        { label: 'System Health', icon: 'monitor_heart', path: '/admin/system-health' }, 
        { label: 'Audit Logs', icon: 'history', path: '/admin/audit-logs' }, 
    ];

    const metrics = [
        { label: 'API Status', value: 'Operational', highlight: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: 'dns' },
        { label: 'Database Routing', value: 'Primary', highlight: 'bg-indigo-50 text-indigo-600 border-indigo-200', icon: 'database' },
        { label: 'Avg Latency', value: '38ms', highlight: 'bg-blue-50 text-blue-600 border-blue-200', icon: 'speed' },
        { label: 'Memory Usage', value: '42%', highlight: 'bg-slate-50 text-slate-600 border-slate-200', icon: 'memory' }
    ];

    return (
        <DashboardLayout 
            role="Administrator" 
            headerTitle="System Health Monitoring"
            sidebarItems={sidebarItems}
            TopHeader={AdminHeader}
        >
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in py-4">
                
                {/* Hero */}
                <div className="bg-emerald-900 p-8 md:p-12 rounded-[32px] overflow-hidden relative text-white border border-emerald-800 shadow-xl">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-400/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
                    
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 bg-emerald-800/50 border border-emerald-400/30 px-3 py-1.5 rounded-full mb-6">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span className="text-xs font-black tracking-widest uppercase text-emerald-100">All Systems Normal</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">System Health</h1>
                        <p className="text-emerald-100/80 max-w-lg text-lg">Real-time infrastructure performance, load balancing metrics, and automated cluster monitoring.</p>
                    </div>
                </div>

                {/* Core Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {metrics.map((m, i) => (
                        <div key={i} className={`p-6 rounded-3xl border ${m.highlight}`}>
                            <span className="material-symbols-outlined mb-4 block text-2xl opacity-80">{m.icon}</span>
                            <div className="text-xs font-black uppercase tracking-widest opacity-60 mb-1">{m.label}</div>
                            <div className="text-2xl font-black">{m.value}</div>
                        </div>
                    ))}
                </div>

                {/* Incidents Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                        <h3 className="font-black text-xl mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-emerald-500">task_alt</span>
                            Recent Automated Checks
                        </h3>
                        <div className="space-y-4">
                            {[
                                { t: 'Cache Nodes Synchronized', s: 'Success', d: '2 hours ago' },
                                { t: 'Database Scheduled Backup', s: 'Success', d: '14 hours ago' },
                                { t: 'WebSocket Tunnel Reconnected', s: 'Resolved', d: 'Yesterday' }
                            ].map((job, i) => (
                                <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-900">{job.t}</h4>
                                        <p className="text-xs font-bold text-slate-400 mt-1">{job.d}</p>
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${
                                        job.s === 'Success' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                                    }`}>{job.s}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                        <h3 className="font-black text-xl mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-rose-500">gpp_maybe</span>
                            Security Advisories (Zero)
                        </h3>
                        <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-emerald-100 rounded-2xl bg-emerald-50/50">
                            <span className="material-symbols-outlined text-4xl text-emerald-300 mb-2">shield_locked</span>
                            <h4 className="font-black text-emerald-700">No active threats detected</h4>
                            <p className="text-sm font-medium text-emerald-600/70 mt-1 max-w-[250px]">Firewall rules and rate-limiting modules are aggressively blocking malicious traffic.</p>
                        </div>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
};

export default SystemHealth;
