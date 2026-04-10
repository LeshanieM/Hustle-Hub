import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import ModelViewer from '../../components/products/ModelViewer';
import { adminService } from '../../services/adminService';
import { 
    Flag, 
    ChevronLeft, 
    Package, 
    User, 
    Tag, 
    DollarSign, 
    AlertTriangle, 
    CheckCircle,
    Info
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const data = await adminService.getProductById(id);
            setProduct(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching product details:', err);
            setError('Failed to load product details');
            toast.error('Could not fetch product information');
        } finally {
            setLoading(false);
        }
    };

    const handleFlagFake = async () => {
        try {
            const updatedProduct = await adminService.toggleProductFlag(id);
            setProduct(updatedProduct);
            toast.success(updatedProduct.isFake ? 'Product flagged as fake' : 'Product unflagged');
        } catch (err) {
            console.error('Error flagging product:', err);
            toast.error('Failed to update product status');
        }
    };

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `http://localhost:5000/${url.replace(/\\/g, '/')}`;
    };

    if (loading) {
        return (
            <AdminLayout headerTitle="Product Investigation">
                <div className="flex flex-col items-center justify-center h-screen -mt-20">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Retrieving Product Intel...</p>
                </div>
            </AdminLayout>
        );
    }

    if (error || !product) {
        return (
            <AdminLayout headerTitle="Error">
                <div className="flex flex-col items-center justify-center h-screen -mt-20">
                    <AlertTriangle className="text-rose-500 mb-4" size={48} />
                    <h3 className="text-lg font-black text-rose-900 uppercase">Intel Retrieval Failed</h3>
                    <p className="text-rose-600/70 text-sm mb-6">{error || 'Product not found'}</p>
                    <button 
                        onClick={() => navigate('/admin/products')}
                        className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-all shadow-lg"
                    >
                        Back to Inventory
                    </button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout
            headerTitle={`Product: ${product.name}`}
        >
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Back Link */}
                <button 
                    onClick={() => navigate('/admin/products')}
                    className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-bold uppercase text-[10px] tracking-widest group"
                >
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Product Listing
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column - 3D Viewer / Image */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden relative min-h-[500px] group">
                            {product.modelUrl ? (
                                <ModelViewer 
                                    src={getImageUrl(product.modelUrl)} 
                                    alt={product.name}
                                    className="h-full"
                                />
                            ) : product.imageUrl ? (
                                <div className="h-full flex items-center justify-center p-12 bg-slate-50">
                                    <img 
                                        src={getImageUrl(product.imageUrl)} 
                                        alt={product.name} 
                                        className="max-h-full max-w-full object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-50 text-slate-300">
                                    <Package size={64} strokeWidth={1} />
                                    <p className="mt-4 font-bold uppercase text-[10px] tracking-widest">No visual data available</p>
                                </div>
                            )}

                            {/* Status Overlay */}
                            <div className="absolute top-6 right-6">
                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg ${product.isFake
                                    ? 'bg-rose-500 text-white'
                                    : 'bg-emerald-500 text-white'
                                    }`}>
                                    {product.isFake ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
                                    {product.isFake ? 'Flagged Fake' : 'Verified Genuine'}
                                </div>
                            </div>
                        </div>

                        {/* Description Box */}
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                            <h3 className="flex items-center gap-2 text-slate-900 font-black uppercase text-xs tracking-wider mb-4">
                                <Info size={16} className="text-indigo-600" />
                                Product Description
                            </h3>
                            <p className="text-slate-600 leading-relaxed text-sm">
                                {product.description || 'No description provided for this item.'}
                            </p>
                        </div>
                    </div>

                    {/* Right Column - Controls & Info */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Action Card */}
                        <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-indigo-200">
                            <h3 className="text-indigo-400 font-black uppercase text-[10px] tracking-[0.2em] mb-6">Administrative Controls</h3>
                            
                            <div className="space-y-6">
                                <div>
                                    <p className="text-slate-400 text-xs font-medium mb-4 leading-relaxed">
                                        As an administrator, you can toggle the verification status of this product. Flagging as fake will alert customers and may restrict listing visibility.
                                    </p>
                                    <button
                                        onClick={handleFlagFake}
                                        className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 shadow-xl ${product.isFake
                                            ? 'bg-white text-slate-900 hover:bg-slate-100'
                                            : 'bg-rose-600 text-white hover:bg-rose-500 shadow-rose-900/20'
                                            }`}
                                    >
                                        <Flag size={18} className={product.isFake ? 'fill-slate-900' : 'fill-white'} />
                                        {product.isFake ? 'Unflag Product' : 'Flag as Fake'}
                                    </button>
                                </div>

                                <div className="pt-6 border-t border-slate-800">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Integrity Score</span>
                                        <span className={`text-xs font-black ${product.isFake ? 'text-rose-400' : 'text-emerald-400'}`}>
                                            {product.isFake ? 'LOW / RISK' : 'HIGH / TRUSTED'}
                                        </span>
                                    </div>
                                    <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-1000 ${product.isFake ? 'bg-rose-500 w-20' : 'bg-emerald-500 w-full'}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Intel Card */}
                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 space-y-6">
                            <h3 className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">Product Intelligence</h3>
                            
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm">
                                        <Tag size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</p>
                                        <p className="text-sm font-black text-slate-900">{product.category}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm">
                                        <User size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Seller Agency</p>
                                        <p className="text-sm font-black text-slate-900 italic">@{product.seller}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-indigo-600 shadow-sm">
                                        <DollarSign size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Market Value</p>
                                        <p className="text-lg font-black text-slate-900">
                                            ${product.price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                                    <div className="flex items-center gap-2 text-indigo-900 font-black uppercase text-[10px] tracking-widest mb-1">
                                        <Package size={14} />
                                        System ID
                                    </div>
                                    <code className="text-[10px] text-indigo-600 font-mono break-all">{id}</code>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminProductDetails;
