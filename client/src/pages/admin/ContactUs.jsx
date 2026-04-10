import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import AdminHeader from '../../components/AdminHeader';
import { useAuth } from '../../context/AuthContext';
import Footer from '../../components/Footer';
import api from '../../api/axios';

const ContactUs = () => {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [replyAction, setReplyAction] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const { data } = await api.get('/support/all-tickets');
                if (data.success) {
                    setTickets(data.tickets);
                }
            } catch (err) {
                console.error("Error fetching tickets:", err);
            }
        };
        fetchTickets();
    }, []);

    const handleAction = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.patch(`/support/${selectedTicket._id}/admin-resolve`, { reply: replyAction });
            if (data.success) {
                setTickets(tickets.map(t =>
                    t._id === selectedTicket._id ? { ...t, status: 'Resolved', reply: replyAction } : t
                ));
                setSelectedTicket(null);
                setReplyAction('');
            }
        } catch (err) {
            console.error("Error resolving ticket:", err);
            alert("Failed to resolve ticket");
        }
    };

    const filteredTickets = tickets.filter(t =>
        t.targetStore && t.targetStore.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    return (
        <DashboardLayout
            role="Administrator"
            headerTitle="Administrative Console"
            sidebarItems={sidebarItems}
            TopHeader={AdminHeader}
            showSearch={false}
        >
            <div className="max-w-6xl mx-auto py-8 px-4 font-inter flex flex-col min-h-[calc(100vh-100px)] w-full" style={{ fontFamily: "'Inter', sans-serif" }}>
                {/* Minimal Header */}
                <div className="mb-12 border-b border-slate-100 pb-8 space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-[#051094] mb-2 tracking-tight">Support Intelligence</h1>
                        <p className="text-slate-500 text-sm">Review all customer inquiries and direct support requests globally across the platform.</p>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <div className="flex gap-4">
                            <div className="px-5 py-3 bg-[#051094]/5 rounded-xl border border-[#051094]/10">
                                <p className="text-[10px] font-black uppercase text-[#051094]/60 mb-0.5 tracking-wider">Active Tickets</p>
                                <p className="text-2xl font-black text-[#051094] leading-none">{tickets.filter(t => t.status !== 'Resolved').length}</p>
                            </div>
                            <div className="px-5 py-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                <p className="text-[10px] font-black uppercase text-emerald-600/60 mb-0.5 tracking-wider">Resolved Tickets</p>
                                <p className="text-2xl font-black text-emerald-600 leading-none">{tickets.filter(t => t.status === 'Resolved').length}</p>
                            </div>
                        </div>

                        <div className="relative w-full md:w-96">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input
                                type="text"
                                placeholder="Search by Store Name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:border-[#051094] outline-none shadow-sm transition-all"
                            />
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
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Ticket ID</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Customer</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Target Store</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Subject</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Date</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredTickets.map(t => (
                                    <tr key={t._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-[11px] font-mono font-bold text-slate-400 tracking-tighter">#{t._id.slice(-6)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="text-sm font-bold text-slate-900">{t.sender ? `${t.sender.firstName} ${t.sender.lastName}` : 'Unknown'}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-slate-900">{t.targetStore}</td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-600 truncate max-w-xs">{t.subject}</td>
                                        <td className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-tighter">{new Date(t.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-center">
                                            {t.status === 'Resolved' ? (
                                                <button
                                                    onClick={() => setSelectedTicket(t)}
                                                    className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center justify-center gap-1 w-full hover:bg-emerald-100 active:scale-[0.98] transition-all bg-emerald-50 rounded-lg px-2 py-1"
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">visibility</span>
                                                    View Resolved
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setSelectedTicket(t)}
                                                    className="px-4 py-1.5 bg-[#051094] text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm hover:brightness-110 transition-all w-full"
                                                >
                                                    Audit / Resolve
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filteredTickets.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-slate-400 text-[13px]">
                                            No inquiries found matching your filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Resolution Modal */}
                {selectedTicket && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm transition-all">
                        <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-8 relative animate-in slide-in-from-bottom-5 duration-300">
                            <button
                                onClick={() => setSelectedTicket(null)}
                                className="absolute top-6 right-6 text-slate-300 hover:text-slate-900 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>

                            <h3 className="text-xl font-bold text-[#051094] mb-2 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px] text-[#051094]">settings_suggest</span>
                                Ticket Review
                            </h3>
                            <p className="text-xs text-slate-400 mb-6 font-bold uppercase tracking-widest">Ticket #{selectedTicket._id.slice(-6)} • Store: {selectedTicket.targetStore}</p>

                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-6">
                                <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Original Message</p>
                                <p className="text-sm text-slate-600 leading-relaxed font-medium">{selectedTicket.message}</p>
                            </div>

                            {selectedTicket.status === 'Resolved' ? (
                                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                    <p className="text-[10px] font-black uppercase text-emerald-600 mb-2">Resolution / Reply saved</p>
                                    <p className="text-sm text-slate-800 leading-relaxed font-medium">{selectedTicket.reply || "No reply text available."}</p>
                                </div>
                            ) : (
                                <form onSubmit={handleAction} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Force Resolve / Intervene</label>
                                        <textarea
                                            required
                                            rows="5"
                                            placeholder="Type administrative action taken to override or resolve this incident..."
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:border-[#051094] outline-none resize-none placeholder:text-slate-300 shadow-sm"
                                            value={replyAction}
                                            onChange={(e) => setReplyAction(e.target.value)}
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-4 bg-[#051094] text-white rounded-lg text-sm font-black uppercase tracking-widest shadow-md hover:brightness-110 active:scale-[0.98] transition-all"
                                    >
                                        Log & Finalize Incident
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                )}
                <div className="mt-auto pt-16">
                    <Footer />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ContactUs;
