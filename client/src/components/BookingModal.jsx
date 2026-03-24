import React, { useState } from 'react';
import { createBooking } from '../services/bookingService';

// ── Constants ─────────────────────────────────────────────────────────────────

const TIME_SLOTS = [];
for (let h = 8; h <= 17; h++) {
  for (const m of [0, 30]) {
    if (h === 17 && m === 30) break;
    const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    const ampm = h < 12 ? 'AM' : 'PM';
    TIME_SLOTS.push(`${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`);
  }
}

const LOCATIONS = [
  { id: 'anohana',      emoji: '🍱', name: 'Anohana Canteen',      zone: 'Zone A' },
  { id: 'main_canteen', emoji: '🏛️', name: 'Main Building Canteen', zone: 'Zone B' },
  { id: 'sliit_dupath', emoji: '☕', name: 'SLIIT Dupath',          zone: 'Zone C' },
  { id: 'new_canteen',  emoji: '🍽️', name: 'New Building Canteen',  zone: 'Zone D' },
  { id: 'bird_nest',    emoji: '🐦', name: 'Bird Nest',             zone: 'Zone E' },
  { id: 'sliit_ground', emoji: '⚽', name: 'SLIIT Ground',          zone: 'Zone F' },
];

// Today's date as yyyy-mm-dd (no past dates allowed)
const todayStr = () => new Date().toISOString().split('T')[0];

// ── Sub-components ────────────────────────────────────────────────────────────

const label = (text, optional) => (
  <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
    {text} {optional && <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400, textTransform: 'none' }}>(optional)</span>}
  </label>
);

const inputStyle = (hasValue) => ({
  width: '100%', padding: '12px 14px', borderRadius: 10, fontSize: 14, fontWeight: 600,
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
  color: hasValue ? '#fff' : 'rgba(255,255,255,0.4)', cursor: 'pointer',
  fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
  colorScheme: 'dark',
});

const ProgressBar = ({ step }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
    {[1, 2, 3].map((s, i) => (
      <React.Fragment key={s}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontWeight: 800, fontSize: 14,
            background: step >= s ? 'linear-gradient(135deg,#051094,#2d4fff)' : 'rgba(255,255,255,0.08)',
            color: step >= s ? '#fff' : 'rgba(255,255,255,0.35)',
            border: step >= s ? 'none' : '2px solid rgba(255,255,255,0.15)',
            transition: 'all 0.3s', fontFamily: "'DM Sans', sans-serif",
          }}>
            {step > s ? '✓' : s}
          </div>
          <span style={{ fontSize: 11, color: step >= s ? '#fff' : 'rgba(255,255,255,0.35)', marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>
            {['Details', 'Location', 'Confirm'][i]}
          </span>
        </div>
        {i < 2 && <div style={{ height: 2, width: 56, margin: '0 4px', marginBottom: 20, background: step > s ? 'linear-gradient(90deg,#051094,#2d4fff)' : 'rgba(255,255,255,0.12)', transition: 'background 0.3s' }} />}
      </React.Fragment>
    ))}
  </div>
);

