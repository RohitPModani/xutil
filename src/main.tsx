import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { HelmetProvider } from 'react-helmet-async';

ReactDOM.createRoot(document.getElementById('root')!).render(
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
