import { useEffect, useState } from 'react';
import axios from 'axios';

const AlertPanel = () => {
    const [alertsData, setAlertsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editingThreshold, setEditingThreshold] = useState('');
    const [selectedUntrackedId, setSelectedUntrackedId] = useState('');
    const [newThreshold, setNewThreshold] = useState(5);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/analytics/owner/inventory-alerts', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAlertsData(res.data);
            } catch (err) {
                console.error('Failed to fetch alerts:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAlerts();
    }, []);

    const handleEditClick = (alert) => {
        setEditingId(alert._id);
        setEditingThreshold(alert.threshold);
    };

    const handleSaveThreshold = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`http://localhost:5000/api/analytics/owner/inventory-alerts/${id}`, 
                { threshold: editingThreshold },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (res.data.success) {
                // Update local state
                setAlertsData(prev => {
                    const updatedAlerts = prev.alerts.map(a => 
                        a._id === id ? { 
                            ...a, 
                            threshold: res.data.threshold,
                            status: a.stock === 0 ? 'Out of Stock' : (a.stock <= res.data.threshold ? 'Low Stock' : 'Healthy')
                        } : a
                    );
                    
                    const lowStockCount = updatedAlerts.filter(a => a.trackStock && a.stock <= a.threshold).length;
                    const trackedCount = updatedAlerts.filter(a => a.trackStock).length;
                    
                    return { ...prev, alerts: updatedAlerts, lowStockCount, trackedCount };
                });
            }
        } catch (err) {
            console.error('Failed to update threshold:', err);
            alert('Failed to update alert threshold');
        } finally {
            setEditingId(null);
        }
    };

    const handleToggleTracking = async (id, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`http://localhost:5000/api/analytics/owner/inventory-alerts/${id}`, 
                { trackStock: !currentStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (res.data.success) {
                // Update local state
                setAlertsData(prev => {
                    const updatedAlerts = prev.alerts.map(a => 
                        a._id === id ? { 
                            ...a, 
                            trackStock: res.data.trackStock,
                            status: !res.data.trackStock ? 'No Tracking' : (a.stock === 0 ? 'Out of Stock' : (a.stock <= a.threshold ? 'Low Stock' : 'Healthy'))
                        } : a
                    );
                    
                    const lowStockCount = updatedAlerts.filter(a => a.trackStock && a.stock <= a.threshold).length;
                    const trackedCount = updatedAlerts.filter(a => a.trackStock).length;
                    
                    return { ...prev, alerts: updatedAlerts, lowStockCount, trackedCount };
                });
            }
        } catch (err) {
            console.error('Failed to toggle tracking:', err);
            alert('Failed to update tracking status');
        }
    };

    const handleCreateAlert = async (e) => {
        e.preventDefault();
        if (!selectedUntrackedId) return;

        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`http://localhost:5000/api/analytics/owner/inventory-alerts/${selectedUntrackedId}`, 
                { trackStock: true, threshold: newThreshold },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                setAlertsData(prev => {
                    const updatedAlerts = prev.alerts.map(a => 
                        a._id === selectedUntrackedId ? { 
                            ...a, 
                            trackStock: true,
                            threshold: Number(newThreshold),
                            status: a.stock === 0 ? 'Out of Stock' : (a.stock <= newThreshold ? 'Low Stock' : 'Healthy')
                        } : a
                    );
                    
                    const lowStockCount = updatedAlerts.filter(a => a.trackStock && a.stock <= a.threshold).length;
                    const trackedCount = updatedAlerts.filter(a => a.trackStock).length;
                    
                    return { ...prev, alerts: updatedAlerts, lowStockCount, trackedCount };
                });
                setSelectedUntrackedId('');
                setNewThreshold(5);
            }
        } catch (err) {
            console.error('Failed to create alert:', err);
            alert('Failed to configure alert tracking');
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden min-h-[200px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1111d4]"></div>
            </div>
        );
    }

    const hasAlerts = alertsData?.lowStockCount > 0;
    const trackedProducts = alertsData?.alerts?.filter(a => a.trackStock) || [];
    const untrackedProducts = alertsData?.alerts?.filter(a => !a.trackStock) || [];

    return (
        <div className="bg-white backdrop-blur-3xl rounded-[2rem] border border-slate-200 flex flex-col h-full shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose-500/20 to-transparent"></div>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
                        <span className={`material-symbols-outlined ${hasAlerts ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {hasAlerts ? 'warning' : 'inventory'}
                        </span>
                        Inventory Alerts
                    </h3>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${hasAlerts ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}>
                        {alertsData?.lowStockCount || 0} ALERTS
                    </span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white border border-slate-200 px-3 py-1.5 rounded-full">{alertsData?.trackedCount || 0} Tracked Items</span>
            </div>

            {/* Create Alert Dropdown UI */}
            <form onSubmit={handleCreateAlert} className="p-5 bg-slate-50/50 border-b border-slate-200 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px] group/input">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">Select Product</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500/70 text-lg group-focus-within/input:text-rose-400 transition-colors pointer-events-none">search</span>
                        <select 
                            value={selectedUntrackedId} 
                            onChange={(e) => setSelectedUntrackedId(e.target.value)}
                            className="w-full pl-12 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-rose-500/50 focus:bg-slate-50 transition-all appearance-none cursor-pointer"
                        >
                            <option value="" disabled className="bg-slate-50 text-slate-500">Choose an untracked product...</option>
                            {untrackedProducts.map(p => (
                                <option key={p._id} value={p._id} className="bg-white">{p.name} (Stock: {p.stock})</option>
                            ))}
                        </select>
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 text-lg pointer-events-none">expand_more</span>
                    </div>
                </div>
                <div className="w-28 group/input2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">Threshold</label>
                    <input 
                        type="number" 
                        min="0"
                        value={newThreshold}
                        onChange={(e) => setNewThreshold(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 text-center outline-none focus:border-rose-500/50 focus:bg-slate-50 transition-all cursor-text"
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={!selectedUntrackedId}
                    className="h-[46px] px-5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-sm font-bold hover:bg-rose-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer shadow-lg backdrop-blur-md"
                >
                    <span className="material-symbols-outlined text-[18px]">add_alert</span>
                    Create
                </button>
            </form>
            
            <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-slate-50/50 text-slate-500 text-[10px] font-bold uppercase tracking-widest sticky top-0 z-10 backdrop-blur-md">
                        <tr>
                            <th className="px-6 py-4">Tracked Product</th>
                            <th className="px-6 py-4 text-center">Stock</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {trackedProducts.length > 0 ? (
                            trackedProducts.map((alert) => (
                                <tr key={alert._id} className={`hover:bg-white transition-colors ${alert.stock <= alert.threshold ? 'bg-rose-500/[0.05]' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            {alert.imageUrl ? (
                                                <div className="h-10 w-10 rounded-xl bg-white bg-cover bg-center shrink-0 border border-slate-200 shadow-inner" style={{ backgroundImage: `url(http://localhost:5000/${alert.imageUrl.replace('\\', '/')})` }} />
                                            ) : (
                                                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shrink-0 border border-slate-200 shadow-inner">
                                                    <span className="material-symbols-outlined text-slate-500 text-lg">inventory_2</span>
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-slate-900 text-[13px]">{alert.name}</p>
                                                <p className="text-[10px] font-semibold text-slate-500 max-w-[120px] truncate">{alert.type}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className={`font-black text-[13px] ${alert.stock === 0 ? 'text-rose-500' : (alert.stock <= alert.threshold ? 'text-amber-500' : 'text-slate-600')}`}>
                                                {alert.stock}
                                            </span>
                                            {editingId === alert._id ? (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <span className="text-[9px] font-bold text-slate-500">/</span>
                                                    <input 
                                                        type="number" 
                                                        min="0"
                                                        value={editingThreshold} 
                                                        onChange={(e) => setEditingThreshold(e.target.value)}
                                                        className="w-10 text-[10px] text-center border border-[#1111d4] rounded outline-none px-1 py-0.5"
                                                        autoFocus
                                                    />
                                                    <button onClick={() => handleSaveThreshold(alert._id)} className="text-[#1111d4] hover:bg-[#1111d4]/10 rounded flex items-center justify-center p-0.5 border-none bg-transparent cursor-pointer">
                                                        <span className="material-symbols-outlined text-[14px]">check</span>
                                                    </button>
                                                </div>
                                            ) : (
                                                <button onClick={() => handleEditClick(alert)} className="group flex items-center gap-1 text-[9px] font-bold text-slate-500 uppercase hover:text-[#1111d4] border-none bg-transparent cursor-pointer p-0 mt-0.5">
                                                    / {alert.threshold} min
                                                    <span className="material-symbols-outlined text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">edit</span>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border whitespace-nowrap
                                            ${alert.stock === 0 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : (alert.stock <= alert.threshold ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20')}`}>
                                            <span className="material-symbols-outlined text-[14px] shrink-0">{alert.stock === 0 ? 'error' : (alert.stock <= alert.threshold ? 'warning_amber' : 'check_circle')}</span>
                                            {alert.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleToggleTracking(alert._id, alert.trackStock)} className="text-[11px] font-bold text-slate-500 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-200 bg-transparent flex items-center gap-1.5 ml-auto">
                                            <span className="material-symbols-outlined text-[16px]">notifications_off</span>
                                            Untrack
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                    <span className="material-symbols-outlined text-5xl mb-3 opacity-30 block text-rose-500">inventory_2</span>
                                    <p className="text-sm font-bold text-slate-900 mb-1 tracking-wide">No tracked products</p>
                                    <p className="text-xs text-slate-500">Use the dropdown above to create inventory alerts.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AlertPanel;
