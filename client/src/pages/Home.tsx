import React from "react";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center pb-12 min-h-[85vh] bg-gray-900 text-white px-4">
      {/* Hero Section */}
      <h1 className="text-4xl md:text-4xl font-bold text-center mb-4">
        Welcome to <span className="text-white">PyData</span>
        <span className="text-red-500">PRO</span>
      </h1>
      <p className="text-lg md:text-2xl text-center max-w-xl mb-8 text-gray-300">
        AI-powered job intelligence and career tooling built for developers,
        analysts, and data professionals
      </p>

      <div className="w-full max-w-4xl h-[400px] sm:h-[400px] md:h-[500px] lg:h-[700px] rounded-2xl overflow-hidden shadow-inner mb-10">
        {/* @ts-expect-error: custom element not known to TS */}
        <spline-viewer
          url="https://prod.spline.design/mC6PnZYNXmAiFRZr/scene.splinecode"
          style={{ width: '100%', height: '100%', border: 'none' }}
        />
      </div>


      <div className="flex space-x-6">
        <Link
          to="/register"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
        >
          Register
        </Link>
        <Link
          to="/login"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition"
        >
          Login
        </Link>
      </div>
    </div>
  );
};

export default Home;
