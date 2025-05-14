// src/components/BottomNavBar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const BottomNavBar = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white py-2">
      <div className="flex justify-around">
        <Link to="/logs" className="text-center">
          <i className="fas fa-file-alt"></i> <span className="block">Logs</span>
        </Link>
        <Link to="/profile" className="text-center">
          <i className="fas fa-user"></i> <span className="block">Profile</span>
        </Link>
      </div>
    </div>
  );
};

export default BottomNavBar;
