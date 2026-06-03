"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return children;
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}