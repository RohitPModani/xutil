// src/components/BuyMeCoffee.tsx
import { Coffee } from 'lucide-react';

interface BuyMeCoffeeProps {
  variant?: 'inline' | 'bottom';
}

const BuyMeCoffee = ({ variant = 'bottom' }: BuyMeCoffeeProps) => {
  const baseStyle =
    'inline-flex items-center gap-2 text-sm px-3 py-1.5 sm:text-base sm:px-4 sm:py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-white rounded-full shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200';

  if (variant === 'inline') {
    return (
      <a
        href="https://buymeacoffee.com/xutil"
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseStyle} ml-2`} 
        title='Donate'
        aria-label='Buy me coffee'
      >
        <Coffee className="w-4 h-4 sm:w-5 sm:h-5" />  
        <span className="font-medium sm:hidden">Coffee</span> 
        <span className="font-medium hidden sm:inline">Buy me a Coffee</span>
      </a>
    );
  }

  return (
    <div className="w-full text-center sm:py-6 py-4">
      <a
        href="https://buymeacoffee.com/xutil"
        target="_blank"
        rel="noopener noreferrer"
        className={baseStyle}
        title='Donate'
        aria-label='Buy me coffee'
      >
        <Coffee className="w-5 h-5" />
        <span className="font-medium">Buy me a Coffee</span>
      </a>
    </div>
  );
};

export default BuyMeCoffee;
