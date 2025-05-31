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
    <nav className="bg-gray-900 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center px-6 py-4">
        <Link to="/" className="text-xl font-bold tracking-wide">
          PyData<span className="text-red-500">PRO</span>
        </Link>

        <div className="hidden lg:flex space-x-6">
          {(token ? authedPages : publicPages).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="hover:text-red-400 transition duration-200"
            >
              {item.name}
            </Link>
          ))}

          {token && (
            <button
              onClick={handleLogout}
              className="hover:text-red-500 transition duration-200 focus:outline-none"
            >
              Logout
            </button>
          )}
        </div>

        <button
          className="lg:hidden text-white text-3xl focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          ☰
        </button>
      </div>

      {menuOpen && (
        <div className="lg:hidden bg-gray-800 px-6 pb-4 space-y-2">
          {(token ? authedPages : publicPages).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="block py-2 hover:text-red-400 transition duration-200"
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
              className="block w-full text-left py-2 hover:text-red-400 transition duration-200"
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
