import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Index from "./pages/Index";
import User from "./pages/User";
import MainLayout from "./layout/MainLayout";

const App = () => {
  return (
    <>
      <Toaster richColors position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/user/:id" element={<User />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;