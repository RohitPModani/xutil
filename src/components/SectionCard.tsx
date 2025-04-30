interface SectionCardProps {
    children: React.ReactNode;
    className?: string;
  }
  
  function SectionCard({ children, className = '' }: SectionCardProps) {
    return (
      <div className={`bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-white shadow-lg rounded-lg sm:p-6 p-4 ${className}`}>
        {children}
      </div>
    );
  }
  
  export default SectionCard;  