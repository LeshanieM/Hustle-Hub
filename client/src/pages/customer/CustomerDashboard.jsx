import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const CustomerDashboard = () => {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState({
        topShops: [
            { _id: '1', storeName: 'The Coffee Lab', orderCount: 45, rating: 4.9, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=200' },
            { _id: '2', storeName: 'Print Master', orderCount: 32, rating: 4.7, image: 'https://images.unsplash.com/photo-1562654501-a0ccc0af3fb1?auto=format&fit=crop&q=80&w=200' },
            { _id: '3', storeName: 'Campus Roll', orderCount: 28, rating: 4.8, image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=200' }
        ],
        topProducts: [
            { _id: 'p1', title: 'Finals Cram Study Kit', price: 14.99, totalSold: 120, category: 'Stationary', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=400' },
            { _id: 'p2', title: 'Midnight Beef Burger', price: 8.50, totalSold: 85, category: 'Food', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400' }
        ]
    });
    const [myOrders, setMyOrders] = useState([
        { _id: 'HH-7829', shopName: 'The Coffee Lab', items: 2, totalAmount: 12.40, status: 'On the way', date: 'Oct 24, 2023', estimatedArrival: '12:45 PM' },
        { _id: 'HH-7830', shopName: 'Student Canteen', items: 1, totalAmount: 6.50, status: 'Completed', date: 'Oct 22, 2023' }
    ]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Dev bypass or role check
        const isDev = process.env.NODE_ENV === 'development';
        if (!isDev && (!user || user.role !== 'customer')) {
            // In a real app, you might want to redirect, but for now we follow the pattern
        }

        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const config = { headers: { Authorization: `Bearer ${token}` } };
                    const [dashboardRes, ordersRes] = await Promise.all([
                        axios.get('http://localhost:5000/api/customer/dashboard'),
                        axios.get('http://localhost:5000/api/orders/myorders', config)
                    ]);
                    setDashboardData(dashboardRes.data);
                    setMyOrders(ordersRes.data);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching customer dashboard, using mock data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (loading) return <div className="p-8 text-center font-bold animate-pulse text-primary">Hustle Hub - Loading Dashboard...</div>;

    const activeOrders = myOrders.filter(o => o.status !== 'Completed' && o.status !== 'Delivered' && o.status !== 'cancelled');
    const pastOrders = myOrders.filter(o => o.status === 'Completed' || o.status === 'Delivered');

    return (
        <div className="flex flex-col h-full bg-white text-black antialiased font-display">
            <div className="flex h-[calc(100vh-140px)] overflow-hidden">
                {/* Sidebar Navigation */}
                <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden lg:flex">
                    <div className="p-6 flex items-center gap-3">
                        <div className="bg-primary text-white p-2 rounded-lg">
                            <span className="material-symbols-outlined block">bolt</span>
                        </div>
                        <h2 className="text-xl font-black tracking-tight text-primary">Hustle Hub</h2>
                    </div>
                    <nav className="flex-1 px-4 space-y-2 mt-4">
                        <Link className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary font-semibold" to="/customer-dashboard">
                            <span className="material-symbols-outlined">dashboard</span>
                            <span>Dashboard</span>
                        </Link>
                        <Link className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors" to="/my-orders">
                            <span className="material-symbols-outlined">shopping_bag</span>
                            <span>Orders</span>
                        </Link>
                        <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors" href="#">
                            <span className="material-symbols-outlined">favorite</span>
                            <span>Favorites</span>
                        </a>
                        <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors" href="#">
                            <span className="material-symbols-outlined">person</span>
                            <span>Profile</span>
                        </a>
                        <div className="pt-4 mt-4 border-t border-slate-100">
                            <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors" href="#">
                                <span className="material-symbols-outlined">settings</span>
                                <span>Settings</span>
                            </a>
                        </div>
                    </nav>
                    <div className="p-4 mt-auto">
                        <div className="bg-primary/5 rounded-2xl p-4">
                            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Campus Points</p>
                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-black text-black">1,240</span>
                                <span className="material-symbols-outlined text-primary">stars</span>
                            </div>
                        </div>
                        <button className="w-full mt-4 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition-all">
                            <span>View Profile</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto custom-scrollbar">

                    <div className="p-8 max-w-7xl mx-auto space-y-8">
                        {/* Welcome Section */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h1 className="text-4xl font-black tracking-tight text-black">Ready for your next hustle, {user?.name?.split(' ')[0] || 'Alex'}? ⚡️</h1>
                                <p className="text-slate-500 mt-1">You have {activeOrders.length} active orders and a delivery arriving soon.</p>
                            </div>
                            <div className="flex gap-2">
                                <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col min-w-[140px]">
                                    <span className="text-xs font-bold text-slate-400 uppercase">This Week</span>
                                    <span className="text-xl font-bold">{myOrders.length} Orders</span>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col min-w-[140px]">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Savings</span>
                                    <span className="text-xl font-bold text-green-600">$42.50</span>
                                </div>
                            </div>
                        </div>

                        {/* Active Orders Tracking Widget */}
                        {activeOrders.length > 0 && (
                            <section>
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">local_shipping</span>
                                    Active Orders
                                </h3>
                                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                                                <span className="material-symbols-outlined">coffee</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg leading-none">{activeOrders[0].shopName || 'Campus Store'}</p>
                                                <p className="text-sm text-slate-500">Order #{activeOrders[0]._id.slice(-6)} • {activeOrders[0].items} items</p>
                                            </div>
                                        </div>
                                        <div className="text-left md:text-right">
                                            <p className="text-xs font-bold text-primary uppercase tracking-wider">Estimated Arrival</p>
                                            <p className="text-xl font-black">{activeOrders[0].estimatedArrival || '12:45 PM'}</p>
                                        </div>
                                    </div>
                                    {/* Timeline */}
                                    <div className="relative flex flex-col md:flex-row justify-between items-center w-full px-4">
                                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 hidden md:block"></div>
                                        <div className="absolute top-1/2 left-0 w-3/4 h-1 bg-primary -translate-y-1/2 hidden md:block transition-all duration-500"></div>
                                        {/* Step 1 */}
                                        <div className="relative z-10 flex flex-col items-center gap-2 group mb-4 md:mb-0">
                                            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center ring-4 ring-white">
                                                <span className="material-symbols-outlined text-sm">check</span>
                                            </div>
                                            <span className="text-xs font-bold">Placed</span>
                                        </div>
                                        {/* Step 2 */}
                                        <div className="relative z-10 flex flex-col items-center gap-2 group mb-4 md:mb-0">
                                            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center ring-4 ring-white">
                                                <span className="material-symbols-outlined text-sm">check</span>
                                            </div>
                                            <span className="text-xs font-bold">Preparing</span>
                                        </div>
                                        {/* Step 3 */}
                                        <div className="relative z-10 flex flex-col items-center gap-2 group mb-4 md:mb-0">
                                            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center ring-4 ring-primary/20 animate-pulse">
                                                <span className="material-symbols-outlined text-base">delivery_dining</span>
                                            </div>
                                            <span className="text-xs font-bold text-primary">On the way</span>
                                        </div>
                                        {/* Step 4 */}
                                        <div className="relative z-10 flex flex-col items-center gap-2 group opacity-40">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center ring-4 ring-white">
                                                <span className="material-symbols-outlined text-sm">inventory_2</span>
                                            </div>
                                            <span className="text-xs font-bold">Delivered</span>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Favorite/Top Shops Section */}
                            <section className="lg:col-span-1">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold">Recommended Shops</h3>
                                    <a className="text-primary text-sm font-bold hover:underline" href="#">View All</a>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {dashboardData.topShops.map(shop => (
                                        <div key={shop._id} className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col items-center text-center group cursor-pointer hover:border-primary/40 transition-all border-l-4 border-l-primary/10">
                                            <div className="w-16 h-16 rounded-2xl bg-slate-100 mb-3 flex items-center justify-center overflow-hidden">
                                                <img alt={shop.storeName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={shop.image} />
                                            </div>
                                            <p className="font-bold text-sm truncate w-full">{shop.storeName}</p>
                                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[12px] fill-yellow-400 text-yellow-400">star</span> {shop.rating || '4.8'}
                                            </p>
                                        </div>
                                    ))}
                                    <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col items-center justify-center border-dashed border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer group">
                                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">add_circle</span>
                                        <p className="text-xs font-bold text-slate-500 mt-2">Discover</p>
                                    </div>
                                </div>
                            </section>

                            {/* Recommended for You Section */}
                            <section className="lg:col-span-2">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold">Trending Items</h3>
                                    <div className="flex gap-2">
                                        <button className="p-1 rounded-lg bg-white border border-slate-200">
                                            <span className="material-symbols-outlined text-black">chevron_left</span>
                                        </button>
                                        <button className="p-1 rounded-lg bg-white border border-slate-200">
                                            <span className="material-symbols-outlined text-black">chevron_right</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {dashboardData.topProducts.map(product => (
                                        <div key={product._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex shadow-sm group hover:shadow-md transition-shadow">
                                            <div className="w-1/3 h-full overflow-hidden">
                                                <img alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={product.image} />
                                            </div>
                                            <div className="p-4 flex-1 flex flex-col">
                                                <div className="flex-1">
                                                    <p className={`text-xs font-bold uppercase mb-1 ${product.category === 'Food' ? 'text-orange-500' : 'text-primary'}`}>{product.category}</p>
                                                    <h4 className="font-bold text-base line-clamp-1">{product.title}</h4>
                                                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{product.totalSold} items sold recently</p>
                                                </div>
                                                <div className="flex items-center justify-between mt-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-lg font-black text-black">${product.price}</span>
                                                        {product.category === 'Food' && <span className="text-[10px] text-green-600 font-bold">10% Off for Students</span>}
                                                    </div>
                                                    <button className="bg-primary text-white p-2 rounded-lg hover:bg-primary/90 transition-colors">
                                                        <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Special Offer Banner */}
                                <div className="mt-6 relative rounded-2xl bg-primary overflow-hidden p-8 text-white">
                                    <div className="relative z-10 max-w-sm">
                                        <h4 className="text-2xl font-black mb-2 leading-tight">Join the Campus Hustle Program!</h4>
                                        <p className="text-white/80 text-sm mb-6">Earn double points on all orders from student-run businesses this weekend.</p>
                                        <button className="bg-white text-primary px-6 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all outline-none">
                                            Learn More
                                        </button>
                                    </div>
                                    <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-10 translate-y-10">
                                        <span className="material-symbols-outlined text-[200px]">rocket_launch</span>
                                    </div>
                                    <div className="absolute top-0 right-0 p-4">
                                        <div className="w-32 h-32 rounded-full bg-white/10 blur-3xl"></div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Recent Activity Feed */}
                        <section className="pb-8">
                            <h3 className="text-xl font-bold mb-4">Past Purchases</h3>
                            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b border-slate-100">
                                            <th className="px-6 py-4">Item</th>
                                            <th className="px-6 py-4">Shop</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Total</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {pastOrders.map((order, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-sm">{idx === 0 ? 'print' : 'lunch_dining'}</span>
                                                        </div>
                                                        <span className="font-bold text-sm">{idx === 0 ? 'Thesis Printing' : 'Campus Meal Deal'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium">{order.shopName}</td>
                                                <td className="px-6 py-4 text-sm text-slate-500">{order.date}</td>
                                                <td className="px-6 py-4 text-sm font-bold">${order.totalAmount}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded-full">{order.status}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-primary font-bold text-xs hover:underline opacity-0 group-hover:opacity-100 transition-opacity">Reorder</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CustomerDashboard;
