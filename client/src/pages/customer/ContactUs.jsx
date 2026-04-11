import React, { useState, useEffect } from 'react';
import CustomerLayout from '../../components/dashboard/CustomerLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const ContactUs = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({ subject: '', message: '', targetStore: '' });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [editingTicket, setEditingTicket] = useState(null);
    
    // State for history and stores
    const [history, setHistory] = useState([]);
    const [stores, setStores] = useState([]);

    useEffect(() => {
        const fetchStores = async () => {
            try {
                const { data } = await api.get('/stores');
                if (data.success) {
                    setStores(data.stores);
                }
            } catch (err) {
                console.error("Error fetching stores:", err);
            }
        };

        const fetchHistory = async () => {
            try {
                const { data } = await api.get('/support/my-tickets');
                if (data.success) {
                    setHistory(data.tickets);
                }
            } catch (err) {
                console.error("Error fetching support history:", err);
            }
        };

        fetchStores();
        fetchHistory();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this ticket?")) return;
        try {
            const { data } = await api.delete(`/support/${id}`);
            if (data.success) {
                setHistory(history.filter(t => t._id !== id));
            }
        } catch (err) {
            console.error(err);
            alert("Failed to delete ticket");
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.patch(`/support/${editingTicket._id}`, {
                message: editingTicket.message
            });
            if (data.success) {
                setHistory(history.map(t => t._id === editingTicket._id ? data.ticket : t));
                setEditingTicket(null);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to edit ticket");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/support', formData);
            if (data.success) {
                setSubmitted(true);
                setFormData({ subject: '', message: '', targetStore: '' });
                // Prepend to history
                setHistory([data.ticket, ...history]);
                setTimeout(() => setSubmitted(false), 5000);
            } else {
                alert(data.message || 'Error sending message');
            }
        } catch (err) {
            console.error("Error sending message:", err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to send message';
            alert(`Failed: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <CustomerLayout activeTab="contact" headerTitle="Support Center">
            <div className="max-w-6xl mx-auto py-8 px-4 font-inter" style={{ fontFamily: "'Inter', sans-serif" }}>
                <div className="mb-12 border-b border-slate-100 pb-8">
                    <h1 className="text-3xl font-bold text-[#051094] mb-2">Contact Us</h1>
                    <p className="text-slate-500 text-sm">Have a question? Reach out to store owners below.</p>
                </div>

                <div className="max-w-4xl mx-auto space-y-12">
                        {/* The Form */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                                <span className="material-symbols-outlined text-[#051094] text-[20px]">storefront</span>
                                Contact Store Owner
                            </h3>

                            {submitted ? (
                                <div className="p-8 text-center bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 animate-in fade-in duration-300">
                                   <p className="font-bold mb-1">Message Sent!</p>
                                   <p className="text-sm">We've dispatched your inquiry to the store owner.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Select Store</label>
                                            <select 
                                                required
                                                value={formData.targetStore}
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:border-[#051094] outline-none appearance-none"
                                                onChange={(e) => setFormData({...formData, targetStore: e.target.value})}
                                            >
                                                <option value="">Choose store...</option>
                                                {stores.map(s => <option key={s._id} value={s.storeName}>{s.storeName}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Topic</label>
                                            <select 
                                                required
                                                value={formData.subject}
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:border-[#051094] outline-none appearance-none"
                                                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                            >
                                                <option value="">Inquiry type...</option>
                                                <option value="shipping">Shipping</option>
                                                <option value="payment">Payment</option>
                                                <option value="product">Product Details</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Message</label>
                                        <textarea 
                                            required
                                            value={formData.message}
                                            rows="4"
                                            placeholder="Briefly describe your issue..."
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:border-[#051094] outline-none resize-none"
                                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                                        ></textarea>
                                    </div>

                                    <button 
                                        disabled={loading}
                                        type="submit"
                                        className={`px-8 py-3 text-white rounded-lg text-sm font-bold shadow-sm transition-all ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#051094] hover:brightness-110 active:scale-[0.98]'}`}
                                    >
                                        {loading ? 'Sending...' : 'Send Message'}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Minimal Table: Message History */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-slate-900">Message History</h3>
                            <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-sm">
                                <table className="w-full text-left border-collapse bg-white">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">ID</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Store</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Subject</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Date</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Status & Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {history.map(item => (
                                            <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 text-xs font-mono text-slate-400">{item._id.slice(-6)}</td>
                                                <td className="px-6 py-4 text-sm font-bold text-slate-900">{item.targetStore}</td>
                                                <td className="px-6 py-4 text-xs text-slate-600 font-medium capitalize">{item.subject}</td>
                                                <td className="px-6 py-4 text-[11px] text-slate-400 font-bold">{new Date(item.createdAt).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 flex items-center gap-3">
                                                    {item.status === 'Resolved' ? (
                                                        <button
                                                            onClick={() => setSelectedTicket(item)}
                                                            className="px-3 py-1 rounded text-[9px] font-black uppercase tracking-tighter bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors shadow-sm"
                                                        >
                                                            View Reply
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter ${
                                                                item.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
                                                            }`}>
                                                                {item.status}
                                                            </span>
                                                            <button type="button" onClick={() => setEditingTicket(item)} className="text-slate-400 hover:text-[#051094] transition-colors" title="Edit">
                                                                <span className="material-symbols-outlined text-[16px]">edit</span>
                                                            </button>
                                                            <button type="button" onClick={() => handleDelete(item._id)} className="text-slate-400 hover:text-red-600 transition-colors" title="Delete">
                                                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                                            </button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {history.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-8 text-center text-slate-400 text-[13px]">
                                                    No support tickets found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                </div>

                {/* Reply Viewer Modal */}
                {selectedTicket && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 transition-all">
                        <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-8 relative animate-in zoom-in duration-300">
                            <button 
                                onClick={() => setSelectedTicket(null)}
                                className="absolute top-6 right-6 text-slate-400 hover:text-slate-900"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                            
                            <h3 className="text-xl font-bold text-[#051094] mb-2 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">mark_email_read</span>
                                Store Reply
                            </h3>
                            <p className="text-xs text-slate-400 mb-6 font-bold uppercase tracking-widest">Inquiry #{selectedTicket._id.slice(-6)} • {selectedTicket.targetStore}</p>
                            
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Original Message</p>
                                    <p className="text-sm text-slate-600 leading-relaxed">{selectedTicket.message}</p>
                                </div>
                                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                    <p className="text-[10px] font-black uppercase text-emerald-600 mb-2">Owner's Reply</p>
                                    <p className="text-sm text-slate-800 leading-relaxed font-medium">{selectedTicket.reply || "No reply text available."}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Edit Modal */}
                {editingTicket && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 transition-all">
                        <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-8 relative animate-in zoom-in duration-300">
                            <button 
                                type="button"
                                onClick={() => setEditingTicket(null)}
                                className="absolute top-6 right-6 text-slate-400 hover:text-slate-900"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                            
                            <h3 className="text-xl font-bold text-[#051094] mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">edit</span>
                                Edit Ticket
                            </h3>
                            
                            <form onSubmit={handleEditSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Message</label>
                                    <textarea 
                                        required
                                        rows="5"
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:border-[#051094] outline-none resize-none"
                                        value={editingTicket.message}
                                        onChange={(e) => setEditingTicket({...editingTicket, message: e.target.value})}
                                    ></textarea>
                                </div>
                                <button 
                                    type="submit"
                                    className="w-full py-4 bg-[#051094] text-white rounded-lg text-sm font-bold shadow-md hover:brightness-110 active:scale-[0.98] transition-all"
                                >
                                    Save Changes
                                </button>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </CustomerLayout>
    );
};

export default ContactUs;
