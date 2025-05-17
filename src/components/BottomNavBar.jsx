import React from "react";
import { Link, useLocation } from "react-router-dom";

const BottomNavBar = () => {
  const location = useLocation();

  const navItems = [
    { to: "/logs", label: "Logs", icon: "fas fa-file-alt" },
    { to: "/profile", label: "Profile", icon: "fas fa-user" },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-gray-900 bg-opacity-95 border-t border-gray-700 text-white font-sans py-3 z-50"
      role="navigation"
      aria-label="Bottom navigation"
    >
      <div className="flex justify-around max-w-lg mx-auto">
        {navItems.map(({ to, label, icon }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center text-sm font-medium tracking-wide transition-colors duration-200 ${
                isActive
                  ? "text-fuchsia-500"
                  : "text-gray-400 hover:text-fuchsia-400 focus:text-fuchsia-400 focus:outline-none"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <i
                className={`${icon} text-lg mb-1`}
                aria-hidden="true"
                aria-label={label}
              ></i>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavBar;
