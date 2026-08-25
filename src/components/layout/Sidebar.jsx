"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, BarChart3, ClipboardList,
  Settings, Wrench, FolderOpen, Package, X, Briefcase, Search,
} from "lucide-react";
import { useSidebar } from "./SidebarContext";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { open, setOpen } = useSidebar();
  const { user } = useAuth();

  const menuItems = [
    user?.permissions?.dashboard && { name: "Dashboard",        path: "/dashboard",      icon: LayoutDashboard },
    user?.permissions?.sales     && { name: "Sales",            path: "/sales",          icon: BarChart3 },
    user?.permissions?.allocate  && { name: "Allocate Leads",   path: "/allocate-leads", icon: ClipboardList },
    user?.permissions?.services  && { name: "Services",         path: "/services",       icon: Wrench },
    user?.permissions?.services  && { name: "Projects",         path: "/projects",       icon: FolderOpen },
    user?.permissions?.stock     && { name: "Stock Management", path: "/stock",          icon: Package },
    user?.permissions?.employees && { name: "Employees",        path: "/employees",      icon: Briefcase },
    user?.permissions?.users     && { name: "Users",            path: "/users",          icon: Users },
    user?.permissions?.settings  && { name: "Settings",         path: "/settings",       icon: Settings },
  ].filter(Boolean);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/20 z-40" 
          onClick={() => setOpen(false)} 
          aria-hidden="true" 
        />
      )}

      {/* Sidebar Panel */}
      <aside 
        className={`fixed top-0 left-0 h-screen w-64 bg-slate-50 flex flex-col z-50 border-r border-slate-200 shadow-[4px_0_28px_rgba(0,0,0,0.07)] transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] font-sans ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between pt-5 pb-4 px-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="Logo"
              width={140}
              height={80}
              priority
              className="h-10 w-auto object-contain"
            />
          </div>
          <button 
            className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer flex items-center justify-center text-slate-500 transition-all shrink-0 hover:bg-red-100 hover:border-red-200 hover:text-red-500" 
            onClick={() => setOpen(false)} 
            aria-label="Close menu"
          >
            <X size={13} />
          </button>
        </div>

        {/* Search */}
        <div className="pt-3 px-3 pb-2.5">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg py-2 px-3 transition-all focus-within:border-sky-600 focus-within:bg-white">
            <Search size={13} className="text-slate-400 shrink-0" />
            <input 
              className="border-none outline-none bg-transparent text-[13px] text-slate-700 w-full font-sans placeholder-slate-500" 
              placeholder="Search..." 
            />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-1.5 px-2 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
            const showDivider = item.path === "/settings" && index > 0;
            return (
              <div key={index}>
                {showDivider && <div className="h-px bg-slate-200 mx-1 mt-1.5 mb-2" />}
                <Link
                  href={item.path}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2.5 py-2 px-2.5 rounded-lg text-[13px] font-medium transition-all mb-[1px] relative group ${isActive ? "bg-sky-50 text-sky-700 font-semibold" : "text-slate-700 hover:bg-slate-200 hover:text-slate-900"}`}
                >
                  <Icon 
                    size={16} 
                    className={`shrink-0 transition-colors ${isActive ? "text-sky-600" : "text-slate-500 group-hover:text-slate-700"}`} 
                  />
                  <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</span>
                  {isActive && <div className="w-[3px] h-3.5 rounded-sm bg-sky-600 shrink-0" />}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="py-3 px-4 border-t border-slate-200">
          <p className="text-[10px] text-slate-400 text-center tracking-[0.2px]">© 2026 A N Global Services Private Limited</p>
        </div>
      </aside>
    </>
  );
}
