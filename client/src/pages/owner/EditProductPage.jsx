import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductForm from '../../components/products/ProductForm';
import { productService } from '../../services/productService';
import toast from 'react-hot-toast';
import OwnerHeader from '../../components/OwnerHeader';
import Footer from '../../components/Footer';

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
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#051094]"></div>
      </div>
    );
  }

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
          <ProductForm 
            initialData={productData} 
            onSubmit={handleSubmit} 
            isLoading={isSubmitting} 
            isEdit={true} 
          />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EditProductPage;