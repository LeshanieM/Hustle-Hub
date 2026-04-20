// components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

const Footer = () => {
  const footerLinks = [
    { name: 'Home', path: '/' },
    { name: 'Landing', path: '/landing' },
    { name: 'Login', path: '/login' },
    { name: 'Stores', path: '/stores' },
  ];

  return (
    <footer className="relative bg-[#051094] text-white overflow-hidden border-t border-white/10">
      {/* Decorative Waves/Circles */}
      <div className="absolute -bottom-24 -left-24 w-64 h-64 border-[20px] border-white/5 rounded-full" />
      <div className="absolute -bottom-36 -left-36 w-96 h-96 border-[30px] border-white/5 rounded-full" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 w-full">
        {/* Left Column: Logo & Email */}
        <div className="p-8 md:p-10 border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-between min-h-[220px]">
          <Link to="/" className="no-underline flex items-center gap-3">
            <img src="/assets/logo.png" alt="Hustle-Hub Logo" className="w-[40px] h-[40px] object-contain rounded-lg shadow-sm" />
            <h2 className="text-3xl font-bold text-white m-0">
              Hustle<span className="text-[#33cdff]">-Hub</span>
            </h2>
          </Link>
          
          <div className="flex items-center gap-3 text-white/80 hover:text-white transition-colors cursor-pointer mt-6">
            <Mail size={16} />
            <span className="text-base">support@hustlehub.com</span>
          </div>
        </div>

        {/* Middle Column: Links Grid */}
        <div className="border-b md:border-b-0 md:border-r border-white/10 flex flex-col">
          <div className="grid grid-cols-2 p-8 md:p-10 flex-1 gap-x-8">
            {footerLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-base text-white/80 no-underline hover:text-white transition-colors py-2 underline underline-offset-4 decoration-white/30 hover:decoration-white"
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="h-16 md:h-20 border-t border-white/10" />
        </div>

        {/* Right Column: CTA & Copyright */}
        <div className="p-8 md:p-10 flex flex-col justify-between min-h-[220px]">
          <div>
            <h3 className="text-2xl font-medium leading-tight mb-6">
              Would like to talk about your future business?
            </h3>
            <button className="bg-transparent border border-white text-white px-6 py-2.5 rounded-none font-bold hover:bg-white hover:text-[#051094] transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider text-xs">
              Get in touch →
            </button>
          </div>
          
          <div className="text-xs text-white/50 mt-8">
            © 2026 hustle-hub.inc.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
