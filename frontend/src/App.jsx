import React, { useContext, useEffect, useState } from "react";
import Navbar from "./componenets/Navbar/Navbar";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Home from "./pages/Home/Home";
import Cart from "./pages/Cart/Cart";
import PlaceOrder from "./pages/PlaceOrder/PlaceOrder";
import Payment from "./pages/Payment/Payment";
import OrderStatus from "./pages/OrderStatus/OrderStatus";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import Footer from "./componenets/Footer/Footer";
import LoginPopup from "./componenets/LoginPopup/LoginPopup";
import { StoreContext } from "./context/StoreContext";

const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const { user } = useContext(StoreContext);
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isCheckoutRoute =
    location.pathname === "/order" ||
    location.pathname === "/payment" ||
    location.pathname.startsWith("/order-status");

  useEffect(() => {
    if (user?.role === "admin" && !isAdminRoute) {
      navigate("/admin");
    }
  }, [user, isAdminRoute, navigate]);

  return (
    <>
      <div className="app">
        {!isAdminRoute && !isCheckoutRoute && <Navbar setShowLogin={setShowLogin} />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order" element={<PlaceOrder />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/order-status" element={<OrderStatus />} />
          <Route path="/order-status/:orderId" element={<OrderStatus />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
        {!isAdminRoute && !isCheckoutRoute && <Footer />}
      </div>
      {showLogin && <LoginPopup setShowLogin={setShowLogin} />}
    </>
  );
};

export default App;
