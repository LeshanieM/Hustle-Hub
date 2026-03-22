// components/CustomerHeader.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-10 py-[18px] bg-white/80 backdrop-blur-md border-b border-[rgba(10,10,15,0.1)]">
      <Link
        to="/"
        className="flex items-center gap-2 font-bold text-lg no-underline text-[#0a0a0f]"
      >
        <span className="w-[30px] h-[30px] bg-[#0000ff] rounded-lg grid place-items-center text-white text-base font-bold">
          H
        </span>
        Hustle-Hub
      </Link>
      <div className="flex gap-3 items-center">
        {user ? (
          <>
            <Link to="/">
              <button className="bg-none border-none cursor-pointer text-sm text-[#6b6860] px-4 py-2 rounded-lg font-medium hover:text-[#0a0a0f]">
                Home
              </button>
            </Link>
            <Link to="/customer/products">
              <button className="bg-none border-none cursor-pointer text-sm text-[#6b6860] px-4 py-2 rounded-lg font-medium hover:text-[#0a0a0f]">
                Products
              </button>
            </Link>
            <Link to="/profile">
              <button className="bg-none border-none cursor-pointer text-sm text-[#6b6860] px-4 py-2 rounded-lg font-medium hover:text-[#0a0a0f]">
                Profile
              </button>
            </Link>
            <button
              onClick={handleLogout}
              className="bg-[#0a0a0f] text-[#f5f3ee] border-none cursor-pointer font-semibold text-sm px-5 py-2 rounded-lg hover:bg-[#ff4444] hover:-translate-y-[1px] transition-all"
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login">
              <button className="bg-none border-none cursor-pointer text-sm text-[#6b6860] px-4 py-2 rounded-lg font-medium hover:text-[#0a0a0f]">
                Log In
              </button>
            </Link>
            <Link to="/register">
              <button className="bg-[#0a0a0f] text-[#f5f3ee] border-none cursor-pointer font-semibold text-sm px-5 py-2 rounded-lg hover:bg-[#0000ff] hover:-translate-y-[1px] transition-all">
                Join Now
              </button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Header;
