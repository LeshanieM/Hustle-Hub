import React, { useState } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import CustomerHeader from '../../components/CustomerHeader';
import { useAuth } from '../../context/AuthContext';
import Footer from '../../components/Footer';

const ContactUs = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('store');
    const [formData, setFormData] = useState({ subject: '', message: '', targetStore: '', orderId: '' });
    const [submitted, setSubmitted] = useState(false);

    // Mock history data
    const [history] = useState([
        { id: 101, recipient: "The Tech Spot", subject: "Refund Request", status: "Resolved", date: "Oct 20, 2023" },
        { id: 102, recipient: "Platform Admin", subject: "Password Reset", status: "Pending", date: "Oct 22, 2023" },
        { id: 103, recipient: "Vintage Vibes", subject: "Size Inquiry", status: "Open", date: "Oct 24, 2023" }
    ]);

    const mockStores = ["The Tech Spot", "Vintage Vibes", "Artisan Alley", "Campus Essentials"];

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 5000);
    };

    const sidebarItems = [
        { label: 'Dashboard', icon: 'dashboard', path: '/customer-dashboard' },
        { label: 'My Orders', icon: 'shopping_bag', path: '/orders' },
        { label: 'Saved Items', icon: 'favorite', path: '/saved-items' },
        { label: 'Settings', icon: 'settings', path: '/profile' },
    ];

    return (
        <DashboardLayout 
            role="Customer" 
            headerTitle="Support Center"
            sidebarItems={sidebarItems}
            TopHeader={CustomerHeader}
        >
            <div className="max-w-6xl mx-auto py-8 px-4 font-inter" style={{ fontFamily: "'Inter', sans-serif" }}>
                {/* Minimal Header */}
                <div className="mb-12 border-b border-slate-100 pb-8">
                    <h1 className="text-3xl font-bold text-[#051094] mb-2">Contact Us</h1>
                    <p className="text-slate-500 text-sm">Have a question? Reach out to store owners or our platform team below.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left: Minimal Selection & Form */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Support Type</h2>
                            <div className="flex flex-col gap-2">
                                <button 
                                    onClick={() => setActiveTab('store')}
                                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'store' ? 'bg-[#051094] text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                >
                                    Message a Store Owner
                                </button>
                                <button 
                                    onClick={() => setActiveTab('platform')}
                                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'platform' ? 'bg-[#051094] text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                >
                                    Platform Support
                                </button>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                           <h3 className="text-sm font-bold text-slate-900 mb-4">Quick Help</h3>
                           <p className="text-xs text-slate-500 leading-relaxed mb-4">Our typical response time for platform inquiries is under 24 hours.</p>
                           <div className="text-xs font-bold text-[#051094] cursor-pointer hover:underline">Read our FAQ &rarr;</div>
                        </div>
                    </div>

                    {/* Right: The Tabular Content & Form */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* The Form */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                                <span className="material-symbols-outlined text-[#051094] text-[20px]">{activeTab === 'store' ? 'storefront' : 'support_agent'}</span>
                                {activeTab === 'store' ? 'Contact Store Owner' : 'Contact Platform'}
                            </h3>

                            {submitted ? (
                                <div className="p-8 text-center bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 animate-in fade-in duration-300">
                                   <p className="font-bold mb-1">Message Sent!</p>
                                   <p className="text-sm">We've dispatched your inquiry correctly.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {activeTab === 'store' ? (
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Select Store</label>
                                                <select 
                                                    required
                                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:border-[#051094] outline-none appearance-none"
                                                    onChange={(e) => setFormData({...formData, targetStore: e.target.value})}
                                                >
                                                    <option value="">Choose store...</option>
                                                    {mockStores.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Order ID</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Optional"
                                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:border-[#051094] outline-none"
                                                    onChange={(e) => setFormData({...formData, orderId: e.target.value})}
                                                />
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Topic</label>
                                            <select 
                                                required
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:border-[#051094] outline-none appearance-none"
                                                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                            >
                                                <option value="">Inquiry type...</option>
                                                <option value="shipping">Shipping</option>
                                                <option value="payment">Payment</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Message</label>
                                        <textarea 
                                            required
                                            rows="4"
                                            placeholder="Briefly describe your issue..."
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:border-[#051094] outline-none resize-none"
                                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                                        ></textarea>
                                    </div>

                                    <button 
                                        type="submit"
                                        className="px-8 py-3 bg-[#051094] text-white rounded-lg text-sm font-bold shadow-sm hover:brightness-110 active:scale-[0.98] transition-all"
                                    >
                                        Send Message
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
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Recipient</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Subject</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Date</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {history.map(item => (
                                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 text-xs font-mono text-slate-400">#{item.id}</td>
                                                <td className="px-6 py-4 text-sm font-bold text-slate-900">{item.recipient}</td>
                                                <td className="px-6 py-4 text-xs text-slate-600 font-medium">{item.subject}</td>
                                                <td className="px-6 py-4 text-[11px] text-slate-400 font-bold">{item.date}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter ${
                                                        item.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' : 
                                                        item.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </DashboardLayout>
    );
};

export default ContactUs;
