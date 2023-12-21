import React from "react";
import { Route, Navigate } from "react-router-dom";

const PrivateRoute = ({ element: Element, isAuthenticated, fallbackPath = "/", ...props }) => {
  return isAuthenticated ? (
    <Route {...props} element={<Element />} />
  ) : (
    <Navigate to={fallbackPath} replace />
  );
};

export default PrivateRoute;
