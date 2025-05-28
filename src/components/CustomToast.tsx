import { Check, XCircle, Info, AlertTriangle, X } from "lucide-react";
import clsx from "clsx";
import { motion } from "framer-motion"; // For animations

interface CustomToastProps {
  type: "success" | "error" | "info" | "warn";
  message: string;
  closeToast?: () => void; // Provided by react-toastify
}

const icons = {
  success: <Check className="w-5 h-5 shrink-0 text-white" />,
  error: <XCircle className="w-5 h-5 shrink-0 text-white" />,
  info: <Info className="w-5 h-5 shrink-0 text-white" />,
  warn: <AlertTriangle className="w-5 h-5 shrink-0 text-white" />,
};

const CustomToast = ({ type, message, closeToast }: CustomToastProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={clsx(
        "w-fit max-w-[90vw] sm:max-w-md flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-4 rounded-xl shadow-lg border",
        "bg-zinc-900/80 dark:bg-zinc-900/80 text-white transition-all duration-300 hover:shadow-2xl",
        "border-zinc-700 ml-auto mr-4 sm:mr-6"
      )}
      role="alert"
      aria-live="assertive"
    >
      {/* Icon */}
      <div className="flex-shrink-0">{icons[type]}</div>

      {/* Message */}
      <p className="text-sm sm:text-base font-bold leading-tight flex-1 truncate">
        {message}
      </p>

      {/* Close Button */}
      {closeToast && (
        <button
          onClick={closeToast}
          className={clsx(
            "flex-shrink-0 p-1 rounded-full transition-colors duration-200",
            "hover:bg-white/10 "
          )}
          aria-label="Close toast"
        >
          <X className="w-4 h-4 opacity-75" />
        </button>
      )}
    </motion.div>
  );
};

export default CustomToast;
