import React from 'react';

const ChartCard = ({ title, subtitle, children, height = 'h-[300px]', footer }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-lg font-black text-slate-900 leading-tight">{title}</h3>
          {subtitle && <p className="text-sm text-slate-500 font-medium mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
           <button className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined text-[18px]">more_vert</span>
           </button>
        </div>
      </div>
      
      <div className={`${height} w-full`}>
        {children}
      </div>

      {footer && (
        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-slate-400">
          {footer}
        </div>
      )}
    </div>
  );
};

export default ChartCard;
