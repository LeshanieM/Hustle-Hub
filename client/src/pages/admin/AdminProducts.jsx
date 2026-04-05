import { useState, useMemo } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import TableComponent from '../../components/dashboard/TableComponent';
import AdminHeader from '../../components/AdminHeader';
import { ShoppingBag, AlertTriangle, CheckCircle, Search, Filter, MoreVertical, Flag } from 'lucide-react';

const AdminProducts = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    
    // Mock Data
    const [products, setProducts] = useState([
        { 
            _id: '1', 
            name: 'iPhone 15 Pro Max', 
            category: 'Electronics', 
            price: 1200, 
            seller: 'TechStore', 
            status: 'Verified',
            isFake: false,
            createdAt: '2024-03-15'
        },
        { 
            _id: '2', 
            name: 'Vintage Wood Chair', 
            category: 'Furniture', 
            price: 150, 
            seller: 'OldIsGold', 
            status: 'Verified',
            isFake: false,
            createdAt: '2024-03-14'
        },
        { 
            _id: '3', 
            name: 'Gucci Handbag (Replica)', 
            category: 'Fashion', 
            price: 50, 
            seller: 'FastFashion', 
            status: 'Pending',
            isFake: true,
            createdAt: '2024-03-13'
        },
        { 
            _id: '4', 
            name: 'Nike Air Jordan 1', 
            category: 'Shoes', 
            price: 200, 
            seller: 'SneakerHead', 
            status: 'Verified',
            isFake: false,
            createdAt: '2024-03-12'
        },
        { 
            _id: '5', 
            name: 'Sony WH-1000XM5', 
            category: 'Electronics', 
            price: 350, 
            seller: 'AudioPhile', 
            status: 'Verified',
            isFake: false,
            createdAt: '2024-03-11'
        },
        { 
            _id: '6', 
            name: 'Rolex Submariner (AA Copy)', 
            category: 'Watches', 
            price: 100, 
            seller: 'LuxDups', 
            status: 'Flagged',
            isFake: true,
            createdAt: '2024-03-10'
        }
    ]);

    const handleFlagFake = (id) => {
        setProducts(prev => prev.map(p => 
            p._id === id ? { ...p, isFake: !p.isFake, status: !p.isFake ? 'Flagged' : 'Verified' } : p
        ));
    };

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 p.seller.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
            return matchesSearch && matchesCategory;
        });
    }, [products, searchTerm, filterCategory]);

    const stats = useMemo(() => {
        const total = products.length;
        const fake = products.filter(p => p.isFake).length;
        const verified = total - fake;
        return { total, fake, verified };
    }, [products]);

    const categories = ['All', ...new Set(products.map(p => p.category))];

    const sidebarItems = [
        { label: 'Platform Overview', icon: 'dashboard', path: '/admin-dashboard' },
        { label: 'Products Management', icon: 'shopping_bag', path: '/admin/products' },
        { label: 'Business Directory', icon: 'storefront', path: '/admin/businesses' },
        { label: 'User Directory', icon: 'group', path: '/admin/users' },
        { label: 'AI Forecasting & Insights', icon: 'auto_graph', path: '/admin/ai-insights' }, 
        { label: 'Audit Logs', icon: 'history', path: '/admin/audit-logs' }, 
    ];

    return (
        <DashboardLayout 
            role="Administrator" 
            headerTitle="Product Intelligence"
            sidebarItems={sidebarItems}
            TopHeader={AdminHeader}
        >
            <div className="space-y-8 max-w-[1600px] mx-auto">
                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard 
                        title="Total Products" 
                        value={stats.total} 
                        icon="shopping_bag" 
                        color="blue" 
                        trend="up" 
                        trendValue="+5%" 
                    />
                    <StatCard 
                        title="Flagged as Fake" 
                        value={stats.fake} 
                        icon="report" 
                        color="rose" 
                        trend="down" 
                        trendValue="12.5%" 
                    />
                    <StatCard 
                        title="Verified Genuine" 
                        value={stats.verified} 
                        icon="verified" 
                        color="emerald" 
                        trend="up" 
                        trendValue="+8%" 
                    />
                </div>

                {/* Main Table Section */}
                <TableComponent 
                    title="Global Product Listing"
                    headers={['Product Details', 'Category', 'Seller', 'Price', 'Status', 'Actions']}
                    data={filteredProducts}
                    actions={
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Search products..." 
                                    className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select 
                                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    }
                    renderRow={(product) => (
                        <tr key={product._id} className="hover:bg-slate-50/80 transition-all border-b border-slate-50 last:border-0 group">
                            <td className="px-6 py-5">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-sm ${
                                        product.isFake ? 'bg-gradient-to-br from-rose-500 to-orange-500' : 'bg-gradient-to-br from-indigo-500 to-blue-500'
                                    }`}>
                                        {product.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-black text-slate-900 text-sm group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{product.name}</div>
                                        <div className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">ID: {product._id}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-5">
                                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                                    {product.category}
                                </span>
                            </td>
                            <td className="px-6 py-5">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase">
                                        {product.seller.charAt(0)}
                                    </div>
                                    <span className="text-xs font-bold text-slate-700">{product.seller}</span>
                                </div>
                            </td>
                            <td className="px-6 py-5 font-black text-slate-900 text-sm tracking-tight text-right">
                                ${product.price.toLocaleString()}
                            </td>
                            <td className="px-6 py-5">
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                                    product.isFake 
                                        ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                }`}>
                                    {product.isFake ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                                    {product.isFake ? 'Fake / Imitation' : 'Verified Genuine'}
                                </div>
                            </td>
                            <td className="px-6 py-5">
                                <div className="flex items-center gap-2 justify-end">
                                    <button 
                                        onClick={() => handleFlagFake(product._id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 ${
                                            product.isFake 
                                                ? 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50' 
                                                : 'bg-rose-600 text-white hover:bg-rose-700 hover:shadow-lg hover:shadow-rose-200'
                                        }`}
                                    >
                                        <Flag size={14} className={product.isFake ? 'fill-slate-400' : 'fill-white'} />
                                        {product.isFake ? 'Unflag Product' : 'Flag as Fake'}
                                    </button>
                                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                                        <MoreVertical size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )}
                />
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .space-y-8 {
                    animation: fadeIn 0.5s ease-out forwards;
                }
            `}</style>
        </DashboardLayout>
    );
};

export default AdminProducts;
