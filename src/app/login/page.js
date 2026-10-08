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
      return setError("Enter your email and password");
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
      
      {/* Left Panel - Brand / Graphic */}
      <div className="hidden lg:flex w-[50%] relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-[#0B132B] via-[#111e42] to-[#1a2d66]">
        {/* Subtle Decorative Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        
        {/* Top: Logo */}
        <div className="relative z-10 flex items-start">
          <div className="w-56 bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center justify-center shadow-2xl">
            <img src="/logo.png" alt="A N Global Services" className="w-full h-auto object-contain brightness-0 invert" />
          </div>
        </div>

        {/* Middle: Copy */}
        <div className="relative z-10 space-y-4">
          <div className="text-blue-200 font-semibold tracking-wider uppercase text-sm mb-2">
            A N Global Services
          </div>
          <h1 className="text-3xl xl:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 mb-6 leading-[1.2] tracking-tight drop-shadow-sm">
            Intelligent CRM <br/>for the Modern Enterprise.
          </h1>
          <p className="text-base text-blue-100/70 max-w-md font-medium leading-relaxed border-l-4 border-blue-500/50 pl-4">
            Manage your leads, services, and tasks all in one secure, high-performance platform.
          </p>
        </div>

        {/* Bottom: Badge */}
        <div className="relative z-10 flex items-center gap-3 text-blue-300/60 text-sm font-bold tracking-widest uppercase">
          <div className="w-10 h-px bg-gradient-to-r from-blue-300/0 via-blue-300/50 to-blue-300/0"></div>
          Enterprise Edition
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col items-center justify-center relative p-6 sm:p-12 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50/50 via-white to-white overflow-y-auto">
        
        <div className="w-full max-w-[420px] flex flex-col justify-center min-h-full py-8">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-14 h-14 bg-white shadow-sm border border-gray-100 p-2 rounded-xl flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="max-w-full max-h-full object-contain" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-gray-900 text-lg">A N Global Services</span>
              <span className="text-xs font-medium text-gray-500 tracking-wide">Private Limited</span>
            </div>
          </div>

          <div className="mb-10 text-left">
            <h2 className="text-[26px] font-bold text-gray-800 tracking-tight mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-500 font-medium text-sm">
              Sign in to your CRM dashboard to continue.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-semibold rounded-xl border border-red-100 flex items-center gap-3 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-gray-600 tracking-wide">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <Mail size={18} strokeWidth={2} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="name@company.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-400 font-medium shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-semibold text-gray-600 tracking-wide">
                  Password
                </label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <Lock size={18} strokeWidth={2} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-400 font-medium shadow-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-500 transition-colors outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-[#0B132B] to-[#1a2d66] hover:from-[#15234b] hover:to-[#223980] cursor-pointer text-white font-medium py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(11,19,43,0.39)] hover:shadow-[0_6px_20px_rgba(11,19,43,0.23)] hover:-translate-y-0.5"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin text-white/70" />
              ) : (
                <>Sign In <ArrowRight size={16} strokeWidth={3} className="ml-1 opacity-80" /></>
              )}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <span className="text-[11px] text-gray-400 font-semibold tracking-wide">
              © 2026 A N Global Services Private Limited
            </span>
            <span className="text-[11px] text-gray-400 font-semibold tracking-wide uppercase">
              Secure Login
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}