import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import MainLayout from "./layout/MainLayout";
import Chatbot from "./components/Chatbot";
import { isAuthenticated } from "./utils/helper";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Expenses = lazy(() => import("./pages/Expenses"));
const Income = lazy(() => import("./pages/Income"));
const Budget = lazy(() => import("./pages/Budget"));
const Analytics = lazy(() => import("./pages/Analytics"));
const ChildDetails = lazy(() => import("./pages/ChildDetails"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Profile = lazy(() => import("./pages/profile"));
const Advisor = lazy(() => import("./pages/Advisor"));

const ProtectedLayout = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <MainLayout>
      {children}
      <Chatbot />
    </MainLayout>
  );
};

const PublicRoute = ({ children }) => {
  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const RouteLoader = () => (
  <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
    Loading...
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
          <Route path="/expenses" element={<ProtectedLayout><Expenses /></ProtectedLayout>} />
          <Route path="/income" element={<ProtectedLayout><Income /></ProtectedLayout>} />
          <Route path="/budget" element={<ProtectedLayout><Budget /></ProtectedLayout>} />
          <Route path="/analytics" element={<ProtectedLayout><Analytics /></ProtectedLayout>} />
          <Route path="/children/:childId" element={<ProtectedLayout><ChildDetails /></ProtectedLayout>} />
          <Route path="/advisor" element={<ProtectedLayout><Advisor /></ProtectedLayout>} />
          <Route path="/profile" element={<ProtectedLayout><Profile /></ProtectedLayout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
