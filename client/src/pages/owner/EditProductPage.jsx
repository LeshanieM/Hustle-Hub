import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductForm from '../../components/products/ProductForm';
import { productService } from '../../services/productService';
import toast from 'react-hot-toast';
import OwnerLayout from '../../components/dashboard/OwnerLayout';

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [productData, setProductData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productService.getProductById(id);
        setProductData(data);
      } catch (error) {
        toast.error('Could not load product details');
        console.error(error);
        navigate('/owner/products');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      await productService.updateProduct(id, formData);
      toast.success('Product updated successfully!');
      navigate('/owner/products');
    } catch (error) {
      toast.error('Failed to update product');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1111d4]"></div>
      </div>
    );
  }

  return (
    <OwnerLayout activeTab="products" headerTitle="Catalog Modification">
      <div className="pb-12 px-4">
        <div className="container mx-auto">
          <div className="mb-8 max-w-2xl mx-auto flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Edit Product</h2>
              <p className="text-slate-500 text-sm font-medium">Update your item's description, pricing, or stock parameters.</p>
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
            <ProductForm 
              initialData={productData} 
              onSubmit={handleSubmit} 
              isLoading={isSubmitting} 
              isEdit={true} 
            />
          </div>
        </div>
      </div>
    </OwnerLayout>
  );
};

export default EditProductPage;