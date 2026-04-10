import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import CustomerHeader from '../../components/CustomerHeader';

const SavedItems = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [savedItems, setSavedItems] = useState([]);

    useEffect(() => {
        const fetchSavedItems = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                
                const res = await axios.get('http://localhost:5000/api/customer/dashboard', config);
                if (res.data && res.data.savedItems) {
                    setSavedItems(res.data.savedItems);
                }
            } catch (error) {
                console.error('Failed to fetch saved items:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSavedItems();
    }, [user]);

    const removeSavedItem = (id) => {
        setSavedItems(prev => prev.filter(item => item._id !== id));
        // You would also want to call an API to remove it from the backend
    };

    const sidebarItems = [
        { label: 'Overview', icon: 'dashboard', path: '/customer-dashboard' },
        { label: 'My Orders', icon: 'shopping_bag', path: '/orders' },
        { label: 'Saved Items', icon: 'favorite', path: '/saved-items' },
        { label: 'Settings', icon: 'settings', path: '/profile' },
    ];

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-bold text-slate-400">Loading saved items...</p>
            </div>
        </div>
    );

    return (
        <DashboardLayout 
            role="Customer" 
            headerTitle="Saved Items"
            sidebarItems={sidebarItems}
            TopHeader={CustomerHeader}
        >
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
                    {savedItems.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {savedItems.map(item => (
                                <div key={item._id} className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden hover:shadow-lg transition-all group">
                                    <div className="w-full h-48 overflow-hidden relative">
                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        <button onClick={() => removeSavedItem(item._id)} className="absolute top-4 right-4 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">favorite</span>
                                        </button>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col justify-between">
                                        <div>
                                            <h5 className="font-black text-slate-900 text-lg leading-tight mb-1">{item.title}</h5>
                                            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{item.category}</p>
                                        </div>
                                        <div className="flex justify-between items-center mt-6">
                                            <span className="font-black text-slate-900 text-xl">${item.price}</span>
                                            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-indigo-200">
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="col-span-full py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center flex flex-col items-center">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                                <span className="material-symbols-outlined text-4xl text-rose-300">favorite_border</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No saved items found</h3>
                            <p className="text-slate-500 max-w-sm mb-8">You haven't saved any products yet. Browse our marketplace to find items you love.</p>
                            <button onClick={() => navigate('/stores')} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200">
                                Explore Products
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SavedItems;
