import React, { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import OwnerLayout from '../../components/dashboard/OwnerLayout';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Helpers ───────────────────────────────────────────────────────────────────

const authFetch = async (method, path, body) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

const isToday = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr), n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
};

const slotToMinutes = (slot) => {
  if (!slot) return 0;
  const [time, ampm] = slot.trim().split(' ');
  let [h, m] = time.split(':').map(Number);
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return h * 60 + (m || 0);
};

const isUrgentNow = (b) => {
  if (b.is_urgent) return true;
  const now = new Date().getHours() * 60 + new Date().getMinutes();
  const slot = slotToMinutes(b.delivery_time);
  return slot > 0 && slot - now <= 30 && slot - now >= 0;
};

const pingSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 440;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(); osc.stop(ctx.currentTime + 0.4);
  } catch {}
};

const TIME_SLOTS = [];
for (let h = 8; h <= 17; h++) {
  for (const m of [0, 30]) {
    if (h === 17 && m === 30) break;
    const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    TIME_SLOTS.push(`${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`);
  }
}

const LOCATIONS = [
  { id: 'anohana',      emoji: '🍱', name: 'Anohana Canteen' },
  { id: 'main_canteen', emoji: '🏛️', name: 'Main Building Canteen' },
  { id: 'sliit_dupath', emoji: '☕', name: 'SLIIT Dupath' },
  { id: 'new_canteen',  emoji: '🍽️', name: 'New Building Canteen' },
  { id: 'bird_nest',    emoji: '🐦', name: 'Bird Nest' },
  { id: 'sliit_ground', emoji: '⚽', name: 'SLIIT Ground' },
];

const STATUS_CFG = {
  pending:   { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  bar: 'bg-amber-400',  label: 'Pending',   icon: '⏳' },
  confirmed: { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   bar: 'bg-blue-500',   label: 'Confirmed', icon: '✅' },
  completed: { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  bar: 'bg-green-500',  label: 'Delivered', icon: '🎉' },
  cancelled: { bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200',    bar: 'bg-red-400',    label: 'Cancelled', icon: '✕' },
};

const REJECTION_REASONS = [
  { id: 'out_of_stock',     icon: '📦', label: 'Out of Stock' },
  { id: 'too_busy',         icon: '⏰', label: 'Too Busy' },
  { id: 'item_unavailable', icon: '❌', label: 'Item Unavailable' },
  { id: 'other',            icon: '💬', label: 'Other' },
];

// ── Skeleton ──────────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4 animate-pulse">
    <div className="flex justify-between mb-3">
      <div className="h-4 bg-gray-200 rounded w-1/3" />
      <div className="h-4 bg-gray-200 rounded w-16" />
    </div>
    <div className="h-3 bg-gray-100 rounded w-2/3 mb-2" />
    <div className="h-3 bg-gray-100 rounded w-1/2" />
  </div>
);

// ── Modals ────────────────────────────────────────────────────────────────────

