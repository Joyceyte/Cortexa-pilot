import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-foreground space-y-3">
      <div
        className="w-6 h-6 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"
        aria-label="Loading spinner"
      />
      <p className="text-sm text-neutral-500">Loading...</p>
    </div>
  );
};

export default LoadingSpinner;
