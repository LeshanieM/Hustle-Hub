import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const OwnerDashboard = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/orders/owner', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrders(res.data);
            } catch (error) {
                console.error(error);
                // Mock data for offline/demo mode
                const mockOrders = [
                    { _id: 'ord_001', customerId: { name: 'John Doe' }, totalAmount: 120, status: 'pending', deliveryLocation: 'Block A, Room 101' },
                    { _id: 'ord_002', customerId: { name: 'Jane Smith' }, totalAmount: 250, status: 'completed', deliveryLocation: 'Library' },
                    { _id: 'ord_003', customerId: { name: 'Mike Ross' }, totalAmount: 85, status: 'ready', deliveryLocation: 'Cafeteria' },
                    { _id: 'ord_004', customerId: { name: 'Rachel Zane' }, totalAmount: 340, status: 'pending', deliveryLocation: 'Block B, Room 205' },
                ];
                setOrders(mockOrders);
            }
        };
        fetchOrders();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/orders/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(orders.map(o => o._id === id ? { ...o, status } : o));
        } catch (error) {
            console.error(error);
            // Optimistic update for offline mode
            setOrders(orders.map(o => o._id === id ? { ...o, status } : o));
            alert('Offline mode: Status updated locally');
        }
    };

    // Calculate stats safely
    const stats = {
        totalRevenue: orders.reduce((acc, curr) => acc + curr.totalAmount, 0),
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        totalOrders: orders.length
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Owner Dashboard</h1>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-card p-6 rounded-2xl border-l-4 border-indigo-500">
                    <h2 className="text-gray-500 font-medium mb-2 uppercase tracking-wide text-xs">Total Revenue</h2>
                    <p className="text-4xl font-extrabold text-indigo-600">${stats.totalRevenue}</p>
                </div>
                <div className="glass-card p-6 rounded-2xl border-l-4 border-violet-500">
                    <h2 className="text-gray-500 font-medium mb-2 uppercase tracking-wide text-xs">Active Orders</h2>
                    <p className="text-4xl font-extrabold text-violet-600">{stats.pendingOrders}</p>
                </div>
                <div className="glass-card p-6 rounded-2xl border-l-4 border-cyan-500">
                    <h2 className="text-gray-500 font-medium mb-2 uppercase tracking-wide text-xs">Total Orders</h2>
                    <p className="text-4xl font-extrabold text-cyan-600">{stats.totalOrders}</p>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="glass-card rounded-2xl overflow-hidden p-6">
                <h2 className="text-xl font-bold mb-6 text-gray-800">Recent Orders</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                                        No recent orders found.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">#{order._id.slice(-6)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.deliveryLocation || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">${order.totalAmount}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${order.status === 'completed' || order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {order.status === 'pending' && (
                                                <button
                                                    onClick={() => updateStatus(order._id, 'completed')}
                                                    className="text-indigo-600 hover:text-indigo-900 font-medium hover:underline"
                                                >
                                                    Mark Complete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OwnerDashboard;
