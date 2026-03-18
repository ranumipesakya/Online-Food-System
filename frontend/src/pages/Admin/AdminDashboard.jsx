import React, { useContext, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { assets } from "../../assets/assets";
import "./AdminDashboard.css";

const ORDER_STATUSES = ["pending", "confirmed", "preparing", "out for delivery", "delivered"];
const CATEGORY_OPTIONS = ["Salad", "Rolls", "Deserts", "Sandwich", "Cake", "Pure Veg", "Pasta", "Noodles"];

const AdminDashboard = () => {
  const { user, apiUrl, token, fetchAdminOrders, updateAdminOrderStatus, logout } = useContext(StoreContext);
  const [activeTab, setActiveTab] = useState("add");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);

  const [addForm, setAddForm] = useState({
    name: "",
    description: "",
    category: CATEGORY_OPTIONS[0],
    price: "",
    image: null,
  });

  const summary = useMemo(
    () => ({
      totalFoods: foods.length,
      totalOrders: orders.length,
      pendingOrders: orders.filter((o) => o.status === "pending").length,
    }),
    [foods, orders]
  );

  const loadFoods = async () => {
    const response = await fetch(`${apiUrl}/api/food/list`);
    const data = await response.json();
    if (data.success) {
      setFoods(data.foods || []);
    }
  };

  const loadOrders = async () => {
    const result = await fetchAdminOrders();
    if (result.success) {
      setOrders(result.orders || []);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      loadFoods();
      loadOrders();
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  const onAddChange = (event) => {
    const { name, value, files } = event.target;
    if (name === "image") {
      setAddForm((prev) => ({ ...prev, image: files?.[0] || null }));
      return;
    }
    setAddForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitAddFood = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("name", addForm.name);
      formData.append("description", addForm.description);
      formData.append("category", addForm.category);
      formData.append("price", addForm.price);
      if (addForm.image) {
        formData.append("image", addForm.image);
      }

      const response = await fetch(`${apiUrl}/api/food/add`, {
        method: "POST",
        headers: { token },
        body: formData,
      });

      const data = await response.json();
      if (!data.success) {
        setMessage(data.message || "Failed to add item.");
      } else {
        setMessage("Food item added successfully.");
        setAddForm({ name: "", description: "", category: CATEGORY_OPTIONS[0], price: "", image: null });
        await loadFoods();
      }
    } catch (error) {
      setMessage("Cannot connect to server.");
    }

    setLoading(false);
  };

  const removeFoodItem = async (foodId) => {
    const response = await fetch(`${apiUrl}/api/food/remove/${foodId}`, {
      method: "DELETE",
      headers: { token },
    });

    const data = await response.json();
    if (data.success) {
      setFoods((prev) => prev.filter((item) => item._id !== foodId));
    }
  };

  const onChangeOrderStatus = async (orderId, status) => {
    const result = await updateAdminOrderStatus(orderId, status);
    if (result.success) {
      setOrders((prev) => prev.map((order) => (order._id === orderId ? { ...order, status } : order)));
    }
  };

  return (
    <div className="admin-dashboard-v2">
      <div className="admin-navbar">
        <div className="admin-brand">
          <img src={assets.logo} alt="Logo" />
          <h1>Admin Panel</h1>
        </div>
        <div className="admin-metrics">
          <span>Foods: {summary.totalFoods}</span>
          <span>Orders: {summary.totalOrders}</span>
          <span>Pending: {summary.pendingOrders}</span>
        </div>
        <button type="button" className="admin-logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="admin-tabs">
        <button className={activeTab === "add" ? "active" : ""} onClick={() => setActiveTab("add")}>Add Items</button>
        <button className={activeTab === "list" ? "active" : ""} onClick={() => setActiveTab("list")}>List Items</button>
        <button className={activeTab === "orders" ? "active" : ""} onClick={() => setActiveTab("orders")}>Orders</button>
      </div>

      {activeTab === "add" && (
        <form className="admin-card add-form" onSubmit={submitAddFood}>
          <h2>Add Food Item</h2>
          <input name="name" value={addForm.name} onChange={onAddChange} placeholder="Name" required />
          <input name="description" value={addForm.description} onChange={onAddChange} placeholder="Description" required />
          <div className="split-row">
            <select name="category" value={addForm.category} onChange={onAddChange} required>
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <input name="price" value={addForm.price} onChange={onAddChange} placeholder="Price" required />
          </div>
          <input name="image" type="file" accept="image/*" onChange={onAddChange} required />
          <button type="submit" disabled={loading}>{loading ? "Adding..." : "Add Item"}</button>
          {message && <p className="admin-note">{message}</p>}
        </form>
      )}

      {activeTab === "list" && (
        <div className="admin-card">
          <h2>All Foods List</h2>
          {foods.length === 0 ? (
            <p>No food items found.</p>
          ) : (
            <div className="food-table-wrap">
              <table className="food-admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {foods.map((food) => (
                    <tr key={food._id}>
                      <td>
                        <img src={`${apiUrl}/uploads/${food.image}`} alt={food.name} className="food-table-image" />
                      </td>
                      <td>{food.name}</td>
                      <td>{food.category}</td>
                      <td>Rs {food.price}</td>
                      <td>
                        <button className="danger-btn" type="button" onClick={() => removeFoodItem(food._id)}>
                          x
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "orders" && (
        <div className="admin-card">
          <h2>Orders</h2>
          <div className="orders-wrap">
            {orders.map((order) => (
              <div className="order-admin-card" key={order._id}>
                <div className="order-head">
                  <p><b>Order:</b> {order._id}</p>
                  <p><b>Total:</b> Rs {order.amount}</p>
                </div>

                <p className="order-user-line">
                  <b>User:</b> {order.userId?.name || "N/A"} | {order.userId?.email || "N/A"} | {order.address?.phone || "N/A"}
                </p>
                <p className="order-user-line">
                  <b>Address:</b> {order.address?.street}, {order.address?.city}, {order.address?.state}, {order.address?.country}
                </p>

                <div className="order-items-mini">
                  {order.items.map((item, idx) => (
                    <p key={`${order._id}-${idx}`}>
                      {item.name} x {item.quantity} = Rs {item.price * item.quantity}
                    </p>
                  ))}
                </div>

                <div className="status-row">
                  <label htmlFor={`status-${order._id}`}>Status</label>
                  <select
                    id={`status-${order._id}`}
                    value={order.status}
                    onChange={(e) => onChangeOrderStatus(order._id, e.target.value)}
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p>No orders found.</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
