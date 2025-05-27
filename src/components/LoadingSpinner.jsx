import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="text-center space-y-2">
      {/*
    <div className="w-6 h-6 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mx-auto" />{" "}
    */}
      <p className="text-sm">Loading...</p>
    </div>
  );
};

export default LoadingSpinner;
