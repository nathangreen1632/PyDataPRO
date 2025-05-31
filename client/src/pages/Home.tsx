import React from "react";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  return (
    <div className="relative w-full h-[calc(100vh-112px)] bg-gray-900 text-white overflow-hidden">
      <div className="absolute inset-0 z-0">
        {/* @ts-expect-error : design object not known to TS*/}
        <spline-viewer
          url="https://prod.spline.design/mC6PnZYNXmAiFRZr/scene.splinecode"
          style={{ width: "100%", height: "100%", border: "none" }}
        />
      </div>

      <div className="relative z-10 flex flex-col justify-between h-full px-4 pt-6 pb-4 text-center">
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 mt-12">
            Welcome to <span className="text-white">PyData</span>
            <span className="text-red-500">PRO</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl max-w-2xl text-white mx-auto mt-10">
            AI-powered job intelligence and career tooling built for developers,
            analysts, and data professionals
          </p>
        </div>

        <div className="flex-grow" />

        <div className="flex flex-col sm:flex-row gap-3 mb-42 justify-center">
          <Link
            to="/register"
            className="bg-cyan-400 hover:bg-pink-600 text-black font-semibold py-3 px-6 rounded-full transition shadow-lg"
          >
            Register
          </Link>
          <Link
            to="/login"
            className="bg-pink-400 hover:bg-cyan-600 text-black font-semibold py-3 px-6 rounded-full transition shadow-lg"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
