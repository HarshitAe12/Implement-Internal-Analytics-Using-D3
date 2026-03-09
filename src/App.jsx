import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Index from "./pages/Index";
import User from "./pages/User";
import Login from "./pages/Login";
import MainLayout from "./layout/MainLayout";
import ProtectedRoute from "./utils/ProtectedRoute";

const App = () => {
  return (
    <>
      <Toaster richColors position="top-right" />

      <BrowserRouter>
        <Routes>

          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/user/:id" element={<User />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;