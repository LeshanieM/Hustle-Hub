import React from 'react';

const ReviewTableRow = ({ review, isSelected, toggleSelect, onApprove, onFlag, onDelete }) => {
  const isFlagged = review.status === 'flagged';
  
  const getInitials = (fName, lName) => {
    return ((fName?.[0] || '') + (lName?.[0] || '')).toUpperCase() || 'A';
  };
  const name = review.user_id?.firstName ? `${review.user_id.firstName} ${review.user_id.lastName}` : review.user_id?.username || 'Anonymous';
  
  const targetLabel = review.product_id ? 'Product' : 'Storefront';
  const targetName = review.product_id?.name || review.storefront_id?.name || 'Unknown';

  return (
    <tr className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${isFlagged ? 'bg-red-50/30' : ''}`}>
      <td className="p-4 text-center">
        <input 
          type="checkbox" 
          checked={isSelected}
          onChange={() => toggleSelect(review._id)}
          className="w-4 h-4 text-[#051094] rounded border-gray-300 focus:ring-[#051094] cursor-pointer"
        />
      </td>
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#051094] text-white flex items-center justify-center text-xs font-bold shadow-sm shrink-0">
            {getInitials(review.user_id?.firstName, review.user_id?.lastName)}
          </div>
          <span className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">{name}</span>
        </div>
      </td>
      <td className="p-4 min-w-[150px]">
        <div className="flex flex-col items-start gap-1">
          <span className={`inline-block text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full ${review.product_id ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
            {targetLabel}
          </span>
          <span className="text-sm text-gray-600 font-medium truncate max-w-[180px]">{targetName}</span>
        </div>
      </td>
      <td className="p-4">
        <div className="flex text-[#051094] text-sm">
          {[1,2,3,4,5].map(s => <span key={s} className={s <= review.rating ? '' : 'text-gray-200'}>★</span>)}
        </div>
      </td>
      <td className="p-4 w-1/3">
        <p className="text-sm text-gray-600 truncate max-w-[200px]" title={review.feedback}>
          {review.feedback}
        </p>
      </td>
      <td className="p-4 text-sm text-gray-500 font-medium whitespace-nowrap">
        {new Date(review.created_at).toLocaleDateString()}
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          {isFlagged ? (
            <button onClick={() => onApprove(review._id)} className="text-xs font-bold text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded transition-colors cursor-pointer border border-emerald-200">
              Approve
            </button>
          ) : (
            <button onClick={() => onFlag(review._id)} className="text-xs font-bold text-amber-500 hover:bg-amber-50 px-2 py-1 rounded transition-colors cursor-pointer border border-amber-200">
              Flag
            </button>
          )}
          <button onClick={() => onDelete(review._id)} className="text-xs font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors cursor-pointer border border-red-200">
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

export default ReviewTableRow;
