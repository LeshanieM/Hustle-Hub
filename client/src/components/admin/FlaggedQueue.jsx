import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const FlaggedQueue = ({ refreshKey }) => {
  const [flagged, setFlagged] = useState([]);
  
  useEffect(() => {
    const fetchFlagged = async () => {
      try {
        const res = await api.get('/admin/reviews/flagged');
        setFlagged(res.data.slice(0, 3)); // 3 most recent
      } catch (err) {}
    };
    fetchFlagged();
  }, [refreshKey]);

  return (
    <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-6">
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
        Needs Action Queue
      </h3>
      {flagged.length === 0 ? (
        <div className="text-sm text-gray-400 text-center py-6">No flagged reviews!</div>
      ) : (
        <div className="flex flex-col gap-4">
          {flagged.map(review => (
            <div key={review._id} className="pl-4 border-l-[3px] border-red-500 bg-gray-50 p-3 rounded-r-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-red-600">
                  {review.product_id?.name || review.storefront_id?.name || 'Unknown Target'}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-700 line-clamp-2">{review.feedback}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FlaggedQueue;
