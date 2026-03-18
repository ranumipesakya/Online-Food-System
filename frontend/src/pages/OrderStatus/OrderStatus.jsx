import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import "./OrderStatus.css";

const STATUS_STEPS = ["pending", "confirmed", "preparing", "out for delivery", "delivered"];

const OrderStatus = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { user, fetchUserOrders, fetchUserOrderById } = useContext(StoreContext);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      if (!user) {
        setError("Please login to view order status.");
        setLoading(false);
        return;
      }

      let result;
      if (orderId) {
        result = await fetchUserOrderById(orderId);
        if (result.success) {
          setOrder(result.order);
        } else {
          setError(result.message || "Failed to load order.");
        }
      } else {
        result = await fetchUserOrders();
        if (result.success) {
          setOrder(result.orders[0] || null);
        } else {
          setError(result.message || "Failed to load orders.");
        }
      }
      setLoading(false);
    };

    loadOrder();
    const intervalId = setInterval(loadOrder, 8000);
    return () => clearInterval(intervalId);
  }, [orderId, user]);

  if (!order) {
    return (
      <div className="order-status-page">
        <div className="order-status-card">
          <h2>{loading ? "Loading order..." : error || "No recent order found"}</h2>
          <button type="button" onClick={() => navigate("/")}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const currentStepIndex = Math.max(0, STATUS_STEPS.indexOf(String(order.status || "").toLowerCase()));

  return (
    <div className="order-status-page">
      <div className="order-status-card">
        <div className="order-status-header">
          <h1>Order Status</h1>
          <button type="button" className="back-home-btn" onClick={() => navigate("/")}>
            Back Home
          </button>
        </div>

        <p className="order-meta">
          Order ID: <b>{order._id}</b>
        </p>
        <p className="order-meta">
          Delivery to: <b>{order.address?.street}, {order.address?.city}</b> | Phone: <b>{order.address?.phone}</b>
        </p>

        <div className="status-steps">
          {STATUS_STEPS.map((step, index) => (
            <div key={step} className={`step-item ${index <= currentStepIndex ? "active" : ""}`}>
              <span className="step-dot" />
              <p>{step[0].toUpperCase() + step.slice(1)}</p>
            </div>
          ))}
        </div>

        <h3 className="ordered-title">Ordered Items</h3>
        <div className="ordered-list">
          {order.items.map((item) => (
            <div className="ordered-row" key={`${item.foodId || item.name}-${item.quantity}`}>
              <div className="ordered-left">
                <img src={item.image} alt={item.name} />
                <div>
                  <p className="item-name">{item.name}</p>
                  <p className="item-meta">
                    Qty {item.quantity} x Rs {item.price}
                  </p>
                </div>
              </div>
              <div className="ordered-right">
                <p className="item-price">Rs {item.price * item.quantity}</p>
                <span className="item-status">{String(order.status || "").toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="order-total">
          <p>
            Total: <b>Rs {order.amount}</b>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderStatus;
