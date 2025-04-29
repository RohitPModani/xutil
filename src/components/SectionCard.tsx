interface SectionCardProps {
    children: React.ReactNode;
    className?: string;
  }
  
  function SectionCard({ children, className = '' }: SectionCardProps) {
    return (
      <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white shadow-lg rounded-lg sm:p-6 p-4 ${className}`}>
        {children}
      </div>
    );
  }
  
  export default SectionCard;  