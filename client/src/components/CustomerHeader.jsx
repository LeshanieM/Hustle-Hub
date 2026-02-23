// components/Header.jsx
import React from 'react';

const MaterialIcon = ({ name, size = 20 }) => (
  <span
    className="material-symbols-rounded"
    style={{ fontSize: size, lineHeight: 1 }}
  >
    {name}
  </span>
);

const Header = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-100 flex items-center justify-between px-4 sm:px-10 py-[18px] bg-[rgba(245,243,238,0.88)] backdrop-blur-md border-b border-[rgba(10,10,15,0.1)]">
      <a href="#" className="flex items-center gap-2 font-bold text-lg no-underline text-[#0a0a0f]">
        <span className="w-[30px] h-[30px] bg-[#0000ff] rounded-lg grid place-items-center text-white text-base font-bold">
          H
        </span>
        Hustle-Hub
      </a>
      <div className="flex gap-3 items-center">
        <button className="bg-none border-none cursor-pointer text-sm text-[#6b6860] px-4 py-2 rounded-lg font-medium hover:text-[#0a0a0f]">
          Log In
        </button>
        <button className="bg-[#0a0a0f] text-[#f5f3ee] border-none cursor-pointer font-semibold text-sm px-5 py-2 rounded-lg hover:bg-[#0000ff] hover:-translate-y-[1px] transition-all">
          Join Now
        </button>
      </div>
    </nav>
  );
};

export default Header;