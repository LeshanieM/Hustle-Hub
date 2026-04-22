import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

const CATEGORY_ICONS = {
  food: '🍔',
  stationery: '✏️',
  electronics: '💻',
  clothing: '👕',
  accessories: '👜',
  books: '📚',
  other: '📦',
};

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(star => (
      <svg
        key={star}
        className={`w-4 h-4 ${star <= rating ? 'text-amber-400' : 'text-gray-200'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const MyReviewsPanel = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    api.get('/reviews/my')
      .then(res => setReviews(res.data || []))
      .catch(err => console.error('Failed to load my reviews:', err))
      .finally(() => setLoading(false));
  }, []);

  // Build unique category filter tabs
  const categories = ['All', ...new Set(
    reviews
      .map(r => r.product_id?.type || 'other')
      .filter(Boolean)
  )];

  const filtered = activeFilter === 'All'
    ? reviews
    : reviews.filter(r => (r.product_id?.type || 'other') === activeFilter);

  if (loading) {
    return (
      <div className="w-full flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#051094]" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">💬</span>
            <h2 className="text-2xl font-black text-gray-900">My Reviews</h2>
          </div>
          <p className="text-gray-500 text-sm font-medium">
            {reviews.length} review{reviews.length !== 1 ? 's' : ''} across {categories.length - 1} categor{categories.length - 1 !== 1 ? 'ies' : 'y'}
          </p>
        </div>

        {/* Avg rating pill */}
        {reviews.length > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2.5">
            <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-black text-gray-900">
              {(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)}
            </span>
            <span className="text-gray-400 text-sm font-medium">avg rating</span>
          </div>
        )}
      </div>

      {/* Category filter tabs */}
      {categories.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap mb-6">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl border-2 transition-all duration-200 focus:outline-none
                ${activeFilter === cat
                  ? 'bg-[#051094] border-[#051094] text-white shadow-md shadow-[#051094]/20'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-[#051094]/40 hover:text-[#051094]'
                }`}
            >
              {cat !== 'All' && <span>{CATEGORY_ICONS[cat] || '📦'}</span>}
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="text-6xl mb-4">💬</span>
          <h3 className="text-xl font-black text-gray-700 mb-2">No reviews yet</h3>
          <p className="text-gray-400 font-medium max-w-xs">
            {activeFilter === 'All'
              ? 'Order a product and share your experience!'
              : `No ${activeFilter} reviews found.`}
          </p>
        </div>
      )}

      {/* Review cards grid */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.map(review => {
          const product = review.product_id;
          const category = product?.type || 'other';
          const imgUrl = product?.imageUrl
            ? product.imageUrl.startsWith('http')
              ? product.imageUrl
              : `http://localhost:5000/${product.imageUrl.replace(/\\/g, '/')}`
            : null;

          return (
            <div
              key={review._id}
              className="group flex flex-col sm:flex-row gap-4 bg-white border-2 border-gray-100 hover:border-[#051094]/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* Product image */}
              <div className="flex-shrink-0 w-full sm:w-20 h-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
                {imgUrl ? (
                  <img src={imgUrl} alt={product?.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">{CATEGORY_ICONS[category] || '📦'}</span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                        review.status === 'flagged'
                          ? 'bg-red-50 text-red-600 border-red-200'
                          : 'bg-[#051094]/10 text-[#051094] border-[#051094]/20'
                      }`}>
                        {CATEGORY_ICONS[category] || '📦'} {category.charAt(0).toUpperCase() + category.slice(1)}
                      </span>
                      {review.status === 'flagged' && (
                        <span className="text-xs font-bold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                          ⚑ Flagged
                        </span>
                      )}
                    </div>
                    <h4 className="font-black text-gray-900 truncate max-w-xs">
                      {product?.name || 'Product unavailable'}
                    </h4>
                    {product?.price && (
                      <p className="text-xs text-gray-400 font-medium mt-0.5">
                        ${parseFloat(product.price).toFixed(2)}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-start sm:items-end gap-1 flex-shrink-0">
                    <StarRating rating={review.rating} />
                    <span className="text-[11px] text-gray-400 font-medium">
                      {new Date(review.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Feedback */}
                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 mt-2">
                  "{review.feedback}"
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyReviewsPanel;
