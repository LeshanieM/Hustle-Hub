import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CustomerLayout from '../../components/dashboard/CustomerLayout';
import toast from 'react-hot-toast';
import ProductCard from '../../components/products/ProductCard';

const SavedItems = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [savedItems, setSavedItems] = useState([]);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const fetchSavedItems = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            
            const res = await axios.get(`${API_URL}/user/saved-items`, config);
            if (res.data && res.data.savedItems) {
                setSavedItems(res.data.savedItems);
            }
        } catch (error) {
            console.error('Failed to fetch saved items:', error);
            toast.error('Failed to load saved items');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchSavedItems();
        }
    }, [user]);

    const removeSavedItem = async (productId) => {
        try {
            const token = localStorage.getItem('token');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            
            await axios.post(`${API_URL}/user/favorite/${productId}`, {}, config);
            setSavedItems(prev => prev.filter(item => item._id !== productId));
            
            // Update AuthContext user object to keep it in sync across components
            updateUser({ savedItems: (user.savedItems || []).filter(id => id !== productId) });
            
            toast.success('Item removed from favorites');
        } catch (error) {
            console.error('Failed to remove item:', error);
            toast.error('Failed to remove item');
        }
    };

    return (
        <CustomerLayout activeTab="saved" headerTitle="Saved Items">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 md:p-10">
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#051094]"></div>
                        </div>
                    ) : savedItems.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {savedItems.map(item => (
                                <ProductCard 
                                    key={item._id} 
                                    product={item} 
                                    isOwner={false} 
                                    onDelete={removeSavedItem} 
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="py-24 bg-slate-50/50 rounded-[32px] border border-dashed border-slate-200 text-center flex flex-col items-center">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-sm border border-slate-100">
                                <span className="material-symbols-outlined text-5xl text-rose-300">favorite_border</span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">No saved items found</h3>
                            <p className="text-slate-500 max-w-sm mb-10 font-medium leading-relaxed">You haven't saved any products yet. Browse our marketplace to find items you love.</p>
                            <button 
                                onClick={() => navigate('/customer/products')} 
                                className="px-10 py-4 bg-[#051094] hover:bg-[#0d0db0] text-white font-bold rounded-2xl transition-all shadow-xl shadow-[#051094]/20 active:scale-95 border-none cursor-pointer text-lg"
                            >
                                Explore Products
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
};

export default SavedItems;
