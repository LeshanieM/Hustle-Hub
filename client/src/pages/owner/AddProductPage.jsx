import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProductForm from '../../components/products/ProductForm';
import { productService } from '../../services/productService';
import toast from 'react-hot-toast';
import OwnerLayout from '../../components/dashboard/OwnerLayout';

const AddProductPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const userId = user?._id || user?.id;
      if (!userId) {
        throw new Error('Missing owner account information');
      }

      formData.append('ownerId', userId);

      await productService.createProduct(formData);
      toast.success('Product created successfully!');
      navigate('/owner/products');
    } catch (error) {
      toast.error('Failed to create product. Please try again.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OwnerLayout activeTab="products" headerTitle="Inbound Inventory">
      <div className="pb-12 px-4">
        <div className="container mx-auto">
          <div className="mb-8 max-w-2xl mx-auto flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Add New Product</h2>
              <p className="text-slate-500 text-sm font-medium">Define your item details, pricing, and stock limits.</p>
            </div>
            <button 
              onClick={() => navigate('/owner/products')}
              className="text-slate-500 hover:text-[#1111d4] transition-colors flex items-center text-xs font-bold bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md"
            >
              <span className="material-symbols-outlined text-[18px] mr-1.5">arrow_back</span>
              Back to Catalog
            </button>
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ProductForm onSubmit={handleSubmit} isLoading={isSubmitting} isEdit={false} />
          </div>
        </div>
      </div>
    </OwnerLayout>
  );
};

export default AddProductPage;
