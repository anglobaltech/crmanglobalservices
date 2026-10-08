"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useSidebar } from "./SidebarContext";
import { Menu, LogOut, User, Bell, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ProfileModal from "./ProfileModal";
import api from "@/services/api";
import { useRouter, usePathname } from "next/navigation";

export default function Header() {
  const { setOpen } = useSidebar();
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  const managerRoles = [
    "Super Admin", "Founder & CEO", "Director", 
    "Branch Manager", "Manager", "Team Manager", "Assistant Manager"
  ];
  const isManager = managerRoles.includes(user?.roleName);

  useEffect(() => {
    if (!isManager) return;
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/api/stock/unread-remarks");
        setNotifications(res.data.unread || []);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [isManager]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (notif) => {
    setShowNotifications(false);
    localStorage.setItem('openStockModal', JSON.stringify({ tab: notif.type, id: notif.id }));
    if (pathname === '/stock') {
      window.dispatchEvent(new Event('checkStockModal'));
    } else {
      router.push('/stock');
    }
  };

  const clearNotification = async (notif, e) => {
    e.stopPropagation();
    try {
      const url = notif.type === "gate" ? `/api/stock/gate-entries/${notif.id}` 
                : notif.type === "entry" ? `/api/stock/entries/${notif.id}` 
                : `/api/stock/exits/${notif.id}`;
      await api.patch(url, { hasUnreadRemark: false });
      setNotifications(prev => prev.filter(n => n.id !== notif.id));
    } catch (err) {
      console.error("Failed to clear notification", err);
    }
  };

  return (
    <header className="h-14 sm:h-16 bg-white shadow-sm flex items-center justify-between px-3 sm:px-4 sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <Link href="/dashboard" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Logo"
            width={140}
            height={80}
            priority
            className="cursor-pointer h-8 sm:h-10 w-auto object-contain"
          />
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {isManager && (
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 max-h-96 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
                  <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                  <span className="text-[10px] font-semibold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                    {notifications.length} Unread
                  </span>
                </div>
                <div className="overflow-y-auto flex-1 p-2 space-y-1">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 text-xs">
                      No new notifications
                    </div>
                  ) : (
                    notifications.map(n => {
                      // Extract the last remark text
                      const remarks = (n.remarkHistory || "").split("\n");
                      const lastRemark = remarks[remarks.length - 1] || "New remark added";
                      
                      return (
                        <div 
                          key={n.id} 
                          onClick={() => handleNotificationClick(n)}
                          className="p-3 bg-white hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-xl cursor-pointer transition-colors flex gap-3 group"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-bold text-gray-900">{n.displayId}</span>
                              <span className="text-[9px] text-gray-400">
                                {n.date && new Date(n.date._seconds ? n.date._seconds * 1000 : n.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-[10px] font-medium text-gray-500 truncate mb-1">
                              {n.productName}
                            </p>
                            <p className="text-[11px] text-gray-700 line-clamp-2 leading-tight">
                              {lastRemark}
                            </p>
                          </div>
                          <button 
                            onClick={(e) => clearNotification(n, e)}
                            className="text-gray-300 hover:text-green-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Mark as read"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div
          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors"
          onClick={() => setIsProfileOpen(true)}
        >
          <span className="hidden sm:block text-sm text-gray-600 font-medium max-w-[120px] truncate">
            {user?.name || user?.email || "Guest"}
          </span>
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-600 text-white flex items-center justify-center rounded-full font-bold overflow-hidden shadow-sm flex-shrink-0 text-sm">
            {user?.profilePic ? (
              <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              (user?.name?.[0] || user?.email?.[0] || "G").toUpperCase()
            )}
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500 text-white cursor-pointer font-medium hover:bg-red-700 transition-colors shadow-sm text-xs sm:text-sm"
          aria-label="Logout"
        >
          <LogOut size={15} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>

      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </header>
  );
}
