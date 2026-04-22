// components/CustomerHeader.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { HelpCircle } from "lucide-react";

const Header = () => {
  const { user, logout, startTour } = useAuth();

  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[72px] flex items-center justify-between px-4 sm:px-10 py-[16px] bg-white/80 backdrop-blur-md border-b border-[rgba(10,10,15,0.1)]">
      <Link
        to={user ? "/landing" : "/"}
        className="flex items-center gap-2 font-bold text-lg no-underline text-[#0a0a0f]"
      >
        <img
          src="/assets/logo.png"
          alt="Hustle-Hub Logo"
          className="w-[40px] h-[40px] object-contain rounded-lg shadow-sm"
        />
        <span className="font-bold">
          <span className="text-[#051094]">Hustle</span>-
          <span className="text-[#33cdff]">Hub</span>
        </span>
      </Link>
      <div className="flex gap-3 items-center">
        {user ? (
          <>
            <Link to="/customer-dashboard">
              <button className="tour-marketplace bg-none border-none cursor-pointer text-sm text-[#6b6860] px-4 py-2 rounded-lg font-medium hover:text-[#0a0a0f]">
                Dashboard
              </button>
            </Link>

            <Link to="/profile">
              <button className="tour-profile bg-none border-none cursor-pointer text-sm text-[#6b6860] px-4 py-2 rounded-lg font-medium hover:text-[#0a0a0f]">
                Profile
              </button>
            </Link>

            <Link to="/room-builder">
              <button className="tour-sell-item bg-[#0000ff] text-white border-none cursor-pointer font-bold text-sm px-4 py-2 rounded-lg hover:bg-[#051094] hover:-translate-y-[1px] transition-all shadow-sm">
                Simulator
              </button>
            </Link>

            <button
              onClick={startTour}
              className="flex items-center gap-2 bg-[#f5f3ee] text-[#6b6860] border border-[rgba(10,10,15,0.1)] cursor-pointer font-semibold text-sm px-4 py-2 rounded-lg hover:bg-[#e8e6e1] hover:text-[#0a0a0f] transition-all"
            >
              <HelpCircle size={16} />
              <span>Tour</span>
            </button>

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
