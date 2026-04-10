import React from 'react';

const StatCard = ({ title, value, icon, trend, trendValue, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-[#1111d4]/10 text-[#1111d4]',
    purple: 'bg-purple-50 text-purple-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color] || colorClasses.blue} transition-colors group-hover:scale-110 duration-300`}>
          <span className="material-symbols-outlined notranslate block text-2xl">{icon}</span>
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${
            trend === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
          }`}>
            <span className="material-symbols-outlined notranslate text-[14px]">
              {trend === 'up' ? 'trending_up' : 'trending_down'}
            </span>
            {trendValue}
          </span>
        )}
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium tracking-tight">{title}</p>
        <p className="text-3xl font-black mt-1 text-slate-900">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
