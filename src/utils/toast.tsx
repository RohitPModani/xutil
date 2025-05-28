import { toast } from "react-toastify";
import CustomToast from "../components/CustomToast";

export const showSuccess = (msg: string) =>
  toast(<CustomToast type="success" message={msg} />);

export const showError = (msg: string) =>
  toast(<CustomToast type="error" message={msg} />);

export const showInfo = (msg: string) =>
  toast(<CustomToast type="info" message={msg} />);

export const showWarn = (msg: string) =>
  toast(<CustomToast type="warn" message={msg} />);
