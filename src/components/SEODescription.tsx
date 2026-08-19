import { ReactNode } from "react";
import Disclosure from "./Disclosure";

interface SEODescriptionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

/**
 * The explainer at the foot of a tool page. Collapsed by default - someone who
 * came to decode a token does not need the essay first - but always present in
 * the markup for search engines.
 */
export default function SEODescription({
  title,
  children,
  defaultOpen = false,
  className = "",
}: SEODescriptionProps) {
  return (
    <Disclosure
      title={`What is ${title}?`}
      defaultOpen={defaultOpen}
      className={`mt-8 ${className}`}
    >
      {children}
    </Disclosure>
  );
}
