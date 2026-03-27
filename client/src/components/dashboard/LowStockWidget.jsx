import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const LowStockWidget = () => {
    const [alertsData, setAlertsData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/analytics/owner/inventory-alerts', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // Only keep tracked products that are running low
                const criticalAlerts = res.data?.alerts?.filter(a => a.trackStock && a.stock <= a.threshold) || [];
                setAlertsData({ ...res.data, alerts: criticalAlerts });
            } catch (err) {
                console.error('Failed to fetch alerts:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAlerts();
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden min-h-[200px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
            </div>
        );
    }

    const hasAlerts = alertsData?.alerts?.length > 0;

    return (
        <div className="bg-white backdrop-blur-3xl rounded-[2rem] border border-slate-200 shadow-2xl relative overflow-hidden flex flex-col h-full group">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose-500/20 to-transparent"></div>
            <div className="p-7 border-b border-slate-200/50 flex items-center justify-between bg-white/50 z-10">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <span className={`material-symbols-outlined ${hasAlerts ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {hasAlerts ? 'warning' : 'inventory'}
                        </span>
                        Low Stock Warnings
                    </h3>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${hasAlerts ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'}`}>
                        {alertsData?.lowStockCount || 0} ALERTS
                    </span>
                </div>
                <Link to="/analytics" className="text-xs font-bold text-[#1111d4] hover:underline">
                    Configure
                </Link>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 px-2 pb-2">
                <table className="w-full text-left">
                    <thead className="text-slate-400 text-[10px] font-bold uppercase tracking-wider sticky top-0 bg-white/95 backdrop-blur z-20">
                        <tr>
                            <th className="px-5 py-4 border-b border-slate-100">Product Name</th>
                            <th className="px-5 py-4 border-b border-slate-100 text-center">Stock</th>
                            <th className="px-5 py-4 border-b border-slate-100 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/50">
                        {hasAlerts ? (
                            alertsData.alerts.map((alert) => (
                                <tr key={alert._id} className="hover:bg-slate-50/50 transition-colors group/row">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            {alert.imageUrl ? (
                                                <div className="h-8 w-8 rounded bg-slate-100 bg-cover bg-center shrink-0" style={{ backgroundImage: `url(http://localhost:5000/${alert.imageUrl.replace('\\', '/')})` }} />
                                            ) : (
                                                <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center shrink-0">
                                                    <span className="material-symbols-outlined text-slate-400 text-sm">inventory_2</span>
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-slate-900 text-[13px]">{alert.name}</p>
                                                <p className="text-[10px] font-semibold text-rose-500 max-w-[120px] truncate">
                                                    Drops below {alert.threshold} min
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-center">
                                        <span className={`font-black text-[13px] ${alert.stock === 0 ? 'text-rose-600' : 'text-amber-600'}`}>
                                            {alert.stock}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                        <Link to={`/owner/products/edit/${alert._id}`} className="inline-block text-[11px] font-bold text-[#1111d4] bg-[#1111d4]/10 hover:bg-[#1111d4]/20 px-3 py-1.5 rounded-lg transition-colors cursor-pointer border-none shadow-sm">
                                            Restock
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="px-5 py-10 text-center text-slate-500">
                                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50 block text-emerald-500">check_circle</span>
                                    <p className="text-sm font-bold text-slate-900 mb-1">Stock levels healthy</p>
                                    <p className="text-xs text-slate-400">All your tracked inventory is above the alert thresholds.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LowStockWidget;
