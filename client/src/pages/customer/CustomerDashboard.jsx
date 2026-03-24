import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import TableComponent from '../../components/dashboard/TableComponent';
import ChartCard from '../../components/dashboard/ChartCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Footer from '../../components/Footer';
import CustomerHeader from '../../components/CustomerHeader';

const CustomerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    
    // Data State
    const [stats, setStats] = useState({
        totalOrders: 0,
        activeOrdersCount: 0,
        savedProducts: 0,
        favoriteShops: 0
    });

    const [activeOrders, setActiveOrders] = useState([]);
    const [orderHistory, setOrderHistory] = useState([]);

    const [savedItems, setSavedItems] = useState([]);
    const [favoriteShops, setFavoriteShops] = useState([]);

    const [insightsData] = useState([
        { name: 'Mon', count: 1 },
        { name: 'Tue', count: 2 },
        { name: 'Wed', count: 0 },
        { name: 'Thu', count: 3 },
        { name: 'Fri', count: 5 },
        { name: 'Sat', count: 2 },
        { name: 'Sun', count: 1 },
    ]);

    const [notifications] = useState([
        { id: 1, text: "Your order from The Coffee Lab is on the way!", time: "2 mins ago", type: "order" },
        { id: 2, text: "New promotion: 20% off at Print Master", time: "1 hour ago", type: "promo" }
    ]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                
                const [ordersRes, dashboardRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/orders/myorders', config).catch(() => ({ data: [] })),
                    axios.get('http://localhost:5000/api/customer/dashboard', config).catch(() => ({ data: null }))
                ]);

                const allOrders = ordersRes.data || [];
                const active = allOrders.filter(o => !['Completed', 'Delivered', 'Cancelled', 'cancelled'].includes(o.status));
                const history = allOrders.filter(o => ['Completed', 'Delivered', 'Cancelled', 'cancelled'].includes(o.status));
                
                setActiveOrders(active);
                setOrderHistory(history);

                if (dashboardRes.data) {
                    setStats({
                        totalOrders: allOrders.length,
                        activeOrdersCount: active.length,
                        savedProducts: dashboardRes.data.savedProductsCount || 0,
                        favoriteShops: dashboardRes.data.favoriteShopsCount || 0
                    });
                    if (dashboardRes.data.savedItems) setSavedItems(dashboardRes.data.savedItems);
                    if (dashboardRes.data.favoriteShops) setFavoriteShops(dashboardRes.data.favoriteShops);
                } else {
                    // Fallback using just orders data
                    setStats(prev => ({
                        ...prev,
                        totalOrders: allOrders.length,
                        activeOrdersCount: active.length
                    }));
                }
            } catch (error) {
                console.error('Data mapping failed.', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const removeSavedItem = (id) => {
        setSavedItems(prev => prev.filter(item => item._id !== id));
        setStats(prev => ({ ...prev, savedProducts: prev.savedProducts - 1 }));
    };

    const sidebarItems = [
        { label: 'Dashboard', icon: 'dashboard', path: '/customer-dashboard' },
        { label: 'My Orders', icon: 'shopping_bag', path: '/customer-dashboard' }, // Adjusted for single page view
        { label: 'Saved Items', icon: 'favorite', path: '/customer-dashboard' },
        { label: 'Settings', icon: 'settings', path: '/profile' },
    ];

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-bold text-slate-400">Loading your hustle...</p>
            </div>
        </div>
    );

    return (
        <DashboardLayout 
            role="Customer" 
            headerTitle="Customer Overview"
            sidebarItems={sidebarItems}
            TopHeader={CustomerHeader}
        >
            <div className="space-y-10">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Orders" value={stats.totalOrders} icon="receipt_long" trend="up" trendValue="+2" color="blue" />
                    <StatCard title="Active Orders" value={activeOrders.length} icon="local_shipping" color="amber" />
                    <StatCard title="Saved Products" value={stats.savedProducts} icon="favorite" color="rose" />
                    <StatCard title="Favorite Shops" value={stats.favoriteShops} icon="storefront" color="emerald" />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                    {/* Left Column - Orders & Activity */}
                    <div className="xl:col-span-2 space-y-10">
                        {/* Active Order Tracker */}
                        <section>
                            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <span className="material-symbols-outlined text-indigo-600">local_shipping</span>
                                Active Order Status
                            </h3>
                            {activeOrders.length > 0 ? (
                                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
                                     <div className="flex justify-between items-start mb-8">
                                        <div>
                                            <h4 className="text-2xl font-black text-slate-900">{activeOrders[0].shopName}</h4>
                                            <p className="text-sm font-bold text-slate-400">Order #{activeOrders[0]._id.slice(-6)} • {activeOrders[0].status}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none mb-1">Estimated Arrival</p>
                                            <p className="text-2xl font-black text-slate-900">{activeOrders[0].estimatedArrival || 'Soon'}</p>
                                        </div>
                                     </div>
                                     
                                     {/* Simple Progress Bar */}
                                     <div className="h-3 bg-slate-100 rounded-full overflow-hidden relative">
                                        <div 
                                          className="absolute top-0 left-0 h-full bg-indigo-600 transition-all duration-1000"
                                          style={{ width: activeOrders[0].status === 'On the way' ? '75%' : '25%' }}
                                        ></div>
                                     </div>
                                     <div className="flex justify-between mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <span className="text-indigo-600">Placed</span>
                                        <span>Preparing</span>
                                        <span className={activeOrders[0].status === 'On the way' ? 'text-indigo-600' : ''}>On the way</span>
                                        <span>Delivered</span>
                                     </div>
                                </div>
                            ) : (
                                <div className="p-12 border-2 border-dashed border-slate-100 rounded-[32px] text-center bg-slate-50/30">
                                    <p className="font-bold text-slate-400">You don't have any active orders right now.</p>
                                    <button onClick={() => navigate('/customer/products')} className="mt-4 text-indigo-600 font-black hover:underline">Start Shopping →</button>
                                </div>
                            )}
                        </section>

                        {/* Order History */}
                        <TableComponent 
                            title="Order History"
                            headers={['Order ID', 'Shop', 'Date', 'Amount', 'Status', 'Action']}
                            data={orderHistory}
                            renderRow={(order) => (
                                <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-black text-sm">#{order._id.slice(-6)}</td>
                                    <td className="px-6 py-4 font-bold text-slate-600 text-sm">{order.shopName}</td>
                                    <td className="px-6 py-4 text-slate-400 text-xs font-bold">{new Date(order.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-black text-sm">${order.totalAmount.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                            order.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-indigo-600 font-black text-xs hover:underline">Reorder</button>
                                    </td>
                                </tr>
                            )}
                            actions={
                                <select className="bg-slate-50 border-none rounded-lg text-[11px] font-black px-3 py-1.5 focus:ring-1 focus:ring-indigo-600 outline-none">
                                    <option>Last 30 Days</option>
                                    <option>Last 6 Months</option>
                                </select>
                            }
                        />

                        {/* Saved Items */}
                        <section>
                            <h3 className="text-xl font-black text-slate-900 mb-6">Saved for Later</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {savedItems.length > 0 ? savedItems.map(item => (
                                    <div key={item._id} className="bg-white rounded-3xl border border-slate-100 shadow-sm flex overflow-hidden hover:shadow-lg transition-all group">
                                        <div className="w-24 h-24 shrink-0 overflow-hidden">
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="p-4 flex-1 flex flex-col justify-between">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h5 className="font-black text-slate-900 text-sm leading-tight truncate w-32">{item.title}</h5>
                                                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{item.category}</p>
                                                </div>
                                                <button onClick={() => removeSavedItem(item._id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                                                    <span className="material-symbols-outlined text-lg">close</span>
                                                </button>
                                            </div>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="font-black text-slate-900 text-lg">${item.price}</span>
                                                <button className="px-3 py-1.5 bg-indigo-600 text-white font-black text-[10px] rounded-lg shadow-md shadow-indigo-100 hover:brightness-110 active:scale-95 transition-all">Add to Cart</button>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full py-12 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 text-center font-bold text-slate-400">
                                        No saved items yet. Start exploring!
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right Column - Insights & Notifications */}
                    <div className="space-y-10">
                        {/* Notifications */}
                        <section className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center justify-between">
                                Notifications
                                <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-black rounded-full">{notifications.length} New</span>
                            </h3>
                            <div className="space-y-4">
                                {notifications.map(note => (
                                    <div key={note.id} className="flex gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group">
                                        <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${
                                            note.type === 'order' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                                        }`}>
                                            <span className="material-symbols-outlined text-lg">
                                                {note.type === 'order' ? 'local_shipping' : 'campaign'}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-900 line-clamp-2 leading-tight">{note.text}</p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-1">{note.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-6 py-3 border border-slate-100 rounded-2xl text-[11px] font-black text-slate-400 hover:border-indigo-600 hover:text-indigo-600 transition-all uppercase tracking-widest">View All Activity</button>
                        </section>

                        {/* Insights Panel */}
                        <ChartCard title="Ordering Patterns" subtitle="Your activity over the last 7 days" height="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={insightsData}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}}
                                    />
                                    <YAxis hide />
                                    <Tooltip 
                                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                        itemStyle={{fontSize: '12px', fontWeight: 900, color: '#4f46e5'}}
                                    />
                                    <Area type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        {/* Favorite Shops Quick View */}
                        <section className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                            <h3 className="text-lg font-black text-slate-900 mb-6">Favorite Shops</h3>
                            <div className="grid grid-cols-3 gap-4">
                                {favoriteShops.map(shop => (
                                    <div key={shop._id} className="flex flex-col items-center group cursor-pointer">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-50 overflow-hidden mb-2 border border-slate-50 group-hover:scale-110 transition-transform duration-300">
                                            <img src={shop.image} alt={shop.storeName} className="w-full h-full object-cover" />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-900 truncate w-full text-center">{shop.storeName}</span>
                                    </div>
                                ))}
                                <button className="flex flex-col items-center group">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all border border-dashed border-slate-200">
                                        <span className="material-symbols-outlined">add</span>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 mt-2">Explore</span>
                                </button>
                            </div>
                        </section>
                    </div>
                </div>

                <Footer />
            </div>
        </DashboardLayout>
    );
};

export default CustomerDashboard;
