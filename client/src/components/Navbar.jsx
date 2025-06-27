import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    isActive ? "text-blue-600 font-bold" : "text-gray-700 hover:text-blue-500";

  return (
    <nav className="flex gap-6 p-4 border-b bg-white">
      <NavLink to="/dashboard" className={linkClass}>
        Dashboard
      </NavLink>
      <NavLink to="/workouts" className={linkClass}>
        Workouts
      </NavLink>
      <button onClick={handleLogout} className="ml-auto text-red-500">
        Logout
      </button>
    </nav>
  );
}

export default Navbar;

