// components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const footerLinks = [
    { name: "Terms", path: "/terms" },
    { name: "Privacy", path: "/privacy" },
    { name: "Home", path: "/" },
    { name: "Stores", path: "/stores" }
  ];

  return (
    <footer className="border-t border-[rgba(10,10,15,0.1)] px-4 sm:px-10 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <Link to="/" className="flex items-center gap-2 font-bold text-lg no-underline text-[#0a0a0f]">
        <span className="w-[30px] h-[30px] bg-[#0000ff] rounded-lg grid place-items-center text-white text-base font-bold">
          H
        </span>
        Hustle-Hub
      </Link>
      <div className="flex gap-6">
        {footerLinks.map((link) => (
          <Link 
            key={link.name} 
            to={link.path} 
            className="text-xs text-[#6b6860] no-underline hover:text-[#0a0a0f] transition-colors"
          >
            {link.name}
          </Link>
        ))}
      </div>
      <div className="text-xs text-[#6b6860]">© 2024 Hustle-Hub Inc.</div>
    </footer>
  );
};

export default Footer;