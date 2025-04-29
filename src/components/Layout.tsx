// src/components/Layout.tsx
import { Outlet, useLocation } from 'react-router-dom';
import AboutUsSection from './AboutUsSection';
import aboutUsDescription from '../context/about';
import BuyMeCoffee from './BuyMeCoffee';
import ThemeToggle from './ThemeToggle';

function Layout() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="section min-h-screen transition-colors duration-300">
      <header className="flex items-center justify-between px-4 py-4 sm:py-6 max-w-7xl mx-auto gap-4">
      {/* Logo/Title */}
      <div className="text-left">
        <h1 className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-white">
          X-Util
        </h1>
      </div>

      {/* Center tagline (hidden on mobile) */}
      <div className="hidden md:block">
        <h2 className="text-sm sm:text-lg font-medium text-muted">
          Your destination for all Dev Tools
        </h2>
      </div>

      {/* Theme toggle */}
      <div className="flex justify-end">
        <ThemeToggle />
      </div>
    </header>

      {isHomePage && (
        <div className="px-4 max-w-7xl mx-auto sm:mb-4 mb-2">
          <AboutUsSection>
            {aboutUsDescription}
          </AboutUsSection>
        </div>
      )}

      <main className="px-3 pb-6 sm:px-4 sm:pb-8 max-w-7xl mx-auto">
        <Outlet />
      </main>

      {isHomePage && <BuyMeCoffee />}
    </div>
  );
}

export default Layout;