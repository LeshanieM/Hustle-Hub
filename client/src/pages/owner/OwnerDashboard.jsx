import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import OwnerHeader from '../../components/OwnerHeader';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const generateWeeks = (startDate) => {
    const weeks = [];
    const now = new Date();

    // Determine current week's Monday
    const currentDay = now.getDay();
    const currentDiff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    let currentMonday = new Date(now);
    currentMonday.setDate(currentDiff);
    currentMonday.setHours(0, 0, 0, 0);

    // Determine target start week's Monday
    const startObj = new Date(startDate);
    const startDay = startObj.getDay();
    const startDiff = startObj.getDate() - startDay + (startDay === 0 ? -6 : 1);
    startObj.setDate(startDiff);
    startObj.setHours(0, 0, 0, 0);

    // Default guard against endless loops
    let limit = 52;
    let it = new Date(currentMonday);

    while (it >= startObj && limit > 0) {
        const wStart = new Date(it);
        const wEnd = new Date(it);
        wEnd.setDate(it.getDate() + 6);

        const startStr = wStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const endStr = wEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        weeks.push({
            label: `${startStr} - ${endStr}`,
            startDate: wStart.toISOString(),
            endDate: wEnd.toISOString()
        });

        // Step backward exactly one week
        it.setDate(it.getDate() - 7);
        limit--;
    }

    if (weeks.length === 0) {
        const wEnd = new Date(currentMonday);
        wEnd.setDate(currentMonday.getDate() + 6);
        weeks.push({
            label: `${currentMonday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${wEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
            startDate: currentMonday.toISOString(),
            endDate: wEnd.toISOString()
        });
    }

    // The current week is pushed first, which naturally puts the latest available week at weeks[0]
    return weeks;
};

const OwnerDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [kpis, setKpis] = useState(null);
    const [salesData, setSalesData] = useState([]);
    const [availableWeeks, setAvailableWeeks] = useState([]);
    const [selectedWeek, setSelectedWeek] = useState('');
    const reportRef = useRef(null);

    const generatePDF = async () => {
        const element = reportRef.current;
        if (!element) return;

        try {
            const canvas = await html2canvas(element, { scale: 2 });
            const data = canvas.toDataURL('image/png');

            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProperties = pdf.getImageProperties(data);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;

            pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Dashboard_Report_${selectedWeek.replace(/\s+/g, '_')}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    useEffect(() => {
        const fetchStoreData = async () => {
            let baseDate = user?.createdAt ? new Date(user.createdAt) : new Date();
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const res = await axios.get('http://localhost:5000/api/stores/my-store', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.data?.success && res.data?.store?.createdAt) {
                        baseDate = new Date(res.data.store.createdAt);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch store for dates', error);
            }
            const weeks = generateWeeks(baseDate);
            setAvailableWeeks(weeks);
            if (weeks.length > 0) {
                setSelectedWeek(weeks[0].label);
            }
        };
        fetchStoreData();
    }, [user]);

    useEffect(() => {
        const fetchKpis = async () => {
            if (!selectedWeek) return;
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const encodedWeek = encodeURIComponent(selectedWeek);
                const res = await axios.get(`http://localhost:5000/api/analytics/owner/kpis?week=${encodedWeek}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setKpis(res.data);
            } catch (error) {
                console.error('Failed to fetch KPIs', error);
                setKpis({
                    totalRevenue: { value: 0, change: 0 },
                    totalExpenses: { value: 0, change: 0 },
                    netProfit: { value: 0, change: 0 },
                    activeCustomers: { value: 0, change: 0 }
                });
            }
        };

        const fetchSales = async () => {
            if (!selectedWeek) return;
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const encodedWeek = encodeURIComponent(selectedWeek);
                const res = await axios.get(`http://localhost:5000/api/analytics/owner/sales?week=${encodedWeek}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSalesData(res.data);
            } catch (error) {
                console.error('Failed to fetch sales', error);
                setSalesData([]);
            }
        };

        fetchKpis();
        fetchSales();
    }, [selectedWeek]);

    const handleLogout = () => {
        if (logout) {
            logout();
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        navigate('/login');
    };

    return (
        <div className="bg-[#f6f6f8] text-slate-900 font-sans min-h-screen">
            <OwnerHeader />
            <div className="flex h-screen overflow-hidden pt-[66px]">
                {/* Sidebar Navigation */}
                <aside className="w-64 flex-shrink-0 flex flex-col bg-white border-r border-slate-200">
                    <div className="pt-6"></div>
                    <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                        <a className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#1111d4]/10 text-[#1111d4] font-bold" href="#">
                            <span className="material-icons-filled">dashboard</span>
                            <span>Dashboard</span>
                        </a>
                        <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors" href="#">
                            <span className="material-symbols-outlined">inventory_2</span>
                            <span>Products</span>
                        </a>
                        <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors" href="#">
                            <span className="material-symbols-outlined">shopping_cart</span>
                            <span>Orders</span>
                        </a>
                        <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors" href="#">
                            <span className="material-symbols-outlined">bar_chart</span>
                            <span>Reports</span>
                        </a>
                        <Link className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors" to="/analytics">
                            <span className="material-symbols-outlined">analytics</span>
                            <span>Analytics</span>
                        </Link>
                    </nav>
                    <div className="p-4 border-t border-slate-200 space-y-3">
                        <button onClick={() => navigate('/owner/products/add')} className="w-full flex items-center justify-center gap-2 bg-[#1111d4] text-white py-2.5 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer border-none">
                            <span className="material-symbols-outlined text-sm">add</span>
                            <span>Add Product</span>
                        </button>
                        <div className="pt-4 space-y-1">
                            <Link className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-sm transition-colors" to="/store-editor">
                                <span className="material-symbols-outlined text-base">brush</span>
                                <span>Store Editor</span>
                            </Link>
                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 text-sm cursor-pointer border-none bg-transparent">
                                <span className="material-symbols-outlined text-base">logout</span>
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    {/* Top Navigation */}
                    <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-slate-200">
                        <div className="flex-1 max-w-xl">
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1111d4] transition-colors">search</span>
                                <input className="w-full bg-slate-100 border-none rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-[#1111d4] transition-all text-sm outline-none" placeholder="Search products, orders, or analytics..." type="text" />
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3 pl-2">
                                <div className="text-right hidden md:block">
                                    <p className="text-sm font-semibold">{user?.firstName ? `${user.firstName} ${user.lastName}` : "Alex Rivera"}</p>
                                    <p className="text-xs text-slate-500">Shop Owner</p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-slate-200 border border-[#1111d4]/20 overflow-hidden bg-cover bg-center" data-alt="User profile avatar" style={{ backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.firstName || 'Alex'}&backgroundColor=b6e3f4')` }}></div>
                            </div>
                        </div>
                    </header>

                    {/* Dashboard Content */}
                    <div className="flex-1 overflow-y-auto bg-[#f6f6f8]">
                        <div className="p-8" ref={reportRef}>
                            {/* Header Actions */}
                            <div className="flex flex-wrap items-center justify-between mb-8 gap-4" data-html2canvas-ignore="true">
                                <div>
                                    <h2 className="text-2xl font-bold">Dashboard Overview</h2>
                                    <p className="text-slate-500 text-sm">Welcome back, {user?.firstName || "Alex"}. Here's what's happening today.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={generatePDF} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors cursor-pointer">
                                        <span className="material-symbols-outlined text-lg">description</span>
                                        Generate Report
                                    </button>
                                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 text-sm hover:border-[#1111d4]/50 focus-within:border-[#1111d4] transition-colors">
                                        <span className="material-symbols-outlined text-slate-400 text-lg">calendar_month</span>
                                        <select
                                            className="bg-transparent border-none outline-none font-medium text-slate-700 cursor-pointer appearance-none pr-4"
                                            value={selectedWeek}
                                            onChange={(e) => setSelectedWeek(e.target.value)}
                                            style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394A3B8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '10px auto' }}
                                        >
                                            {availableWeeks.map((week, idx) => (
                                                <option key={idx} value={week.label}>{week.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* KPI Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <div className="bg-white p-6 rounded-xl border border-slate-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <span className="material-symbols-outlined text-green-600">payments</span>
                                        </div>
                                        <span className={`text-sm font-bold flex items-center ${kpis?.totalRevenue?.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {kpis?.totalRevenue?.change > 0 ? '+' : ''}{kpis?.totalRevenue?.change || 0}%
                                            <span className="material-symbols-outlined text-sm ml-1">{kpis?.totalRevenue?.change >= 0 ? 'trending_up' : 'trending_down'}</span>
                                        </span>
                                    </div>
                                    <p className="text-slate-500 text-sm font-medium">Total Revenue</p>
                                    <h3 className="text-2xl font-bold mt-1">${kpis?.totalRevenue?.value?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"}</h3>
                                </div>
                                <div className="bg-white p-6 rounded-xl border border-slate-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 bg-red-100 rounded-lg">
                                            <span className="material-symbols-outlined text-red-600">receipt_long</span>
                                        </div>
                                        <span className={`text-sm font-bold flex items-center ${kpis?.totalExpenses?.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {kpis?.totalExpenses?.change > 0 ? '+' : ''}{kpis?.totalExpenses?.change || 0}%
                                            <span className="material-symbols-outlined text-sm ml-1">{kpis?.totalExpenses?.change >= 0 ? 'trending_up' : 'trending_down'}</span>
                                        </span>
                                    </div>
                                    <p className="text-slate-500 text-sm font-medium">Total Expenses</p>
                                    <h3 className="text-2xl font-bold mt-1">${kpis?.totalExpenses?.value?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"}</h3>
                                </div>
                                <div className="bg-white p-6 rounded-xl border border-slate-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 bg-[#1111d4]/10 rounded-lg">
                                            <span className="material-symbols-outlined text-[#1111d4]">savings</span>
                                        </div>
                                        <span className={`text-sm font-bold flex items-center ${kpis?.netProfit?.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {kpis?.netProfit?.change > 0 ? '+' : ''}{kpis?.netProfit?.change || 0}%
                                            <span className="material-symbols-outlined text-sm ml-1">{kpis?.netProfit?.change >= 0 ? 'trending_up' : 'trending_down'}</span>
                                        </span>
                                    </div>
                                    <p className="text-slate-500 text-sm font-medium">Net Profit</p>
                                    <h3 className="text-2xl font-bold mt-1">${kpis?.netProfit?.value?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"}</h3>
                                </div>
                                <div className="bg-white p-6 rounded-xl border border-slate-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <span className="material-symbols-outlined text-blue-600">person_add</span>
                                        </div>
                                        <span className={`text-sm font-bold flex items-center ${kpis?.activeCustomers?.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {kpis?.activeCustomers?.change > 0 ? '+' : ''}{kpis?.activeCustomers?.change || 0}%
                                            <span className="material-symbols-outlined text-sm ml-1">{kpis?.activeCustomers?.change >= 0 ? 'trending_up' : 'trending_down'}</span>
                                        </span>
                                    </div>
                                    <p className="text-slate-500 text-sm font-medium">Active Customers</p>
                                    <h3 className="text-2xl font-bold mt-1">{kpis?.activeCustomers?.value?.toLocaleString() || "0"}</h3>
                                </div>
                            </div>

                            {/* Main Grid Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Sales Performance Chart */}
                                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold">Sales Performance</h3>
                                        <select className="bg-slate-100 border-none rounded-lg text-xs font-bold py-1 px-3 focus:ring-1 focus:ring-[#1111d4] outline-none">
                                            <option>Weekly</option>
                                            <option>Monthly</option>
                                        </select>
                                    </div>
                                    <div className="h-64 flex flex-col justify-between pt-4">
                                        {salesData && salesData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#1111d4" stopOpacity={0.2} />
                                                            <stop offset="95%" stopColor="#1111d4" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }} dy={10} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} dx={-10} />
                                                    <Tooltip
                                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                                        itemStyle={{ color: '#1111d4', fontWeight: 'bold' }}
                                                    />
                                                    <Area type="monotone" dataKey="sales" stroke="#1111d4" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">data_alert</span>
                                                <p className="text-sm">No sales data for this period</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Order Management Widget */}
                                <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col">
                                    <h3 className="text-lg font-bold mb-6">Order Status</h3>
                                    <div className="space-y-6 flex-1">
                                        <div className="relative pt-1">
                                            <div className="flex mb-2 items-center justify-between">
                                                <div>
                                                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-[#1111d4] bg-[#1111d4]/10">Pending</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs font-semibold inline-block text-[#1111d4]">0 Orders</span>
                                                </div>
                                            </div>
                                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-[#1111d4]/10">
                                                <div className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#1111d4]" style={{ width: "0%" }}></div>
                                            </div>
                                        </div>
                                        <div className="relative pt-1">
                                            <div className="flex mb-2 items-center justify-between">
                                                <div>
                                                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-100">In Transit</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs font-semibold inline-block text-blue-600">0 Orders</span>
                                                </div>
                                            </div>
                                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
                                                <div className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500" style={{ width: "0%" }}></div>
                                            </div>
                                        </div>
                                        <div className="relative pt-1">
                                            <div className="flex mb-2 items-center justify-between">
                                                <div>
                                                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-100">Delivered</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs font-semibold inline-block text-green-600">0 Orders</span>
                                                </div>
                                            </div>
                                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-100">
                                                <div className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500" style={{ width: "0%" }}></div>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="mt-6 w-full py-2 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer bg-transparent">View All Deliveries</button>
                                </div>
                            </div>

                            {/* Bottom Grid Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                                {/* Inventory Alerts */}
                                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
                                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-bold">Inventory Alerts</h3>
                                            <span className="bg-slate-200 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">0 ALERTS</span>
                                        </div>
                                        <a className="text-[#1111d4] text-sm font-semibold hover:underline" href="#">View Inventory</a>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                                                <tr>
                                                    <th className="px-6 py-4 font-bold">Product Name</th>
                                                    <th className="px-6 py-4 font-bold">SKU</th>
                                                    <th className="px-6 py-4 font-bold text-center">Current Stock</th>
                                                    <th className="px-6 py-4 font-bold">Status</th>
                                                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                                        No inventory alerts at this time.
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Quick Actions Widget */}
                                <div className="bg-white p-6 rounded-xl border border-slate-200">
                                    <h3 className="text-lg font-bold mb-6">Quick Actions</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button onClick={() => navigate('/owner/products/add')} className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:bg-[#1111d4]/5 hover:border-[#1111d4]/20 transition-all group bg-transparent cursor-pointer">
                                            <span className="material-symbols-outlined text-3xl text-[#1111d4] mb-2">add_box</span>
                                            <span className="text-xs font-bold text-slate-600 group-hover:text-[#1111d4]">Add Item</span>
                                        </button>
                                        <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:bg-[#1111d4]/5 hover:border-[#1111d4]/20 transition-all group bg-transparent cursor-pointer">
                                            <span className="material-symbols-outlined text-3xl text-[#1111d4] mb-2">local_shipping</span>
                                            <span className="text-xs font-bold text-slate-600 group-hover:text-[#1111d4]">Ship Orders</span>
                                        </button>
                                        <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:bg-[#1111d4]/5 hover:border-[#1111d4]/20 transition-all group bg-transparent cursor-pointer">
                                            <span className="material-symbols-outlined text-3xl text-[#1111d4] mb-2">confirmation_number</span>
                                            <span className="text-xs font-bold text-slate-600 group-hover:text-[#1111d4]">Discounts</span>
                                        </button>
                                        <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:bg-[#1111d4]/5 hover:border-[#1111d4]/20 transition-all group bg-transparent cursor-pointer">
                                            <span className="material-symbols-outlined text-3xl text-[#1111d4] mb-2">mail</span>
                                            <span className="text-xs font-bold text-slate-600 group-hover:text-[#1111d4]">Campaigns</span>
                                        </button>
                                    </div>
                                    <div className="mt-6 p-4 bg-[#1111d4]/5 rounded-xl border border-[#1111d4]/10">
                                        <h4 className="text-sm font-bold text-[#1111d4] mb-2 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-lg">info</span>
                                            Tip for you
                                        </h4>
                                        <p className="text-xs text-slate-600 leading-relaxed">No new tips available at this moment. Check back later!</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default OwnerDashboard;
