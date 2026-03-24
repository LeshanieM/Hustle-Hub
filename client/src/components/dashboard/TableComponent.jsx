import React from 'react';

const TableComponent = ({ 
  title, 
  headers, 
  data = [], 
  renderRow, 
  emptyMessage = "No data available",
  actions
}) => {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      {(title || actions) && (
        <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-white">
          <h3 className="text-lg font-black text-slate-900">{title}</h3>
          <div className="flex items-center gap-3">
            {actions}
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto overflow-y-hidden">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-black uppercase tracking-wider">
              {headers.map((header, idx) => (
                <th key={idx} className="px-6 py-4 font-black">
                  <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-600 transition-colors">
                    {header}
                    {/* Potential sort icon here */}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.length > 0 ? (
              data.map((item, idx) => renderRow(item, idx))
            ) : (
              <tr>
                <td colSpan={headers.length} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                    <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-4xl text-slate-200">database_off</span>
                    </div>
                    <h4 className="text-slate-900 font-black text-lg mb-1">{emptyMessage}</h4>
                    <p className="text-slate-400 text-sm font-medium">Try adjusting your filters or search terms.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableComponent;
