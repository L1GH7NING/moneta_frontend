import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import { AuthProvider } from "./context/AuthProvider";
import Budget from "./pages/Budget";
import Expenses from "./pages/Expenses";
import Categories from "./pages/Categories";
import CategoryPage from "./pages/CategoryPage";
import DarkModeToggle from "./components/utils/DarkModeToggle";

const App = () => {
  return (
    <AuthProvider>
      {/* Global dark-mode toggle (persists to localStorage) */}
      {/* <div className="fixed top-4 right-4 z-50">
        <DarkModeToggle />
      </div> */}
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/budgets" element={<Budget />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/categories" element={<Categories />} />
            <Route
              path="/categories/:categoryId"
              element={<CategoryPage />}
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
