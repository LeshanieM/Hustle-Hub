import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import CustomerHeader from '../../components/CustomerHeader';
import Footer from '../../components/Footer';

const BrowseStores = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStores = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/stores');
                if (res.data && res.data.success) {
                    setStores(res.data.stores);
                } else {
                    setError('API returned unexpected response');
                }
            } catch (err) {
                console.error("[BrowseStores] Failed to fetch stores:", err.response?.data || err.message);
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchStores();
    }, []);

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
            <CustomerHeader />

            {/* pt-24 pushes content below the fixed header */}
            <main className="flex-1 max-w-7xl mx-auto px-6 md:px-12 pt-24 pb-16 w-full">
                <div className="mb-10">
                    <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">University Storefronts</h1>
                    <p className="text-slate-500 font-medium text-lg">Support student entrepreneurs and discover unique products across campus.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1111d4]"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 font-medium">
                        <strong>Error loading stores:</strong> {error}
                    </div>
                ) : stores.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {stores.map((store) => (
                            <Link
                                to={`/store/${encodeURIComponent(store.storeName)}`}
                                key={store._id}
                                className="group bg-white rounded-[32px] border border-slate-200 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                            >
                                {/* Banner */}
                                <div className="h-40 bg-slate-100 relative overflow-hidden flex-shrink-0">
                                    {store.bannerUrl ? (
                                        <img
                                            src={store.bannerUrl}
                                            alt={store.storeName}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div
                                            className="absolute inset-0"
                                            style={{ background: `linear-gradient(135deg, ${store.themeSettings?.primaryColor || '#1111d4'}66, #00000066)` }}
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                                    {/* Logo floating badge */}
                                    <div className="absolute -bottom-7 left-6">
                                        {store.logoUrl ? (
                                            <img src={store.logoUrl} alt="Logo" className="h-16 w-16 rounded-2xl object-cover border-4 border-white shadow-xl bg-white" />
                                        ) : (
                                            <div className="h-16 w-16 rounded-2xl bg-white border-4 border-white shadow-xl flex items-center justify-center text-slate-400">
                                                <span className="material-symbols-outlined text-3xl">store</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-8 pt-12 flex flex-col flex-1">
                                    <h2 className="text-xl font-black text-slate-900 mb-2 group-hover:text-[#1111d4] transition-colors">
                                        {store.storeName}
                                    </h2>
                                    <p className="text-slate-500 font-medium line-clamp-2 text-sm flex-1 mb-6">
                                        {store.description || 'Welcome to my shop! Explore our collection.'}
                                    </p>

                                    {/* Action row */}
                                    <div className="flex items-center justify-between">
                                        <span
                                            className="px-5 py-2.5 rounded-xl text-sm font-black text-white shadow-sm"
                                            style={{ backgroundColor: store.themeSettings?.primaryColor || '#1111d4' }}
                                        >
                                            Visit Store
                                        </span>
                                        <span className="material-symbols-outlined text-slate-300 group-hover:translate-x-1 group-hover:text-[#1111d4] transition-all">
                                            arrow_forward
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[40px] border-2 border-dashed border-slate-200 py-24 flex flex-col items-center justify-center text-center px-6">
                        <div className="h-24 w-24 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-5xl text-slate-300">storefront</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">No Stores Yet</h2>
                        <p className="text-slate-500 font-medium max-w-md">There are currently no active storefronts. Be the first to start your hustle!</p>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default BrowseStores;
