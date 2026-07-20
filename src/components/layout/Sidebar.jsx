"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  ClipboardList,
  Settings,
  Wrench,
  FolderOpen,
  X,
} from "lucide-react";
import { useSidebar } from "./SidebarContext";
import { useAuth } from "@/context/AuthContext"; 

export default function Sidebar() {
  const pathname = usePathname();
  const { open, setOpen } = useSidebar();
  const { user } = useAuth(); 

  const menuItems = [
    user?.permissions?.dashboard && {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    user?.permissions?.sales && {
      name: "Sales",
      path: "/sales",
      icon: BarChart3,
    },
    user?.permissions?.allocate && {
      name: "Allocate Leads",
      path: "/allocate-leads",
      icon: ClipboardList,
    },
    user?.permissions?.services && {
      name: "Services",
      path: "/services",
      icon: Wrench,
    },
    user?.permissions?.services && {
      name: "Projects",
      path: "/projects",
      icon: FolderOpen,
    },
    user?.permissions?.users && {
      name: "Users",
      path: "/users",
      icon: Users,
    },
    user?.permissions?.settings && {
      name: "Settings",
      path: "/settings",
      icon: Settings,
    },
  ].filter(Boolean);

  return (
    <>
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/30 z-40"
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-gray-900 text-white flex flex-col z-50
        transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-end p-2 border-b border-gray-700">
          <button
            onClick={() => setOpen(false)}
            className="p-0 rounded hover:text-white hover:bg-red-500 cursor-pointer text-gray-400 transition"
          >
            <X />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <Link
                key={index}
                href={item.path}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                ${
                  isActive
                    ? "bg-[#0072b1] text-white"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}