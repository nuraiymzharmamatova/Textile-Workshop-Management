import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import LoginPage from './components/pages/auth/LoginPage';
import DashboardPage from './components/pages/dashboard/DashboardPage';
import OrdersPage from './components/pages/orders/OrdersPage';
import ClientsPage from './components/pages/clients/ClientsPage';
import InventoryPage from './components/pages/inventory/InventoryPage';
import ProductionPage from './components/pages/production/ProductionPage';
import EmployeesPage from './components/pages/employees/EmployeesPage';
import ReportsPage from './components/pages/reports/ReportsPage';
import ProductsPage from './components/pages/products/ProductsPage';
import ProfilePage from './components/pages/profile/ProfilePage';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/" /> : children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="production" element={<ProductionPage />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
