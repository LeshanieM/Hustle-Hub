import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({ totalUsers: 0, totalStudents: 12450, totalOwners: 148, totalRevenue: 45200 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Dev bypass or role check
        const isDev = process.env.NODE_ENV === 'development';
        if (!isDev && (!user || user.role !== 'admin')) {
            navigate('/');
            return;
        }
        fetchData();
    }, [user, navigate]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const [usersRes, statsRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/admin/users', config),
                    axios.get('http://localhost:5000/api/admin/stats', config)
                ]);
                setUsers(usersRes.data);
                setStats(statsRes.data);
            } else {
                // Fallback to mock data if no token
                throw new Error('No token');
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching admin data, using mock data:', error);
            // Mock data matched to the provided UI
            setUsers([
                {
                    _id: '1',
                    name: 'Sarah Jenkins',
                    email: 'sarah.j@university.edu',
                    role: 'customer',
                    isVerified: true,
                    registrationDate: 'Oct 12, 2023'
                },
                {
                    _id: '2',
                    name: 'Mike Zhang',
                    email: 'mike.z@university.edu',
                    role: 'customer',
                    isVerified: false,
                    registrationDate: 'Nov 04, 2023'
                }
            ]);
            setLoading(false);
        }
    };

    const verifyUser = async (id) => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                await axios.patch(`http://localhost:5000/api/admin/verify/${id}`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setUsers(users.map(u => u._id === id ? { ...u, isVerified: !u.isVerified } : u));
        } catch (error) {
            console.error('Error verifying user:', error);
            // Optimistic update for demo
            setUsers(users.map(u => u._id === id ? { ...u, isVerified: !u.isVerified } : u));
        }
    };

    const approveBusiness = async (id) => {
        if (!window.confirm('Are you sure you want to approve this business? This will promote the user to Owner.')) return;
        try {
            const token = localStorage.getItem('token');
            if (token) {
                await axios.patch(`http://localhost:5000/api/admin/approve-business/${id}`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setUsers(users.map(u => u._id === id ? { ...u, role: 'owner', isVerified: true } : u));
        } catch (error) {
            console.error('Error approving business:', error);
            // Optimistic update for demo
            setUsers(users.map(u => u._id === id ? { ...u, role: 'owner', isVerified: true } : u));
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-white">
            <div className="text-xl font-bold animate-pulse text-primary text-black">Hustle Hub - Loading Dashboard...</div>
        </div>
    );

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white text-black font-display">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col justify-between">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="bg-primary text-white p-2 rounded-lg">
                            <span className="material-symbols-outlined block">rocket_launch</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold leading-tight tracking-tight">Hustle Hub</h1>
                            <p className="text-xs text-slate-500 font-medium">Campus Administrator</p>
                        </div>
                    </div>
                    <nav className="space-y-1">
                        <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-semibold" href="#">
                            <span className="material-symbols-outlined">dashboard</span>
                            <span>Dashboard</span>
                        </a>
                        <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors" href="#">
                            <span className="material-symbols-outlined">check_circle</span>
                            <span>Approvals</span>
                        </a>
                        <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors" href="#">
                            <span className="material-symbols-outlined">storefront</span>
                            <span>Store Directory</span>
                        </a>
                        <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors" href="#">
                            <span className="material-symbols-outlined">group</span>
                            <span>User Management</span>
                        </a>
                    </nav>
                </div>
                <div className="p-6 border-t border-slate-200 space-y-1">
                    <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors" href="#">
                        <span className="material-symbols-outlined">settings</span>
                        <span>System Settings</span>
                    </a>
                    <div className="flex items-center gap-3 p-3 mt-4 bg-slate-100 rounded-xl">
                        <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold truncate">{user?.name || 'Alex Rivera'}</p>
                            <p className="text-xs text-slate-500 truncate italic">Chief Admin</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto">

                <div className="p-8 space-y-8 max-w-7xl mx-auto">
                    {/* System Overview Metrics */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-50 text-primary rounded-lg">
                                    <span className="material-symbols-outlined">school</span>
                                </div>
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">+12%</span>
                            </div>
                            <p className="text-slate-500 text-sm font-medium">Total Students</p>
                            <p className="text-3xl font-bold mt-1">{stats.totalStudents?.toLocaleString()}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                                    <span className="material-symbols-outlined">store</span>
                                </div>
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">+5%</span>
                            </div>
                            <p className="text-slate-500 text-sm font-medium">Active Businesses</p>
                            <p className="text-3xl font-bold mt-1 text-black">{stats.totalOwners}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                                    <span className="material-symbols-outlined">payments</span>
                                </div>
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">+18%</span>
                            </div>
                            <p className="text-slate-500 text-sm font-medium">Total Revenue</p>
                            <p className="text-3xl font-bold mt-1 text-black">${stats.totalRevenue?.toLocaleString()}</p>
                        </div>
                    </section>

                    {/* Business Approval Queue */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold">Business Approval Queue</h3>
                                <span className="bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">AI Analysis Enabled</span>
                            </div>
                            <button className="text-primary text-sm font-semibold hover:underline">View All Requests</button>
                        </div>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {/* Eco-Threadz Thrift - Mocked as per user design */}
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col shadow-sm">
                                <div className="flex flex-col md:flex-row h-full">
                                    <div className="w-full md:w-48 h-48 md:h-auto bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=400')" }}></div>
                                    <div className="flex-1 p-5 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-lg text-black">Eco-Threadz Thrift</h4>
                                                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">Retail</span>
                                            </div>
                                            <p className="text-sm text-slate-600 italic leading-relaxed mb-4 border-l-2 border-primary/30 pl-3">
                                                "AI Summary: A student-led sustainable fashion marketplace focusing on dorm-to-dorm delivery. High growth potential in the Greek Life demographic."
                                            </p>
                                            <p className="text-xs font-medium text-slate-500 mb-6">Owner: Sarah Jenkins • Submitted: 2h ago</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="flex-1 bg-primary text-white text-sm font-bold py-2 rounded-lg hover:bg-primary/90 transition-colors">Approve</button>
                                            <button className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-semibold transition-colors">Details</button>
                                            <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors shadow-sm">
                                                <span className="material-symbols-outlined">block</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Campus Cravings - Mocked as per user design */}
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col shadow-sm">
                                <div className="flex flex-col md:flex-row h-full">
                                    <div className="w-full md:w-48 h-48 md:h-auto bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400')" }}></div>
                                    <div className="flex-1 p-5 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-lg text-black">Campus Cravings</h4>
                                                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">Food & Beverage</span>
                                            </div>
                                            <p className="text-sm text-slate-600 italic leading-relaxed mb-4 border-l-2 border-primary/30 pl-3">
                                                "AI Summary: Late-night healthy snack delivery. Logistics model relies on bicycle couriers. Safety certifications are currently pending review."
                                            </p>
                                            <p className="text-xs font-medium text-slate-500 mb-6">Owner: Mike Zhang • Submitted: 5h ago</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="flex-1 bg-primary text-white text-sm font-bold py-2 rounded-lg hover:bg-primary/90 transition-colors">Approve</button>
                                            <button className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-semibold transition-colors">Details</button>
                                            <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors shadow-sm">
                                                <span className="material-symbols-outlined">block</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Store Directory Management Table */}
                    <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                            <h3 className="text-lg font-bold">Store Directory</h3>
                            <div className="flex items-center gap-2">
                                <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-sm font-medium">
                                    <span className="material-symbols-outlined text-sm">filter_list</span> Filter
                                </button>
                                <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-sm font-medium">
                                    <span className="material-symbols-outlined text-sm">download</span> Export
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                        <th className="px-6 py-3">Store Name</th>
                                        <th className="px-6 py-3">Category</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Revenue (MTD)</th>
                                        <th className="px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    <tr className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-lg bg-slate-200 bg-cover bg-center"></div>
                                                <span className="font-bold text-sm">Blue Chip Books</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">Education</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-[10px] font-bold text-green-700 bg-green-100 rounded-full uppercase">Active</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">$2,450.00</td>
                                        <td className="px-6 py-4">
                                            <button className="material-symbols-outlined text-slate-400 hover:text-primary">more_vert</button>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-lg bg-slate-200 bg-cover bg-center"></div>
                                                <span className="font-bold text-sm">Knit & Sip</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">Lifestyle</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-[10px] font-bold text-amber-700 bg-amber-100 rounded-full uppercase">Pending Review</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">$0.00</td>
                                        <td className="px-6 py-4">
                                            <button className="material-symbols-outlined text-slate-400 hover:text-primary">more_vert</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* User Management Section */}
                    <section className="space-y-4 pb-12">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <h3 className="text-lg font-bold w-full md:w-auto">User Management</h3>
                            <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
                                <button className="flex-1 md:px-4 py-1.5 text-sm font-bold bg-white rounded-lg shadow-sm">Business Owners</button>
                                <button className="flex-1 md:px-4 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">Verified Students</button>
                            </div>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                            <th className="px-6 py-3">User</th>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="px-6 py-3">Registration Date</th>
                                            <th className="px-6 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {filteredUsers.map(u => (
                                            <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                            {u.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm">{u.name}</p>
                                                            <p className="text-xs text-slate-500">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`flex items-center gap-1.5 text-sm font-medium ${u.isVerified ? 'text-green-600' : 'text-amber-500'}`}>
                                                        <span className={`size-2 rounded-full ${u.isVerified ? 'bg-green-500' : 'bg-amber-400'}`}></span>
                                                        {u.isVerified ? 'Verified' : 'Reviewing'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-500">{u.registrationDate || 'N/A'}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button className="px-3 py-1.5 text-xs font-bold bg-slate-100 rounded-lg hover:bg-primary hover:text-white transition-all">View Profile</button>
                                                        <button className="px-3 py-1.5 text-xs font-bold bg-slate-100 rounded-lg hover:bg-primary hover:text-white transition-all" onClick={() => approveBusiness(u._id)}>Make Owner</button>
                                                        <button className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Ban User">
                                                            <span className="material-symbols-outlined text-sm">person_off</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
