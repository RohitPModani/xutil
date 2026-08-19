import { useNavigate, useOutletContext } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function BackToHome() {
  const navigate = useNavigate();
  const { resetState } = useOutletContext<{ resetState: () => void }>();

  return (
    <button
      onClick={() => {
        resetState();
        navigate("/");
      }}
      className="inline-flex items-center gap-1.5 font-mono text-xs text-dim hover:text-ink transition-colors"
    >
      <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
      All tools
    </button>
  );
}

export default BackToHome;
