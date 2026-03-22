import React, { useState } from 'react';
import ReviewTableRow from './ReviewTableRow';

const ReviewTable = ({ reviews, onApprove, onFlag, onDelete, onBulkDelete, onBulkFlag, loading }) => {
  const [selectedIds, setSelectedIds] = useState([]);
  
  const [filterKeyword, setFilterKeyword] = useState('');
  const [filterRating, setFilterRating] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredReviews = reviews.filter(rev => {
    let match = true;
    if (filterRating !== 'All' && rev.rating !== Number(filterRating)) match = false;
    if (filterType === 'Product' && !rev.product_id) match = false;
    if (filterType === 'Storefront' && !rev.storefront_id) match = false;
    if (filterStatus !== 'All' && rev.status !== filterStatus.toLowerCase()) match = false;
    
    if (filterKeyword) {
      const lowerKey = filterKeyword.toLowerCase();
      const feedbackMatch = rev.feedback?.toLowerCase().includes(lowerKey);
      const userFName = rev.user_id?.firstName?.toLowerCase() || '';
      const userLName = rev.user_id?.lastName?.toLowerCase() || '';
      const prodName = rev.product_id?.name?.toLowerCase() || '';
      const storeName = rev.storefront_id?.name?.toLowerCase() || '';
      
      if (!feedbackMatch && !userFName.includes(lowerKey) && !userLName.includes(lowerKey) && !prodName.includes(lowerKey) && !storeName.includes(lowerKey)) {
        match = false;
      }
    }
    return match;
  });

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedIds.length === filteredReviews.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredReviews.map(r => r._id));
    }
  };

  const handleExportCSV = () => {
    if (filteredReviews.length === 0) return;
    
    const headers = ['Review ID', 'Reviewer Name', 'Target Type', 'Target Name', 'Rating', 'Feedback', 'Status', 'Date'];
    
    const escapeCSV = (str) => {
      if (!str) return '""';
      let clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = filteredReviews.map(r => {
      const name = r.user_id ? `${r.user_id.firstName || ''} ${r.user_id.lastName || ''}`.trim() : 'Anonymous';
      const tType = r.product_id ? 'Product' : 'Storefront';
      const tName = r.product_id?.name || r.storefront_id?.name || 'Unknown';
      const dateStr = new Date(r.created_at).toLocaleDateString();
      
      return [
        escapeCSV(r._id),
        escapeCSV(name),
        escapeCSV(tType),
        escapeCSV(tName),
        escapeCSV(r.rating),
        escapeCSV(r.feedback),
        escapeCSV(r.status || 'normal'),
        escapeCSV(dateStr)
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `HustleHub_Reviews_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border text-left border-gray-100 shadow-sm rounded-xl overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto flex-1">
          <input 
            type="text" 
            placeholder="Search keywords..." 
            value={filterKeyword}
            onChange={(e) => setFilterKeyword(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full sm:w-64 focus:outline-none focus:border-[#051094]"
          />
          <select value={filterRating} onChange={e => setFilterRating(e.target.value)} className="border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none cursor-pointer">
            <option value="All">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none cursor-pointer">
            <option value="All">All Types</option>
            <option value="Product">Product</option>
            <option value="Storefront">Storefront</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none cursor-pointer">
            <option value="All">All Statuses</option>
            <option value="Normal">Normal</option>
            <option value="Flagged">Flagged</option>
          </select>
        </div>
        
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 mr-4 border-r border-gray-200 pr-4">
              <span className="text-sm font-semibold text-[#051094]">{selectedIds.length} selected</span>
              <button 
                onClick={() => { onBulkFlag(selectedIds); setSelectedIds([]); }} 
                className="text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-2 rounded-lg transition-colors cursor-pointer border border-amber-100"
              >
                Bulk Flag
              </button>
              <button 
                onClick={() => { onBulkDelete(selectedIds); setSelectedIds([]); }} 
                className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors cursor-pointer border border-red-100"
              >
                Bulk Delete
              </button>
            </div>
          )}
          <button onClick={handleExportCSV} className="text-sm font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg shadow-sm transition-colors cursor-pointer">
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto w-full flex-1">
        {loading ? (
           <div className="py-12 flex justify-center">
             <svg className="animate-spin h-8 w-8 text-[#051094]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
           </div>
        ) : filteredReviews.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            No reviews match your filters.
          </div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white border-b border-gray-100 text-gray-400 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="p-4 w-12 text-center">
                  <input type="checkbox" checked={selectedIds.length === filteredReviews.length && filteredReviews.length > 0} onChange={toggleAll} className="w-4 h-4 rounded text-[#051094] border-gray-300 focus:ring-[#051094] cursor-pointer" />
                </th>
                <th className="p-4">Reviewer</th>
                <th className="p-4">Target</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Feedback</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map(review => (
                <ReviewTableRow 
                  key={review._id}
                  review={review}
                  isSelected={selectedIds.includes(review._id)}
                  toggleSelect={toggleSelect}
                  onApprove={onApprove}
                  onFlag={onFlag}
                  onDelete={onDelete}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ReviewTable;
