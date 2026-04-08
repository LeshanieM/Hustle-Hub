import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ModelViewer from '../../components/products/ModelViewer';
import { productService } from '../../services/productService';
import toast from 'react-hot-toast';
import CustomerHeader from '../../components/CustomerHeader';
import Footer from '../../components/Footer';
import ReviewSection from '../../components/reviews/ReviewSection';
import BookingModal from '../../components/BookingModal';
import BookingSuccess from '../../components/BookingSuccess';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productService.getProductById(id);
        setProduct(data);
      } catch (error) {
        toast.error('Product not found');
        console.error(error);
        navigate('/customer/products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleBookingSuccess = (bookingData) => {
    setShowBooking(false);
    setConfirmedBooking(bookingData);
    toast.success(`Successfully booked ${product?.name}!`);
  };

  const handleSuccessClose = () => {
    setConfirmedBooking(null);
  };

  const handleViewOrders = () => {
    setConfirmedBooking(null);
    navigate('/orders');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#051094]"></div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <CustomerHeader />
      <div className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <button 
            onClick={() => navigate('/stores')}
            className="mb-8 text-gray-500 hover:text-[#051094] transition-colors flex items-center text-sm font-medium bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm w-fit"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Store
          </button>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col lg:flex-row">
            
            {/* Media Section (3D Viewer or Image) */}
            <div className="w-full lg:w-3/5 min-h-[400px] lg:min-h-[600px] bg-gray-50 flex items-center justify-center p-4 lg:p-8">
              {product.modelUrl ? (
                <ModelViewer src={product.modelUrl} alt={product.name} />
              ) : product.imageUrl ? (
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-inner bg-white flex items-center justify-center border border-gray-200">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="max-h-full max-w-full object-contain p-4 transition-transform hover:scale-105 duration-500"
                  />
                </div>
              ) : (
                <div className="text-gray-400 flex flex-col items-center">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-lg font-medium">No media available</span>
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="w-full lg:w-2/5 p-8 lg:p-12 flex flex-col">
              <div className="inline-block px-3 py-1 bg-[#051094]/10 text-[#051094] rounded-full text-xs font-bold tracking-wide uppercase mb-4 w-fit">
                {product.type || 'General'}
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">{product.name}</h1>
              
              <div className="text-3xl font-bold text-emerald-600 mb-6">
                ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
              </div>
              
              <div className="prose prose-sm sm:prose-base text-gray-600 mb-8 flex-grow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="whitespace-pre-line leading-relaxed">{product.description}</p>
              </div>
              
              <div className="mt-auto pt-8 border-t border-gray-100">
                <button
                  onClick={() => setShowBooking(true)}
                  className="w-full py-4 px-8 bg-[#051094] hover:bg-[#051094]/90 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center transform hover:-translate-y-1"
                >
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Book Now
                </button>
                <p className="text-center text-sm text-gray-500 mt-4 font-medium">
                  Booking reserves this product. Payment is handled securely.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Customer Reviews Integration */}
      <div className="bg-white border-t border-gray-100 mt-8">
        <ReviewSection targetType="product" targetId={id} />
      </div>
      
      <Footer />

      {/* Booking Modal */}
      {showBooking && (
        <BookingModal
          product={product}
          onClose={() => setShowBooking(false)}
          onSuccess={handleBookingSuccess}
        />
      )}

      {/* Booking Success Overlay */}
      {confirmedBooking && (
        <BookingSuccess
          booking={confirmedBooking}
          onClose={handleSuccessClose}
          onViewOrders={handleViewOrders}
        />
      )}
    </div>
  );
};

export default ProductDetailsPage;