import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import MainLayout from "./layout/MainLayout";
import ProtectedRoute from "./utils/ProtectedRoute";
import { lazy, Suspense } from "react";

const App = () => {

const Index = lazy(() => import("./pages/Index"));
const User = lazy(()=>import("./pages/User"));
const Login=lazy(()=>import("./pages/Login"))

  const token = localStorage.getItem("access_token");

  return (
    <>
      <Toaster richColors position="top-right" />
    <Suspense fallback={<div>Loading...</div>}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={token ? <Navigate to="/" replace /> : <Login />
              
            }
          />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/user/:id" element={<User />} />
            </Route>
          </Route>

        </Routes>
      </BrowserRouter>
      </Suspense>
    </>
  );
};

export default App;