import { Link } from 'react-router-dom';

const TopProductsTable = ({ topItems = [], title = "Top Selling Products", showAllLink = false }) => {
    
    return (
        <div className="bg-white backdrop-blur-3xl rounded-[2rem] border border-slate-200 flex flex-col h-full shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                        <span className="material-symbols-outlined text-[20px] block">workspace_premium</span>
                    </div>
                    {title}
                </h3>
                {showAllLink && (
                    <Link to="/owner-dashboard/products" className="text-xs font-bold text-[#1111d4] hover:underline">
                        View All
                    </Link>
                )}
            </div>
            {topItems.length > 0 ? (
                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                            <tr>
                                <th className="px-5 py-3">#</th>
                                <th className="px-5 py-3">Product</th>
                                <th className="px-5 py-3 text-center">Units Sold</th>
                                <th className="px-5 py-3 text-right">Revenue generated</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {topItems.map((item, idx) => (
                                <tr key={item._id || idx} className="hover:bg-white transition-colors">
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-xl text-[11px] font-black shadow-inner
                                            ${idx === 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : idx === 1 ? 'bg-slate-500/20 text-slate-600 border border-slate-500/30' : idx === 2 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-white text-slate-500 border border-slate-200'}`}>
                                            {idx + 1}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-900 text-[13px] tracking-wide">{item.title || item.name || 'Unnamed'}</td>
                                    <td className="px-6 py-4 text-center text-[13px] font-semibold text-slate-500">{(item.totalSold ?? item.quantity ?? 0).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right text-[13px] font-black text-emerald-400">${(item.revenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                    <span className="material-symbols-outlined text-5xl mb-3 opacity-30 text-amber-500">inventory_2</span>
                    <p className="text-sm font-bold text-slate-500">No product data yet</p>
                    <p className="text-[11px] mt-1 text-slate-500">Check back when you receive orders.</p>
                </div>
            )}
        </div>
    );
};

export default TopProductsTable;
