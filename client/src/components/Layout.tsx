// client/src/components/Layout.tsx
import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Layout: React.FC = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
  <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
    {/* Navbar */}
    <div className="container mx-auto px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold">
        <span className="text-gray-800 dark:text-white">PyData</span>
        <span className="text-gray-800 dark:text-red-500">PRO</span>
      </Link>

      <nav className="flex space-x-6">
        {!token && (
          <>
            <Link to="/register" className="text-gray-600 dark:text-gray-300 hover:underline">Register</Link>
            <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:underline">Login</Link>
          </>
        )}


        {token && (
          <>
            <Link to="/profile" className="text-gray-600 dark:text-gray-300 hover:underline">Profile</Link>
            <Link to="/interview" className="text-gray-600 dark:text-gray-300 hover:underline">Interview Generator</Link>
          </>
        )}


        {token && (
          <>
            <Link to="/analytics" className="text-gray-600 dark:text-gray-300 hover:underline">Analytics</Link>
            <button
              onClick={handleLogout}
              className="text-gray-600 dark:text-gray-300 hover:underline focus:outline-none"
            >
              Logout
            </button>
          </>
        )}


      </nav>
    </div>

    {/* Main Content — no vertical centering, just top padding */}
    <main className="flex-1 container mx-auto px-6 pt-12 pb-6">
      <Outlet />
    </main>

    {/* Footer */}
    <footer className="bg-white dark:bg-gray-800 shadow-inner py-4">
      <div className="container mx-auto text-center text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} PyDataPRO — All rights reserved.
      </div>
    </footer>
  </div>
);

};

export default Layout;
