import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AboutUsSection from "./AboutUsSection";
import aboutUsDescription from "../data/about";
import BuyMeCoffee from "./BuyMeCoffee";
import ThemeToggle from "./ThemeToggle";
import ScrollToTop from "./ScrollToTop";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { GitHub } from "react-feather";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Google Forms sends no CORS headers, so the response is opaque and we
    // cannot read its status. A network-level failure still rejects, which is
    // the only failure we can actually detect - so check connectivity up front
    // and word the confirmation to match what we really know.
    if (navigator.onLine === false) {
      showError("You appear to be offline. Please try again later.");
      return;
    }

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

      showSuccess("Thanks! Your request has been sent.");
      setFormData({ name: "", tool: "", desc: "" });
      setIsFormOpen(false);
    } catch (error) {
      console.error("Tool request failed:", error);
      showError("Could not reach the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const searchInputRef = useRef<HTMLInputElement>(null);

  const isMac = useMemo(() => {
    const platform = (
      navigator as Navigator & { userAgentData?: { platform?: string } }
    ).userAgentData?.platform;
    if (platform) {
      return platform.toUpperCase().includes("MAC");
    }
    return navigator.userAgent.toUpperCase().includes("MAC");
  }, []);
  const shortcutHint = isMac ? "⌘K" : "Ctrl K";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isShortcut = isMac
        ? e.metaKey && e.key === "k"
        : e.ctrlKey && e.key === "k";
      if (!isShortcut) return;
      e.preventDefault();
      // From a tool page the shortcut returns you to the index, since that is
      // where searching can actually do something.
      if (!isHomePage) {
        navigate("/");
        return;
      }
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isHomePage, isMac, navigate]);

  const resetState = useCallback(() => {
    setSearchQuery("");
    const isMobile = window.innerWidth < 768;
    if (!isMobile) {
      try {
        sessionStorage.removeItem("lastClickedTool");
      } catch {
        // Storage can be unavailable in private mode.
      }
    }
  }, []);

  const handleLogoClick = () => {
    resetState();
    navigate("/");
  };

  const updateSearchResults = useCallback((hasResults: boolean) => {
    setHasSearchResults(hasResults);
  }, []);

  const focusSearch = useCallback(() => {
    searchInputRef.current?.focus();
  }, []);

  const outletContext = useMemo(
    () => ({
      searchQuery,
      setSearchQuery,
      resetState,
      updateSearchResults,
      focusSearch,
    }),
    [searchQuery, resetState, updateSearchResults, focusSearch]
  );

  return (
    <div className="section min-h-screen flex flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[60] focus:top-3 focus:left-3 focus:px-3 focus:py-2 focus:rounded-md focus:bg-surface focus:border focus:border-line focus:text-ink"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-50 border-b border-line bg-ground/90 backdrop-blur-md">
        <div className="shell h-14 flex items-center gap-3 sm:gap-6">
          <button
            onClick={handleLogoClick}
            className="shrink-0 font-display text-lg font-semibold tracking-tight text-ink hover:text-dim transition-colors"
          >
            XUtil
          </button>

          {isHomePage ? (
            <div className="relative flex-1 max-w-2xl">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint pointer-events-none"
                aria-hidden="true"
              />
              <input
                ref={searchInputRef}
                type="search"
                role="searchbox"
                aria-label="Search tools"
                placeholder="Search 63 tools"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-9 pr-16 py-2 rounded-md"
              />
              {searchQuery ? (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 icon-button"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <kbd
                  className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:block font-mono text-[0.6875rem] text-faint pointer-events-none"
                  aria-hidden="true"
                >
                  {shortcutHint}
                </kbd>
              )}
            </div>
          ) : null}

          <div className="ml-auto shrink-0 flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setIsFormOpen(true)}
              disabled={isSubmitting}
              className="hidden sm:inline-flex button-quiet"
            >
              Request a tool
            </button>
            <a
              href="https://github.com/RohitPModani/xutil.git"
              target="_blank"
              rel="noopener noreferrer"
              className="icon-button"
              title="Source on GitHub"
              aria-label="Source on GitHub"
            >
              <GitHub className="w-[18px] h-[18px]" />
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main id="main" className="shell flex-1 pb-12">
        <ScrollToTop />
        <div className={isHomePage ? undefined : "shell-reading"}>
          <Outlet context={outletContext} />
        </div>
      </main>

      <footer className="border-t border-line mt-8">
        <div className="shell py-8 space-y-8">
          {isHomePage && hasSearchResults && !searchQuery.trim() && (
            <AboutUsSection>{aboutUsDescription}</AboutUsSection>
          )}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-faint font-mono">
              Everything runs locally in your browser.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFormOpen(true)}
                disabled={isSubmitting}
                className="sm:hidden button-quiet"
              >
                Request a tool
              </button>
              <BuyMeCoffee />
            </div>
          </div>
        </div>
      </footer>

      {isFormOpen && (
        <div
          className="fixed inset-0 bg-ground/70 backdrop-blur-sm z-50 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="request-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsFormOpen(false);
          }}
        >
          <div className="card w-full max-w-md p-6 space-y-6">
            <div className="space-y-1.5">
              <p className="label">Request a tool</p>
              <h2
                id="request-title"
                className="font-display text-xl font-semibold text-ink"
              >
                What should we build next?
              </h2>
              <p className="text-sm text-dim">
                Tell us what you need and we will take a look.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="form-label">
                  Your name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Ada Lovelace"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="tool" className="form-label">
                  Tool name
                </label>
                <input
                  id="tool"
                  type="text"
                  placeholder="JSON to YAML converter"
                  required
                  value={formData.tool}
                  onChange={(e) =>
                    setFormData({ ...formData, tool: e.target.value })
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="desc" className="form-label">
                  What should it do?
                </label>
                <textarea
                  id="desc"
                  placeholder="Takes a JSON object and returns the YAML equivalent."
                  required
                  value={formData.desc}
                  onChange={(e) =>
                    setFormData({ ...formData, desc: e.target.value })
                  }
                  className="input-field resize-none"
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="button-quiet"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="button-primary"
                >
                  {isSubmitting ? "Sending…" : "Send request"}
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
