import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, Check, ExternalLink } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";
import { formatTimeAgo } from "../utils/formatTime";

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
      >
        <Bell size={20} className="text-[#6b6860]" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-[#ff4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-[rgba(10,10,15,0.1)] rounded-xl shadow-xl z-[60] overflow-hidden animate-fadeIn">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
            <h3 className="font-bold text-sm text-[#0a0a0f] m-0">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-[#0000ff] font-medium cursor-pointer hover:underline border-none bg-transparent"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell size={20} className="text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-900 m-0">No new notifications</p>
                <p className="text-xs text-gray-500 mt-1 m-0">You're all caught up!</p>
              </div>
            ) : (
              notifications.slice(0, 5).map((n) => (
                <div
                  key={n._id}
                  className={`p-4 border-b border-gray-50 transition-colors hover:bg-gray-50 relative ${
                    !n.isRead ? "bg-blue-50/30" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.isRead ? "bg-[#0000ff]" : "bg-transparent"}`} />
                    <div className="flex-1">
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-xs font-bold text-gray-900 m-0 leading-tight">
                          {n.title}
                        </p>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                          {formatTimeAgo(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 mb-2 line-clamp-2">
                        {n.message}
                      </p>
                      <div className="flex gap-2">
                        {!n.isRead && (
                          <button
                            onClick={() => markAsRead(n._id)}
                            className="flex items-center gap-1 text-[10px] text-[#0000ff] font-bold border-none bg-transparent cursor-pointer p-0"
                          >
                            <Check size={12} />
                            Mark read
                          </button>
                        )}
                        {n.link && (
                          <Link
                            to={n.link}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-1 text-[10px] text-gray-500 font-bold no-underline hover:text-gray-900"
                          >
                            <ExternalLink size={12} />
                            View
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <Link
            to="/notifications"
            onClick={() => setIsOpen(false)}
            className="block text-center py-3 text-xs font-bold text-[#0a0a0f] hover:bg-gray-50 border-t border-gray-100 no-underline"
          >
            See all notifications
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
