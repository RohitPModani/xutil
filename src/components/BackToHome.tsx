// src/components/BackToHome.tsx
import { useNavigate, useOutletContext } from "react-router-dom";
import { Home } from "lucide-react";

function BackToHome() {
  const navigate = useNavigate();
  // Access the resetState function from Outlet context
  const { resetState } = useOutletContext<{
    searchQuery: string;
    resetState: () => void;
  }>();

  const handleBackToHome = () => {
    resetState(); // Clear searchQuery and lastClickedTool
    navigate("/"); // Navigate to Home
  };

  return (
    <button
      onClick={handleBackToHome}
      className="inline-flex items-center gap-2 text-sm px-3 py-1.5 sm:text-base sm:px-4 sm:py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-white rounded-full shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200"
      title="Home"
      aria-label="Home"
    >
      <Home className="sm:w-5 sm:h-5 w-4 h-4" />
      <span className="font-medium">Home</span>
    </button>
  );
}

export default BackToHome;
