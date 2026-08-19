import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
// Latin subsets only, at the weights actually used.
import "@fontsource-variable/ibm-plex-sans";
import "@fontsource/ibm-plex-sans-condensed/latin-500.css";
import "@fontsource/ibm-plex-sans-condensed/latin-600.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import "./index.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { HelmetProvider } from "react-helmet-async";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <div className="section min-h-screen relative transition-colors duration-300">
      <HelmetProvider>
        <App />
      </HelmetProvider>
      <ToastContainer
        position="top-right"
        autoClose={1500}
        hideProgressBar
        closeOnClick
        pauseOnHover={false}
        draggable
        newestOnTop
        closeButton={false}
        toastClassName="!bg-transparent !shadow-none !p-0"
        className="!z-50"
      />
    </div>
  </React.StrictMode>
);
