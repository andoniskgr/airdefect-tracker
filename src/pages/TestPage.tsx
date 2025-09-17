import React from "react";

const TestPage = () => {
  return (
    <div className="min-h-screen bg-slate-700 text-white p-4 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Test Page</h1>
        <p className="text-xl">
          If you can see this, the basic routing is working!
        </p>
        <div className="mt-8">
          <p className="text-sm text-gray-300">
            Current time: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
