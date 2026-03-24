import React from 'react';

const LOCATION_MAP = {
  anohana:      { emoji: '🍱', name: 'Anohana Canteen' },
  main_canteen: { emoji: '🏛️', name: 'Main Building Canteen' },
  sliit_dupath: { emoji: '☕', name: 'SLIIT Dupath' },
  new_canteen:  { emoji: '🍽️', name: 'New Building Canteen' },
  bird_nest:    { emoji: '🐦', name: 'Bird Nest' },
  sliit_ground: { emoji: '⚽', name: 'SLIIT Ground' },
};

// Format: "Mon, 28 Apr · 02:00 PM"
const formatDelivery = (dateStr, timeStr) => {
  if (!dateStr && !timeStr) return '—';
  const parts = [];
  if (dateStr) {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      parts.push(d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }));
    } catch { parts.push(dateStr); }
  }
  if (timeStr) parts.push(timeStr);
  return parts.join(' · ');
};

const BookingSuccess = ({ booking, onClose, onViewOrders }) => {
  const loc = LOCATION_MAP[booking?.delivery_place] || { emoji: '📍', name: booking?.delivery_place };
  const orderId = booking?._id ? booking._id.slice(-8).toUpperCase() : '--------';
  const deliveryLabel = formatDelivery(booking?.delivery_date, booking?.delivery_time);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @keyframes successIn { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
        @keyframes ring { 0%,100%{transform:scale(1);opacity:0.5} 50%{transform:scale(1.15);opacity:0.15} }
        @keyframes rainbow { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
      `}</style>

      <div style={{ background: 'linear-gradient(145deg,#0a0f2e,#0d1545)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, width: '100%', maxWidth: 460, boxShadow: '0 30px 90px rgba(0,0,0,0.7)', animation: 'successIn 0.5s cubic-bezier(.22,1,.36,1)', overflow: 'hidden' }}>

        {/* Rainbow shimmer top */}
        <div style={{ height: 4, background: 'linear-gradient(90deg,#ff6b6b,#ffd93d,#6bcb77,#4d96ff,#c77dff,#ff6b6b)', backgroundSize: '200% 100%', animation: 'rainbow 2s linear infinite' }} />

        <div style={{ padding: '32px 28px 28px', textAlign: 'center' }}>
          {/* Pulsing rings + emoji */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 20 }}>
            <div style={{ position: 'absolute', inset: -20, borderRadius: '50%', background: 'rgba(45,79,255,0.15)', animation: 'ring 2.5s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', inset: -10, borderRadius: '50%', background: 'rgba(45,79,255,0.22)', animation: 'ring 2.5s ease-in-out infinite 0.4s' }} />
            <span style={{ fontSize: 64, position: 'relative', zIndex: 1 }}>🎉</span>
          </div>

          <h2 style={{ color: '#fff', fontWeight: 900, fontSize: 26, margin: '0 0 10px', lineHeight: 1.2 }}>Booking Confirmed!</h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, margin: '0 0 28px', lineHeight: 1.6 }}>
            Your order has been placed. The seller will confirm it shortly.
          </p>

          {/* Summary card */}
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '18px 20px', textAlign: 'left', marginBottom: 28 }}>
            {[
              ['Order ID',  <code key="id" style={{ fontFamily: 'monospace', color: '#6fa3ff', fontSize: 14 }}>#{orderId}</code>],
              ['Location', `${loc.emoji} ${loc.name}`],
              ['Delivery', deliveryLabel],
            ].map(([lbl, val]) => (
              <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>{lbl}</span>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
            <button onClick={onViewOrders} style={{ padding: 14, borderRadius: 12, background: 'linear-gradient(135deg,#051094,#2d4fff)', border: 'none', color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer', width: '100%', fontFamily: "'DM Sans',sans-serif" }}>
              📋 View My Orders
            </button>
            <button onClick={onClose} style={{ padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.75)', fontWeight: 700, fontSize: 15, cursor: 'pointer', width: '100%', fontFamily: "'DM Sans',sans-serif" }}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
