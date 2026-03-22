import React, { useState, useEffect, useCallback } from 'react';
import ReviewCard from './ReviewCard';
import AddReviewModal from './AddReviewModal';
import AISummaryCard from './AISummaryCard';
import toast, { Toaster } from 'react-hot-toast';
import api from '../../api/axios';

const ReviewSection = ({ targetType, targetId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) setCurrentUser(JSON.parse(userStr));
    } catch (e) {
      console.error('Failed to parse user from local storage');
    }
  }, []);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = targetType === 'product' 
        ? `/reviews/product/${targetId}` 
        : `/reviews/store/${targetId}`;
        
      const response = await api.get(endpoint);
      setReviews(response.data);
    } catch (error) {
      toast.error('Could not load reviews.');
    } finally {
      setLoading(false);
    }
  }, [targetType, targetId]);

  useEffect(() => {
    if (targetType && targetId) {
      fetchReviews();
    }
  }, [fetchReviews, targetType, targetId]);

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      toast.success('Review deleted');
      fetchReviews(); // Re-fetch list
    } catch (error) {
      toast.error(error.message);
    }
  };

  const userRole = currentUser?.role || currentUser?.user?.role || '';
  const isCustomer = userRole.toUpperCase() === 'CUSTOMER';

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <Toaster position="top-right" />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Customer Reviews</h2>
          <p className="text-gray-500 mt-1 font-medium">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</p>
        </div>
        
        {currentUser && (
          <button 
            onClick={() => { setEditingReview(null); setIsModalOpen(true); }}
            className="mt-4 sm:mt-0 px-6 py-2.5 bg-[#051094] hover:bg-blue-900 text-white font-bold rounded-lg transition-all hover:-translate-y-0.5 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            Write a Review
          </button>
        )}
      </div>

      {targetType === 'product' && reviews.length >= 3 && currentUser && (
        <AISummaryCard productId={targetId} />
      )}

      {loading ? (
        <div className="py-12 flex justify-center">
          <svg className="animate-spin h-8 w-8 text-[#051094]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No reviews yet</h3>
          <p className="text-gray-500">Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <ReviewCard 
              key={review._id} 
              review={review} 
              currentUser={currentUser} 
              onDelete={handleDelete}
              onEditClick={() => { setEditingReview(review); setIsModalOpen(true); }}
            />
          ))}
        </div>
      )}

      <AddReviewModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingReview(null); }}
        targetType={targetType}
        targetId={targetId}
        onSuccess={() => fetchReviews()}
        reviewToEdit={editingReview}
      />
    </div>
  );
};

export default ReviewSection;
