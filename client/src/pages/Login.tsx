import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {API_BASE} from "../utils/api.ts";

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        login(data.token);
        localStorage.setItem("userId", data.user.id);
        toast.success('Logged in successfully!');
        navigate('/profile');
      } else {
        toast.error(data.message ?? 'Login failed');
      }
    } catch (error) {
      console.error(error);
      toast.error('Login error');
    }
  };

  return (
  <div className="min-h-screen bg-gray-900 px-4 py-12 flex items-center justify-center">
    <form
      onSubmit={handleLogin}
      className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-8 space-y-5"
    >
      <h2 className="text-3xl font-bold text-white text-center mb-2">Welcome Back</h2>

      <input
        type="email"
        autoComplete="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />

      <input
        type="password"
        autoComplete="current-password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />

      <button
        type="submit"
        className="w-full py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition"
      >
        Login
      </button>
    </form>
  </div>
);

};

export default Login;
