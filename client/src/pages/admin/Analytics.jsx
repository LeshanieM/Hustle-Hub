import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line
} from 'recharts';
import regression from 'regression';
import OwnerHeader from '../../components/OwnerHeader';
import Footer from '../../components/Footer';

const Analytics = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [prediction, setPrediction] = useState(null);
    const [targets, setTargets] = useState({ daily: 0, monthly: 0, yearly: 0 });
    const [editingTargets, setEditingTargets] = useState(false);

    useEffect(() => {
        fetchAnalytics();
        if (user?.profileConfig?.targets) {
            setTargets(user.profileConfig.targets);
        }
    }, [user]);

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/analytics', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data);
            calculatePrediction(res.data.salesData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            // Mock data for offline/demo mode
            const mockData = {
                totalRevenue: 15420,
                totalOrders: 142,
                customerCount: 89,
                salesData: Array.from({ length: 30 }, (_, i) => ({
                    _id: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
                    sales: Math.floor(Math.random() * 1000) + 200
                })),
                topItems: [
                    { _id: '1', title: 'Wireless Headphones', totalSold: 45, revenue: 4500 },
                    { _id: '2', title: 'Smart Watch', totalSold: 32, revenue: 3200 },
                    { _id: '3', title: 'Bluetooth Speaker', totalSold: 28, revenue: 1400 },
                    { _id: '4', title: 'Laptop Stand', totalSold: 15, revenue: 450 }
                ]
            };
            setData(mockData);
            calculatePrediction(mockData.salesData);
            setLoading(false);
        }
    };

    const calculatePrediction = (salesData) => {
        if (!salesData || salesData.length < 2) return;

        // Prepare data for regression: [dayIndex, salesAmount]
        const points = salesData.map((d, i) => [i, d.sales]);
        const result = regression.linear(points);

        // Predict next 7 days
        const lastIndex = points.length - 1;
        const nextWeek = [];
        for (let i = 1; i <= 7; i++) {
            const pred = result.predict(lastIndex + i);
            nextWeek.push({
                day: `Day +${i}`,
                predictedSales: Math.max(0, Math.round(pred[1]))
            });
        }
        setPrediction({ equation: result.string, nextWeek });
    };

    const handleTargetSave = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/analytics/targets', targets, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEditingTargets(false);
            alert('Targets updated successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to update targets');
        }
    };

    if (loading) return <div className="p-8">Loading Analytics...</div>;

    // Calculate progress towards targets
    // Assuming data.salesData contains daily sales. For monthly/yearly we'd need more aggregation from backend
    // For MVP, we'll estimate or just show daily progress based on today's sales
    const todayStr = new Date().toISOString().split('T')[0];
    const todaySalesObj = data.salesData.find(d => d._id === todayStr);
    const todaySales = todaySalesObj ? todaySalesObj.sales : 0;
    const dailyProgress = targets.daily > 0 ? (todaySales / targets.daily) * 100 : 0;

    return (
        <>
            <OwnerHeader />
            <div className="max-w-7xl mx-auto p-4 sm:px-6 lg:px-8 pb-12">
                <h1 className="text-3xl font-bold mb-8 text-gray-800">Analytics & Growth</h1>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="glass-card p-5 rounded-2xl border-l-4 border-indigo-500">
                    <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Total Revenue</p>
                    <p className="text-3xl font-extrabold text-gray-900 mt-1">${data.totalRevenue}</p>
                </div>
                <div className="glass-card p-5 rounded-2xl border-l-4 border-green-500">
                    <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Total Orders</p>
                    <p className="text-3xl font-extrabold text-gray-900 mt-1">{data.totalOrders}</p>
                </div>
                <div className="glass-card p-5 rounded-2xl border-l-4 border-yellow-500">
                    <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Customers</p>
                    <p className="text-3xl font-extrabold text-gray-900 mt-1">{data.customerCount}</p>
                </div>
                <div className="glass-card p-5 rounded-2xl border-l-4 border-violet-500">
                    <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Daily Goal</p>
                    <p className="text-3xl font-extrabold text-gray-900 mt-1">${targets.daily}</p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
                        <div className="bg-violet-600 h-1.5 rounded-full" style={{ width: `${Math.min(dailyProgress, 100)}%` }}></div>
                    </div>
                    <p className="text-xs text-right mt-1 font-medium text-violet-600">{Math.round(dailyProgress)}% Achieved</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Sales Chart */}
                <div className="glass-card p-6 rounded-2xl">
                    <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
                        <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg mr-3">📊</span>
                        Sales Trend
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.salesData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                cursor={{ fill: '#F3F4F6' }}
                            />
                            <Bar dataKey="sales" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Revenue" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Predictions */}
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-bold mb-4 text-gray-700">Growth Forecast (Linear Regression)</h2>
                    {prediction ? (
                        <>
                            <p className="mb-4 text-sm text-gray-600">Trend Line: {prediction.equation}</p>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={prediction.nextWeek}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="day" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="predictedSales" stroke="#8884d8" name="Predicted Sales ($)" />
                                </LineChart>
                            </ResponsiveContainer>
                        </>
                    ) : (
                        <p className="text-gray-500">Not enough data for predictions.</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Items */}
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-bold mb-4 text-gray-700">Top Selling Products</h2>
                    <ul className="divide-y divide-gray-200">
                        {data.topItems.map((item) => (
                            <li key={item._id} className="py-3 flex justify-between">
                                <span className="font-medium text-gray-800">{item.title}</span>
                                <span className="text-gray-600">{item.totalSold} sold (${item.revenue})</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Targets Configuration */}
                <div className="bg-white p-6 rounded shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-700">Target Settings</h2>
                        {!editingTargets ? (
                            <button onClick={() => setEditingTargets(true)} className="text-blue-600 hover:text-blue-800">Edit</button>
                        ) : (
                            <button onClick={handleTargetSave} className="text-green-600 hover:text-green-800 font-bold">Save</button>
                        )}
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-700 mb-1">Daily Revenue Target ($)</label>
                            <input
                                type="number"
                                disabled={!editingTargets}
                                value={targets.daily}
                                onChange={(e) => setTargets({ ...targets, daily: Number(e.target.value) })}
                                className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1">Monthly Revenue Target ($)</label>
                            <input
                                type="number"
                                disabled={!editingTargets}
                                value={targets.monthly}
                                onChange={(e) => setTargets({ ...targets, monthly: Number(e.target.value) })}
                                className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1">Yearly Revenue Target ($)</label>
                            <input
                                type="number"
                                disabled={!editingTargets}
                                value={targets.yearly}
                                onChange={(e) => setTargets({ ...targets, yearly: Number(e.target.value) })}
                                className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div >
        <Footer />
        </>
    );
};

export default Analytics;
