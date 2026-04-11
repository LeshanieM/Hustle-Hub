import React, { useState, useEffect } from 'react';
import OwnerLayout from '../../components/dashboard/OwnerLayout';
import Footer from '../../components/Footer';
import api from '../../api/axios';

const ContactUs = () => {
    const [inquiries, setInquiries] = useState([]);
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInquiries = async () => {
            try {
                const { data } = await api.get('/support/store-tickets');
                if (data.success) {
                    setInquiries(data.tickets.map(t => ({
                        id: t._id,
                        customer: t.sender ? `${t.sender.firstName} ${t.sender.lastName}` : 'Unknown Customer',
                        email: t.sender?.studentEmail || '',
                        subject: t.subject,
                        message: t.message || '',
                        date: new Date(t.createdAt).toLocaleDateString(),
                        replied: t.status === 'Resolved',
                        reply: t.reply || ''
                    })));
                }
            } catch (err) {
                console.error("Error fetching store tickets:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInquiries();
    }, []);

    const handleReply = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.patch(`/support/${selectedInquiry.id}/reply`, { reply: replyText });
            if (data.success) {
                setInquiries(inquiries.map(inq => 
                    inq.id === selectedInquiry.id ? { ...inq, replied: true, reply: replyText } : inq
                ));
                setSelectedInquiry(null);
                setReplyText('');
            }
        } catch (err) {
            console.error("Error replying to ticket:", err);
            alert('Failed to send reply');
        }
    };

    return (
        <OwnerLayout activeTab="contact" headerTitle="Seller Support">
            <div className="max-w-6xl mx-auto py-8 px-4 font-inter flex flex-col min-h-[calc(100vh-100px)] w-full" style={{ fontFamily: "'Inter', sans-serif" }}>
                {/* Minimal Header */}
                <div className="mb-12 border-b border-slate-100 pb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[#051094] mb-2 tracking-tight">Seller Support</h1>
                        <p className="text-slate-500 text-sm">Manage customer inquiries and direct support requests for your store.</p>
                    </div>
                </div>

                {/* Minimal Table: Inquiry Inbox */}
                <div className="space-y-6">
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Customer Inquiry Inbox</h2>
                    <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-sm bg-white">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Customer</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Subject</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Date</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {inquiries.map(inq => (
                                    <tr key={inq.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-slate-900">{inq.customer}</div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-600 truncate max-w-xs">{inq.subject}</td>
                                        <td className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-tighter">{inq.date}</td>
                                        <td className="px-6 py-4 text-center">
                                            {inq.replied ? (
                                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center justify-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                                    Replied
                                                </span>
                                            ) : (
                                                <button 
                                                    onClick={() => setSelectedInquiry(inq)}
                                                    className="px-4 py-1.5 bg-[#051094] text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm hover:brightness-110 active:scale-[0.98] transition-all"
                                                >
                                                    Pending Reply
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Minimal Reply Modal */}
                {selectedInquiry && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 transition-all opacity-100 scale-100">
                        <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-8 relative animate-in zoom-in duration-300">
                            <button 
                                onClick={() => setSelectedInquiry(null)}
                                className="absolute top-6 right-6 text-slate-400 hover:text-slate-900"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                            
                            <h3 className="text-xl font-bold text-[#051094] mb-2 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">reply</span>
                                Reply to {selectedInquiry.customer}
                            </h3>
                            <p className="text-xs text-slate-400 mb-6 font-bold uppercase tracking-widest">Inquiry #{selectedInquiry.id}</p>
                            
                            <div className="mb-6 p-4 bg-slate-50 border border-slate-100 rounded-lg">
                                <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2">Customer Message</h4>
                                <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedInquiry.message || 'No message provided.'}</p>
                            </div>

                            <form onSubmit={handleReply} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Your message</label>
                                    <textarea 
                                        required
                                        rows="5"
                                        placeholder="Briefly respond to the customer..."
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:border-[#051094] outline-none resize-none"
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                    ></textarea>
                                </div>
                                <button 
                                    type="submit"
                                    className="w-full py-4 bg-[#051094] text-white rounded-lg text-sm font-bold shadow-md hover:brightness-110 active:scale-[0.98] transition-all"
                                >
                                    Deliver Response
                                </button>
                            </form>
                        </div>
                    </div>
                )}
                <div className="mt-auto pt-16">
                    <Footer />
                </div>
            </div>
        </OwnerLayout>
    );
};

export default ContactUs;
