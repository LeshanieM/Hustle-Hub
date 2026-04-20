import React from 'react';
import toast from 'react-hot-toast';

export const showBadgeToast = (badges) => {
  if (!badges || Object.keys(badges).length === 0) return;
  // Make sure it's an array
  const badgeArray = Array.isArray(badges) ? badges : [badges];
  if (badgeArray.length === 0) return;

  badgeArray.forEach((badge, index) => {
    // Stagger multiple badge toasts slightly using timeout
    setTimeout(() => {
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-sm w-full bg-[#051094] shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-300 p-4 border border-[#051094]/50 z-50`}
        >
          <div className="flex items-center w-full">
            <div className="flex-shrink-0 pt-0.5">
              <div className="h-14 w-14 rounded-full bg-white/10 flex items-center justify-center text-3xl shadow-inner border border-white/20">
                {badge.icon}
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-[11px] font-black tracking-widest text-[#a8b8ff] uppercase flex items-center gap-1.5 mb-1">
                <span className="text-base">🎉</span> BADGE UNLOCKED!
              </p>
              <p className="text-xl font-bold text-white mb-0.5 leading-tight">
                {badge.label}
              </p>
              <p className="text-sm text-blue-100/90 font-medium leading-tight line-clamp-2">
                {badge.description}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex self-start">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="rounded-full inline-flex text-white/40 hover:text-white/90 hover:bg-white/10 focus:outline-none transition-colors p-1.5"
              >
                <span className="sr-only">Close</span>
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ), { 
        duration: 5000,
        position: 'bottom-right'
      });
    }, index * 800); // 800ms stagger between multiple badges
  });
};
