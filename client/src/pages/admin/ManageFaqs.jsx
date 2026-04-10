import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';

const ManageFaqs = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState(null);

    const [form, setForm] = useState({
        question: '',
        answer: '',
        category: 'General',
        keywords: ''
    });

    const categories = ['All', 'General', 'Marketplace', 'Account', 'Simulator', 'Support'];

    useEffect(() => {
        fetchFaqs();
    }, [filterCategory, searchTerm]);

    const fetchFaqs = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/faqs?category=${filterCategory}&search=${searchTerm}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFaqs(response.data);
        } catch (error) {
            console.error('Error fetching FAQs:', error);
            toast.error('Failed to load FAQs');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const keywordsArray = form.keywords.split(',').map(k => k.trim()).filter(k => k);
            const payload = { ...form, keywords: keywordsArray };

            if (editingFaq) {
                await axios.put(`http://localhost:5000/api/faqs/${editingFaq._id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('FAQ updated successfully');
            } else {
                await axios.post('http://localhost:5000/api/faqs', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('FAQ created successfully');
            }
            setIsModalOpen(false);
            resetForm();
            fetchFaqs();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving FAQ');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/faqs/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('FAQ deleted successfully');
            fetchFaqs();
        } catch (error) {
            console.error('Error deleting FAQ:', error);
            toast.error('Error deleting FAQ');
        }
    };

    const openEditModal = (faq) => {
        setEditingFaq(faq);
        setForm({
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            keywords: faq.keywords.join(', ')
        });
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setEditingFaq(null);
        setForm({
            question: '',
            answer: '',
            category: 'General',
            keywords: ''
        });
    };


    return (
        <AdminLayout
            headerTitle="FAQ Management"
            loading={loading && faqs.length === 0}
        >
            <div className="space-y-6">
                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input
                                type="text"
                                placeholder="Search questions..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <button
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#1111d4] text-white rounded-xl hover:bg-[#051094] transition-all shadow-md font-bold text-sm w-full md:w-auto justify-center"
                    >
                        <span className="material-symbols-outlined">add</span>
                        Add New FAQ
                    </button>
                </div>

                {/* FAQ List */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Question & Answer</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {faqs.map((faq) => (
                                    <tr key={faq._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-6 max-w-2xl">
                                            <p className="font-bold text-slate-900 text-sm mb-1">{faq.question}</p>
                                            <p className="text-slate-500 text-xs line-clamp-2">{faq.answer}</p>
                                            {faq.keywords?.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {faq.keywords.map((k, i) => (
                                                        <span key={i} className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase font-bold">
                                                            {k}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                {faq.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openEditModal(faq)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(faq._id)}
                                                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {faqs.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-12 text-center text-slate-400 font-medium">
                                            No FAQs found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">
                                {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="material-symbols-outlined text-slate-400 hover:text-slate-600 transition-colors">close</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Question</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={form.question}
                                    onChange={(e) => setForm({ ...form, question: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                                    <select
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    >
                                        {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Keywords (comma separated)</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g. price, cost, fee"
                                        value={form.keywords}
                                        onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Answer</label>
                                <textarea
                                    required
                                    rows="4"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    value={form.answer}
                                    onChange={(e) => setForm({ ...form, answer: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-[#1111d4] text-white rounded-xl font-bold hover:bg-[#051094] transition-all shadow-md"
                                >
                                    {editingFaq ? 'Save Changes' : 'Create FAQ'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default ManageFaqs;
