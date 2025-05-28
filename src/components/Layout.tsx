import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AboutUsSection from "./AboutUsSection";
import aboutUsDescription from "../data/about";
import BuyMeCoffee from "./BuyMeCoffee";
import ThemeToggle from "./ThemeToggle";
import ScrollToTop from "./ScrollToTop";
import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { GitHub } from "react-feather";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { showError, showSuccess } from "../utils/toast";

function Layout() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearchResults, setHasSearchResults] = useState(true);
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", tool: "", desc: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formDataEncoded = new URLSearchParams();
    formDataEncoded.append("entry.112796009", formData.name);
    formDataEncoded.append("entry.1057890448", formData.tool);
    formDataEncoded.append("entry.1291570962", formData.desc);

    try {
      setIsSubmitting(true);

      await fetch(
        "https://docs.google.com/forms/d/e/1FAIpQLScJwt5CkRpu-w77-B6EVhwWV5iTJqH08ysxcROyTZ6eWu9KHg/formResponse",
        {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formDataEncoded.toString(),
        }
      );

      showSuccess("Request has been submitted.");
      setFormData({ name: "", tool: "", desc: "" });
      setIsFormOpen(false);
    } catch (error) {
      showError("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Determine shortcut hint based on platform
  const getIsMac = () => {
    // Prefer userAgentData if available
    if ((navigator as any).userAgentData?.platform) {
      return (navigator as any).userAgentData.platform
        .toUpperCase()
        .includes("MAC");
    }
    // Fallback to userAgent
    return navigator.userAgent.toUpperCase().includes("MAC");
  };
  const isMac = getIsMac();
  const shortcutHint = isMac ? "⌘ + K" : "Ctrl + K";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (isMac && e.metaKey && e.key === "k") ||
        (!isMac && e.ctrlKey && e.key === "k")
      ) {
        e.preventDefault();
        if (isHomePage && searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isHomePage, isMac]);

  const handleLogoClick = () => {
    resetState();
    navigate("/");
  };

  const resetState = () => {
    setSearchQuery("");
    // Check if in mobile view (width < 768px, matching the condition in Home.tsx)
    const isMobile = window.innerWidth < 768;
    if (!isMobile) {
      sessionStorage.removeItem("lastClickedTool");
    }
  };

  const updateSearchResults = (hasResults: boolean) => {
    setHasSearchResults(hasResults);
  };

  return (
    <div className="section min-h-screen transition-colors duration-300">
      <header className="w-full flex items-center justify-between px-4 py-4 sm:py-6 max-w-7xl mx-auto gap-2 sm:gap-4">
        <div className="flex-shrink-0 flex items-center gap-2">
          <button
            onClick={handleLogoClick}
            className="text-lg sm:text-2xl font-bold text-zinc-800 dark:text-white hover:text-zinc-700 dark:hover:text-zinc-400 transition focus:outline-none"
          >
            XUtil
          </button>
          <button
            onClick={() => setIsFormOpen(true)}
            disabled={isSubmitting}
            className="text-xs sm:text-sm px-2 py-1 rounded-md border border-zinc-400 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            {isMobile ? "Request" : "Request a Tool"}
          </button>
        </div>

        <div className="flex-1 max-w-[50%] sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg mx-auto flex items-center">
          {isHomePage ? (
            <div className="relative w-full">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={`Search tools... (${shortcutHint})`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 sm:py-2 text-sm rounded-full border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="h-[35px] sm:h-[38px] rounded-full border border-transparent px-3"></div>
          )}
        </div>

        <div className="flex-shrink-0 flex items-center gap-2 sm:gap-4">
          <a
            href="https://github.com/RohitPModani/xutil.git"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg sm:text-2xl font-bold text-zinc-800 dark:text-white hover:text-zinc-700 dark:hover:text-zinc-400 transition focus:outline-none"
            title="Github"
            aria-label="Github"
          >
            <GitHub className="w-5 h-5 sm:w-7 sm:h-7" />
          </a>
          <ThemeToggle />
        </div>
      </header>

      <main className="px-3 pb-6 sm:px-4 sm:pb-8 max-w-7xl mx-auto">
        <ScrollToTop />
        <Outlet context={{ searchQuery, resetState, updateSearchResults }} />
      </main>

      <footer className="px-4 max-w-7xl mx-auto sm:mb-4 mb-2">
        {isHomePage && hasSearchResults && (
          <AboutUsSection>{aboutUsDescription}</AboutUsSection>
        )}
      </footer>

      {/* Remove min-h allocation */}
      <div>
        {isHomePage && (
          <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50">
            <BuyMeCoffee />
          </div>
        )}
      </div>
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center px-4">
          <div className="border border-zinc-300 dark:border-zinc-600  bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">Request a New Tool</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="input-field"
              />
              <input
                type="text"
                placeholder="Tool Name"
                required
                value={formData.tool}
                onChange={(e) =>
                  setFormData({ ...formData, tool: e.target.value })
                }
                className="input-field"
              />
              <textarea
                placeholder="Brief Description"
                required
                value={formData.desc}
                onChange={(e) =>
                  setFormData({ ...formData, desc: e.target.value })
                }
                className="input-field"
                rows={4}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-zinc-300 hover:bg-zinc-400 dark:bg-zinc-700 dark:hover:bg-zinc-600 font-semibold rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-700 dark:bg-white dark:hover:bg-zinc-300 text-white dark:text-zinc-900 font-semibold rounded-full"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Layout;
