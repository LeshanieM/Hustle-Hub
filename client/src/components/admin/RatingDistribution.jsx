import React from 'react';

const RatingDistribution = ({ distribution, total }) => {
  const maxVal = total > 0 ? total : 1;

  const renderBar = (star, count, isDanger) => {
    const percentage = Math.round((count / maxVal) * 100) || 0;
    return (
      <div key={star} className="flex items-center gap-3 text-sm mb-3">
        <div className="w-12 text-gray-600 font-medium">{star} ★</div>
        <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${isDanger ? 'bg-red-600' : 'bg-[#051094]'}`} 
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="w-12 text-right text-gray-500 font-bold">{count}</div>
      </div>
    );
  };

  return (
    <div className="bg-white border text-left border-gray-100 shadow-sm rounded-xl p-6">
      <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
        Rating Distribution
      </h3>
      <div className="flex flex-col">
        {renderBar('5', distribution?.['5'] || 0, false)}
        {renderBar('4', distribution?.['4'] || 0, false)}
        {renderBar('3', distribution?.['3'] || 0, false)}
        {renderBar('2', distribution?.['2'] || 0, false)}
        {renderBar('1', distribution?.['1'] || 0, true)}
      </div>
    </div>
  );
};

export default RatingDistribution;
