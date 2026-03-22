import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const StoreEditor = () => {
    const { user } = useAuth();
    const [viewMode, setViewMode] = useState('desktop'); // 'desktop' or 'mobile'
    const [activeTab, setActiveTab] = useState('design'); // 'design', 'content', 'settings'

    const mockProducts = [
        {
            _id: 'm1',
            title: "Handmade Leather Journal",
            description: "Handcrafted brown leather journal on wooden desk",
            price: 45.00,
            category: "Stationery",
            image: "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?auto=format&fit=crop&q=80&w=500",
            rating: 4.9,
            reviews: 84
        },
        {
            _id: 'm2',
            title: "Minimalist Desk Lamp",
            description: "Minimalist desk lamp with warm light",
            price: 32.00,
            category: "Home Decor",
            image: "https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&q=80&w=500",
            rating: 4.8,
            reviews: 120
        },
        {
            _id: 'm3',
            title: "Hand-Thrown Ceramic Mug",
            description: "Ceramic coffee mug with textured glaze",
            price: 24.00,
            category: "Lifestyle",
            image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=500",
            rating: 5.0,
            reviews: 256,
            isBestSeller: true
        },
        {
            _id: 'm4',
            title: "Organic Cotton Tablecloth",
            description: "Organic cotton linen table cloth",
            price: 58.00,
            category: "Home Decor",
            image: "https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?auto=format&fit=crop&q=80&w=500",
            rating: 4.7,
            reviews: 42
        },
        {
            _id: 'm5',
            title: "Vintage Polaroid Camera",
            description: "Instant vintage film camera",
            price: 120.00,
            category: "Lifestyle",
            image: "https://images.unsplash.com/photo-1526170315835-3d5a73e5893d?auto=format&fit=crop&q=80&w=500",
            rating: 4.9,
            reviews: 28
        },
        {
            _id: 'm6',
            title: "Classic White Watch",
            description: "Minimalist white quartz wristwatch",
            price: 185.00,
            category: "Lifestyle",
            image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=500",
            rating: 4.8,
            reviews: 215
        }
    ];

    // Mock store state for editor
    const [storeData, setStoreData] = useState({
        name: "LUXE",
        location: "San Francisco, CA",
        rating: 4.9,
        reviews: "1.2k",
        banner: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200",
        logo: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=200",
        headline: "Summer Collection 2024",
        subheadline: "Minimalist designs for modern living. Curated with care for your aesthetic home.",
        ctaText: "Shop Now",
        primaryColor: "#051094"
    });

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white text-slate-900 font-display">
            {/* Sidebar Navigation */}
            <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col z-20">
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm shadow-primary/5">
                            <span className="material-symbols-outlined">storefront</span>
                        </div>
                        <div>
                            <h1 className="text-sm font-black tracking-tight">Hustle Hub</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Admin Panel</p>
                        </div>
                    </div>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-primary rounded-xl transition-all font-bold text-sm">
                        <span className="material-symbols-outlined text-[22px]">dashboard</span>
                        Dashboard
                    </Link>
                    <Link to="/my-orders" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-primary rounded-xl transition-all font-bold text-sm">
                        <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
                        Orders
                    </Link>
                    <Link to="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-primary rounded-xl transition-all font-bold text-sm">
                        <span className="material-symbols-outlined text-[22px]">inventory_2</span>
                        Products
                    </Link>
                    <Link to="/store-editor" className="flex items-center gap-3 px-4 py-3 bg-primary/10 text-primary rounded-xl font-black text-sm shadow-sm shadow-primary/5">
                        <span className="material-symbols-outlined text-[22px]">edit_note</span>
                        Storefront Editor
                    </Link>
                    <Link to="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-primary rounded-xl transition-all font-bold text-sm">
                        <span className="material-symbols-outlined text-[22px]">settings</span>
                        Settings
                    </Link>
                </nav>
                <div className="p-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/50 border border-slate-100">
                        <div className="size-9 rounded-full bg-primary/20 flex items-center justify-center font-black text-primary border-2 border-white shadow-sm overflow-hidden">
                            {user?.name?.charAt(0) || 'J'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black truncate">{user?.name || 'Jane Cooper'}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user?.role || 'Shop Owner'}</p>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 text-sm">unfold_more</span>
                    </div>
                </div>
            </aside>

            {/* Main Workspace */}
            <main className="flex-1 flex flex-col h-full bg-slate-50/50">

                {/* Editor Content Area */}
                <div className="flex-1 flex overflow-x-auto overflow-y-hidden">
                    {/* Live Canvas */}
                    <div className="flex-1 min-w-0 overflow-y-auto p-4 md:p-8 lg:p-12 bg-slate-100/50 scrollbar-hide">
                        <div className={`mx-auto bg-white shadow-2xl rounded-[40px] overflow-hidden min-h-[1200px] border-8 border-white transition-all duration-500 ${viewMode === 'mobile' ? 'max-w-[400px]' : 'max-w-5xl'}`}>
                            {/* Editable Header */}
                            <div className="px-10 py-8 flex items-center justify-between border-b border-slate-50 hover:ring-4 ring-primary/10 transition-all cursor-pointer group relative">
                                <div className="flex items-center gap-10">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-black tracking-tight text-primary uppercase">LUXE</span>
                                    </div>
                                    <nav className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-widest text-slate-400">
                                        <span className="hover:text-primary transition-colors">Collection</span>
                                        <span className="hover:text-primary transition-colors">New Arrivals</span>
                                        <span className="hover:text-primary transition-colors">About</span>
                                    </nav>
                                </div>
                                <div className="flex items-center gap-6 text-slate-400">
                                    <span className="material-symbols-outlined">search</span>
                                    <span className="material-symbols-outlined">shopping_cart</span>
                                </div>
                                {/* Edit Badge */}
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 bg-primary text-white p-2 rounded-xl shadow-xl transition-all scale-75 group-hover:scale-100">
                                    <span className="material-symbols-outlined text-lg">edit</span>
                                </div>
                            </div>

                            {/* Editable Hero */}
                            <div className="relative h-[450px] bg-slate-900 flex items-center px-16 hover:ring-4 ring-primary/20 ring-inset transition-all group cursor-pointer overflow-hidden">
                                <img src={storeData.banner} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000" alt="Banner" />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
                                <div className="relative z-10 max-w-lg">
                                    <h1 className="text-5xl font-black text-white mb-6 leading-tight !text-white">{storeData.headline}</h1>
                                    <p className="text-slate-200 text-lg mb-10 font-medium leading-relaxed">{storeData.subheadline}</p>
                                    <button className="px-10 py-4 bg-primary text-white font-black rounded-2xl shadow-2xl shadow-primary/40 hover:scale-105 transition-all">
                                        {storeData.ctaText}
                                    </button>
                                </div>

                                {/* Overlay Controls */}
                                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-4 backdrop-blur-[4px] z-30">
                                    <div className="flex gap-4 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                        <button className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-black shadow-2xl flex items-center gap-2 hover:bg-slate-50 transition-all">
                                            <span className="material-symbols-outlined text-lg">image</span> Change Banner
                                        </button>
                                        <button className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-black shadow-2xl flex items-center gap-2 hover:bg-slate-50 transition-all">
                                            <span className="material-symbols-outlined text-lg">edit</span> Edit Text
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Editable Grid Section */}
                            <div className="p-16">
                                <div className="flex items-center justify-between mb-12 hover:ring-2 ring-primary/10 rounded-2xl p-4 transition-all group relative cursor-pointer">
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Featured Products</h3>
                                    <span className="text-primary font-black text-sm uppercase tracking-widest border-b-2 border-primary/20">View all</span>
                                    <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 bg-primary text-white p-2 rounded-xl shadow-xl transition-all">
                                        <span className="material-symbols-outlined text-sm">edit</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                    {mockProducts.map((p, i) => (
                                        <div key={i} className="group relative cursor-pointer">
                                            <div className="aspect-[4/5] rounded-[32px] bg-slate-100 overflow-hidden mb-6 hover:shadow-2xl transition-all duration-500">
                                                <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.title} />
                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-30">
                                                    <button className="bg-primary text-white p-4 rounded-3xl shadow-2xl transform scale-75 group-hover:scale-100 transition-all">
                                                        <span className="material-symbols-outlined text-2xl">edit</span>
                                                    </button>
                                                </div>
                                            </div>
                                            <h4 className="font-black text-slate-900 group-hover:text-primary transition-colors">{p.title}</h4>
                                            <p className="text-slate-400 font-bold mt-1">${p.price.toFixed(2)}</p>
                                        </div>
                                    ))}

                                    <button className="aspect-[4/5] rounded-[32px] border-4 border-dashed border-primary/20 bg-primary/5 flex flex-col items-center justify-center gap-4 hover:bg-primary/10 transition-all group min-h-[300px]">
                                        <div className="size-16 rounded-3xl bg-primary text-white flex items-center justify-center shadow-xl transform group-hover:rotate-90 transition-transform duration-500">
                                            <span className="material-symbols-outlined text-4xl font-black">add</span>
                                        </div>
                                        <span className="font-black text-primary uppercase tracking-widest text-sm">Add Product</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Property Editor Sidebar */}
                    <aside className="w-80 flex-shrink-0 bg-white border-l border-slate-200 flex flex-col shadow-2xl z-10 transition-all">
                        <div className="flex border-b border-slate-100 p-2">
                            {['design', 'content', 'settings'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-4 text-[10px] font-black tracking-widest uppercase transition-all rounded-xl ${activeTab === tab ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
                            {activeTab === 'design' && (
                                <>
                                    <section>
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                            <span className="h-px flex-1 bg-slate-100"></span>
                                            Brand Identity
                                            <span className="h-px flex-1 bg-slate-100"></span>
                                        </h4>
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <label className="text-xs font-black text-slate-700">Primary Color</label>
                                                <div className="flex items-center gap-4">
                                                    <div className="size-12 rounded-2xl bg-primary border-4 border-white shadow-xl shadow-primary/20 cursor-pointer"></div>
                                                    <input
                                                        className="flex-1 text-sm bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-4 focus:ring-primary/10 font-bold text-slate-600 uppercase"
                                                        type="text"
                                                        value={storeData.primaryColor}
                                                        onChange={(e) => setStoreData({ ...storeData, primaryColor: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-xs font-black text-slate-700">Store Logo</label>
                                                <div className="border-4 border-dashed border-slate-100 rounded-[32px] p-8 flex flex-col items-center gap-4 group hover:border-primary/20 transition-all bg-slate-50/50 cursor-pointer">
                                                    <div className="size-16 rounded-2xl bg-white shadow-lg flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors">
                                                        <span className="material-symbols-outlined text-3xl">image</span>
                                                    </div>
                                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">Replace Logo</p>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section>
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                            <span className="h-px flex-1 bg-slate-100"></span>
                                            Layout Settings
                                            <span className="h-px flex-1 bg-slate-100"></span>
                                        </h4>
                                        <div className="space-y-5">
                                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <span className="text-xs font-bold text-slate-600">Overlay Intensity</span>
                                                <input className="w-24 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" type="range" />
                                            </div>
                                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <span className="text-xs font-bold text-slate-600">Product Columns</span>
                                                <div className="flex gap-1">
                                                    {[2, 3, 4].map(n => <button key={n} className={`size-8 rounded-lg text-[10px] font-black ${n === 3 ? 'bg-white shadow text-primary' : 'text-slate-400'}`}>{n}</button>)}
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </>
                            )}

                            {activeTab === 'content' && (
                                <section className="space-y-8 animate-in fade-in duration-300">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <span className="h-px flex-1 bg-slate-100"></span>
                                        Hero Text
                                        <span className="h-px flex-1 bg-slate-100"></span>
                                    </h4>
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-slate-700">Headline</label>
                                            <textarea
                                                className="w-full text-sm bg-slate-50 border-none rounded-2xl p-4 focus:ring-4 focus:ring-primary/10 font-bold"
                                                rows="3"
                                                value={storeData.headline}
                                                onChange={(e) => setStoreData({ ...storeData, headline: e.target.value })}
                                            ></textarea>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-slate-700">Subheadline</label>
                                            <textarea
                                                className="w-full text-sm bg-slate-50 border-none rounded-2xl p-4 focus:ring-4 focus:ring-primary/10 font-medium text-slate-500"
                                                rows="4"
                                                value={storeData.subheadline}
                                                onChange={(e) => setStoreData({ ...storeData, subheadline: e.target.value })}
                                            ></textarea>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-slate-700">Button CTA</label>
                                            <input
                                                className="w-full text-sm bg-slate-50 border-none rounded-2xl p-4 focus:ring-4 focus:ring-primary/10 font-bold"
                                                type="text"
                                                value={storeData.ctaText}
                                                onChange={(e) => setStoreData({ ...storeData, ctaText: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </section>
                            )}

                            {activeTab === 'settings' && (
                                <section className="space-y-6 animate-in fade-in duration-300">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <span className="h-px flex-1 bg-slate-100"></span>
                                        Visibility
                                        <span className="h-px flex-1 bg-slate-100"></span>
                                    </h4>
                                    <div className="space-y-3">
                                        {[
                                            { label: "Search Bar", enabled: true },
                                            { label: "New Arrivals", enabled: true },
                                            { label: "Related Products", enabled: false },
                                            { label: "Customer Reviews", enabled: true }
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <span className="text-sm font-bold text-slate-700">{item.label}</span>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input checked={item.enabled} readOnly className="sr-only peer" type="checkbox" />
                                                    <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        <div className="p-8 border-t border-slate-100 bg-slate-50/50">
                            <button className="w-full py-4 bg-white text-slate-700 text-xs font-black rounded-2xl flex items-center justify-center gap-3 border shadow-sm hover:translate-y-[-2px] transition-all active:scale-95">
                                <span className="material-symbols-outlined text-lg">visibility</span> View Live Site
                            </button>
                            <p className="text-[10px] font-bold text-center text-slate-400 mt-4 uppercase tracking-[0.2em]">Autosaved • 2 mins ago</p>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default StoreEditor;