const ProductBanner = ({ product }) => (
  <div style={{ background: 'rgba(5,16,148,0.18)', border: '1px solid rgba(45,79,255,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
    <span style={{ fontSize: 28 }}>🛍️</span>
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: 700, color: '#fff', fontSize: 15, fontFamily: "'DM Sans', sans-serif" }}>{product.name}</div>
      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
        {product.category || product.type || 'Item'} · ${Number(product.price).toLocaleString()}
      </div>
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

const BookingModal = ({ product, onClose, onSuccess, prefill }) => {
  const [step, setStep]         = useState(1);
  const [quantity, setQuantity] = useState(prefill?.quantity || 1);
  const [timeSlot, setTimeSlot] = useState(prefill?.delivery_time || '');
  const [deliveryDate, setDeliveryDate] = useState(prefill?.delivery_date || todayStr());
  const [note, setNote]         = useState('');
  const [location, setLocation] = useState(prefill?.delivery_place || '');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [stepError, setStepError] = useState('');

  const price = Number(product.price) || 0;
  const total = price * quantity;
  const selectedLoc = LOCATIONS.find(l => l.id === location);

  const handleNext = () => {
    setStepError('');
    if (step === 1) {
      if (!deliveryDate) { setStepError('Please select a delivery date.'); return; }
      if (!timeSlot)     { setStepError('Please select a delivery time slot.'); return; }
    }
    if (step === 2 && !location) { setStepError('Please select a delivery location.'); return; }
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    setLoading(true); setError('');
    try {
      const booking = await createBooking({ product_id: product._id, quantity, delivery_place: location, delivery_time: timeSlot, delivery_date: deliveryDate, note });
      onSuccess(booking);
    } catch (err) {
      setError(err.message || 'Failed to place booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format delivery date for Step 3 summary
  const formattedDate = deliveryDate
    ? new Date(deliveryDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })
    : '—';

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, animation: 'fadeIn 0.25s ease' }}>
      <style>{`
        @keyframes fadeIn  { from{opacity:0}         to{opacity:1} }
        @keyframes modalIn { from{opacity:0;transform:scale(0.92) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        .bm-loc:hover { border-color:rgba(45,79,255,0.5)!important; background:rgba(5,16,148,0.15)!important; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1) opacity(0.6); }
      `}</style>

      <div onClick={e => e.stopPropagation()} style={{ background: 'linear-gradient(145deg,#0a0f2e,#0d1545)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, width: '100%', maxWidth: 520, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,0.6)', animation: 'modalIn 0.3s cubic-bezier(.22,1,.36,1)', overflow: 'hidden', fontFamily: "'DM Sans',sans-serif" }}>

        {/* Blue glow accent */}
        <div style={{ height: 3, background: 'linear-gradient(90deg,#051094,#2d4fff,#6fa3ff)', flexShrink: 0 }} />

        {/* Header */}
        <div style={{ padding: '20px 24px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 20, margin: 0 }}>Book Now</h2>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, width: 32, height: 32, color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>
          <ProgressBar step={step} />
          <ProductBanner product={product} />
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 8px', animation: 'slideUp 0.25s ease' }}>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div>
              <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 18 }}>Order Details</h3>

              {/* Quantity + live price */}
              <div style={{ marginBottom: 16 }}>
                {label('Quantity')}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>−</button>
                  <span style={{ color: '#fff', fontWeight: 800, fontSize: 22, minWidth: 30, textAlign: 'center' }}>{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(10, q + 1))} style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>+</button>
                  <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>max 10</span>
                </div>
                {/* Live price preview */}
                <div style={{ background: 'rgba(45,79,255,0.12)', border: '1px solid rgba(45,79,255,0.3)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>
                    ${price.toLocaleString()} × {quantity}
                  </span>
                  <span style={{ color: '#6fa3ff', fontWeight: 900, fontSize: 16 }}>
                    = ${total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Date + Time in a 2-col grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  {label('Delivery Date')}
                  <input
                    type="date"
                    min={todayStr()}
                    value={deliveryDate}
                    onChange={e => setDeliveryDate(e.target.value)}
                    style={inputStyle(!!deliveryDate)}
                  />
                </div>
                <div>
                  {label('Time Slot')}
                  <select value={timeSlot} onChange={e => setTimeSlot(e.target.value)} style={inputStyle(!!timeSlot)}>
                    <option value="" disabled style={{ background: '#0a0f2e' }}>Select slot</option>
                    {TIME_SLOTS.map(t => <option key={t} value={t} style={{ background: '#0a0f2e', color: '#fff' }}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Note */}
              <div style={{ marginBottom: 8 }}>
                {label('Note to Seller', true)}
                <textarea
                  value={note} onChange={e => setNote(e.target.value)} rows={3}
                  placeholder="Any special instructions…"
                  style={{ ...inputStyle(true), resize: 'vertical', color: '#fff' }}
                />
              </div>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div>
              <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Select Delivery Location</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, paddingBottom: 4 }}>
                {LOCATIONS.map(loc => (
                  <button key={loc.id} className="bm-loc" onClick={() => setLocation(loc.id)} style={{ background: location === loc.id ? 'rgba(5,16,148,0.35)' : 'rgba(255,255,255,0.04)', border: location === loc.id ? '2px solid #2d4fff' : '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 10px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', position: 'relative' }}>
                    {location === loc.id && <div style={{ position: 'absolute', top: 8, right: 8, width: 20, height: 20, background: '#2d4fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', fontWeight: 800 }}>✓</div>}
                    <div style={{ fontSize: 26, marginBottom: 6 }}>{loc.emoji}</div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, fontFamily: "'DM Sans',sans-serif", marginBottom: 2 }}>{loc.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontFamily: "'DM Sans',sans-serif" }}>{loc.zone}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <div>
              <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Order Summary</h3>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '18px 16px', marginBottom: 14 }}>
                {[
                  ['Product',  product.name],
                  ['Quantity', `× ${quantity}`],
                  ['Location', selectedLoc ? `${selectedLoc.emoji} ${selectedLoc.name}` : location],
                  ['Delivery', `${formattedDate} · ${timeSlot}`],
                  ...(note ? [['Note', note]] : []),
                ].map(([lbl, val]) => (
                  <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{lbl}</span>
                    <span style={{ color: '#fff', fontWeight: 600, fontSize: 13, textAlign: 'right', maxWidth: '60%' }}>{val}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12, marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: 700 }}>Total</span>
                  <span style={{ color: '#2d4fff', fontSize: 20, fontWeight: 900 }}>${total.toLocaleString()}</span>
                </div>
              </div>
              {error && <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: 10, padding: '12px 14px', color: '#fca5a5', fontSize: 13, marginBottom: 10 }}>⚠ {error}</div>}
            </div>
          )}

          {stepError && <div style={{ color: '#fca5a5', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>⚠ {stepError}</div>}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={step === 1 ? onClose : () => setStep(s => s - 1)} style={{ padding: '11px 22px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
            {step === 1 ? 'Cancel' : '← Back'}
          </button>
          {step < 3 ? (
            <button onClick={handleNext} style={{ padding: '11px 28px', borderRadius: 10, background: 'linear-gradient(135deg,#051094,#2d4fff)', border: 'none', color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Continue →</button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} style={{ padding: '11px 28px', borderRadius: 10, background: loading ? 'rgba(5,16,148,0.5)' : 'linear-gradient(135deg,#051094,#2d4fff)', border: 'none', color: '#fff', fontWeight: 800, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'DM Sans',sans-serif" }}>
              {loading ? (<><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" /></svg>Placing Order…</>) : '🎉 Confirm Booking'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
