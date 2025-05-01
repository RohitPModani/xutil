// src/components/Layout.tsx
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import AboutUsSection from './AboutUsSection';
import aboutUsDescription from '../context/about';
import BuyMeCoffee from './BuyMeCoffee';
import ThemeToggle from './ThemeToggle';
import ScrollToTop from './ScrollToTop';
import { useState } from 'react';
import { Search, X } from 'lucide-react';

function Layout() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleLogoClick = () => {
    resetState();
    navigate('/');
  };

  const resetState = () => {
    setSearchQuery('');
    // Check if in mobile view (width < 768px, matching the condition in Home.tsx)
    const isMobile = window.innerWidth < 768;
    if (!isMobile) {
      sessionStorage.removeItem('lastClickedTool');
    }
  };

  return (
    <div className="section min-h-screen transition-colors duration-300">
      <header className="flex items-center justify-between px-4 py-4 sm:py-6 max-w-7xl mx-auto gap-4">
        <div className="flex-shrink-0 flex items-center">
          <button
            onClick={handleLogoClick}
            className="text-lg sm:text-2xl font-bold text-zinc-800 dark:text-white hover:text-zinc-700 dark:hover:text-zinc-400 transition focus:outline-none"
          >
            XUtil
          </button>
        </div>

        <div className="flex-1 max-w-[50%] sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg mx-auto flex items-center">
          {isHomePage ? (
            <div className="relative w-full">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 sm:py-2 text-sm rounded-full border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
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

        <div className="flex-shrink-0 flex items-center">
          <ThemeToggle />
        </div>
      </header>

      {/* Remove min-h allocation */}
      <div className="px-4 max-w-7xl mx-auto sm:mb-4 mb-2">
        {isHomePage && <AboutUsSection>{aboutUsDescription}</AboutUsSection>}
      </div>

      <main className="px-3 pb-6 sm:px-4 sm:pb-8 max-w-7xl mx-auto">
        <ScrollToTop />
        <Outlet context={{ searchQuery, resetState }} />
      </main>

      {/* Remove min-h allocation */}
      <div>
        {isHomePage && (
          <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50">
            <BuyMeCoffee />
          </div>
        )}
      </div>
    </div>
  );
}

export default Layout;