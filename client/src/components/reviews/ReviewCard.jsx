import React from 'react';

const ReviewCard = ({ review, currentUser, onDelete, onEditClick }) => {
  const { _id, rating, feedback, created_at, user_id } = review;
  
  // Format dates
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const reviewerName = user_id?.firstName 
    ? `${user_id.firstName} ${user_id.lastName}` 
    : user_id?.username || 'Anonymous User';
  const isAdmin = currentUser?.role === 'ADMIN';
  const isOwner = currentUser?._id && user_id?._id && currentUser._id === user_id._id;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4 border-l-4 hover:border-l-[#051094] transition-all flex flex-col sm:flex-row gap-4 w-full group">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h5 className="font-bold text-gray-900">{reviewerName}</h5>
            <div className="flex items-center text-sm">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className={`text-xl leading-none ${star <= rating ? 'text-[#051094]' : 'text-gray-200'}`}>
                  ★
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
              {formatDate(created_at)}
            </span>
            {(isOwner || isAdmin) && (
              <div className="flex gap-2">
                {isOwner && (
                  <button 
                    onClick={onEditClick}
                    className="text-gray-400 hover:text-[#051094] p-1.5 rounded-lg hover:bg-blue-50 transition-colors focus:outline-none"
                    title="Edit Review"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                )}
                <button 
                  onClick={() => onDelete(_id)}
                  className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors focus:outline-none"
                  title="Delete Review"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            )}
          </div>
        </div>
        <p className="text-gray-700 text-sm md:text-base leading-relaxed mt-2">{feedback}</p>
      </div>
    </div>
  );
};

export default ReviewCard;
