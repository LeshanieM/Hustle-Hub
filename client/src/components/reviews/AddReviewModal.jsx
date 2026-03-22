import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const AddReviewModal = ({ isOpen, onClose, targetType, targetId, onSuccess, reviewToEdit }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (reviewToEdit) {
      setRating(reviewToEdit.rating);
      setHoverRating(reviewToEdit.rating);
      setFeedback(reviewToEdit.feedback);
    } else {
      setRating(0);
      setHoverRating(0);
      setFeedback('');
    }
  }, [reviewToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }

    if (feedback.trim().length < 10) {
      toast.error('Feedback must be at least 10 characters');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        rating,
        feedback,
      };

      if (!reviewToEdit) {
        if (targetType === 'product') {
          payload.product_id = targetId;
        } else {
           payload.storefront_id = targetId;
        }
      }

      const isEdit = !!reviewToEdit;
      const url = isEdit ? `/reviews/${reviewToEdit._id}` : `/reviews`;
      
      const response = isEdit 
        ? await api.put(url, payload)
        : await api.post(url, payload);

      toast.success('Review published successfully!');
      
      // Reset state
      setRating(0);
      setHoverRating(0);
      setFeedback('');
      
      onSuccess(response.data);
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
         style={{ animation: 'fadeIn 0.2s ease-out forwards' }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#051094]"></div>
        <div className="flex justify-between items-center p-5 border-b border-gray-100 mt-1">
          <h3 className="text-xl font-bold text-gray-900">{reviewToEdit ? 'Edit Review' : 'Write a Review'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none p-1.5 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6 flex flex-col items-center">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Overall Rating
            </label>
            <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none transition-transform hover:scale-110"
                  onMouseEnter={() => setHoverRating(star)}
                  onClick={() => setRating(star)}
                  aria-label={`Rate ${star} stars`}
                >
                  <svg
                    className={`w-10 h-10 cursor-pointer transition-colors duration-200 ${(hoverRating || rating) >= star ? 'text-[#051094]' : 'text-gray-200'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="feedback" className="block text-sm font-semibold text-gray-700 mb-2">
              Your Review
            </label>
            <textarea
              id="feedback"
              rows="4"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#051094] focus:bg-white resize-none transition-all placeholder:text-gray-400 text-gray-800"
              placeholder="What did you think? Share your experience (min. 10 characters)..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              minLength={10}
            ></textarea>
            <p className="text-xs text-gray-400 mt-1 text-right">{feedback.length} characters</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-lg font-bold text-white transition-all shadow-md focus:outline-none focus:ring-4 focus:ring-blue-300
              ${loading 
                ? 'bg-blue-400 cursor-not-allowed shadow-none' 
                : 'bg-[#051094] hover:bg-blue-900 hover:shadow-lg hover:-translate-y-0.5'
              }`}
          >
            {loading ? (reviewToEdit ? 'Updating...' : 'Submitting...') : (reviewToEdit ? 'Update Review' : 'Post Review')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddReviewModal;
