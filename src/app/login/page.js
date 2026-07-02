"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      return setError("Please enter your email and password");
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid email or password");
      }

      // Token save
      localStorage.setItem("crm_token", data.token);

      login(data.user);

      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-white" style={{ fontFamily: "Inter, sans-serif" }}>
      
      {/* Left Column - Branding (Fixed, No Scroll) */}
      <div className="hidden lg:flex w-[45%] bg-[#0B132B] relative flex-col justify-between p-12">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        
        {/* Content Top */}
        <div className="relative z-10 flex items-start">
          <div className="w-40 bg-white p-3 rounded-2xl flex items-center justify-center shadow-lg">
            <img src="/logo.png" alt="A N Global Services" className="w-full h-auto object-contain" />
          </div>
        </div>

        {/* Content Middle */}
        <div className="relative z-10">
          <h1 className="text-4xl xl:text-5xl font-extrabold text-white mb-6 leading-[1.15] tracking-tight">
            Streamline your workflow with intelligent CRM.
          </h1>
          <p className="text-lg text-blue-100/70 max-w-md font-medium leading-relaxed">
            Manage your leads, services, and tasks all in one secure, enterprise-grade platform.
          </p>
        </div>

        {/* Content Bottom */}
        <div className="relative z-10 flex items-center gap-3 text-blue-300/50 text-sm font-semibold tracking-widest uppercase">
          <div className="w-8 h-px bg-blue-300/30"></div>
          Enterprise Edition
        </div>
      </div>

      {/* Right Column - Login Form (Fixed, No Scroll) */}
      <div className="flex-1 flex flex-col items-center justify-center relative p-6 sm:p-12">
        
        {/* Mobile Header */}
        <div className="absolute top-8 left-6 sm:left-12 lg:hidden flex items-center gap-3">
          <div className="w-12 h-12 bg-white shadow-sm border border-gray-100 p-2 rounded-lg flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="max-w-full max-h-full object-contain" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-gray-900">A N Global Services</span>
            <span className="text-xs font-medium text-gray-500">Private Limited</span>
          </div>
        </div>

        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
              Sign In
            </h2>
            <p className="text-gray-500 font-medium">
              to A N Global Services Private Limited
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100 flex items-start">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors placeholder:text-gray-400 font-medium shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors font-medium shadow-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#0B132B] hover:bg-[#15234b] cursor-pointer text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin text-white/70" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">
              © {new Date().getFullYear()} A N Global Services Private Limited
            </span>
            <span className="text-xs text-gray-400 font-medium">
              All rights reserved
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}