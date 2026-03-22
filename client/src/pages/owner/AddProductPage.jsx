import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProductForm from '../../components/products/ProductForm';
import { productService } from '../../services/productService';
import toast from 'react-hot-toast';
import OwnerHeader from '../../components/OwnerHeader';
import Footer from '../../components/Footer';

const AddProductPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      // Append ownerId to the FormData
      const userId = user?._id || user?.id || 'owner1';
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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <OwnerHeader />
      <div className="flex-grow pt-20 pb-12 px-4">
        <div className="container mx-auto">
          <div className="mb-6 max-w-2xl mx-auto">
            <button 
              onClick={() => navigate('/owner/products')}
              className="text-gray-500 hover:text-[#051094] transition-colors flex items-center text-sm font-medium bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm w-fit"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
          </div>
          <ProductForm onSubmit={handleSubmit} isLoading={isSubmitting} isEdit={false} />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AddProductPage;