import { Coffee } from "lucide-react";

interface BuyMeCoffeeProps {
  variant?: "inline" | "bottom";
}

/**
 * Lives in the footer now. It previously floated over the middle of the page
 * and covered whatever was underneath it.
 */
const BuyMeCoffee = ({ variant = "bottom" }: BuyMeCoffeeProps) => (
  <a
    href="https://buymeacoffee.com/rohitmodani"
    target="_blank"
    rel="noopener noreferrer"
    className={
      variant === "inline"
        ? "inline-flex items-center gap-1.5 font-mono text-xs text-dim hover:text-ink transition-colors"
        : "button-quiet"
    }
    aria-label="Buy me a coffee"
  >
    <Coffee className="w-3.5 h-3.5" aria-hidden="true" />
    <span>Buy me a coffee</span>
  </a>
);

export default BuyMeCoffee;
