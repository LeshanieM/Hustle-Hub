import React, { useState } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import OwnerHeader from '../../components/OwnerHeader';
import { useAuth } from '../../context/AuthContext';
import Footer from '../../components/Footer';

const ContactUs = () => {
    const { user } = useAuth();
    const [inquiries, setInquiries] = useState([
        { id: 1, customer: "Alex Johnson", email: "alex@student.edu", subject: "Custom Tech Accessory", date: "Oct 24, 2023", priority: "High", replied: false },
        { id: 2, customer: "Sarah Miller", email: "sarah.m@student.edu", subject: "Bulk Order Discount", date: "Oct 23, 2023", priority: "Medium", replied: true, reply: "Yes Sarah! We offer 15% off for orders over 5 units." },
        { id: 3, customer: "Mike Ross", email: "mike.ross@student.edu", subject: "Warranty Inquiry", date: "Oct 22, 2023", priority: "Low", replied: false }
    ]);
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [replyText, setReplyText] = useState('');

    const handleReply = (e) => {
        e.preventDefault();
        setInquiries(inquiries.map(inq => 
            inq.id === selectedInquiry.id ? { ...inq, replied: true, reply: replyText } : inq
        ));
        setSelectedInquiry(null);
        setReplyText('');
    };

    const sidebarItems = [
        { label: 'Dashboard', icon: 'dashboard', path: '/owner-dashboard' },
        { label: 'Products', icon: 'inventory_2', path: '/owner/products' },
        { label: 'Orders', icon: 'shopping_bag', path: '/owner/orders' },
        { label: 'Analytics', icon: 'analytics', path: '/analytics' },
        { label: 'Store Editor', icon: 'brush', path: '/store-editor' },
    ];

    return (
        <DashboardLayout 
            role="Owner" 
            headerTitle="Seller Support"
            sidebarItems={sidebarItems}
            TopHeader={OwnerHeader}
        >
            <div className="max-w-6xl mx-auto py-8 px-4 font-inter" style={{ fontFamily: "'Inter', sans-serif" }}>
                {/* Minimal Header */}
                <div className="mb-12 border-b border-slate-100 pb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[#051094] mb-2 tracking-tight">Seller Support</h1>
                        <p className="text-slate-500 text-sm">Manage customer inquiries and direct support requests for your store.</p>
                    </div>
                    <div className="flex gap-4">
                         <div className="px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
                             <p className="text-[10px] font-black uppercase text-slate-400 mb-0.5">Response Rate</p>
                             <p className="text-sm font-bold text-[#051094]">94%</p>
                         </div>
                         <div className="px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
                             <p className="text-[10px] font-black uppercase text-slate-400 mb-0.5">Average Time</p>
                             <p className="text-sm font-bold text-[#051094]">3.2 hrs</p>
                         </div>
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
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Priority</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {inquiries.map(inq => (
                                    <tr key={inq.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-[#051094]">
                                                    {inq.customer.charAt(0)}
                                                </div>
                                                <div className="text-sm font-bold text-slate-900">{inq.customer}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-600 truncate max-w-xs">{inq.subject}</td>
                                        <td className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-tighter">{inq.date}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${
                                                inq.priority === 'High' ? 'bg-orange-50 text-orange-600' :
                                                inq.priority === 'Medium' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {inq.priority}
                                            </span>
                                        </td>
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

                {/* Information Callout */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="p-6 border border-slate-200 rounded-2xl bg-white shadow-sm flex items-start gap-5">
                          <div className="w-12 h-12 bg-slate-50 text-[#051094] rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
                             <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
                          </div>
                          <div>
                              <h4 className="text-sm font-bold text-slate-900 mb-1">Platform Support</h4>
                              <p className="text-xs text-slate-500 leading-relaxed mb-4">Request a manual review for bulk payouts or report technical issues in the Owner Portal.</p>
                              <div className="text-[10px] font-black text-[#051094] uppercase tracking-widest cursor-pointer hover:underline underline-offset-4">Open System Ticket &rarr;</div>
                          </div>
                     </div>
                     <div className="p-6 border border-slate-200 rounded-2xl bg-white shadow-sm flex items-start gap-5">
                          <div className="w-12 h-12 bg-slate-50 text-[#051094] rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
                             <span className="material-symbols-outlined text-2xl">help_center</span>
                          </div>
                          <div>
                              <h4 className="text-sm font-bold text-slate-900 mb-1">Seller Guidelines</h4>
                              <p className="text-xs text-slate-500 leading-relaxed mb-4">Review the student-partner handbook for tips on sales, storefront visibility, and shipping.</p>
                              <div className="text-[10px] font-black text-[#051094] uppercase tracking-widest cursor-pointer hover:underline underline-offset-4">Read Playbook &rarr;</div>
                          </div>
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
                            <p className="text-xs text-slate-400 mb-6 font-bold uppercase tracking-widest">Inquiry #{selectedInquiry.id} • {selectedInquiry.priority} Priority</p>
                            
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
                <Footer />
            </div>
        </DashboardLayout>
    );
};

export default ContactUs;
