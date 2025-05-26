import { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = ({
  token,
  handleLogout,
}: {
  token: string | null;
  handleLogout: () => void;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const authedPages = [
    { name: "Profile", path: "/profile" },
    { name: "Interview Generator", path: "/interview" },
    { name: "Career Path", path: "/career-path" },
    { name: "Learning Resources", path: "/learning-resources" },
    { name: "Analytics", path: "/analytics" },
  ];

  const publicPages = [
    { name: "Register", path: "/register" },
    { name: "Login", path: "/login" },
  ];

  return (
    <nav className="bg-gray-900 text-white py-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center px-6">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold tracking-wide">
          PyData<span className="text-red-500">PRO</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex space-x-6">
          {(token ? authedPages : publicPages).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="hover:text-red-400 transition-all duration-200"
            >
              {item.name}
            </Link>
          ))}

          {token && (
            <button
              onClick={handleLogout}
              className="hover:text-red-400 transition-all duration-200 focus:outline-none"
            >
              Logout
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-white text-3xl focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-gray-800 py-4 px-6 space-y-2">
          {(token ? authedPages : publicPages).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="block py-2 hover:text-red-400 transition-all duration-200"
              onClick={() => setMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}

          {token && (
            <button
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
              className="block py-2 w-full text-left hover:text-red-400 transition-all duration-200"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
