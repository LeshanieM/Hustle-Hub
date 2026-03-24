import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [storefrontFilter, setStorefrontFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Expansion state
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Override modal state
  const [overrideModal, setOverrideModal] = useState({ isOpen: false, bookingId: null });
  const [overrideStatus, setOverrideStatus] = useState('pending');
  const [overrideReason, setOverrideReason] = useState('');
  
  // Popover state
  const [activePopover, setActivePopover] = useState(null);

  const fetchBookingsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [bookingsRes, statsRes] = await Promise.all([
        api.get('/admin/bookings'),
        api.get('/admin/bookings/stats')
      ]);
      setBookings(bookingsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch bookings data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingsData();
  }, []);

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/admin/bookings/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'hustle-hub-bookings.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      toast.error('Failed to export CSV');
    }
  };

  const handleOverrideSubmit = async (e) => {
    e.preventDefault();
    if (!overrideReason.trim()) return;

    try {
      const { bookingId } = overrideModal;
      const res = await api.patch(`/admin/bookings/${bookingId}/status`, {
        status: overrideStatus,
        reason: overrideReason
      });
      
      // Optimistic update
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: res.data.status } : b));
      toast.success('Status overridden by admin');
      
      setOverrideModal({ isOpen: false, bookingId: null });
      setOverrideReason('');
      setOverrideStatus('pending');
      fetchBookingsData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to override status');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setStorefrontFilter('');
    setLocationFilter('');
    setTimeFilter('');
    setDateFilter('');
    setCurrentPage(1);
  };

  const toggleRow = (id, e) => {
    if (e.target.closest('.action-btn') || e.target.closest('.popover-menu')) return;
    
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const studentFrequency = useMemo(() => {
    const freq = {};
    bookings.forEach(b => {
      const studentId = b.student_id?._id;
      if (studentId) {
        freq[studentId] = (freq[studentId] || 0) + 1;
      }
    });
    return freq;
  }, [bookings]);

  const uniqueStorefronts = useMemo(() => {
    const stores = new Set();
    bookings.forEach(b => {
      if (b.product_id?.storefront_id?.storefront_name) {
        stores.add(b.product_id.storefront_id.storefront_name);
      }
    });
    return Array.from(stores).sort();
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      if (statusFilter !== 'All') {
        const checkStatus = statusFilter === 'Delivered' ? 'completed' : statusFilter.toLowerCase();
        if (b.status !== checkStatus) return false;
      }
      if (storefrontFilter && b.product_id?.storefront_id?.storefront_name !== storefrontFilter) return false;
      if (locationFilter && b.delivery_place !== locationFilter) return false;
      if (timeFilter && b.delivery_time !== timeFilter) return false;
      if (dateFilter && b.delivery_date !== dateFilter) return false;
      
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        const cName = `${b.student_id?.first_name || ''} ${b.student_id?.last_name || ''}`.toLowerCase();
        const pName = (b.product_id?.name || '').toLowerCase();
        const sName = (b.product_id?.storefront_id?.storefront_name || '').toLowerCase();
        const orderId = b._id.slice(-8).toLowerCase();
        
        if (!cName.includes(s) && !pName.includes(s) && !sName.includes(s) && !orderId.includes(s)) {
          return false;
        }
      }
      return true;
    });
  }, [bookings, statusFilter, storefrontFilter, locationFilter, timeFilter, dateFilter, searchTerm]);

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const currentBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const campuses = ['anohana', 'main_canteen', 'sliit_dupath', 'new_canteen', 'bird_nest', 'sliit_ground'];
  const timeslots = ['08:00 AM','08:30 AM','09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','12:30 PM','01:00 PM','01:30 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM','05:00 PM'];

  return (
    <div className="w-full min-h-[calc(100vh-64px)] mt-16 bg-[#f8f9fa] pt-8 pb-12 px-4 sm:px-8 font-sans">
      <div className="max-w-[1600px] mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="text-left">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Order Management</h1>
            <p className="text-gray-500 mt-2 font-medium">Monitor, analyze, and override platform-wide bookings.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search orders..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 bg-white border border-gray-200 rounded-lg py-2 px-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0000ff] focus:ring-1 focus:ring-[#0000ff] shadow-sm"
              />
            </div>
            <button 
              onClick={handleExportCSV} 
              className="px-4 py-2 text-sm font-medium rounded-lg text-white transition-opacity shadow-sm bg-[#051094] hover:bg-blue-800"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* STATS BAR */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
            <span className="text-sm font-semibold text-gray-500 mb-1">Total Bookings</span>
            <span className="text-3xl font-black text-gray-900">{stats?.total || 0}</span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
            <span className="text-sm font-semibold text-gray-500 mb-1">Pending</span>
            <span className="text-3xl font-black text-amber-500">{stats?.pending || 0}</span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
            <span className="text-sm font-semibold text-gray-500 mb-1">Today's Revenue</span>
            <span className="text-3xl font-black text-green-600">${stats?.todayRevenue?.toLocaleString() || 0}</span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
            <span className="text-sm font-semibold text-gray-500 mb-1">Completion Rate</span>
            <span className="text-3xl font-black text-[#051094]">{stats?.completionRate || 0}%</span>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          
          {/* FILTER BAR  */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3 flex-wrap bg-gray-50">
            <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              {['All', 'Pending', 'Confirmed', 'Delivered', 'Cancelled'].map(status => (
                <button 
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-1.5 text-sm transition-colors ${statusFilter === status ? 'bg-[#051094] text-white font-medium' : 'hover:bg-gray-50 text-gray-600'}`}
                >
                  {status}
                </button>
              ))}
            </div>

            <select 
              value={storefrontFilter} onChange={(e) => setStorefrontFilter(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:border-[#0000ff] shadow-sm">
              <option value="">All Storefronts</option>
              {uniqueStorefronts.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select 
              value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:border-[#0000ff] shadow-sm">
              <option value="">All Locations</option>
              {campuses.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
            </select>

            <select 
              value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:border-[#0000ff] shadow-sm">
              <option value="">All Times</option>
              {timeslots.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <input 
              type="date" 
              value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:border-[#0000ff] shadow-sm"
            />

            <button onClick={clearFilters} className="ml-auto text-sm text-[#0000ff] hover:underline px-2 font-medium">
              Clear Filters
            </button>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            {loading ? (
              <div className="p-8 flex justify-center items-center h-full">
                <div className="text-gray-400 font-medium">Loading orders...</div>
              </div>
            ) : error ? (
              <div className="p-8 text-center m-6 rounded-xl border border-red-200 bg-red-50">
                <p className="text-red-600 mb-4 font-medium">{error}</p>
                <button onClick={fetchBookingsData} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">Retry</button>
              </div>
            ) : currentBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-center">
                <div className="text-5xl mb-4 opacity-50">📭</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No bookings found</h3>
                <p className="text-gray-500">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-semibold border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-5 py-4 w-10"><input type="checkbox" className="rounded border-gray-300 focus:ring-[#0000ff] text-[#051094]" disabled /></th>
                    <th className="px-5 py-4">Order ID</th>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Storefront</th>
                    <th className="px-5 py-4">Product</th>
                    <th className="px-5 py-4">Delivery Location</th>
                    <th className="px-5 py-4">Time Slot</th>
                    <th className="px-5 py-4 text-right">Total ($)</th>
                    <th className="px-5 py-4 text-center">Status</th>
                    <th className="px-5 py-4">Placed On</th>
                    <th className="px-5 py-4 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentBookings.map(b => (
                    <React.Fragment key={b._id}>
                      <tr 
                        onClick={(e) => toggleRow(b._id, e)}
                        className={`cursor-pointer transition-colors hover:bg-blue-50/50 ${expandedRows.has(b._id) ? 'bg-blue-50/30' : ''}`}
                      >
                        <td className="px-5 py-4"><input type="checkbox" className="rounded border-gray-300" disabled /></td>
                        <td className="px-5 py-4 font-mono text-gray-500 font-medium">#{b._id.slice(-8).toUpperCase()}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{b.student_id?.first_name} {b.student_id?.last_name}</span>
                            {studentFrequency[b.student_id?._id] > 2 && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 bg-amber-100 text-amber-700">
                                🔁 {studentFrequency[b.student_id?._id]} orders
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-[150px] mt-0.5">{b.student_id?.email}</div>
                        </td>
                        <td className="px-5 py-4 text-gray-600 font-medium truncate max-w-[150px]">{b.product_id?.storefront_id?.storefront_name}</td>
                        <td className="px-5 py-4">
                          <div className="font-bold text-gray-900 truncate max-w-[150px]">{b.product_id?.name}</div>
                          <div className="text-[10px] text-gray-500 font-semibold uppercase mt-0.5 inline-block px-1.5 py-[2px] bg-gray-100 rounded">{b.product_id?.category || 'General'}</div>
                        </td>
                        <td className="px-5 py-4 text-gray-600">
                           <span className="mr-1.5 opacity-70">🏛️</span>
                           {b.delivery_place?.replace('_', ' ')}
                        </td>
                        <td className="px-5 py-4 text-gray-600 font-medium">{b.delivery_time}</td>
                        <td className="px-5 py-4 font-bold text-gray-900 text-right">${(b.total_price || 0).toLocaleString()}</td>
                        <td className="px-5 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider inline-block min-w-[90px] text-center ${getStatusColor(b.status)}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-500 text-xs font-medium">
                           {new Date(b.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4 text-center relative">
                           <button 
                             onClick={(e) => { e.stopPropagation(); setActivePopover(activePopover === b._id ? null : b._id); }}
                             className="action-btn p-2 text-gray-400 hover:text-[#0000ff] hover:bg-blue-50 rounded-full transition-colors"
                           >
                             •••
                           </button>
                           {activePopover === b._id && (
                             <div className="popover-menu absolute right-8 top-8 z-50 w-48 rounded-xl shadow-xl border border-gray-100 bg-white overflow-hidden py-1">
                               <button 
                                 onClick={(e) => { e.stopPropagation(); setActivePopover(null); setOverrideModal({ isOpen: true, bookingId: b._id }); }}
                                 className="w-full text-left px-4 py-2.5 text-sm text-red-600 font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
                               >
                                 Override Status
                               </button>
                             </div>
                           )}
                        </td>
                      </tr>
                      
                      {/* EXPANDED ROW */}
                      {expandedRows.has(b._id) && (
                        <tr className="bg-gray-50 border-b border-gray-200">
                           <td colSpan="11" className="p-0">
                              <div className="px-8 py-6 grid grid-cols-1 md:grid-cols-3 gap-8 shadow-inner">
                                
                                <div className="space-y-4">
                                  <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1.5">Customer Info</p>
                                    <p className="text-sm font-medium text-gray-900 mb-1">Email: <span className="text-gray-500 font-normal">{b.student_id?.email || 'N/A'}</span></p>
                                    <p className="text-sm font-medium text-gray-900">Student ID: <span className="text-gray-500 font-mono font-normal">{b.student_id?.studentIdStr || 'N/A'}</span></p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1.5">Storefront Info</p>
                                    <p className="text-sm text-gray-900 font-medium">{b.product_id?.storefront_id?.storefront_name || 'N/A'}</p>
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1.5">Product Details</p>
                                    <p className="text-sm font-medium text-gray-900 mb-1">Category: <span className="text-gray-500 font-normal">{b.product_id?.category || 'General'}</span></p>
                                    <p className="text-sm font-medium text-gray-900">Quantity: <span className="text-gray-500 font-normal">{b.quantity || 1}</span></p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1.5">Timing</p>
                                    <p className="text-sm text-gray-900 font-medium mb-1">
                                      {b.delivery_date ? new Date(b.delivery_date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Unknown'} · {b.delivery_time}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Placed on: {new Date(b.createdAt).toLocaleString()}
                                    </p>
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1.5">Notes & History</p>
                                    <div className="bg-white p-3.5 rounded-lg border border-gray-200 h-28 overflow-y-auto shadow-sm">
                                      {b.note && <p className="text-sm mb-2"><span className="text-gray-500 font-medium">Customer Note:</span> <span className="text-gray-700">{b.note}</span></p>}
                                      {b.rejection_reason && <p className="text-sm text-red-600 mb-2 font-medium"><span className="opacity-80">Rejection:</span> {b.rejection_reason}</p>}
                                      {b.owner_note && <p className="text-sm text-indigo-600 font-medium"><span className="opacity-80">Internal Note:</span> {b.owner_note}</p>}
                                      {!b.note && !b.rejection_reason && !b.owner_note && <p className="text-sm text-gray-400 italic">No notes attached.</p>}
                                    </div>
                                  </div>
                                </div>

                              </div>
                           </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* PAGINATION */}
          {currentBookings.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-200 text-sm text-gray-500 font-medium">
              <div>
                Showing {Math.min(filteredBookings.length, (currentPage - 1) * itemsPerPage + 1)} – {Math.min(filteredBookings.length, currentPage * itemsPerPage)} of {filteredBookings.length} orders
              </div>
              <div className="flex gap-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="px-4 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-700 font-medium shadow-sm"
                >
                  Previous
                </button>
                <button 
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="px-4 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-700 font-medium shadow-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* OVERRIDE MODAL */}
      {overrideModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-gray-100">
            <h2 className="text-xl font-black mb-1 text-red-600">Emergency Status Override</h2>
            <p className="text-sm text-gray-500 mb-6 border-l-2 pl-3 border-red-500 font-medium">Only use this for disputed or stuck orders. This bypasses the normal system workflow.</p>
            
            <form onSubmit={handleOverrideSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">New Status</label>
                <select 
                  required
                  value={overrideStatus}
                  onChange={(e) => setOverrideStatus(e.target.value)}
                  className="w-full p-2.5 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-[#0000ff] focus:ring-1 focus:ring-[#0000ff] bg-gray-50 border border-gray-200 font-medium"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed (Delivered)</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="mb-6">
                 <label className="block text-sm font-bold text-gray-700 mb-2">Reason (Required)</label>
                 <textarea 
                   required
                   value={overrideReason}
                   onChange={(e) => setOverrideReason(e.target.value)}
                   className="w-full p-3 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-[#0000ff] focus:ring-1 focus:ring-[#0000ff] bg-gray-50 border border-gray-200 min-h-[100px]"
                   placeholder="e.g. User reported scam, forcefully cancelling..."
                 ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                 <button 
                   type="button" 
                   onClick={() => { setOverrideModal({ isOpen: false, bookingId: null }); setOverrideReason(''); setOverrideStatus('pending'); }}
                   className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                   type="submit" 
                   className="px-5 py-2 text-sm bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-sm transition-colors"
                 >
                   Confirm Override
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global popover listener clear overlay if clicked outside */}
      {activePopover && (
        <div className="fixed inset-0 z-40" onClick={() => setActivePopover(null)}></div>
      )}
      
    </div>
  );
};

export default AdminOrders;
