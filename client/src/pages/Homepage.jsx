// pages/HomePage.jsx
import React from 'react';
import { useEffect } from 'react';
import Header from '../components/CustomerHeader';
import Footer from '../components/Footer';

const MaterialIcon = ({ name, size = 20 }) => (
  <span
    className="material-symbols-rounded"
    style={{ fontSize: size, lineHeight: 1 }}
  >
    {name}
  </span>
);

const useReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
};

export default function HomePage() {
  useReveal();

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
      />

      <div className="min-h-screen bg-[#f5f3ee] text-[#0a0a0f]">
        <Header />

        {/* HERO */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-10 pt-[120px] pb-20 relative overflow-hidden text-center">
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(10,10,15,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(10,10,15,0.1)_1px,transparent_1px)] bg-[length:60px_60px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_50%,black,transparent)]" />

          <div className="absolute w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(5,16,148,0.12),transparent_70%)] top-[-100px] right-[-100px] pointer-events-none animate-[float1_8s_ease-in-out_infinite]" />
          <div className="absolute w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(5,16,148,0.10),transparent_70%)] bottom-[-50px] left-[-80px] pointer-events-none animate-[float2_10s_ease-in-out_infinite]" />

          <style jsx>{`
            @keyframes float1 {
              0%,
              100% {
                transform: translate(0, 0);
              }
              50% {
                transform: translate(-30px, 20px);
              }
            }
            @keyframes float2 {
              0%,
              100% {
                transform: translate(0, 0);
              }
              50% {
                transform: translate(20px, -25px);
              }
            }
          `}</style>

          <div className="inline-flex items-center gap-1.5 bg-[#ede9e0] border border-[rgba(10,10,15,0.1)] rounded-full px-4 py-1.5 mb-8 text-xs font-medium text-[#6b6860] animate-[fadeUp_0.6s_ease_both]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#051094] animate-[pulse_2s_ease-in-out_infinite]" />
            Now live on 12+ campuses
          </div>

          <style jsx>{`
            @keyframes pulse {
              0%,
              100% {
                opacity: 1;
                transform: scale(1);
              }
              50% {
                opacity: 0.6;
                transform: scale(1.3);
              }
            }
            @keyframes fadeUp {
              from {
                opacity: 0;
                transform: translateY(24px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>

          <h1 className="text-[clamp(3rem,8vw,6rem)] font-extrabold leading-[1.0] tracking-[-3px] text-[#0a0a0f] max-w-[800px] animate-[fadeUp_0.7s_ease_0.1s_both]">
            Empowering
            <br />
            <span className="text-[#051094] relative inline-block">
              Campus
              <span className="absolute bottom-1 left-0 right-0 h-1 bg-[#051094] rounded-full scale-x-0 animate-[underlineIn_0.5s_ease_0.8s_both]" />
            </span>
            <br />
            Hustlers
          </h1>

          <style jsx>{`
            @keyframes underlineIn {
              to {
                transform: scaleX(1);
              }
            }
          `}</style>

          <p className="text-base sm:text-lg text-[#6b6860] max-w-[500px] leading-relaxed mt-6 animate-[fadeUp_0.7s_ease_0.2s_both]">
            The all-in-one platform for student entrepreneurs to manage orders,
            inventory, and campus deliveries.
          </p>

          <div className="flex gap-3 mt-10 flex-wrap justify-center animate-[fadeUp_0.7s_ease_0.35s_both]">
            <button className="bg-[#051094] text-white border-none cursor-pointer font-semibold text-base px-7 py-3.5 rounded-lg flex items-center gap-2 shadow-[0_4px_20px_rgba(5,16,148,0.3)] hover:-translate-y-[2px] hover:shadow-[0_8px_30px_rgba(5,16,148,0.4)] transition-all">
              <MaterialIcon name="storefront" size={18} />
              Start Selling
            </button>
            <button className="bg-transparent text-[#051094] border border-[rgba(10,10,15,0.1)] cursor-pointer font-medium text-base px-7 py-3.5 rounded-lg flex items-center gap-2 hover:border-[#0a0a0f] hover:bg-[#ede9e0] transition-all">
              <MaterialIcon name="shopping_bag" size={18} />
              Explore Marketplace
            </button>
          </div>
        </section>

        {/* FOR ENTREPRENEURS */}
        <section className="px-4 sm:px-10 py-16 sm:py-24 max-w-[1100px] mx-auto">
          <div className="mb-12 sm:mb-16 reveal">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#051094] mb-4">
              <span className="w-5 h-0.5 bg-[#051094] rounded-full" />
              For Entrepreneurs
            </div>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-[-2px] text-[#0a0a0f] leading-[1.1] max-w-[560px]">
              Run your hustle like a real business
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-[rgba(10,10,15,0.1)] rounded-2xl p-8 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] transition-all cursor-default reveal">
              <div className="w-11 h-11 rounded-lg bg-[rgba(5,16,148,0.1)] text-[#051094] grid place-items-center text-xl mb-5">
                <MaterialIcon name="dashboard" />
              </div>
              <div className="font-bold text-lg text-[#0a0a0f] tracking-[-0.5px] mb-2.5">
                Professional Dashboard
              </div>
              <p className="text-sm text-[#6b6860] leading-relaxed">
                Manage orders, customer inquiries, and payout history in one
                place.
              </p>
            </div>

            <div className="bg-white border border-[rgba(10,10,15,0.1)] rounded-2xl p-8 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] transition-all cursor-default reveal">
              <div className="w-11 h-11 rounded-lg bg-[rgba(5,16,148,0.1)] text-[#051094] grid place-items-center text-xl mb-5">
                <MaterialIcon name="inventory_2" />
              </div>
              <div className="font-bold text-lg text-[#0a0a0f] tracking-[-0.5px] mb-2.5">
                Inventory Tracking
              </div>
              <p className="text-sm text-[#6b6860] leading-relaxed">
                Real-time stock alerts so you never oversell your popular items.
              </p>
            </div>
          </div>
        </section>

        {/* FOR BUYERS */}
        <section className="px-4 sm:px-10 pb-16 sm:pb-24 max-w-[1100px] mx-auto">
          <div className="mb-12 sm:mb-16 reveal">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#051094] mb-4">
              <span className="w-5 h-0.5 bg-[#051094] rounded-full" />
              For Buyers
            </div>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-[-2px] text-[#0a0a0f] leading-[1.1] max-w-[560px]">
              Delivered to your dorm in minutes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl overflow-hidden relative h-60 cursor-default hover:scale-[1.02] transition-transform reveal">
              <div className="absolute inset-0 bg-gradient-to-br from-[#1e293b] via-[#334155] to-[#475569]">
                <span className="absolute text-[80px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-3/5 opacity-30 grayscale">
                  👕
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,15,0.85)] via-[rgba(10,10,15,0.2)] to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="w-9 h-9 rounded-lg bg-white/15 backdrop-blur grid place-items-center text-base text-white mb-2.5">
                  <MaterialIcon name="checkroom" size={16} />
                </div>
                <div className="font-bold text-lg text-white tracking-[-0.5px]">
                  Custom Apparel
                </div>
                <div className="text-xs text-white/70 mt-1">
                  Unique campus gear
                </div>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden relative h-60 cursor-default hover:scale-[1.02] transition-transform reveal">
              <div className="absolute inset-0 bg-gradient-to-br from-[#92400e] via-[#b45309] to-[#d97706]">
                <span className="absolute text-[80px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-3/5 opacity-40">
                  🍪
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,15,0.85)] via-[rgba(10,10,15,0.2)] to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="w-9 h-9 rounded-lg bg-white/15 backdrop-blur grid place-items-center text-base text-white mb-2.5">
                  <MaterialIcon name="cookie" size={16} />
                </div>
                <div className="font-bold text-lg text-white tracking-[-0.5px]">
                  Local Snacks
                </div>
                <div className="text-xs text-white/70 mt-1">
                  Late-night cravings
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="px-4 sm:px-10 py-16 sm:py-24 text-center max-w-[700px] mx-auto reveal">
          <h2 className="text-[clamp(2.2rem,5vw,3.5rem)] font-extrabold tracking-[-2px] text-[#0a0a0f] leading-[1.1]">
            Ready to start your
            <br />
            <span className="text-[#051094]">campus hustle?</span>
          </h2>
          <div className="flex gap-3 mt-10 justify-center flex-wrap">
            <button className="bg-[#051094] text-white border-none cursor-pointer font-semibold text-sm px-7 py-3.5 rounded-lg flex items-center gap-2 shadow-[0_4px_20px_rgba(5,16,148,0.25)] hover:-translate-y-[2px] hover:shadow-[0_8px_28px_rgba(5,16,148,0.35)] transition-all">
              <MaterialIcon name="person_add" size={18} />
              Create Seller Account
            </button>
            <button className="bg-[#0a0a0f] text-white border-none cursor-pointer font-semibold text-sm px-7 py-3.5 rounded-lg flex items-center gap-2 hover:-translate-y-[2px] transition-all">
              <MaterialIcon name="shopping_cart" size={18} />
              Browse Marketplace
            </button>
          </div>
        </div>

        <Footer />
      </div>

      <style>{`
        .reveal {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </>
  );
}