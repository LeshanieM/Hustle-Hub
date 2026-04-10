import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import toast from 'react-hot-toast';
import OwnerLayout from '../../components/dashboard/OwnerLayout';
import { resolveImageUrl } from '../../utils/imageUtils';

import { useAuth } from '../../context/AuthContext';

const OwnerProductsAlerts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const ownerId = user?._id || user?.id || 'owner1'; 

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await productService.getProductsByOwner(ownerId);
      setProducts(data);
    } catch (error) {
      toast.error('Failed to load products');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(id);
        setProducts(products.filter(p => p._id !== id));
        toast.success('Product deleted successfully');
      } catch (error) {
        toast.error('Failed to delete product');
        console.error(error);
      }
    }
  };


  return (
    <OwnerLayout activeTab="alerts" headerTitle="System Alerts">
      <div className="pb-12 bg-slate-50/50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Products</h1>
              <p className="text-slate-500 mt-1 font-medium">Manage your catalog, fix pricing, and track your global inventory.</p>
            </div>
            <Link 
              to="/owner/products/add" 
              className="bg-[#1111d4] hover:bg-[#1111d4]/90 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 tracking-wide"
            >
              <span className="material-symbols-outlined text-[20px]">add_box</span>
              Add New Product
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1111d4]"></div>
            </div>
          ) : products.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-[11px] font-black uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4 text-center">Stock Limit</th>
                      <th className="px-6 py-4 text-right">Unit Price</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map(product => (
                      <tr key={product._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            {product.imageUrl ? (
                              <div className="h-12 w-12 rounded-lg bg-slate-100 bg-cover bg-center shrink-0 border border-slate-200 shadow-sm" style={{ backgroundImage: `url(${resolveImageUrl(product.imageUrl)})` }} />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                                <span className="material-symbols-outlined text-slate-400">inventory_2</span>
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{product.name}</p>
                              {product.trackStock && product.stock <= (product.alertThreshold || 5) && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-black text-rose-600 bg-rose-50 px-2 mt-1 rounded uppercase tracking-wider">
                                  Low Stock
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex justify-center items-center px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold tracking-wide">
                            {product.type || 'Standard'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className={`text-sm font-black ${product.stock === 0 ? 'text-rose-600' : (product.trackStock && product.stock <= (product.alertThreshold || 5) ? 'text-amber-600' : 'text-slate-900')}`}>
                              {product.stock}
                            </span>
                            {!product.trackStock && <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Untracked</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-black text-slate-900">
                            ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                             <Link 
                               to={`/owner/products/edit/${product._id}`}
                               className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-[#1111d4] hover:text-white transition-colors border border-slate-200 hover:border-[#1111d4] shadow-sm"
                               title="Edit Product"
                             >
                               <span className="material-symbols-outlined text-[16px]">edit</span>
                             </Link>
                             <button 
                               onClick={() => handleDelete(product._id)}
                               className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-rose-600 hover:text-white transition-colors border border-slate-200 hover:border-rose-600 shadow-sm cursor-pointer"
                               title="Delete Product"
                             >
                               <span className="material-symbols-outlined text-[16px]">delete</span>
                             </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center max-w-2xl mx-auto">
              <div className="mx-auto w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-5 border border-slate-100">
                <span className="material-symbols-outlined text-4xl text-slate-400">inventory_2</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Your catalog is empty</h3>
              <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium">Get started by adding your first product to your storefront's inventory. You can upload images, establish pricing, and setup real-time alerts.</p>
              <Link 
                to="/owner/products/add" 
                className="inline-flex items-center gap-2 bg-[#1111d4]/10 text-[#1111d4] hover:bg-[#1111d4]/20 font-bold px-6 py-3 rounded-xl transition-colors tracking-wide"
              >
                <span className="material-symbols-outlined text-[20px]">add_box</span>
                Add First Product
              </Link>
            </div>
          )}
        </div>
      </div>
    </OwnerLayout>
  );
};

export default OwnerProductsAlerts;