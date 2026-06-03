"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      return alert("Enter email and password");
    }

    setLoading(true);

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
        throw new Error(data.message || "Login failed");
      }

      // Token save
      localStorage.setItem("crm_token", data.token);

      login(data.user);

      router.push("/dashboard");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden md:flex w-1/2 bg-[#0072b1] items-center justify-center p-10">
        <div className="text-white max-w-md">
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Welcome Back 👋
          </h2>
          <p className="text-lg opacity-90 mb-6">
            Manage your CRM efficiently with a powerful dashboard designed for growth.
          </p>

          <img
            src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df"
            alt="CRM Illustration"
            className="rounded-xl shadow-lg"
          />
        </div>
      </div>

      <div className="flex w-full md:w-1/2 items-center justify-center px-6">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Login to your account
          </h1>

          <p className="text-gray-500 mb-8">
            Enter your credentials to continue
          </p>

          <div className="flex flex-col gap-5">
            <input
              placeholder="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && handleLogin()
              }
              className="border border-gray-300 focus:border-[#0072b1] focus:ring-2 focus:ring-[#0072b1]/20 outline-none p-3 rounded-lg transition"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && handleLogin()
              }
              className="border border-gray-300 focus:border-[#0072b1] focus:ring-2 focus:ring-[#0072b1]/20 outline-none p-3 rounded-lg transition"
            />

            <button
              onClick={handleLogin}
              disabled={loading}
              className="bg-[#0072b1] hover:bg-[#005f94] disabled:opacity-60 cursor-pointer text-white font-semibold p-3 rounded-lg transition duration-300 shadow-md"
            >
              {loading ? "Logging in…" : "Login"}
            </button>
          </div>

          <p className="text-sm text-gray-400 mt-6 text-center">
            © {new Date().getFullYear()} CRM System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}