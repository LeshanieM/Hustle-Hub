import React from 'react';

const BadgeCard = ({ badge, isEarned, earnedAt, onClick }) => {
  return (
    <div 
      onClick={() => onClick(badge, isEarned, earnedAt)}
      className={`
        relative p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer
        ${isEarned 
          ? 'bg-white border-[#051094]/30 shadow-md hover:shadow-lg hover:border-[#051094] hover:-translate-y-1 transform animate-in zoom-in-95' 
          : 'bg-gray-100 border-gray-200 grayscale hover:grayscale-0 hover:-translate-y-1 hover:shadow-md transition-all'}
      `}
    >
      {/* Icon Area */}
      <div 
        className={`
          w-16 h-16 mb-3 rounded-full flex items-center justify-center text-3xl shadow-inner
          ${isEarned ? 'bg-[#051094]/10 border border-[#051094]/20' : 'bg-gray-200'}
        `}
      >
        {isEarned ? badge.icon : '🔒'}
      </div>

      {/* Text Area */}
      <h4 className="font-bold text-gray-900 mb-1">{badge.label}</h4>
      <p className="text-xs text-gray-500 mb-2 px-1 line-clamp-2">{badge.description}</p>

      {/* Footer */}
      {isEarned && earnedAt && (
        <span className="mt-auto text-[10px] font-semibold text-[#051094] bg-[#051094]/10 px-2 py-1 rounded-full uppercase tracking-wider">
          Earned {new Date(earnedAt).toLocaleDateString()}
        </span>
      )}
      {!isEarned && (
        <span className="mt-auto text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
          Locked
        </span>
      )}
    </div>
  );
};

export default BadgeCard;
