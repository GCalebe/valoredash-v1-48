import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import ProtectedRoute from "./ProtectedRoute";

const AppLayout: React.FC = () => {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AppLayout;