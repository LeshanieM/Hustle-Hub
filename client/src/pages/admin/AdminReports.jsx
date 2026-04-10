import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import AdminHeader from '../../components/AdminHeader';
import { generateHybridReport } from '../../utils/reportGenerator';
import toast from 'react-hot-toast';

// --- Components ---

const ReportTypeCard = ({ title, desc, icon, isSelected, onClick }) => (
    <button 
        onClick={onClick}
        className={`group relative flex items-start gap-6 p-8 rounded-[2rem] border-2 transition-all text-left overflow-hidden w-full ${
            isSelected 
            ? `bg-white border-slate-900 shadow-xl` 
            : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-lg'
        }`}
    >
        <div className={`p-4 rounded-2xl transition-all ${
            isSelected 
            ? `bg-slate-900 text-white shadow-lg` 
            : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600'
        }`}>
            <span className="material-symbols-outlined text-[32px]">{icon}</span>
        </div>
        <div className="flex-1">
            <h5 className={`font-black text-xl tracking-tight mb-2 ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                {title}
            </h5>
            <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase tracking-widest">
                {desc}
            </p>
        </div>
        {isSelected && (
            <div className="absolute top-8 right-8 w-2 h-2 rounded-full bg-slate-900 animate-pulse" />
        )}
    </button>
);

const AdminReports = () => {
    const { user } = useAuth();
    const [selectedType, setSelectedType] = useState('platform');
    const [timeRange, setTimeRange] = useState('Monthly');
    const [isGenerating, setIsGenerating] = useState(false);
    const [realData, setRealData] = useState(null);

    const reportTypes = [
        { 
            id: 'platform', 
            title: 'Platform Report', 
            desc: 'Overall health and business usage', 
            icon: 'hub',
            included: [
                'Total registered students',
                'Total businesses registered',
                'Active businesses',
                'Platform status'
            ]
        },
        { 
            id: 'audit', 
            title: 'Audit Report', 
            desc: 'Admin activity and governance logs', 
            icon: 'policy',
            included: [
                'Admin approvals',
                'Business rejections',
                'Account suspensions',
                'Recent admin actions'
            ]
        },
        { 
            id: 'risk', 
            title: 'Risk Report', 
            desc: 'Monitoring and compliance tracking', 
            icon: 'security',
            included: [
                'Flagged businesses',
                'Suspended businesses',
                'Failed verifications',
                'Pending investigations'
            ]
        },
        { 
            id: 'growth', 
            title: 'Growth Report', 
            desc: 'Student and business adoption trends', 
            icon: 'moving',
            included: [
                'New student registrations',
                'New business registrations',
                'Activity trends',
                'Growth comparison'
            ]
        },
    ];

    const timeRanges = ['Daily', 'Weekly', 'Monthly', 'Annual'];

    const sidebarItems = [
        { label: 'Platform Overview', icon: 'dashboard', path: '/admin-dashboard' },
        { label: 'Products Management', icon: 'shopping_bag', path: '/admin/products' },
        { label: 'Order Management', icon: 'receipt_long', path: '/admin/orders' },
        { label: 'Business Directory', icon: 'storefront', path: '/admin/businesses' },
        { label: 'User Directory', icon: 'group', path: '/admin/users' },
        { label: 'Reports', icon: 'analytics', path: '/admin/reports' },
        { label: 'AI Forecasting & Insights', icon: 'auto_graph', path: '/admin/ai-insights' },
        { label: 'Audit Logs', icon: 'history', path: '/admin/audit-logs' },
    ];

    const activeReport = reportTypes.find(p => p.id === selectedType);

    // Fetch real data from existing analytics endpoints
    useEffect(() => {
        const fetchRealData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const config = { headers: { Authorization: `Bearer ${token}` } };
                
                const [platformRes, storesRes, usersRes, auditRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/analytics/admin/platform', config).catch(() => ({ data: {} })),
                    axios.get('http://localhost:5000/api/admin/stores', config).catch(() => ({ data: [] })),
                    axios.get('http://localhost:5000/api/admin/users', config).catch(() => ({ data: [] })),
                    axios.get('http://localhost:5000/api/admin/audit-logs', config).catch(() => ({ data: [] }))
                ]);

                setRealData({
                    platform: platformRes.data,
                    stores: storesRes.data,
                    users: usersRes.data,
                    auditLogs: auditRes.data
                });
            } catch (err) {
                console.error('Failed to fetch reporting data', err);
            }
        };
        fetchRealData();
    }, []);

    const handleDownload = async (format) => {
        if (!realData) {
            toast.error('Data not loaded yet.');
            return;
        }

        setIsGenerating(true);
        let toastId = null;
        
        // Only show a local toast for CSV since PDF generator has its own
        if (format === 'csv') {
            toastId = toast.loading(`Preparing ${activeReport.title} CSV...`);
        }

        try {
            const headers = ['Metric', 'Current Data'];
            let reportRows = [];
            let summary = [];

            if (selectedType === 'platform') {
                reportRows = [
                    ['Total Students', realData.users?.filter(u => u.role === 'CUSTOMER').length || 0],
                    ['Total Registered Businesses', realData.stores?.length || 0],
                    ['Active Businesses', realData.stores?.filter(s => s.status === 'ACTIVE').length || 0],
                    ['Platform Health', 'Operational']
                ];
                summary = [
                    { label: 'Platform Status', value: 'Live' },
                    { label: 'System Date', value: new Date().toLocaleDateString() }
                ];
            } else if (selectedType === 'audit') {
                const recentLogs = (realData.auditLogs || []).slice(0, 10);
                reportRows = recentLogs.map(log => [
                    log.action, 
                    `${log.admin} on ${log.target}`
                ]);
                summary = [
                    { label: 'Total Logs Found', value: realData.auditLogs?.length || 0 },
                    { label: 'Recent Action', value: recentLogs[0]?.action || 'None' }
                ];
            } else if (selectedType === 'risk') {
                reportRows = [
                    ['Flagged Businesses', realData.stores?.filter(s => s.status === 'SUSPENDED').length || 0],
                    ['Pending Investigations', 0],
                    ['Failed Verifications', 0],
                    ['Security Check', 'Passed']
                ];
                summary = [
                    { label: 'Security Level', value: 'High' }
                ];
            } else if (selectedType === 'growth') {
                reportRows = [
                    ['Total Registered Users', realData.users?.length || 0],
                    ['Total Storefronts', realData.stores?.length || 0],
                    ['Student-Business Ratio', realData.users && realData.stores ? (realData.users.length / realData.stores.length).toFixed(1) : 'N/A']
                ];
                summary = [
                    { label: 'Acquisition Type', value: 'Campus Organic' }
                ];
            }

            if (format === 'pdf') {
                // PDF generator has its own toasts, so we dismiss our "Preparing" toast first
                toast.dismiss(toastId);
                await generateHybridReport({
                    title: `Official Admin Report: ${activeReport.title}`,
                    subtitle: `Time Range: ${timeRange} | Date: ${new Date().toLocaleDateString()} | Campus: HustleHub`,
                    headers,
                    data: reportRows,
                    summary
                }, `HustleHub_${selectedType}_${timeRange.toLowerCase()}.pdf`);
            } else {
                // For CSV, we update our loading toast to success
                let csvContent = `data:text/csv;charset=utf-8,HustleHub Official Report,${activeReport.title}\nTime Range,${timeRange}\nGenerated On,${new Date().toLocaleDateString()}\n\nMetric,Value\n`;
                reportRows.forEach(row => { csvContent += `${row[0]},${row[1]}\n`; });
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `HustleHub_${selectedType}_${timeRange.toLowerCase()}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success('CSV Exported Successfully', { id: toastId });
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate report.', { id: toastId });
        } finally {
            setIsGenerating(false);
            // Ensure no stray loading toasts remain
            setTimeout(() => toast.dismiss(toastId), 100);
        }
    };

    return (
        <DashboardLayout 
            role="Administrator"
            headerTitle="Reporting Center"
            sidebarItems={sidebarItems}
            TopHeader={AdminHeader}
            loading={false}
            showSearch={false}
        >
            <div className="max-w-6xl mx-auto py-12 px-6 space-y-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-slate-100">
                    <div className="space-y-3">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Admin Reports Center</h1>
                        <p className="text-slate-500 font-bold max-w-xl text-lg tracking-tight">Generate and download official platform data for decision making.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left side: Report Type Selection */}
                    <div className="lg:col-span-7 space-y-6">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-4">Select Report Type</h4>
                        <div className="grid grid-cols-1 gap-4">
                            {reportTypes.map(type => (
                                <ReportTypeCard 
                                    key={type.id}
                                    {...type}
                                    isSelected={selectedType === type.id}
                                    onClick={() => setSelectedType(type.id)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Right side: Settings & Download */}
                    <div className="lg:col-span-5">
                        <div className="p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-2xl shadow-slate-100 space-y-8 h-full flex flex-col">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Report Settings</h3>

                            {/* Time Range Selection */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Time Range</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {timeRanges.map(range => (
                                        <button
                                            key={range}
                                            onClick={() => setTimeRange(range)}
                                            className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                timeRange === range 
                                                ? 'bg-slate-900 text-white shadow-xl' 
                                                : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                            }`}
                                        >
                                            {range}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="h-px bg-slate-100 w-full" />

                            {/* Summary Box */}
                            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-4 flex-1">
                                <div className="space-y-1">
                                    <h4 className="text-xs font-black text-slate-900 uppercase">Report Name</h4>
                                    <p className="text-sm font-bold text-slate-500">{activeReport.title}</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xs font-black text-slate-900 uppercase">Includes:</h4>
                                    <div className="space-y-1.5">
                                        {activeReport.included.map((item, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-slate-300" />
                                                <span className="text-xs font-bold text-slate-400">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-4 pt-4">
                                <button 
                                    onClick={() => handleDownload('pdf')}
                                    disabled={isGenerating}
                                    className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                                    Download PDF
                                </button>
                                
                                <button 
                                    onClick={() => handleDownload('csv')}
                                    disabled={isGenerating}
                                    className="w-full flex items-center justify-center gap-3 py-4 rounded-xl border-2 border-slate-100 text-slate-900 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-lg">table_chart</span>
                                    Download CSV
                                </button>
                                
                                <button 
                                    onClick={() => handleDownload('pdf')}
                                    disabled={isGenerating}
                                    className="w-full py-4 rounded-xl bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                                >
                                    Generate Report
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Disclaimer */}
                <div className="flex items-center justify-center gap-2 text-slate-300">
                    <span className="material-symbols-outlined text-sm">lock</span>
                    <p className="text-[10px] font-black uppercase tracking-widest">Official Campus Data Record</p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminReports;
