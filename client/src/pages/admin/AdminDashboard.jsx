import { useEffect, useState, useMemo } from 'react';
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
    
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalBusinesses: 0,
        activeBusinesses: 0,
        blockedBusinesses: 0,
        totalAdmins: 0
    });



    const [businesses, setBusinesses] = useState([]);
    const [allUsers, setAllUsers] = useState([]); // Real user data

    const growthData = useMemo(() => {
        const months = [];
        const now = new Date();
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        
        for(let i=5; i>=0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({ 
                month: d.toLocaleString('default', { month: 'short' }),
                monthNum: d.getMonth(),
                year: d.getFullYear(),
                students: 0,
                businesses: 0
            });
        }

        let baseStudents = 0;
        let baseBusinesses = 0;

        allUsers.forEach(u => {
            if(u.role !== 'CUSTOMER' && u.role !== 'OWNER') return;
            const d = new Date(u.createdAt);
            if(d < sixMonthsAgo) {
                baseStudents++;
            } else {
                const match = months.find(m => m.monthNum === d.getMonth() && m.year === d.getFullYear());
                if(match) match.students++;
            }
        });

        businesses.forEach(b => {
            const d = new Date(b.createdAt);
            if(d < sixMonthsAgo) {
                baseBusinesses++;
            } else {
                const match = months.find(m => m.monthNum === d.getMonth() && m.year === d.getFullYear());
                if(match) match.businesses++;
            }
        });

        let cum_s = baseStudents;
        let cum_b = baseBusinesses;
        return months.map(m => {
            cum_s += m.students;
            cum_b += m.businesses;
            return { month: m.month, students: cum_s, businesses: cum_b };
        });
    }, [allUsers, businesses]);

    const categoryData = useMemo(() => {
        let active = 0, suspended = 0, pending = 0;
        businesses.forEach(b => {
            if (b.status === 'ACTIVE') active++;
            else if (b.status === 'SUSPENDED') suspended++;
            else pending++;
        });
        const arr = [
            { name: 'Active', value: active, color: '#10b981' }, 
            { name: 'Suspended', value: suspended, color: '#ef4444' },
            { name: 'Pending', value: pending, color: '#f59e0b' }
        ].filter(item => item.value > 0);
        return arr.length ? arr : [{ name: 'No Stores', value: 1, color: '#e2e8f0' }];
    }, [businesses]);

    const auditLogs = useMemo(() => {
        const logs = [];
        allUsers.forEach(u => {
            logs.push({
                id: u._id,
                action: `${u.role || 'USER'} Reg.`,
                target: u.username,
                admin: 'System',
                time: new Date(u.createdAt),
                rawTime: new Date(u.createdAt).getTime()
            });
        });
        businesses.forEach(b => {
            logs.push({
                id: b._id,
                action: `Store ${b.status}`,
                target: b.storeName,
                admin: 'System',
                time: new Date(b.createdAt),
                rawTime: new Date(b.createdAt).getTime()
            });
        });
        
        return logs.sort((a,b) => b.rawTime - a.rawTime).slice(0, 5).map(l => ({
            ...l,
            time: l.time.toLocaleDateString() + ' ' + l.time.toLocaleTimeString()
        }));
    }, [allUsers, businesses]);




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

                const computedStudents = usersRes.data ? usersRes.data.filter(u => u.role === 'CUSTOMER' || u.role === 'OWNER').length : 0;
                const computedAdmins = usersRes.data ? usersRes.data.filter(u => u.role === 'ADMIN').length : 0;

                if (statsRes.data) {
                    setStats({
                        totalStudents: computedStudents || statsRes.data.registeredStudents || 0,
                        totalBusinesses: (statsRes.data.activeStores || 0) + (statsRes.data.blockedBatch || 0),
                        activeBusinesses: statsRes.data.activeStores || 0,
                        blockedBusinesses: statsRes.data.blockedBatch || 0,
                        totalAdmins: computedAdmins
                    });
                } else if (usersRes.data && storesRes.data) {
                    // Derive stats if specific analytics fail
                    setStats({
                        totalStudents: computedStudents,
                        totalBusinesses: storesRes.data.length,
                        activeBusinesses: storesRes.data.filter(s => s.status === 'ACTIVE').length,
                        blockedBusinesses: storesRes.data.filter(s => s.status === 'SUSPENDED').length,
                        totalAdmins: computedAdmins
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
        { label: 'Platform Overview', icon: 'dashboard', path: '/admin-dashboard' },
        { label: 'Business Directory', icon: 'storefront', path: '/admin/businesses' },
        { label: 'User Directory', icon: 'group', path: '/admin/users' },
        { label: 'System Health', icon: 'monitor_heart', path: '/admin/system-health' }, 
        { label: 'Audit Logs', icon: 'history', path: '/admin/audit-logs' }, 
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
                
                    {/* KPI Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                        <StatCard title="Total Students" value={stats.totalStudents.toLocaleString()} icon="school" trend="up" trendValue="+12%" color="blue" />
                        <StatCard title="Platform Admins" value={stats.totalAdmins.toLocaleString()} icon="admin_panel_settings" trend="up" trendValue="Live" color="amber" />
                        <StatCard title="Total Businesses" value={stats.totalBusinesses} icon="store" trend="up" trendValue="+8%" color="purple" />
                        <StatCard title="Active Units" value={stats.activeBusinesses} icon="check_circle" color="emerald" />
                        <StatCard title="Blocked / Flagged" value={stats.blockedBusinesses} icon="block" color="rose" />
                    </div>
                 
                {/* Growth Analytics Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2">
                        <ChartCard title="Platform Growth" subtitle="Cumulative registration across 6 months" height="h-[350px]">
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
                        <ChartCard title="Status Mix" subtitle="Distribution of operation status" height="h-[350px]">
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

                

                {/* Lower Grid - Insights & Logs */}
                
                    <TableComponent 
                        title="Recent Activity"
                        headers={['Action', 'Entity', 'By', 'Time']}
                        data={auditLogs}
                        renderRow={(log) => (
                            <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                        <span className="font-black text-slate-900 text-[10px] uppercase tracking-widest">{log.action}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-bold text-slate-500 text-xs">{log.target}</td>
                                <td className="px-6 py-4 text-slate-900 text-xs font-black">{log.admin}</td>
                                <td className="px-6 py-4 font-bold text-slate-400 text-[10px] tracking-widest">{log.time}</td>
                            </tr>
                        )}
                    />
                </div>
            
        </DashboardLayout>
    );
};

export default AdminDashboard;
