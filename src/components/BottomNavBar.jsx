import React from "react";
import { Link, useLocation } from "react-router-dom";

const BottomNavBar = () => {
  const location = useLocation();

  const navItems = [
    {
      to: "/logs",
      label: "Logs",
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    },
    {
      to: "/profile",
      label: "Profile",
      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    },
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
                  ? "text-orange-500"
                  : "text-gray-400 hover:text-orange-400 focus:text-orange-400 focus:outline-none"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <svg
                className="w-6 h-6 mb-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={icon}
                />
              </svg>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavBar;
