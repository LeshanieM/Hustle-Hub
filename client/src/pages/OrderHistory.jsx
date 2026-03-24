import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerHeader from '../components/CustomerHeader';
import Footer from '../components/Footer';
import BookingModal from '../components/BookingModal';
import { getMyBookings, cancelBooking, deleteBooking } from '../services/bookingService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Config ────────────────────────────────────────────────────────────────────

const STATUS_CFG = {
  pending:   { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  dot: 'bg-amber-400',  label: 'Pending',   icon: '⏳', step: 1 },
  confirmed: { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500',   label: 'Confirmed', icon: '✅', step: 2 },
  completed: { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-500',  label: 'Delivered', icon: '🎉', step: 3 },
  cancelled: { bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200',    dot: 'bg-red-400',    label: 'Cancelled', icon: '✕',  step: 0 },
};

const LOCATION_MAP = {
  anohana:      { emoji: '🍱', name: 'Anohana Canteen' },
  main_canteen: { emoji: '🏛️', name: 'Main Building Canteen' },
  sliit_dupath: { emoji: '☕', name: 'SLIIT Dupath' },
  new_canteen:  { emoji: '🍽️', name: 'New Building Canteen' },
  bird_nest:    { emoji: '🐦', name: 'Bird Nest' },
  sliit_ground: { emoji: '⚽', name: 'SLIIT Ground' },
};

const FILTERS = ['All', 'Pending', 'Confirmed', 'Delivered', 'Cancelled'];
const FILTER_MAP = { All: null, Pending: 'pending', Confirmed: 'confirmed', Delivered: 'completed', Cancelled: 'cancelled' };

const fmtDate = (dateStr, timeStr) => {
  const parts = [];
  if (dateStr) {
    try { parts.push(new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })); }
    catch { parts.push(dateStr); }
  }
  if (timeStr) parts.push(timeStr);
  return parts.join(' · ') || '—';
};

// ── Timeline ──────────────────────────────────────────────────────────────────

const Timeline = ({ status }) => {
  const cfg = STATUS_CFG[status];
  if (!cfg || status === 'cancelled') return null;
  return (
    <div className="flex items-center mt-3">
      {['Placed', 'Confirmed', 'Delivered'].map((lbl, i) => (
        <React.Fragment key={lbl}>
          <div className="flex flex-col items-center">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${cfg.step > i ? 'bg-[#051094] border-[#051094] text-white' : 'bg-gray-100 border-gray-300 text-gray-400'}`}>
              {cfg.step > i ? '✓' : i + 1}
            </div>
            <span className={`text-[10px] mt-1 ${cfg.step > i ? 'text-[#051094] font-semibold' : 'text-gray-400'}`}>{lbl}</span>
          </div>
          {i < 2 && <div className={`h-0.5 flex-1 mx-1 mb-5 ${cfg.step > i + 1 ? 'bg-[#051094]' : 'bg-gray-200'}`} />}
        </React.Fragment>
      ))}
    </div>
  );
};

// ── Rate & Review ─────────────────────────────────────────────────────────────

const RateReviewCard = ({ booking }) => {
  const [rating, setRating]   = useState(0);
  const [hover, setHover]     = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async () => {
    if (!rating)           { setErr('Please select a star rating.'); return; }
    if (feedback.length < 10) { setErr('Feedback must be at least 10 characters.'); return; }
    setSubmitting(true); setErr('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: booking.product_id?._id || booking.product_id, rating, feedback }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit review');
      setSubmitted(true);
    } catch (e) { setErr(e.message); }
    finally { setSubmitting(false); }
  };

  if (submitted) return (
    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl text-center">
      <p className="text-green-700 font-semibold text-sm">⭐ Thanks for your review!</p>
    </div>
  );

  return (
    <div className="mt-3 p-4 bg-[#051094]/5 border border-[#051094]/20 rounded-xl">
      <p className="text-sm font-bold text-gray-700 mb-2">⭐ Rate this product</p>
      <div className="flex gap-1 mb-3">
        {[1,2,3,4,5].map(s => (
          <button key={s} onClick={() => setRating(s)} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
            className="text-2xl bg-transparent border-none cursor-pointer p-0 transition-colors"
            style={{ color: (hover || rating) >= s ? '#f59e0b' : '#d1d5db' }}>★</button>
        ))}
      </div>
      <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={2}
        placeholder="Share your experience (min 10 characters)…"
        className="w-full border border-gray-200 rounded-lg p-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-[#051094] focus:border-[#051094] resize-none mb-2" />
      {err && <p className="text-red-500 text-xs mb-2">⚠ {err}</p>}
      <button onClick={handleSubmit} disabled={submitting}
        className="px-4 py-2 bg-[#051094] hover:bg-[#051094]/90 text-white font-bold text-sm rounded-lg transition-colors disabled:opacity-50">
        {submitting ? 'Submitting…' : 'Submit Review'}
      </button>
    </div>
  );
};

// ── Order Card ────────────────────────────────────────────────────────────────

const OrderCard = ({ booking, onCancel, onDelete, onReorder }) => {
  const [expanded, setExpanded]     = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [deleting, setDeleting]     = useState(false);

  const cfg = STATUS_CFG[booking.status] || STATUS_CFG.pending;
  const loc = LOCATION_MAP[booking.delivery_place] || { emoji: '📍', name: booking.delivery_place };
  const product  = booking.product_id;
  const total    = booking.total_price || 0;
  const orderId  = booking._id ? booking._id.slice(-8).toUpperCase() : '--------';
  const placedDate = new Date(booking.createdAt).toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: 'numeric' });
  const delivery = fmtDate(booking.delivery_date, booking.delivery_time);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this booking?')) return;
    setCancelling(true);
    try { await cancelBooking(booking._id); onCancel(booking._id); }
    catch (e) { alert(e.message || 'Failed to cancel'); }
    finally { setCancelling(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Permanently delete this cancelled order?')) return;
    setDeleting(true);
    try { await deleteBooking(booking._id); onDelete(booking._id); }
    catch (e) { alert(e.message || 'Failed to delete'); }
    finally { setDeleting(false); }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden mb-4">
      {/* Status stripe */}
      <div className={`h-1 w-full ${cfg.dot}`} />

      <div className="p-5">
        {/* Top row */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{product?.type === 'Food' ? '🍔' : '📦'}</span>
            <div>
              <div className="font-bold text-gray-900 text-base">{product?.name || 'Unknown Product'}</div>
              {product?.storefront_id?.storefront_name && (
                <div className="text-xs text-gray-500 mt-0.5">🏪 {product.storefront_id.storefront_name}</div>
              )}
            </div>
          </div>
          <div className="text-right flex flex-col items-end gap-1.5">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} /> {cfg.label}
            </span>
            <span className="font-extrabold text-gray-900 text-lg">${total.toLocaleString()}</span>
          </div>
        </div>

        {/* Info pills */}
        <div className="flex flex-wrap gap-2 mb-3">
          {[`📦 ×${booking.quantity}`, `${loc.emoji} ${loc.name}`, `🗓 ${delivery}`].map(pill => (
            <span key={pill} className="bg-gray-100 text-gray-600 border border-gray-200 rounded-full px-3 py-1 text-xs font-medium">{pill}</span>
          ))}
        </div>

        <Timeline status={booking.status} />

        {/* Actions row */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <button onClick={() => onReorder(booking)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[#051094] bg-[#051094]/10 hover:bg-[#051094]/15 border border-[#051094]/20 rounded-lg text-xs font-bold transition-colors">
            🔁 Re-order
          </button>
          <button onClick={() => setExpanded(e => !e)}
            className="text-gray-400 hover:text-gray-600 text-xs font-medium flex items-center gap-1 transition-colors bg-transparent border-none cursor-pointer">
            {expanded ? '▲ Hide details' : '▼ More details'}
          </button>
        </div>

        {/* Expanded panel */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-100 animate-in fade-in duration-200">
            <div className="space-y-2 mb-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Order ID</span>
                <code className="text-[#051094] font-mono font-bold">#{orderId}</code>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Placed</span>
                <span className="text-gray-900 font-semibold">{placedDate}</span>
              </div>
              {booking.note && (
                <div className="flex justify-between text-sm gap-4">
                  <span className="text-gray-500 shrink-0">Note</span>
                  <span className="text-gray-700 text-right">{booking.note}</span>
                </div>
              )}
            </div>

            {/* Cancel — pending only */}
            {booking.status === 'pending' && (
              <button onClick={handleCancel} disabled={cancelling}
                className="w-full mt-2 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors disabled:opacity-50">
                {cancelling ? 'Cancelling…' : '✕ Cancel Order'}
              </button>
            )}

            {/* Delete — cancelled only */}
            {booking.status === 'cancelled' && (
              <button onClick={handleDelete} disabled={deleting}
                className="w-full mt-2 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors disabled:opacity-50">
                🗑 {deleting ? 'Deleting…' : 'Delete Order'}
              </button>
            )}

            {/* Rate & Review — completed only */}
            {booking.status === 'completed' && <RateReviewCard booking={booking} />}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const OrderHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [filter, setFilter]     = useState('All');
  const [reorderBooking, setReorderBooking] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try { setBookings(await getMyBookings()); }
      catch (e) { setError(e.message || 'Failed to load orders'); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleCancel  = (id) => setBookings(bs => bs.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
  const handleDelete  = (id) => setBookings(bs => bs.filter(b => b._id !== id));
  const handleReorder = (booking) => setReorderBooking(booking);

  // Stats
  const total      = bookings.length;
  const pending    = bookings.filter(b => b.status === 'pending').length;
  const delivered  = bookings.filter(b => b.status === 'completed').length;
  const totalSpent = bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + (b.total_price || 0), 0);

  const statusKey = FILTER_MAP[filter];
  const visible   = statusKey ? bookings.filter(b => b.status === statusKey) : bookings;

  const stats = [
    { label: 'Total Orders', value: total,                          icon: '📋' },
    { label: 'Pending',      value: pending,                        icon: '⏳' },
    { label: 'Delivered',    value: delivered,                      icon: '🎉' },
    { label: 'Total Spent',  value: `$${totalSpent.toLocaleString()}`, icon: '💰' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <CustomerHeader />
      <div className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-3xl">

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Orders</h1>
            <p className="text-gray-500 mt-1">Track and manage your bookings</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-2xl font-extrabold text-gray-900">{s.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
            <div className="flex gap-2 flex-wrap">
              {FILTERS.map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${
                    filter === f ? 'bg-[#051094] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#051094]" />
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <p className="text-red-600 font-medium mb-3">⚠ {error}</p>
              <button onClick={() => window.location.reload()}
                className="px-5 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-lg transition-colors">
                Retry
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && visible.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <span className="text-6xl">🛒</span>
              <h3 className="mt-4 text-lg font-bold text-gray-900">No orders yet</h3>
              <p className="text-gray-500 mt-1">
                {filter === 'All' ? "You haven't placed any orders yet." : `No ${filter.toLowerCase()} orders found.`}
              </p>
              <button onClick={() => navigate('/customer/products')}
                className="mt-6 px-6 py-2.5 bg-[#051094] hover:bg-[#051094]/90 text-white font-bold rounded-xl transition-colors">
                Browse Products
              </button>
            </div>
          )}

          {/* Cards */}
          {!loading && !error && visible.map(b => (
            <OrderCard key={b._id} booking={b} onCancel={handleCancel} onDelete={handleDelete} onReorder={handleReorder} />
          ))}
        </div>
      </div>
      <Footer />

      {/* Re-order modal */}
      {reorderBooking && reorderBooking.product_id && (
        <BookingModal
          product={reorderBooking.product_id}
          prefill={{ quantity: reorderBooking.quantity, delivery_place: reorderBooking.delivery_place, delivery_time: reorderBooking.delivery_time, delivery_date: reorderBooking.delivery_date || '' }}
          onClose={() => setReorderBooking(null)}
          onSuccess={(newBooking) => { setBookings(bs => [newBooking, ...bs]); setReorderBooking(null); }}
        />
      )}
    </div>
  );
};

export default OrderHistory;
