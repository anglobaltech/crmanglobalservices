"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { X, Upload, Loader2, Camera, ShieldCheck } from "lucide-react";
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export default function ProfileModal({ isOpen, onClose }) {
  const { user, refreshUser } = useAuth();
  
  const [name, setName] = useState(user?.name || "");
  const [password, setPassword] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState(user?.profilePic || "");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const fileInputRef = useRef(null);

  if (!isOpen || !user) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let uploadedPicUrl = profilePicUrl;

      if (file) {
        const fileRef = ref(storage, `profilePics/${user.id}_${Date.now()}`);
        const snapshot = await uploadBytesResumable(fileRef, file);
        uploadedPicUrl = await getDownloadURL(snapshot.ref);
      }

      const token = localStorage.getItem("crm_token");
      const updates = { name, profilePic: uploadedPicUrl };
      if (password) {
        updates.password = password;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      setProfilePicUrl(uploadedPicUrl);
      setSuccess("Profile updated successfully");
      setPassword("");
      
      await refreshUser();
      
      setTimeout(() => {
        onClose();
        setSuccess("");
      }, 1500);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 transition-all duration-200">
      <div 
        className="bg-white w-full max-w-[400px] rounded-2xl shadow-xl flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Simple Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Edit Profile</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 transition-colors rounded-full p-1 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="px-6 py-6 overflow-y-auto max-h-[calc(100vh-120px)] no-scrollbar">
          
          {/* Avatar Upload (Centered, Clean) */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div 
              className="relative group cursor-pointer w-20 h-20 rounded-full overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center" 
              onClick={() => fileInputRef.current?.click()}
            >
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : profilePicUrl ? (
                <img src={profilePicUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-semibold text-gray-400">
                  {name.charAt(0).toUpperCase()}
                </span>
              )}
              
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={20} />
              </div>
            </div>
            <div className="mt-2 text-[11px] font-medium text-gray-500 uppercase tracking-wider">
              Profile Photo
            </div>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange}
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-xs font-medium rounded-lg border border-red-100">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-50 text-green-700 text-xs font-medium rounded-lg border border-green-100">
                {success}
              </div>
            )}

            {/* Read-only Meta Info */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-gray-500" />
                <span className="text-sm font-semibold text-gray-700">{user?.roleName || "User"}</span>
              </div>
              <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                {user?.department || "No Dept"}
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-[13px] font-semibold text-gray-700">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[13px] font-semibold text-gray-700">Email Address</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-sm cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[13px] font-semibold text-gray-700">New Password <span className="text-gray-400 font-normal">(Optional)</span></label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current"
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
              />
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-black active:bg-gray-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={16} className="animate-spin text-white/70" />}
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
