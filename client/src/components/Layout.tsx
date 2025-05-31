import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import {Toaster} from "react-hot-toast";

const Layout: React.FC = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar token={token} handleLogout={handleLogout} />

      <main className="flex-1">
        <div className="min-h-[calc(100vh-128px)] px-4  sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>


      <footer className="bg-white dark:bg-gray-800 shadow-inner py-4">
        <div className="container mx-auto text-center text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} PyDataPRO — All rights reserved.
        </div>
      </footer>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default Layout;
