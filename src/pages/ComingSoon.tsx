import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Loader } from 'lucide-react'; // Use Loader2 instead of Loader (Loader2 is designed for spin)
import BackToHome from '../components/BackToHome';

export default function ComingSoon() {
  const location = useLocation();
  const toolName = new URLSearchParams(location.search).get('tool');

  useEffect(() => {
    window.scrollTo(0, 0); // Always scroll to top
  }, []);

  return (
    <div className="flex flex-col justify-center items-center flex-grow text-gray-800 dark:text-gray-100 transition-colors duration-300 p-6">
      
      {/* Correct Spinner with slow animation */}
      <div className="animate-spin mb-6">
        <Loader size={64} />
      </div>

      <h1 className="text-4xl md:text-6xl font-bold mb-4">Coming Soon!</h1>

      <p className="text-lg md:text-xl mb-6 text-center max-w-md">
        {toolName ? `${toolName} is under development. Stay tuned! 🚀` : 'We are brewing something awesome. Stay tuned! 🚀'}
      </p>

      <BackToHome />
    </div>
  );
}
