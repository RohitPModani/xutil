interface SectionCardProps {
  children: React.ReactNode;
  className?: string;
}

function SectionCard({ children, className = "" }: SectionCardProps) {
  return (
    <section className={`card p-4 sm:p-6 ${className}`}>{children}</section>
  );
}

export default SectionCard;
