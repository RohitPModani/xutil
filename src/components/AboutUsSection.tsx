import { ReactNode } from "react";
import Disclosure from "./Disclosure";

interface AboutUsSectionProps {
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  title?: string;
}

export default function AboutUsSection({
  children,
  defaultOpen = false,
  className = "",
  title = "What is XUtil?",
}: AboutUsSectionProps) {
  return (
    <Disclosure title={title} defaultOpen={defaultOpen} className={className}>
      {children}
    </Disclosure>
  );
}
