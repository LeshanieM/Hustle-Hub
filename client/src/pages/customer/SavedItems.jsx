import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CustomerLayout from '../../components/dashboard/CustomerLayout';
import toast from 'react-hot-toast';
import { resolveImageUrl } from '../../utils/imageUtils';

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
                                <div key={item._id} className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden hover:shadow-lg transition-all group h-full">
                                    <div className="w-full h-56 overflow-hidden relative bg-slate-50">
                                        {item.imageUrl ? (
                                            <img 
                                                src={resolveImageUrl(item.imageUrl)} 
                                                alt={item.name} 
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="material-symbols-outlined text-5xl text-slate-200">image</span>
                                            </div>
                                        )}
                                        <button 
                                            onClick={() => removeSavedItem(item._id)} 
                                            className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-md active:scale-90 border-none cursor-pointer"
                                            title="Remove from favorites"
                                        >
                                            <span className="material-symbols-outlined text-[22px] fill-1">favorite</span>
                                        </button>
                                        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                                            <p className="text-[10px] font-black text-[#051094] uppercase tracking-widest m-0">{item.type || 'General'}</p>
                                        </div>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex-1">
                                            <h5 className="font-black text-slate-900 text-lg leading-tight mb-2 line-clamp-1">{item.name}</h5>
                                            <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-4">{item.description}</p>
                                        </div>
                                        <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-50">
                                            <span className="font-black text-slate-900 text-2xl">${Number(item.price).toFixed(2)}</span>
                                            <button 
                                                onClick={() => navigate(`/customer/products/${item._id}`)}
                                                className="px-5 py-2.5 bg-[#051094] hover:bg-[#0d0db0] text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-[#051094]/10 active:scale-95 border-none cursor-pointer"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
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
