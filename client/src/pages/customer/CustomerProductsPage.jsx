import React, { useState, useEffect } from 'react';
import ProductCard from '../../components/products/ProductCard';
import { productService } from '../../services/productService';
import toast from 'react-hot-toast';
import CustomerHeader from '../../components/CustomerHeader';
import Footer from '../../components/Footer';

const CustomerProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (error) {
      toast.error('Failed to load products');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const productTypes = ['All', ...new Set(products.map(p => p.type || 'General'))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'All' || product.type === selectedType || (!product.type && selectedType === 'General');
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <CustomerHeader />
      <div className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">University Storefront</h1>
            <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">Discover exclusive university merchandise, tickets, and collectibles.</p>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 gap-4">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input 
                type="text" 
                placeholder="Search products..." 
                className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#051094] focus:border-[#051094] transition-colors bg-white text-gray-900"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center w-full md:w-auto overflow-x-auto pb-2 md:pb-0 space-x-2">
              {productTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedType === type 
                      ? 'bg-[#051094] text-white shadow-sm' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#051094]"></div>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product._id} 
                  product={product} 
                  isOwner={false} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100 max-w-3xl mx-auto">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No products found</h3>
              <p className="mt-2 text-gray-500">We couldn't find anything matching your search criteria.</p>
              <button 
                onClick={() => {setSearchQuery(''); setSelectedType('All');}}
                className="mt-6 text-[#051094] font-medium hover:text-[#051094]/80"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CustomerProductsPage;