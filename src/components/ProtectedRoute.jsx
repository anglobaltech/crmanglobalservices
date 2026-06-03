"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

// ROUTE → PERMISSION MAP
const routePermissions = {
  "/dashboard": "dashboard",
  "/users": "users",
  "/sales": "sales",
  "/leads": "leads",
  "/allocate-leads": "allocate",
  "/settings": "settings",
};

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const publicRoutes = ["/login"];

  useEffect(() => {
    if (loading) return;
    if (!user && !publicRoutes.includes(pathname)) {
      router.push("/login");
    }
  }, [user, loading, pathname, router]);

  // Still loading — show nothing
  if (loading) return null;

  // Not logged in
  if (!user && !publicRoutes.includes(pathname)) return null;

  const matchedRoute = Object.keys(routePermissions).find((route) => {
    if (pathname === route) return true;
    if (route !== "/" && pathname.startsWith(route + "/")) return true;
    return false;
  });

  const requiredPermission = matchedRoute ? routePermissions[matchedRoute] : null;

  if (user && requiredPermission && user.permissions?.[requiredPermission] !== true) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-500 text-sm max-w-xs">
          You don&apos;t have permission to view this section. Contact your admin to get access.
        </p>
        <button
          onClick={() => router.back()}
          className="mt-6 px-5 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return children;
}