const RejectModal = ({ onConfirm, onClose, bulk }) => {
  const [reason, setReason] = useState('');
  const [note, setNote]     = useState('');
  return (
    <div onClick={onClose} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100">
        <h3 className="text-xl font-extrabold text-gray-900 mb-1">Reject {bulk ? 'Orders' : 'Order'}</h3>
        <p className="text-gray-500 text-sm mb-5">Select a reason for rejection</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {REJECTION_REASONS.map(r => (
            <button key={r.id} onClick={() => setReason(r.id)}
              className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${reason === r.id ? 'border-[#051094] bg-[#051094]/5' : 'border-gray-200 bg-gray-50 hover:border-gray-300'}`}>
              <div className="text-xl mb-1">{r.icon}</div>
              <div className={`text-sm font-bold ${reason === r.id ? 'text-[#051094]' : 'text-gray-700'}`}>{r.label}</div>
            </button>
          ))}
        </div>
        <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
          placeholder="Optional note to customer…"
          className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-900 focus:ring-2 focus:ring-[#051094] focus:border-[#051094] resize-none mb-4" />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors">Cancel</button>
          <button onClick={() => { if (!reason) { toast.error('Select a reason'); return; } onConfirm(reason, note); }}
            className="flex-[2] py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors">
            ✕ Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
};

const AcceptModal = ({ onConfirm, onClose }) => {
  const [note, setNote] = useState('');
  return (
    <div onClick={onClose} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-gray-100">
        <h3 className="text-xl font-extrabold text-gray-900 mb-1">✅ Accept Order</h3>
        <p className="text-gray-500 text-sm mb-4">Add an optional note to the customer</p>
        <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
          placeholder="E.g. Ready by your selected time — thank you!"
          className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-900 focus:ring-2 focus:ring-[#051094] focus:border-[#051094] resize-none mb-4" />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors">Back</button>
          <button onClick={() => onConfirm(note)}
            className="flex-[2] py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm transition-colors">
            ✅ Accept Order
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Stat Card ─────────────────────────────────────────────────────────────────

const StatCard = ({ icon, label, value, ring }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 border-l-4 border-l-[#051094]">
    {ring != null ? (
      <svg width="44" height="44" viewBox="0 0 36 36" className="shrink-0">
        <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="4" />
        <circle cx="18" cy="18" r="15" fill="none" stroke="#051094" strokeWidth="4"
          strokeDasharray={`${ring * 0.942} 94.2`} strokeLinecap="round" transform="rotate(-90 18 18)" />
        <text x="18" y="22" textAnchor="middle" fill="#051094" fontSize="8" fontWeight="900" fontFamily="DM Sans">{Math.round(ring)}%</text>
      </svg>
    ) : (
      <span className="text-3xl">{icon}</span>
    )}
    <div>
      <div className="text-xl font-extrabold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  </div>
);

// ── Order Card ────────────────────────────────────────────────────────────────

const OrderCard = ({ booking, index, selected, onSelect, onUpdate, selectMode }) => {
  const [showAccept, setShowAccept] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [flash, setFlash]           = useState(null);

  const cfg      = STATUS_CFG[booking.status] || STATUS_CFG.pending;
  const product  = booking.product_id;
  const customer = booking.customer_id;
  const loc      = LOCATIONS.find(l => l.id === booking.delivery_place) || { emoji: '📍', name: booking.delivery_place };
  const urgent   = isUrgentNow(booking);

  const doFlash = (type) => { setFlash(type); setTimeout(() => setFlash(null), 600); };

  const doAccept = async (note) => {
    setShowAccept(false); setLoading(true);
    const prev = { ...booking };
    onUpdate({ ...booking, status: 'confirmed', owner_note: note });
    try {
      const updated = await authFetch('PATCH', `/bookings/${booking._id}/accept`, { note });
      onUpdate(updated); doFlash('accept'); toast.success('Order accepted!');
    } catch (e) { onUpdate(prev); toast.error(e.message); }
    finally { setLoading(false); }
  };

  const doReject = async (reason, note) => {
    setShowReject(false); setLoading(true);
    const prev = { ...booking };
    onUpdate({ ...booking, status: 'cancelled' });
    try {
      const updated = await authFetch('PATCH', `/bookings/${booking._id}/reject`, { rejection_reason: reason, note });
      onUpdate(updated); doFlash('reject'); toast.success('Order rejected');
    } catch (e) { onUpdate(prev); toast.error(e.message); }
    finally { setLoading(false); }
  };

  const doReady = async () => {
    setLoading(true);
    const prev = { ...booking };
    onUpdate({ ...booking, status: 'completed' });
    try {
      const updated = await authFetch('PATCH', `/bookings/${booking._id}/ready`);
      onUpdate(updated); doFlash('accept'); toast.success('Marked as Ready! 🎉');
    } catch (e) { onUpdate(prev); toast.error(e.message); }
    finally { setLoading(false); }
  };

  const flashClass = flash === 'accept' ? 'bg-green-50' : flash === 'reject' ? 'bg-red-50' : 'bg-white';

  return (
    <>
      {showAccept && <AcceptModal onConfirm={doAccept} onClose={() => setShowAccept(false)} />}
      {showReject && <RejectModal onConfirm={doReject} onClose={() => setShowReject(false)} />}

      <div className={`rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4 transition-all duration-500 ${flashClass}`}
        style={{ animationDelay: `${index * 50}ms`, borderLeft: `5px solid ${cfg.bar?.includes('amber') ? '#f59e0b' : cfg.bar?.includes('blue') ? '#3b82f6' : cfg.bar?.includes('green') ? '#22c55e' : '#ef4444'}` }}>

        {/* Colour stripe at top */}
        <div className={`h-1 w-full ${cfg.bar}`} />

        <div className="p-5">
          {/* Top row: customer + status + price */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              {selectMode && (
                <input type="checkbox" checked={selected} onChange={() => onSelect(booking._id)}
                  className="w-4 h-4 accent-[#051094] cursor-pointer" />
              )}
              <div>
                <div className="font-bold text-gray-900 text-base flex items-center gap-2">
                  {customer?.firstName} {customer?.lastName}
                  {urgent && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 rounded-full text-xs font-bold">🔥 Urgent</span>}
                </div>
                <div className="text-xs text-gray-500">{customer?.studentEmail}</div>
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                {cfg.icon} {cfg.label}
              </span>
              <div className="font-extrabold text-gray-900 text-lg mt-1">${(booking.total_price || 0).toLocaleString()}</div>
            </div>
          </div>

          {/* Product + info pills */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="font-bold text-gray-900 text-sm">{product?.name}</span>
            {product?.category && <span className="px-2.5 py-0.5 bg-[#051094]/10 text-[#051094] border border-[#051094]/20 rounded-full text-xs font-bold">{product.category}</span>}
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {[`📦 ×${booking.quantity}`, `${loc.emoji} ${loc.name}`, `🕐 ${booking.delivery_time}`,
              new Date(booking.createdAt).toLocaleDateString('en-LK', { day: 'numeric', month: 'short' })
            ].map(pill => (
              <span key={pill} className="bg-gray-100 text-gray-600 border border-gray-200 rounded-full px-3 py-1 text-xs font-medium">{pill}</span>
            ))}
          </div>

          {booking.note && <p className="text-xs text-gray-500 mb-3">💬 {booking.note}</p>}

          {/* Actions */}
          {booking.status === 'pending' && !loading && (
            <div className="flex gap-3 mt-2">
              <button onClick={() => setShowAccept(true)}
                className="flex-1 py-2 text-sm font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition-colors">
                ✅ Accept
              </button>
              <button onClick={() => setShowReject(true)}
                className="flex-1 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors">
                ✕ Reject
              </button>
            </div>
          )}
          {booking.status === 'confirmed' && !loading && (
            <button onClick={doReady}
              className="w-full mt-2 py-2.5 text-sm font-bold text-white bg-[#051094] hover:bg-[#051094]/90 rounded-xl transition-colors">
              🚀 Mark as Ready
            </button>
          )}
          {loading && <p className="text-xs text-gray-400 mt-2">Updating…</p>}
        </div>
      </div>
    </>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const OwnerOrders = () => {
  const [activeTab, setActiveTab]     = useState('orders'); // 'orders' | 'reviews'
  const [bookings, setBookings]       = useState([]);
  const [reviews, setReviews]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [error, setError]             = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locFilter, setLocFilter]     = useState('');
  const [timeFilter, setTimeFilter]   = useState('');
  const [dateFilter, setDateFilter]   = useState('');
  const [sortByTime, setSortByTime]   = useState(false);
  const [selectMode, setSelectMode]   = useState(false);
  const [selected, setSelected]       = useState([]);
  const [showBulkReject, setShowBulkReject] = useState(false);
  const prevCount = useRef(0);

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await authFetch('GET', '/bookings/owner/my-orders');
      setBookings(data);
      if (silent && data.length > prevCount.current) {
        toast.success('🛎️ New order received!');
        pingSound();
      }
      prevCount.current = data.length;
      setError('');
    } catch (e) {
      if (!silent) setError(e.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const iv = setInterval(() => fetchOrders(true), 30000);
    return () => clearInterval(iv);
  }, [fetchOrders]);

  useEffect(() => {
    if (activeTab === 'reviews') {
      const fetchReviews = async () => {
        setLoadingReviews(true);
        try {
          const data = await authFetch('GET', '/reviews/owner/my-reviews');
          setReviews(data);
        } catch (e) { toast.error('Failed to load reviews'); }
        finally { setLoadingReviews(false); }
      };
      fetchReviews();
    }
  }, [activeTab]);

  const handleUpdate   = (u) => setBookings(bs => bs.map(b => b._id === u._id ? u : b));
  const toggleSelect   = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const handleBulkAccept = async () => {
    try {
      const { updated } = await authFetch('PATCH', '/bookings/bulk-action', { bookingIds: selected, action: 'accept' });
      setBookings(bs => bs.map(b => selected.includes(b._id) && b.status === 'pending' ? { ...b, status: 'confirmed' } : b));
      toast.success(`${updated} orders accepted!`);
      setSelected([]); setSelectMode(false);
    } catch (e) { toast.error(e.message); }
  };

  const handleBulkReject = async (reason, note) => {
    setShowBulkReject(false);
    try {
      const { updated } = await authFetch('PATCH', '/bookings/bulk-action', { bookingIds: selected, action: 'reject', rejection_reason: reason, note });
      setBookings(bs => bs.map(b => selected.includes(b._id) && b.status === 'pending' ? { ...b, status: 'cancelled' } : b));
      toast.success(`${updated} orders rejected`);
      setSelected([]); setSelectMode(false);
    } catch (e) { toast.error(e.message); }
  };

  // Stats
  const todayAll  = bookings.filter(b => isToday(b.createdAt));
  const pending   = bookings.filter(b => b.status === 'pending').length;
  const todayRev  = todayAll.filter(b => ['confirmed','completed'].includes(b.status)).reduce((s, b) => s + (b.total_price || 0), 0);
  const compRate  = bookings.length > 0 ? (bookings.filter(b => b.status === 'completed').length / bookings.length) * 100 : 0;

  // Filter
  let filtered = bookings;
  if (statusFilter !== 'all') filtered = filtered.filter(b => b.status === statusFilter);
  if (locFilter)  filtered = filtered.filter(b => b.delivery_place === locFilter);
  if (timeFilter) filtered = filtered.filter(b => b.delivery_time  === timeFilter);
  if (dateFilter) filtered = filtered.filter(b => b.delivery_date  === dateFilter);
  if (sortByTime) filtered = [...filtered].sort((a, b) => slotToMinutes(a.delivery_time) - slotToMinutes(b.delivery_time));

  // Extract unique dates for the dropdown
  const uniqueDates = [...new Set(bookings.map(b => b.delivery_date).filter(Boolean))].sort();

  // Grouping
  let grouped = null;
  if (sortByTime && filtered.length > 0) {
    grouped = {};
    filtered.forEach(b => { const k = b.delivery_time || 'Unknown'; if (!grouped[k]) grouped[k] = []; grouped[k].push(b); });
  }

  const STATUS_TABS = [
    { id: 'all',       label: 'All' },
    { id: 'pending',   label: `Pending (${pending})` },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'completed', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <OwnerLayout activeTab="orders" theme="light">
      <div className="pb-24">
        <div className="container mx-auto max-w-4xl">

          {/* Heading & Tabs */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Orders & Reviews</h1>
              <p className="text-gray-500 mt-1">Manage incoming bookings and view customer feedback</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
                <button onClick={() => setActiveTab('orders')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'orders' ? 'bg-[#051094] text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}>
                  📦 Orders
                </button>
                <button onClick={() => setActiveTab('reviews')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'reviews' ? 'bg-[#051094] text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}>
                  ⭐ Reviews
                </button>
              </div>
              
              {activeTab === 'orders' && (
                <button onClick={() => { setSelectMode(m => !m); setSelected([]); }}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${selectMode ? 'bg-[#051094]/10 text-[#051094] border-[#051094]/30' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 shadow-sm'}`}>
                  {selectMode ? '✕ Cancel Select' : '☑ Select'}
                </button>
              )}
            </div>
          </div>

          {activeTab === 'reviews' ? (
            /* Reviews Tab Content */
            <div>
              {loadingReviews && [0,1].map(i => <SkeletonCard key={i} />)}
              
              {!loadingReviews && reviews.length === 0 && (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <span className="text-5xl">⭐</span>
                  <h3 className="mt-4 text-lg font-bold text-gray-900">No reviews yet</h3>
                  <p className="text-gray-500 mt-1">When customers review your products after delivery, they'll appear here.</p>
                </div>
              )}

              {!loadingReviews && reviews.map(r => (
                <div key={r._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4 border-l-4" style={{ borderLeftColor: r.rating >= 4 ? '#22c55e' : r.rating === 3 ? '#f59e0b' : '#ef4444' }}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-gray-900">{r.user_id?.firstName} {r.user_id?.lastName}</div>
                    <div className="text-amber-400 text-lg tracking-widest font-mono">
                      {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3 text-xs">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded font-medium">{r.product_id?.name || 'Unknown Product'}</span>
                    <span className="text-gray-400">{new Date(r.created_at || r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">"{r.feedback}"</p>
                </div>
              ))}
            </div>
          ) : (
            /* Orders Tab Content */
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard icon="📋" label="Today's Orders"  value={todayAll.length} />
                <StatCard icon="⏳" label="Pending"          value={pending} />
                <StatCard icon="💰" label="Revenue Today"    value={`$${todayRev.toLocaleString()}`} />
                <StatCard icon=""   label="Completion Rate"  value="" ring={compRate} />
              </div>

          {/* Filter bar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
            <div className="flex gap-2 flex-wrap mb-3">
              {STATUS_TABS.map(t => (
                <button key={t.id} onClick={() => setStatusFilter(t.id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${statusFilter === t.id ? 'bg-[#051094] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="flex gap-3 flex-wrap items-center">
              <select value={locFilter} onChange={e => setLocFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-[#051094] focus:border-[#051094]"
                title="Filter by Location">
                <option value="">All Locations</option>
                {LOCATIONS.map(l => <option key={l.id} value={l.id}>{l.emoji} {l.name}</option>)}
              </select>
              
              <input 
                type="date" 
                value={dateFilter} 
                onChange={e => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-[#051094] focus:border-[#051094] min-w-[130px]"
                title="Filter by Delivery Date"
              />

              <select value={timeFilter} onChange={e => setTimeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-[#051094] focus:border-[#051094]"
                title="Filter by Time Slot">
                <option value="">All Time Slots</option>
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <button onClick={() => setSortByTime(s => !s)}
                className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${sortByTime ? 'bg-[#051094]/10 text-[#051094] border-[#051094]/30' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'}`}>
                🕐 Sort by Time
              </button>
              {(locFilter || timeFilter || dateFilter || statusFilter !== 'all' || sortByTime) && (
                <button onClick={() => { setLocFilter(''); setTimeFilter(''); setDateFilter(''); setStatusFilter('all'); setSortByTime(false); }}
                  className="text-sm text-gray-400 hover:text-gray-600 underline font-medium bg-transparent border-none cursor-pointer">
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* States */}
          {loading && [0,1,2].map(i => <SkeletonCard key={i} />)}

          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <p className="text-red-600 font-medium mb-3">⚠ {error}</p>
              <button onClick={() => fetchOrders()} className="px-5 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-lg">Retry</button>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <span className="text-6xl">📭</span>
              <h3 className="mt-4 text-lg font-bold text-gray-900">No orders found</h3>
              <p className="text-gray-500 mt-1">
                {statusFilter === 'all' && !locFilter && !timeFilter && !dateFilter ? 'Customer orders will appear here.' : 'No orders match the current filters.'}
              </p>
            </div>
          )}

              {/* Cards — grouped or flat */}
              {!loading && !error && filtered.length > 0 && (
                grouped
                  ? Object.entries(grouped).map(([slot, cards]) => (
                      <div key={slot}>
                        <div className="flex items-center gap-3 mb-3 mt-4">
                          <div className="w-1 h-6 bg-[#051094] rounded-full" />
                          <span className="font-bold text-[#051094] text-sm">🕐 {slot}</span>
                          <span className="text-gray-400 text-sm">— {cards.length} order{cards.length !== 1 ? 's' : ''}</span>
                        </div>
                        {cards.map((b, i) => (
                          <OrderCard key={b._id} booking={b} index={i} selected={selected.includes(b._id)} onSelect={toggleSelect} onUpdate={handleUpdate} selectMode={selectMode} />
                        ))}
                      </div>
                    ))
                  : filtered.map((b, i) => (
                      <OrderCard key={b._id} booking={b} index={i} selected={selected.includes(b._id)} onSelect={toggleSelect} onUpdate={handleUpdate} selectMode={selectMode} />
                    ))
              )}
            </>
          )}
        </div>
      </div>

      {/* Bulk action sticky bar */}
      {selectMode && selected.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-xl px-6 py-4 flex items-center justify-between">
          <span className="font-bold text-gray-900">{selected.length} selected</span>
          <div className="flex gap-3">
            <button onClick={handleBulkAccept}
              className="px-5 py-2.5 text-sm font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition-colors">
              ✅ Accept All
            </button>
            <button onClick={() => setShowBulkReject(true)}
              className="px-5 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors">
              ✕ Reject All
            </button>
          </div>
        </div>
      )}

      {showBulkReject && <RejectModal bulk onConfirm={handleBulkReject} onClose={() => setShowBulkReject(false)} />}
    </OwnerLayout>
  );
};

export default OwnerOrders;
