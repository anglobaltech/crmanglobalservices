"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, BarChart3, ClipboardList,
  Settings, Wrench, FolderOpen, Package, X,
} from "lucide-react";
import { useSidebar } from "./SidebarContext";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { open, setOpen } = useSidebar();
  const { user } = useAuth();

  const menuItems = [
    user?.permissions?.dashboard && { name: "Dashboard",      path: "/dashboard",       icon: LayoutDashboard },
    user?.permissions?.sales     && { name: "Sales",          path: "/sales",          icon: BarChart3 },
    user?.permissions?.allocate  && { name: "Allocate Leads", path: "/allocate-leads", icon: ClipboardList },
    user?.permissions?.services  && { name: "Services",       path: "/services",       icon: Wrench },
    user?.permissions?.services  && { name: "Projects",       path: "/projects",       icon: FolderOpen },
    user?.permissions?.stock     && { name: "Stock Management", path: "/stock",        icon: Package },
    user?.permissions?.users     && { name: "Users",          path: "/users",          icon: Users },
    user?.permissions?.settings  && { name: "Settings",       path: "/settings",       icon: Settings },
  ].filter(Boolean);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar drawer */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-gray-900 text-white flex flex-col z-50
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header row */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 h-14 sm:h-16">
          <span className="text-sm font-bold text-white tracking-wide">A N Global Services</span>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg hover:bg-red-500 text-gray-400 hover:text-white cursor-pointer transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
            return (
              <Link
                key={index}
                href={item.path}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${isActive
                    ? "bg-[#0072b1] text-white shadow-sm"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
              >
                <Icon size={18} className="flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-700">
          <p className="text-[10px] text-gray-500 text-center">A N Global Services Pvt. Ltd.</p>
        </div>
      </aside>
    </>
  );
}