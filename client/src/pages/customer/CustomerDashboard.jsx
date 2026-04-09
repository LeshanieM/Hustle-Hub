import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import TableComponent from '../../components/dashboard/TableComponent';

import Footer from '../../components/Footer';
import CustomerHeader from '../../components/CustomerHeader';
import OwnerHeader from '../../components/OwnerHeader';
import AdminHeader from '../../components/AdminHeader';

const CustomerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const getTopHeader = () => {
        if (!user) return CustomerHeader;
        switch(user.role) {
            case 'ADMIN': return AdminHeader;
            case 'OWNER': return OwnerHeader;
            default: return CustomerHeader;
        }
    };

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



    const spendingData = {
        totalSpent: orderHistory.reduce((sum, order) => sum + (order.total_price || 0), 0)
    };
    const orders = orderHistory.slice(0, 5);

    const OrderCard = ({ order }) => (
        <div className="flex justify-between items-center p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                    <span className="material-symbols-outlined">receipt_long</span>
                </div>
                <div>
                    <h4 className="font-bold text-sm text-slate-900">{order.product_id?.name || 'Order'} - {order.product_id?.storefront_id?.storeName || 'Store'}</h4>
                    <p className="text-xs text-slate-400 font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="font-black text-slate-900 text-sm">${(order.total_price || 0).toFixed(2)}</p>
                <p className={`text-[10px] font-black uppercase tracking-widest ${order.status === 'completed' ? 'text-emerald-500' : 'text-amber-500'}`}>{order.status}</p>
            </div>
        </div>
    );

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                
                const [ordersRes, dashboardRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/bookings/my', config).catch(() => ({ data: [] })),
                    axios.get('http://localhost:5000/api/customer/dashboard', config).catch(() => ({ data: null }))
                ]);

                const allOrders = ordersRes.data || [];
                const active = allOrders.filter(o => ['pending', 'confirmed'].includes(o.status));
                const history = allOrders.filter(o => ['completed', 'cancelled'].includes(o.status));
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
       { label: 'My Orders', icon: 'shopping_bag', path: '/orders' },
        { label: 'Saved Items', icon: 'favorite', path: '/saved-items' },
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
            TopHeader={getTopHeader()}
            showSearch={false}
        >
            <div className="space-y-10">
                 {/* Welcome Message */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black text-slate-900">Welcome back, {user?.firstName || 'Student'}!</h1>
                    <p className="text-slate-500 font-medium pb-2">Here's your personal shopping activity and campus hustle overview.</p>
                </div>
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Orders" value={stats.totalOrders} icon="receipt_long" color="blue" />
                    <StatCard title="Active Orders" value={activeOrders.length} icon="local_shipping" color="amber" />
                    <StatCard title="Saved Products" value={stats.savedProducts} icon="favorite" color="rose" />
                    <StatCard title="Favorite Shops" value={stats.favoriteShops} icon="storefront" color="emerald" />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                    {/* Left Column - Orders & Activity */}
                    <div className="xl:col-span-2 space-y-10">


                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Orders List (Takes up 2 columns) */}
                            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 relative overflow-hidden">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-slate-900">Recent Purchase History</h3>
                                    {orders.length > 0 && <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{orders.length} Total</span>}
                                </div>
                                {orders.length === 0 ? (
                                    <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                        <span className="material-symbols-outlined text-5xl mb-4 text-[#1111d4]/30">shopping_cart</span>
                                        <p className="text-slate-900 font-bold mb-2">No past orders found</p>
                                        <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">Discover amazing products and services on our marketplace to get started.</p>
                                        <Link to="/stores" className="px-6 py-2.5 bg-[#1111d4] text-white rounded-full text-sm font-bold hover:bg-indigo-700 transition-colors">
                                            Explore Marketplace
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                        {orders.map((order) => (
                                            <OrderCard key={order._id} order={order} />
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            {/* Spending Insights & Tools */}
                            <div className="space-y-6">
                                <div className="bg-white rounded-2xl border border-slate-200 p-6 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform"></div>
                                    <h3 className="text-base font-bold text-slate-900 mb-6 relative z-10 flex items-center justify-between">
                                        Spending Insights
                                        <span className="material-symbols-outlined text-emerald-500 text-sm bg-emerald-50 p-1.5 rounded-full">monitoring</span>
                                    </h3>
                                    
                                    <div className="mb-6 relative z-10">
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Spent</p>
                                        <p className="text-3xl font-black text-slate-900">${spendingData.totalSpent.toFixed(2)}</p>
                                    </div>
                                    
                                </div>
                            </div>
                        </div>
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
                                            <h4 className="text-2xl font-black text-slate-900">{activeOrders[0].product_id?.storefront_id?.storeName || 'Shop'}</h4>
                                            <p className="text-sm font-bold text-slate-400">Order #{activeOrders[0]._id.slice(-6)} • {activeOrders[0].status}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none mb-1">Estimated Arrival</p>
                                             <p className="text-2xl font-black text-slate-900">{activeOrders[0].delivery_time || 'Soon'}</p>
                                        </div>
                                     </div>
                                     
                                    
                                     <div className="h-3 bg-slate-100 rounded-full overflow-hidden relative">
                                        <div 
                                          className="absolute top-0 left-0 h-full bg-indigo-600 transition-all duration-1000"
                                          style={{ width: activeOrders[0].status === 'confirmed' ? '75%' : '25%' }}
                                        ></div>
                                     </div>
                                     <div className="flex justify-between mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <span className="text-indigo-600">Placed</span>
                                        <span className={['pending', 'confirmed'].includes(activeOrders[0].status) ? 'text-indigo-600' : ''}>Preparing</span>
                                        <span className={activeOrders[0].status === 'confirmed' ? 'text-indigo-600' : ''}>On the way</span>
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
                                    <td className="px-6 py-4 font-bold text-slate-600 text-sm">{order.product_id?.storefront_id?.storeName || 'Unknown Shop'}</td>
                                    <td className="px-6 py-4 text-slate-400 text-xs font-bold">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-black text-sm">${(order.total_price || 0).toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                            order.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
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
