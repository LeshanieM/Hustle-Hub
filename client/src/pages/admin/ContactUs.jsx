import React, { useState } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import AdminHeader from '../../components/AdminHeader';
import { useAuth } from '../../context/AuthContext';
import Footer from '../../components/Footer';

const ContactUs = () => {
    const { user } = useAuth();
    const [platformInquiries, setPlatformInquiries] = useState([
        { id: 1001, admin: "James Wilson", email: "james@student.edu", subject: "Billing Dispute", date: "Oct 24, 2023", priority: "High", handled: false },
        { id: 1002, admin: "Elena Gilbert", email: "elena@student.edu", subject: "Account Access", date: "Oct 23, 2023", priority: "Medium", handled: true, action: "Account verified after ID re-submission." },
        { id: 1003, admin: "Damon Salvatore", email: "damon@student.edu", subject: "Security Anomaly", date: "Oct 22, 2023", priority: "Critical", handled: false }
    ]);
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [replyAction, setReplyAction] = useState('');

    const handleAction = (e) => {
        e.preventDefault();
        setPlatformInquiries(platformInquiries.map(inq => 
            inq.id === selectedInquiry.id ? { ...inq, handled: true, action: replyAction } : inq
        ));
        setSelectedInquiry(null);
        setReplyAction('');
    };

    const sidebarItems = [
        { label: 'Platform Overview', icon: 'dashboard', path: '/admin-dashboard' },
        { label: 'Business Directory', icon: 'storefront', path: '/admin/businesses' },
        { label: 'User Directory', icon: 'group', path: '/admin/users' },
        { label: 'AI Forecasting & Insights', icon: 'auto_graph', path: '/admin/ai-insights' },
        { label: 'Audit Logs', icon: 'history', path: '/admin/audit-logs' },
    ];

    return (
        <DashboardLayout 
            role="Administrator" 
            headerTitle="Administrative Console"
            sidebarItems={sidebarItems}
            TopHeader={AdminHeader}
        >
            <div className="max-w-6xl mx-auto py-8 px-4 font-inter" style={{ fontFamily: "'Inter', sans-serif" }}>
                {/* Minimal Header */}
                <div className="mb-12 border-b border-slate-100 pb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[#051094] mb-2 tracking-tight">Support Intelligence</h1>
                        <p className="text-slate-500 text-sm">Review platform-level incidents, billing disputes, and security reports.</p>
                    </div>
                    <div className="flex gap-4">
                         <div className="px-4 py-2 bg-[#051094]/5 rounded-lg border border-[#051094]/10">
                             <p className="text-[10px] font-black uppercase text-[#051094]/60 mb-0.5">Active Tickets</p>
                             <p className="text-sm font-black text-[#051094]">12</p>
                         </div>
                         <div className="px-4 py-2 bg-[#ff4444]/5 rounded-lg border border-[#ff4444]/10">
                             <p className="text-[10px] font-black uppercase text-[#ff4444]/60 mb-0.5">Critical Incidents</p>
                             <p className="text-sm font-black text-[#ff4444]">2</p>
                         </div>
                    </div>
                </div>

                {/* Minimal Table: Platform Support Inbox */}
                <div className="space-y-6">
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Platform Support Inbox</h2>
                    <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-sm bg-white">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Incident ID</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Admin User</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Module / Domain</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Date</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Priority</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Resolution</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {platformInquiries.map(inq => (
                                    <tr key={inq.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-[11px] font-mono font-bold text-slate-400 tracking-tighter">#INC-{inq.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center font-bold text-xs text-white">
                                                    {inq.admin.charAt(0)}
                                                </div>
                                                <div className="text-sm font-bold text-slate-900">{inq.admin}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-600 truncate max-w-xs">{inq.subject}</td>
                                        <td className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-tighter">{inq.date}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${
                                                inq.priority === 'Critical' ? 'bg-red-50 text-red-600 font-bold border border-red-100' :
                                                inq.priority === 'High' ? 'bg-orange-50 text-orange-600' :
                                                inq.priority === 'Medium' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {inq.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {inq.handled ? (
                                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center justify-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">verified</span>
                                                    Resolved
                                                </span>
                                            ) : (
                                                <button 
                                                    onClick={() => setSelectedInquiry(inq)}
                                                    className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-black transition-all"
                                                >
                                                    Audit / Resolve
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Administrative Stats Callout */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                     <div className="p-6 border border-slate-200 rounded-2xl bg-white shadow-sm flex items-start gap-5">
                          <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shrink-0 border border-slate-800">
                             <span className="material-symbols-outlined text-2xl">sensors</span>
                          </div>
                          <div>
                              <h4 className="text-sm font-bold text-slate-900 mb-1">Live Telemetry</h4>
                              <p className="text-xs text-slate-500 leading-relaxed">System latency: 45ms. Server load: 32%. Active admins: 4.</p>
                          </div>
                     </div>
                     <div className="p-6 border border-slate-200 rounded-2xl bg-white shadow-sm flex items-start gap-5">
                          <div className="w-12 h-12 bg-slate-50 text-[#051094] rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
                             <span className="material-symbols-outlined text-2xl">shield_person</span>
                          </div>
                          <div>
                              <h4 className="text-sm font-bold text-slate-900 mb-1">Incident Protocols</h4>
                              <p className="text-xs text-slate-500 leading-relaxed">View the standard escalation bridge for engineering-level critical incidents.</p>
                          </div>
                     </div>
                     <div className="p-6 border border-slate-200 rounded-2xl bg-white shadow-sm flex items-start gap-5 underline-offset-4 cursor-pointer hover:bg-slate-50 transition-all">
                          <div>
                              <h4 className="text-sm font-bold text-[#051094] mb-1">Architecture Docs &rarr;</h4>
                              <p className="text-xs text-slate-500 leading-relaxed">Platform technical reference.</p>
                          </div>
                     </div>
                </div>

                {/* Resolution Modal */}
                {selectedInquiry && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0a0a0f]/80 backdrop-blur-md">
                        <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-8 relative animate-in slide-in-from-bottom-5 duration-300">
                            <button 
                                onClick={() => setSelectedInquiry(null)}
                                className="absolute top-6 right-6 text-slate-300 hover:text-slate-900 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                            
                            <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px] text-[#051094]">settings_suggest</span>
                                Administrative Review: {selectedInquiry.admin}
                            </h3>
                            <p className="text-xs text-slate-400 mb-6 font-bold uppercase tracking-widest">Incident #INC-{selectedInquiry.id} • Priority: {selectedInquiry.priority}</p>
                            
                            <form onSubmit={handleAction} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Resolution Protocol</label>
                                    <textarea 
                                        required
                                        rows="5"
                                        placeholder="Type administrative action taken to resolve this incident..."
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:border-[#051094] outline-none resize-none placeholder:text-slate-300"
                                        value={replyAction}
                                        onChange={(e) => setReplyAction(e.target.value)}
                                    ></textarea>
                                </div>
                                <button 
                                    type="submit"
                                    className="w-full py-4 bg-slate-900 text-white rounded-lg text-sm font-black uppercase tracking-widest shadow-md hover:bg-black active:scale-[0.98] transition-all"
                                >
                                    Log & Finalize Incident
                                </button>
                            </form>
                        </div>
                    </div>
                )}
                <Footer />
            </div>
        </DashboardLayout>
    );
};

export default ContactUs;
