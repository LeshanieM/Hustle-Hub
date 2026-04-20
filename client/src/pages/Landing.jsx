import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CustomerHeader from '../components/CustomerHeader';
import OwnerHeader from '../components/OwnerHeader';
import AdminHeader from '../components/AdminHeader';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';

// SVG-based Icon component for maximum reliability
const MaterialIcon = ({ name, size = 24, className = '', fill = false }) => {
  const icons = {
    grid_view: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    search: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    notifications: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    shopping_cart: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
    add_shopping_cart: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /><line x1="12" y1="9" x2="12" y2="15" /><line x1="9" y1="12" x2="15" y2="12" />
      </svg>
    ),
    favorite: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    chevron_right: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    ),
    chevron_left: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    ),
    help_center: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    star: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    menu_book: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    devices: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    restaurant: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
    design_services: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /><path d="M2 2l7.5 1.5" /><path d="M14 11l5 5" />
      </svg>
    ),
    calendar_today: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    public: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    share: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    ),
    alternate_email: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" /><path d="M16 12v1a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
      </svg>
    ),
  };
  return <span className={`inline-flex items-center justify-center ${className}`}>{icons[name] || name}</span>;
};

export default function Landing() {
  const { user, updateUser } = useAuth();
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('products');
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (searchType === 'stores') navigate('/stores', { state: { search: searchQuery.trim() } });
      else navigate('/customer/products', { state: { search: searchQuery.trim() } });
    } else {
      navigate(searchType === 'stores' ? '/stores' : '/customer/products');
    }
  };

  const handleToggleFavorite = async (e, productId) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { toast.error('Please login to save items'); return; }
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.post(`${API_URL}/user/favorite/${productId}`, {}, config);
      
      // Update AuthContext user object to keep it in sync across components
      if (res.data.isFavorite) {
        updateUser({ savedItems: [...(user.savedItems || []), productId] });
      } else {
        updateUser({ savedItems: (user.savedItems || []).filter(id => id !== productId) });
      }
      
      toast.success(res.data.message);
    } catch (error) {
      console.error('Toggle Favorite Error:', error);
      toast.error('Failed to update favorite');
    }
  };

  useEffect(() => {
    axios.get(`${API_URL}/stores`).then((res) => {
      const all = res.data?.stores || res.data || [];
      setStores(all.filter((s) => s.status !== 'SUSPENDED').slice(0, 3));
    }).catch((err) => console.error('Failed to fetch stores:', err));
    axios.get(`${API_URL}/products`).then((res) => {
      const all = Array.isArray(res.data) ? res.data : [];
      setProducts(all.slice(0, 4));
    }).catch((err) => console.error('Failed to fetch products:', err));
  }, []);

  const renderHeader = () => {
    if (!user) return <CustomerHeader />;
    switch (user.role) {
      case 'OWNER': return <OwnerHeader />;
      case 'ADMIN': return <AdminHeader />;
      case 'CUSTOMER': default: return <CustomerHeader />;
    }
  };

  return (
    <div className="bg-[#f6f6f8] text-slate-900 antialiased font-display min-h-screen">
      {renderHeader()}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="py-12 md:py-20 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">What are you looking for today?</h1>
          <p className="text-lg text-slate-500 mb-10">Discover local student-run businesses and essentials on campus.</p>
          <form onSubmit={handleSearch} className="relative group max-w-3xl mx-auto flex items-center bg-white rounded-2xl shadow-lg shadow-[#1111d4]/5 focus-within:ring-1 focus-within:ring-[#1111d4] h-[64px]">
            <div className="pl-5 flex items-center justify-center"><MaterialIcon name="search" className="text-slate-400 group-focus-within:text-[#1111d4]" size={24} /></div>
            <select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="bg-transparent border-none outline-none font-bold text-slate-700 pl-4 pr-1 py-4 focus:ring-0 cursor-pointer text-sm">
              <option value="products">Products</option><option value="stores">Stores</option>
            </select>
            <div className="w-px h-8 bg-slate-200 mx-1"></div>
            <input className="flex-1 w-full pl-3 pr-4 py-4 bg-transparent border-none outline-none text-base placeholder-slate-300" placeholder={searchType === 'stores' ? "Search for student-run stores..." : "Search textbooks, tech, food, and more..."} type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <div className="pr-2"><button type="submit" className="h-[48px] px-8 bg-[#1111d4] text-white font-bold rounded-xl hover:bg-[#0d0db0] transition-all active:scale-95 border-none cursor-pointer">Search</button></div>
          </form>
        </section>

        <section className="mb-16">
          <div className="flex items-center justify-between mb-8"><h2 className="text-2xl font-bold tracking-tight text-slate-900">Featured Categories</h2></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[{name:'Textbooks',icon:'menu_book',img:'https://lh3.googleusercontent.com/aida-public/AB6AXuCD7XK9IjLYp7nxDE8Ao0Aq-otKi9YUn6TmoW5iLlepNmLK8czWkFZzfVGQwaMRxM4nVtOJsNoH_IaWsXkK-TsC9WqR4xEy0hKt0EoLGgD6cJHSInJC-vXOl2sTFkpuTyD3KQw8MfB_qHMXWJlVp_GLJfLc4af-Mu29qnwowo-LVssAMvyFPJMOUOhPylhY8vjf3w-_qA1u5Psszyzv1FhtHe3XxCXmq_VGlY4yr0US1w7-c6A-nM0HNIkuTSWmkfQhDRp3D90YNQ'},{name:'Tech',icon:'devices',img:'https://lh3.googleusercontent.com/aida-public/AB6AXuAZcKZoE9md5_ik2-FQhWcf93ZrVjWTYHRrxyzMadC7bUY2R-gzUg1RRDIWcSDbp-bhCcN7gafEY3_gY2Al11vDidJcqW94E6srooEUP5RtMXJIdav3qNtlx9cx6B4isKH-BicCUMhSPcrGYCaLnDx6V9jHjUDBe5cqmXsGKXnE-K3Ne1_QE6VIlbyV7RUcnTS2W8m4BzjjJzHCvI-cGJxx5iYiPdurqwpEtVOyojxwigJ1RFOxrxHs_UqucOd9UNdAS9wzP6g-Aw'},{name:'Food',icon:'restaurant',img:'https://lh3.googleusercontent.com/aida-public/AB6AXuBXMk3n8Cn0Ae3xvskSC0XfcF-EpJqsDioiDJ84H-G6JMG9XiMpLgBwRXWSE3FFg9S3RV9_vbUF3XcA51PCysYBbtLgzyhazpqnVtqt4B1iR3jV37dqrY6kI9bI6BbBvkR5LCp86siiBY8iwzcsTgutY2CymEEv2HKZSZAE5zDtBjXfPErOAbkeSl_Xfrtg8qB49eG7IAHIB3phDsr0rE9vJYUTIKyHmFSGX2QzX3Kny93UtvI5dxlzrvspEPkQGfO8gQHiTryTvw'},{name:'Services',icon:'design_services',img:'https://lh3.googleusercontent.com/aida-public/AB6AXuBF8g043J-vg8umvuJziYJCWsii_-EYUQkY4L6PrtpICL-emNY6HneQspoqUkkNzqOdLoG3oYhrOdQT96jJNuMwbtCVq9SVRJo6b-R0xuPyDUQNZIGkL4KTPbgs_anHQRVM0t2u7nxjhBfvbB3DZHWO-9LV5BMRA0wVabY9Xrz7ruzj9CHrvnML8pNhs5eX4cK4HlMqD0WANQgUlxZhL3_rayBnmRpcIAG_XfLnjMaUQ_1WlKaFfyJQLIDWGORXCjBO10QGHwjPtw'}].map((cat) => (
              <Link key={cat.name} className="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-slate-200 no-underline shadow-sm" to="#">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
                <img className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={cat.img} alt={cat.name} />
                <div className="absolute bottom-4 left-4 z-20"><MaterialIcon name={cat.icon} className="text-white mb-2" size={24} /><h3 className="text-white font-bold text-lg">{cat.name}</h3></div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="mb-8"><h2 className="text-2xl font-bold tracking-tight text-slate-900">New on Campus</h2><p className="text-slate-500 font-medium mt-1 text-sm">Support your fellow students and discover fresh hustle.</p></div>
          {stores.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stores.map((store) => {
                const statusTag = store.status === 'ACTIVE' ? { label: 'Active', color: 'bg-green-100 text-green-700' } : { label: 'New', color: 'bg-blue-100 text-blue-700' };
                return (
                  <Link key={store._id} to={`/store/${encodeURIComponent(store.storeName)}`} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 no-underline text-inherit">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100">
                        {store.logoUrl ? <img alt={store.storeName} className="w-full h-full object-cover" src={store.logoUrl} /> : <span className="text-2xl font-black text-[#1111d4]">{store.storeName?.charAt(0)}</span>}
                      </div>
                      <div><h3 className="font-bold text-lg text-slate-900 leading-tight">{store.storeName}</h3><span className={`inline-block px-2 py-0.5 mt-1 ${statusTag.color} text-[10px] font-bold uppercase tracking-wider rounded`}>{statusTag.label}</span></div>
                    </div>
                    <p className="text-slate-500 font-medium mb-6 text-sm leading-relaxed line-clamp-2">{store.description || 'Check out this student-run store!'}</p>
                    <span className="block w-full py-2.5 rounded-lg text-[#1111d4] font-bold text-center hover:bg-[#1111d4] hover:text-white transition-all">Visit Store</span>
                  </Link>
                );
              })}
            </div>
          ) : <div className="text-center py-16 text-slate-400"><span className="material-symbols-outlined text-5xl mb-3 opacity-40">storefront</span><p className="text-sm font-bold text-slate-500">No stores yet</p></div>}
        </section>

        <section className="mb-16">
          <div className="flex items-center justify-between mb-8"><h2 className="text-2xl font-bold tracking-tight text-slate-900">Trending Now</h2><Link className="text-[#1111d4] font-bold text-sm hover:underline no-underline" to="/customer/products">View All</Link></div>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((prod) => {
                const isFavorite = user?.savedItems?.includes(prod._id);
                return (
                  <Link key={prod._id} to={`/customer/products/${prod._id}`} className="group cursor-pointer no-underline text-inherit">
                    <div className="relative rounded-3xl overflow-hidden aspect-square bg-slate-100 mb-4 shadow-sm group-hover:shadow-lg transition-all duration-500">
                      {prod.imageUrl ? <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={prod.imageUrl} alt={prod.name} /> : <div className="w-full h-full flex items-center justify-center bg-slate-100"><span className="material-symbols-outlined text-6xl text-slate-300">image</span></div>}
                      <button onClick={(e) => handleToggleFavorite(e, prod._id)} className={`absolute top-3 right-3 w-10 h-10 backdrop-blur rounded-xl flex items-center justify-center transition-all shadow-md active:scale-90 border-none cursor-pointer z-20 ${isFavorite ? 'bg-rose-500 text-white' : 'bg-white/95 text-slate-300 hover:text-rose-500'}`}>
                        <MaterialIcon name="favorite" size={20} fill={isFavorite} />
                      </button>
                    </div>
                    <div className="space-y-1.5 px-0.5">
                      <p className="text-[10px] font-bold text-[#1111d4] uppercase tracking-widest">{prod.type || 'General'}</p>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight truncate">{prod.name}</h3>
                      <div className="flex items-center justify-between pt-1"><span className="text-lg font-black text-slate-900">${Number(prod.price).toFixed(2)}</span><span className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center group-hover:bg-[#1111d4] transition-all shadow-md"><MaterialIcon name="add_shopping_cart" size={20} /></span></div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : <div className="text-center py-16 text-slate-400"><span className="material-symbols-outlined text-5xl mb-3 opacity-40">shopping_bag</span><p className="text-sm font-bold text-slate-500">No products yet</p></div>}
        </section>

        <section className="bg-[#1111d4] rounded-[32px] p-8 md:p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-[#1111d4]/20">
          <div className="absolute inset-0 bg-white/10 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight tracking-tight">Ready to start your own hustle?</h2>
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto font-medium">Join thousands of students earning extra cash by selling textbooks, skills, or treats on campus.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => navigate('/stores')} className="px-10 py-4 bg-white text-[#1111d4] font-bold rounded-xl text-lg hover:shadow-2xl hover:scale-105 transition-all active:scale-95 border-none cursor-pointer">Buy Products</button>
              <button onClick={() => navigate('/customer/contact')} className="px-10 py-4 bg-white/10 backdrop-blur-md border border-white/40 text-white font-bold rounded-xl text-lg hover:bg-white/20 hover:scale-105 transition-all active:scale-95 border-none cursor-pointer">Contact Us</button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
