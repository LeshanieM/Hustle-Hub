import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { badgeConfig } from '../../utils/badgeConfig';
import BadgeCard from './BadgeCard';

/* ── Owner Milestone Track ──────────────────────────────────────── */
const OwnerMilestoneTrack = ({ earnedBadges, onBadgeClick }) => {
  const sellerBadges = badgeConfig.filter(b => b.tier === 'Seller');
  const earnedSellerIds = earnedBadges.map(eb => eb.id);
  const earnedCount = sellerBadges.filter(b => earnedSellerIds.includes(b.id)).length;
  const progressPct = Math.round((earnedCount / sellerBadges.length) * 100);

  return (
    <div className="w-full">
      {/* Header card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#051094] via-[#0a1fa8] to-[#1a2fd4] p-8 mb-8 shadow-xl">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p className="text-white/60 text-sm font-semibold uppercase tracking-widest mb-1">Seller Achievements</p>
            <h2 className="text-3xl font-black text-white mb-2">Your Hustle Journey</h2>
            <p className="text-white/70 font-medium max-w-md">Every product listed and sale confirmed gets you closer to becoming a Top Hustler.</p>
          </div>
          <div className="flex flex-col items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-8 py-5 min-w-[130px]">
            <span className="text-5xl font-black text-white">{earnedCount}</span>
            <span className="text-white/60 text-sm font-semibold mt-1">of {sellerBadges.length} earned</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative z-10 mt-6">
          <div className="flex justify-between text-white/60 text-xs font-bold mb-2">
            <span>Progress</span>
            <span>{progressPct}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-white/60 to-white transition-all duration-1000 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Milestone track */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sellerBadges.map((badge, idx) => {
          const earnedMatch = earnedBadges.find(eb => eb.id === badge.id);
          const isEarned = !!earnedMatch;

          return (
            <button
              key={badge.id}
              onClick={() => onBadgeClick(badge, isEarned, earnedMatch?.earnedAt)}
              className={`
                group relative flex items-center gap-5 p-5 rounded-2xl border-2 text-left w-full transition-all duration-300 focus:outline-none
                ${isEarned
                  ? 'bg-white border-[#051094]/30 shadow-md hover:shadow-xl hover:border-[#051094] hover:-translate-y-1'
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300 hover:-translate-y-0.5 hover:shadow-md'}
              `}
            >
              {/* Step number */}
              <div className={`
                absolute -top-3 -left-3 w-7 h-7 rounded-full text-xs font-black flex items-center justify-center border-2 border-white shadow-sm
                ${isEarned ? 'bg-[#051094] text-white' : 'bg-gray-200 text-gray-400'}
              `}>
                {idx + 1}
              </div>

              {/* Icon */}
              <div className={`
                w-16 h-16 flex-shrink-0 rounded-2xl flex items-center justify-center text-3xl transition-all duration-300
                ${isEarned
                  ? 'bg-[#051094]/10 border border-[#051094]/20 group-hover:scale-110'
                  : 'bg-gray-100 border border-gray-200 grayscale'}
              `}>
                {isEarned ? badge.icon : '🔒'}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`font-black text-base truncate ${isEarned ? 'text-gray-900' : 'text-gray-400'}`}>
                    {badge.label}
                  </h4>
                  {isEarned && (
                    <span className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      Unlocked
                    </span>
                  )}
                </div>
                <p className={`text-sm leading-snug line-clamp-2 ${isEarned ? 'text-gray-500' : 'text-gray-300'}`}>
                  {badge.description}
                </p>
                {isEarned && earnedMatch?.earnedAt && (
                  <p className="mt-1.5 text-[11px] font-semibold text-[#051094]">
                    Earned {new Date(earnedMatch.earnedAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Arrow indicator */}
              <svg className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-1 ${isEarned ? 'text-[#051094]/40' : 'text-gray-200'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ── Customer Grid Panel ────────────────────────────────────────── */
const CustomerGrid = ({ earnedBadges, onBadgeClick }) => {
  const tiers = ["Shopper", "Review"];
  return (
    <div className="w-full mt-4">
      {tiers.map(tier => {
        const tierBadges = badgeConfig.filter(b => b.tier === tier);
        const earnedInTier = tierBadges.filter(tb => earnedBadges.some(eb => eb.id === tb.id));
        return (
          <div key={tier} className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">{tier} Badges</h3>
              <span className="text-sm font-semibold text-[#051094] bg-[#051094]/10 px-4 py-1.5 rounded-full border border-[#051094]/20 shadow-sm">
                {earnedInTier.length} / {tierBadges.length}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-6 overflow-hidden shadow-inner border border-gray-200">
              <div
                className="bg-gradient-to-r from-[#051094]/70 to-[#051094] h-2.5 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${(earnedInTier.length / tierBadges.length) * 100}%` }}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {tierBadges.map(badge => {
                const earnedMatch = earnedBadges.find(eb => eb.id === badge.id);
                return (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                    isEarned={!!earnedMatch}
                    earnedAt={earnedMatch ? earnedMatch.earnedAt : null}
                    onClick={onBadgeClick}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ── Badge Detail Modal ─────────────────────────────────────────── */
const BadgeModal = ({ selectedBadge, onClose }) => {
  if (!selectedBadge) return null;
  const { badge, isEarned, earnedAt } = selectedBadge;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-8 max-w-sm w-full relative shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors focus:outline-none"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col items-center text-center">
          <div className={`w-28 h-28 mb-5 rounded-full flex items-center justify-center text-6xl shadow-inner ${isEarned ? 'bg-[#051094]/10 border-2 border-[#051094]/30' : 'bg-gray-100 border-2 border-gray-200'}`}>
            {isEarned ? badge.icon : '🔒'}
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">{badge.label}</h2>
          {isEarned ? (
            <span className="mb-4 inline-flex items-center gap-1.5 font-bold text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full uppercase tracking-wider">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Unlocked · {new Date(earnedAt).toLocaleDateString()}
            </span>
          ) : (
            <span className="mb-4 inline-block font-bold text-sm text-gray-500 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full uppercase tracking-wider">
              🔒 Locked
            </span>
          )}
          <p className="text-gray-600 font-medium leading-relaxed">{badge.description}</p>
        </div>
      </div>
    </div>
  );
};

/* ── Main Export ────────────────────────────────────────────────── */
const BadgesPanel = ({ userId, role }) => {
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState(null);

  useEffect(() => {
    if (!userId) return;
    api.get(`/user/${userId}/badges`)
      .then(res => setEarnedBadges(res.data || []))
      .catch(err => console.error('Error fetching badges:', err))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleBadgeClick = (badge, isEarned, earnedAt) => {
    setSelectedBadge({ badge, isEarned, earnedAt });
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#051094]" />
      </div>
    );
  }

  return (
    <>
      {role === 'OWNER'
        ? <OwnerMilestoneTrack earnedBadges={earnedBadges} onBadgeClick={handleBadgeClick} />
        : <CustomerGrid earnedBadges={earnedBadges} onBadgeClick={handleBadgeClick} />
      }
      <BadgeModal selectedBadge={selectedBadge} onClose={() => setSelectedBadge(null)} />
    </>
  );
};

export default BadgesPanel;
