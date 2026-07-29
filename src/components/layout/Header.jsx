"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useSidebar } from "./SidebarContext";
import { Menu, LogOut, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ProfileModal from "./ProfileModal";

export default function Header() {
  const { setOpen } = useSidebar();
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="h-14 sm:h-16 bg-white shadow-sm flex items-center justify-between px-3 sm:px-4 sticky top-0 z-30">
      {/* Left: hamburger + logo */}
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

      {/* Right: profile + logout */}
      <div className="flex items-center gap-1 sm:gap-3">
        {/* Profile — name hidden on very small screens */}
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

        {/* Logout */}
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
