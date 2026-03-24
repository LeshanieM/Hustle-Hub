import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import TableComponent from '../../components/dashboard/TableComponent';
import ChartCard from '../../components/dashboard/ChartCard';
import { 
    LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, 
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import AdminHeader from '../../components/AdminHeader';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // Added for section control
    
    // Data State
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalBusinesses: 0,
        activeBusinesses: 0,
        blockedBusinesses: 0
    });

    const [growthData] = useState([
        { month: 'Jan', students: 4000, businesses: 24 },
        { month: 'Feb', students: 5500, businesses: 36 },
        { month: 'Mar', students: 8000, businesses: 58 },
        { month: 'Apr', students: 9500, businesses: 82 },
        { month: 'May', students: 11000, businesses: 115 },
        { month: 'Jun', students: 12450, businesses: 148 },
    ]);

    const [categoryData] = useState([
        { name: 'Food', value: 45, color: '#4f46e5' },
        { name: 'Services', value: 30, color: '#10b981' },
        { name: 'Apparel', value: 15, color: '#f59e0b' },
        { name: 'Electronics', value: 10, color: '#ec4899' },
    ]);

    const [businesses, setBusinesses] = useState([]);
    const [allUsers, setAllUsers] = useState([]); // Real user data

    const [auditLogs] = useState([
        { id: 1, action: 'Blocked Business', target: 'Campus Gear', admin: 'Chief Admin', time: '2 hours ago' },
        { id: 2, action: 'Approved Store', target: 'The Coffee Lab', admin: 'Alex Rivera', time: '5 hours ago' },
        { id: 3, action: 'System Update', target: 'Analytics Engine', admin: 'System', time: 'Yesterday' },
    ]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No token');
                
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const [statsRes, storesRes, usersRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/analytics/admin/platform', config).catch(() => ({ data: null })),
                    axios.get('http://localhost:5000/api/admin/stores', config).catch(() => ({ data: [] })),
                    axios.get('http://localhost:5000/api/admin/users', config).catch(() => ({ data: [] }))
                ]);

                if (statsRes.data) {
                    setStats({
                        totalStudents: statsRes.data.registeredStudents || 0,
                        totalBusinesses: (statsRes.data.activeStores || 0) + (statsRes.data.blockedBatch || 0),
                        activeBusinesses: statsRes.data.activeStores || 0,
                        blockedBusinesses: statsRes.data.blockedBatch || 0
                    });
                } else if (usersRes.data && storesRes.data) {
                    // Derive stats if specific analytics fail
                    setStats({
                        totalStudents: usersRes.data.length,
                        totalBusinesses: storesRes.data.length,
                        activeBusinesses: storesRes.data.filter(s => s.status === 'ACTIVE').length,
                        blockedBusinesses: storesRes.data.filter(s => s.status === 'SUSPENDED').length
                    });
                }

                setBusinesses(storesRes.data || []);
                setAllUsers(usersRes.data || []);

            } catch (error) {
                console.error('Admin data mapping failed:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const toggleBusinessStatus = async (id, currentStatus) => {
        const newStatusMap = {
            'ACTIVE': 'SUSPENDED',
            'SUSPENDED': 'ACTIVE',
            'PENDING_APPROVAL': 'ACTIVE'
        };
        const newStatus = newStatusMap[currentStatus] || 'ACTIVE';
        
        if (!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
        
        try {
            const token = localStorage.getItem('token');
            if (token) {
                await axios.put(`http://localhost:5000/api/admin/stores/${id}/status`, { status: newStatus }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setBusinesses(prev => prev.map(b => b._id === id ? { ...b, status: newStatus } : b));
            // Recalculate stats or just refresh
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update store status.');
        }
    };

    const sidebarItems = [
        { label: 'Platform Overview', icon: 'dashboard', onClick: () => setActiveTab('overview'), active: activeTab === 'overview' },
        { label: 'Business Directory', icon: 'storefront', onClick: () => setActiveTab('businesses'), active: activeTab === 'businesses' },
        { label: 'User Directory', icon: 'group', onClick: () => setActiveTab('users'), active: activeTab === 'users' },
        { label: 'System Health', icon: 'monitor_heart', onClick: () => setActiveTab('overview'), active: false }, // Placeholder
        { label: 'Audit Logs', icon: 'history', onClick: () => setActiveTab('overview'), active: false }, // Placeholder
    ];

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-bold text-slate-400">Loading System Intelligence...</p>
            </div>
        </div>
    );

    return (
        <DashboardLayout 
            role="Administrator" 
            headerTitle="Administrative Intelligence"
            sidebarItems={sidebarItems}
            TopHeader={AdminHeader}
        >
            <div className="space-y-10">
                {activeTab === 'overview' && (
                  <>
                    {/* KPI Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard title="Total Students" value={stats.totalStudents.toLocaleString()} icon="school" trend="up" trendValue="+12%" color="blue" />
                        <StatCard title="Total Businesses" value={stats.totalBusinesses} icon="store" trend="up" trendValue="+8%" color="purple" />
                        <StatCard title="Active Units" value={stats.activeBusinesses} icon="check_circle" color="emerald" />
                        <StatCard title="Blocked / Flagged" value={stats.blockedBusinesses} icon="block" color="rose" />
                    </div>
                  </>
                )}

                {/* Growth Analytics Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2">
                        <ChartCard title="Platform Growth" subtitle="Monthly registration of students vs businesses" height="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={growthData}>
                                    <defs>
                                        <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorBusinesses" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#94a3b8'}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#94a3b8'}} />
                                    <Tooltip 
                                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                    />
                                    <Legend verticalAlign="top" height={36}/>
                                    <Area type="monotone" dataKey="students" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorStudents)" />
                                    <Area type="monotone" dataKey="businesses" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorBusinesses)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </div>
                    
                    <div className="lg:col-span-1">
                        <ChartCard title="Category Mix" subtitle="Distribution by business type" height="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        innerRadius={80}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </div>
                </div>

                {/* Business Management Table */}
                {activeTab === 'overview' || activeTab === 'businesses' ? (
                  <TableComponent 
                      title="Business Management"
                      headers={['Store Name', 'Owner', 'Status', 'Actions']}
                      data={businesses}
                      renderRow={(biz) => (
                          <tr key={biz._id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4">
                                  <span className="font-black text-slate-900 text-sm">{biz.storeName}</span>
                              </td>
                              <td className="px-6 py-4 text-slate-500 text-sm font-medium">
                                {biz.ownerId?.firstName} {biz.ownerId?.lastName}
                              </td>
                              <td className="px-6 py-4">
                                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                      biz.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 
                                      biz.status === 'PENDING_APPROVAL' ? 'bg-amber-50 text-amber-600' : 
                                      'bg-rose-50 text-rose-600'
                                  }`}>
                                      {biz.status?.replace('_', ' ')}
                                  </span>
                              </td>
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                      <button 
                                          onClick={() => toggleBusinessStatus(biz._id, biz.status)}
                                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                              biz.status === 'ACTIVE' ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                                          }`}
                                      >
                                          {biz.status === 'ACTIVE' ? 'Suspend' : 'Approve'}
                                      </button>
                                  </div>
                              </td>
                          </tr>
                      )}
                  />
                ) : null}

                {activeTab === 'users' && (
                  <TableComponent 
                    title="User Directory"
                    headers={['Username', 'Full Name', 'Role', 'Verification', 'Joined']}
                    data={allUsers}
                    renderRow={(u) => (
                      <tr key={u._id} className="hover:bg-slate-50 transition-colors text-sm">
                        <td className="px-6 py-4 font-black">{u.username}</td>
                        <td className="px-6 py-4 text-slate-500">{u.firstName} {u.lastName}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                            u.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 
                            u.role === 'OWNER' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {u.isVerified ? 
                            <span className="text-emerald-500 flex items-center gap-1 font-bold text-xs"><span className="material-symbols-outlined text-sm">verified</span> Verified</span> : 
                            <span className="text-slate-300 font-bold text-xs">Unverified</span>
                          }
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    )}
                  />
                )}

                {/* Lower Grid - Insights & Logs */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 pb-20">
                    {/* Alerts & Insights */}
                    <section className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm overflow-hidden relative group">
                        <div className="absolute -right-4 -top-4 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform"></div>
                        <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3 relative z-10">
                            <span className="material-symbols-outlined text-rose-500">warning</span>
                            Intelligence Alerts
                        </h3>
                        <div className="space-y-4 relative z-10">
                            {[
                                { id: 1, title: 'Unusual Revenue Spike', desc: 'The Coffee Lab reported 300% growth in 24h.', type: 'info' },
                                { id: 2, title: 'Inactive Business', desc: 'Print Master has no sales activity for 14 days.', type: 'warning' },
                                { id: 3, title: 'Multiple Password Failures', desc: 'Detected 15+ login attempts on user ID 8292.', type: 'danger' },
                            ].map(alert => (
                                <div key={alert.id} className={`p-5 rounded-3xl border ${
                                    alert.type === 'danger' ? 'bg-rose-50 border-rose-100' : alert.type === 'warning' ? 'bg-amber-50 border-amber-100' : 'bg-indigo-50 border-indigo-100'
                                }`}>
                                    <h5 className="font-black text-slate-900 text-sm mb-1">{alert.title}</h5>
                                    <p className="text-xs text-slate-500 font-bold">{alert.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Audit Logs */}
                    <TableComponent 
                        title="Audit Logs"
                        headers={['Action', 'Target', 'Admin', 'Time']}
                        data={auditLogs}
                        renderRow={(log) => (
                            <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                        <span className="font-black text-slate-900 text-xs">{log.action}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-bold text-slate-500 text-xs">{log.target}</td>
                                <td className="px-6 py-4 text-slate-900 text-xs font-black">{log.admin}</td>
                                <td className="px-6 py-4 font-bold text-slate-400 text-[10px] tracking-widest">{log.time}</td>
                            </tr>
                        )}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;
