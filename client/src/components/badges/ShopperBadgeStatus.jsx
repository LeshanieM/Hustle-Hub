import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { badgeConfig } from '../../utils/badgeConfig';

const SHOPPER_BADGES = badgeConfig.filter(b => b.tier === 'Shopper');

const ShopperBadgeStatus = ({ userId, compact }) => {
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    api.get(`/user/${userId}/badges`)
      .then(res => setEarnedBadges(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div className="h-12 animate-pulse bg-amber-100 rounded-xl" />;

  const earnedIds = earnedBadges.map(b => b.id);
  const earnedCount = SHOPPER_BADGES.filter(b => earnedIds.includes(b.id)).length;
  const nextBadge = SHOPPER_BADGES.find(b => !earnedIds.includes(b.id));
  const lastEarned = [...SHOPPER_BADGES].reverse().find(b => earnedIds.includes(b.id));

  /* ── Compact card mode ── */
  if (compact) {
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-black text-gray-900 text-base leading-tight">
              {lastEarned ? lastEarned.label : 'New Shopper'}
            </p>
            <p className="text-xs text-amber-600 font-semibold mt-0.5">
              {earnedCount} of {SHOPPER_BADGES.length} badges
            </p>
          </div>
          <span className="text-2xl">{lastEarned ? lastEarned.icon : '🛒'}</span>
        </div>
        {/* Progress segments */}
        <div className="flex gap-1 mb-3">
          {SHOPPER_BADGES.map(badge => (
            <div
              key={badge.id}
              title={badge.label}
              className={`h-2 flex-1 rounded-full transition-all duration-500 ${earnedIds.includes(badge.id) ? 'bg-amber-400' : 'bg-amber-100'}`}
            />
          ))}
        </div>
        {/* Badge icons */}
        <div className="flex items-center gap-1.5">
          {SHOPPER_BADGES.map(badge => (
            <span
              key={badge.id}
              title={badge.label}
              className={`text-base transition-all ${earnedIds.includes(badge.id) ? 'opacity-100' : 'opacity-20 grayscale'}`}
            >
              {badge.icon}
            </span>
          ))}
          {nextBadge && (
            <span className="ml-auto text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full whitespace-nowrap">
              Next: {nextBadge.label}
            </span>
          )}
        </div>
      </div>
    );
  }

  /* ── Full mode (shown in Profile page Shopper Status card) ── */
  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">⭐</span>
          <div>
            <p className="text-xs font-bold text-amber-500 uppercase tracking-widest">Shopper Status</p>
            <p className="font-black text-gray-900 text-sm">
              {lastEarned ? lastEarned.label : 'Beginner Shopper'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-amber-500">
            {earnedCount}
            <span className="text-sm text-amber-400">/{SHOPPER_BADGES.length}</span>
          </p>
          <p className="text-[10px] text-amber-600 font-semibold uppercase tracking-wider">
            Badges Earned
          </p>
        </div>
      </div>

      {/* Progress bar segments */}
      <div className="flex items-center gap-1.5 mb-4">
        {SHOPPER_BADGES.map((badge) => (
          <div key={badge.id} title={badge.label} className="relative group flex-1">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${
                earnedIds.includes(badge.id) ? 'bg-amber-400' : 'bg-amber-100'
              }`}
            />
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block text-[10px] font-bold bg-gray-900 text-white px-2 py-1 rounded-lg whitespace-nowrap z-10">
              {badge.icon} {badge.label}
            </span>
          </div>
        ))}
      </div>

      {/* Badge icons row */}
      <div className="flex items-center gap-2 flex-wrap">
        {SHOPPER_BADGES.map((badge) => (
          <span
            key={badge.id}
            title={badge.label}
            className={`text-xl transition-all duration-300 ${
              earnedIds.includes(badge.id) ? 'opacity-100 scale-110' : 'opacity-20 grayscale'
            }`}
          >
            {badge.icon}
          </span>
        ))}
        {nextBadge && (
          <span className="ml-auto text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-1 rounded-full whitespace-nowrap">
            Next → {nextBadge.label}
          </span>
        )}
        {!nextBadge && (
          <span className="ml-auto text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">
            ✅ All unlocked!
          </span>
        )}
      </div>
    </div>
  );
};

export default ShopperBadgeStatus;
