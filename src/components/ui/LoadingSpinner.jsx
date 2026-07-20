import { RefreshCw } from "lucide-react";

export default function LoadingSpinner({ className = "py-24", size = 28 }) {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <RefreshCw size={size} className="text-gray-300 animate-spin" />
    </div>
  );
}
