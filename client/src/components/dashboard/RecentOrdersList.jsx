import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const RecentOrdersList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('token');
                // Use existing endpoint for bookings as owner
                const res = await axios.get('http://localhost:5000/api/bookings/owner/my-orders?status=pending', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Assuming it returns an array of pending orders
                setOrders(res.data.slice(0, 5) || []); // Limit to 5
            } catch (err) {
                console.error('Failed to fetch orders:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden min-h-[200px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1111d4]"></div>
            </div>
        );
    }

    return (
        <div className="bg-white backdrop-blur-3xl rounded-[2rem] border border-slate-200 shadow-2xl relative overflow-hidden flex flex-col h-full group">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
            <div className="p-7 border-b border-slate-200/50 flex items-center justify-between bg-white/50 z-10">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#1111d4]">shopping_bag</span>
                        Pending Orders
                    </h3>
                    {orders.length > 0 && (
                        <span className="bg-[#1111d4]/10 text-[#1111d4] text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                            {orders.length}
                        </span>
                    )}
                </div>
                <Link to="/orders" className="text-xs font-bold text-[#1111d4] hover:underline">
                    View All
                </Link>
            </div>
            
            <div className="flex-1 overflow-x-auto custom-scrollbar relative z-10 px-2 pb-2">
                <table className="w-full text-left">
                    <thead className="text-slate-400 text-[10px] font-bold uppercase tracking-wider sticky top-0 bg-white/95 backdrop-blur z-20">
                        <tr>
                            <th className="px-5 py-4 border-b border-slate-100">Order ID</th>
                            <th className="px-5 py-4 border-b border-slate-100">Item</th>
                            <th className="px-5 py-4 border-b border-slate-100 text-right">Price</th>
                            <th className="px-5 py-4 border-b border-slate-100 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/50">
                        {orders.length > 0 ? (
                            orders.map((order) => (
                                <tr key={order._id} className="hover:bg-slate-50/50 transition-colors group/row">
                                    <td className="px-5 py-4 text-[12px] font-black text-slate-500">
                                        #{order._id.slice(-6)}
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className="font-bold text-slate-900 text-[13px] truncate max-w-[150px]">
                                            {order.product_id?.name || 'Unknown Product'}
                                        </p>
                                        <p className="text-[10px] font-semibold text-slate-400">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </td>
                                    <td className="px-5 py-4 text-right font-black text-slate-900 text-[13px]">
                                        ${(order.total_price || 0).toFixed(2)}
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        <button className="text-[11px] font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer border-none flex items-center gap-1 mx-auto">
                                            <span className="material-symbols-outlined text-[14px]">check</span>
                                            Mark Ready
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-5 py-10 text-center text-slate-500">
                                    <span className="material-symbols-outlined text-4xl mb-2 opacity-30 block text-[#1111d4]">inbox</span>
                                    <p className="text-sm font-bold text-slate-900 mb-1">Queue cleared!</p>
                                    <p className="text-xs text-slate-400">You have no pending orders at the moment.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentOrdersList;
