import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import StatCard from '../../components/dashboard/StatCard';
import TableComponent from '../../components/dashboard/TableComponent';
import { ShoppingBag, AlertTriangle, CheckCircle, Search, Filter, MoreVertical, Flag, Eye } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { resolveImageUrl } from '../../utils/imageUtils';
import toast from 'react-hot-toast';

const AdminProducts = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllProducts();
            setProducts(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Failed to load products');
            toast.error('Could not fetch product list');
        } finally {
            setLoading(false);
        }
    };

    const handleFlagFake = async (id) => {
        try {
            const updatedProduct = await adminService.toggleProductFlag(id);
            setProducts(prev => prev.map(p => 
                p._id === id ? { ...p, isFake: updatedProduct.isFake, status: updatedProduct.status } : p
            ));
            toast.success(updatedProduct.isFake ? 'Product flagged as fake' : 'Product unflagged');
        } catch (err) {
            console.error('Error flagging product:', err);
            toast.error('Failed to update product status');
        }
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


    return (
        <AdminLayout
            headerTitle="Product Intelligence"
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
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-96 bg-white rounded-3xl border border-slate-100 shadow-sm animate-pulse">
                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Synchronizing Product Database...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-96 bg-rose-50 rounded-3xl border border-rose-100 shadow-sm">
                        <AlertTriangle className="text-rose-500 mb-4" size={48} />
                        <h3 className="text-lg font-black text-rose-900 uppercase">Connection Failed</h3>
                        <p className="text-rose-600/70 text-sm mb-6">{error}</p>
                        <button 
                            onClick={fetchProducts}
                            className="px-6 py-2 bg-rose-600 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-200"
                        >
                            Retry Connection
                        </button>
                    </div>
                ) : (
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
                        <tr key={product._id} className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    {product.imageUrl ? (
                                        <div className="w-10 h-10 rounded-lg shrink-0 border border-slate-200 shadow-sm bg-cover bg-center" style={{ backgroundImage: `url(${resolveImageUrl(product.imageUrl)})` }} />
                                    ) : (
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow-sm shrink-0 ${product.isFake ? 'bg-rose-500' : 'bg-slate-800'}`}>
                                            {product.name.charAt(0)}
                                        </div>
                                    )}

                                    <div>
                                        <div className="font-bold text-slate-900 text-sm whitespace-nowrap">{product.name}</div>
                                        <div className="text-[10px] text-slate-400 font-medium tracking-wide">ID: {product._id.slice(-8)}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                                    {product.category}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <span className="text-xs font-semibold text-slate-600 italic">@{product.seller}</span>
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-900 text-sm tracking-tight text-right">
                                ${product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-4">
                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${product.isFake
                                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                    }`}>
                                    {product.isFake ? <AlertTriangle size={12} strokeWidth={3} /> : <CheckCircle size={12} strokeWidth={3} />}
                                    {product.isFake ? 'Fake' : 'Genuine'}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2 justify-end">
                                    <button
                                        onClick={() => navigate(`/admin/products/${product._id}`)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all hover:bg-slate-200 active:scale-95"
                                    >
                                        <Eye size={12} />
                                        View
                                    </button>
                                    <button
                                        onClick={() => handleFlagFake(product._id)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 ${product.isFake
                                            ? 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50'
                                            : 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm'
                                            }`}
                                    >
                                        <Flag size={12} className={product.isFake ? 'fill-slate-400' : 'fill-white'} />
                                        {product.isFake ? 'Unflag' : 'Flag Fake'}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )}
                />
            )}
            </div>

        </AdminLayout>
    );
};

export default AdminProducts;
