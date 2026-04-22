// pages/HomePage.jsx
import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CustomerHeader from '../components/CustomerHeader';
import OwnerHeader from '../components/OwnerHeader';
import AdminHeader from '../components/AdminHeader';
import Footer from '../components/Footer';
import { ShoppingBag, Store, Users, ArrowRight, CheckCircle2 } from 'lucide-react';

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
  const navigate = useNavigate();
  const { user } = useAuth();
  useReveal();

  const renderHeader = () => {
    if (!user) return <CustomerHeader />;
    switch(user.role) {
      case 'OWNER': return <OwnerHeader />;
      case 'ADMIN': return <AdminHeader />;
      default: return <CustomerHeader />;
    }
  };

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#0a0a0f] font-sans selection:bg-[#051094] selection:text-white">
      {renderHeader()}

      <main>
        {/* HERO SECTION */}
        <section className="relative min-h-[90vh] flex items-center pt-24 overflow-hidden">
          {/* Background Shape */}
          <div className="absolute top-0 right-0 w-[65%] h-full bg-[#C4E8FF] rounded-bl-[120px] hidden lg:block overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[length:40px_40px]" />
            <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-6 sm:px-12 grid lg:grid-cols-2 gap-12 items-center relative z-10">
            {/* Text Content */}
            <div className="max-w-2xl reveal">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#051094]/10 text-[#051094] font-bold text-sm mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#051094] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#051094]"></span>
                </span>
                The Campus Standard
              </div>
              
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-[#0a0a0f] leading-[0.95] tracking-tighter mb-8">
                Your <span className="text-[#051094]">Campus</span><br />
                Marketplace.
              </h1>
              
              <p className="text-xl text-[#6b6860] font-medium leading-relaxed mb-10 max-w-lg">
                The smarter way to buy and sell on campus. Connect with students, manage your hustle, and grow your university business effortlessly.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate('/landing')}
                  className="px-10 py-5 bg-[#051094] text-white font-black rounded-2xl text-lg hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 cursor-pointer border-none"
                >
                  Explore Marketplace <ArrowRight size={20} />
                </button>
                <button 
                  onClick={() => navigate('/register?role=seller')}
                  className="px-10 py-5 bg-white text-[#051094] font-black rounded-2xl text-lg border-2 border-[#051094] hover:bg-[#051094]/5 transition-all cursor-pointer"
                >
                  Start Selling
                </button>
              </div>

              <div className="mt-12 flex items-center gap-8 grayscale opacity-50">
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-[#0a0a0f]">12k+</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#6b6860]">Students</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-[#0a0a0f]">500+</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#6b6860]">Sellers</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-[#0a0a0f]">15</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#6b6860]">Campuses</span>
                </div>
              </div>
            </div>

            {/* Visual Content */}
            <div className="relative hidden lg:block reveal delay-200">
              <div className="relative z-10 animate-[float_6s_ease-in-out_infinite]">
                <img 
                  src="/uni_marketplace_hero_graphic_1776693502028.png" 
                  alt="Marketplace Graphic" 
                  className="w-full max-w-[650px] drop-shadow-[0_32px_64px_rgba(0,0,0,0.3)] rounded-[40px]"
                />
              </div>
              
              {/* Floating Cards */}
              <div className="absolute -top-10 -right-10 bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/20 z-20 animate-[float_5s_ease-in-out_infinite_1s]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/10 text-green-600 rounded-2xl grid place-items-center">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <div className="font-black text-[#0a0a0f]">Order Secured</div>
                    <div className="text-xs font-bold text-[#6b6860]">Delivery in 15 mins</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-10 -left-10 bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/20 z-20 animate-[float_7s_ease-in-out_infinite_0.5s]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#051094]/10 text-[#051094] rounded-2xl grid place-items-center">
                    <ShoppingBag size={24} />
                  </div>
                  <div>
                    <div className="font-black text-[#0a0a0f]">New Sale</div>
                    <div className="text-xs font-bold text-[#6b6860]">+$250.00 today</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="py-24">
          <div className="container mx-auto px-6 grid md:grid-cols-3 gap-12 text-center">
            <div className="reveal">
              <Users className="text-[#051094] mb-6 mx-auto" size={48} />
              <h3 className="text-2xl font-black mb-2">Connect Students</h3>
              <p className="text-[#6b6860] font-medium">Built by students, for students. The biggest campus network.</p>
            </div>
            <div className="reveal delay-100">
              <Store className="text-[#051094] mb-6 mx-auto" size={48} />
              <h3 className="text-2xl font-black mb-2">Boost Sales</h3>
              <p className="text-[#6b6860] font-medium">Professional tools to manage inventory and track your growth.</p>
            </div>
            <div className="reveal delay-200">
              <CheckCircle2 className="text-[#051094] mb-6 mx-auto" size={48} />
              <h3 className="text-2xl font-black mb-2">Verified Only</h3>
              <p className="text-[#6b6860] font-medium">Secure transactions with campus-verified buyers and sellers.</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .reveal {
          opacity: 0;
          transform: translateY(40px);
          transition: all 0.8s cubic-bezier(0.2, 1, 0.3, 1);
        }
        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .delay-100 { transition-delay: 0.1s; }
        .delay-200 { transition-delay: 0.2s; }
      `}</style>
    </div>
  );
}
