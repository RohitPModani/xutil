import { useLocation } from "react-router-dom";
import BackToHome from "./BackToHome";
import BuyMeCoffee from "./BuyMeCoffee";
import { toolSignatures } from "../data/toolSignatures";

/**
 * The top of every tool page: a way back, the tool's name, and what it turns
 * into what. The signature is looked up from the route, so each page states
 * its contract the same way the index does.
 */
function ToolHeader({ title }: { title: string }) {
  const { pathname } = useLocation();
  const sig = toolSignatures[pathname];

  return (
    <header className="mb-6">
      <div className="flex items-center justify-between gap-3">
        <BackToHome />
        <BuyMeCoffee variant="inline" />
      </div>

      <h1 className="mt-5 font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
        {title}
      </h1>

      {sig && (
        <p className="mt-2 font-mono text-xs">
          {sig.in && <span className="sig-in">{sig.in}</span>}
          <span className="sig-arrow">{sig.dir === "both" ? "⇄" : "→"}</span>
          <span className="sig-out">{sig.out}</span>
        </p>
      )}

      <hr className="rule mt-5" />
    </header>
  );
}

export default ToolHeader;
