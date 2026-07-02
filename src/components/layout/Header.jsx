"use client";

import Image from "next/image";
import { useSidebar } from "./SidebarContext";
import { ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useState } from "react";
import ProfileModal from "./ProfileModal";

export default function Header() {
  const { setOpen } = useSidebar();
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-2">
      <div className="flex items-center gap-1">
        <button
          onClick={() => setOpen(true)}
          className="p-1 rounded hover:bg-gray-100 text-gray-500 cursor-pointer"
        >
          <ChevronRight />
        </button>

        <Link href="/dashboard">
          <Image
            src="/logo.png"
            alt="Logo"
            width={180}
            height={100}
            priority
            className="cursor-pointer"
            style={{ width: "auto", height: "auto" }}
          />
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <div 
          className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors"
          onClick={() => setIsProfileOpen(true)}
        >
          <span className="text-gray-600 font-medium">
            {user?.name || user?.email || "Guest"}
          </span>

          <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded-full font-bold overflow-hidden shadow-sm">
            {user?.profilePic ? (
              <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              (user?.name?.[0] || user?.email?.[0] || "G").toUpperCase()
            )}
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg 
          bg-red-500 text-white  cursor-pointer font-medium 
          hover:bg-red-900 hover:text-white 
          transition duration-200 shadow-sm"
        >
          {/* Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Logout
        </button>
      </div>
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </header>
  );
}
