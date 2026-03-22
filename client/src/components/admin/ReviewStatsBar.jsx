import React from 'react';

const ReviewStatsBar = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Total Reviews</div>
        <div className="text-[22px] font-medium text-gray-900 border-l-4 pl-3 border-[#051094]">
          {stats?.totalReviews || 0}
        </div>
        <span className="text-xs font-medium text-emerald-600 mt-2 block">
          +{stats?.weeklyNew || 0} this week
        </span>
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Platform Avg Rating</div>
        <div className="text-[22px] font-medium text-[#051094] border-l-4 pl-3 border-[#051094]">
          {stats?.platformAvgRating || '0.0'} ★
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Flagged Reviews</div>
        <div className={`text-[22px] font-medium border-l-4 pl-3 ${stats?.flaggedCount > 0 ? 'text-red-600 border-red-600' : 'text-amber-500 border-amber-500'}`}>
          {stats?.flaggedCount || 0}
        </div>
        <span className="text-xs font-medium text-gray-400 mt-2 block">Needs Attention</span>
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">1-Star Reviews</div>
        <div className="text-[22px] font-medium text-red-600 border-l-4 pl-3 border-red-600">
          {stats?.oneStarCount || 0}
        </div>
        <span className="text-xs font-medium text-gray-400 mt-2 block">Critical Feedback</span>
      </div>
    </div>
  );
};

export default ReviewStatsBar;
