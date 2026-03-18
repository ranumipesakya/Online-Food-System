
import { createContext, useState, useEffect } from "react";

export const StoreContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const StoreContextProvider = (props) => {
  const [foodList, setFoodList] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [adminDashboard, setAdminDashboard] = useState(null);

  const addToCart = (itemId) => {
    if (!cartItems[itemId]) {
      setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
    } else {
      setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    }
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
  };

  const clearCart = () => {
    setCartItems({});
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        const itemInfo = foodList.find((product) => product._id === item);
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[item];
        }
      }
    }
    return totalAmount;
  };

  const fetchFoodList = async () => {
    try {
      const response = await fetch(`${API_URL}/api/food/list`);
      const data = await response.json();
      if (data.success) {
        const normalizedFoods = (data.foods || []).map((item) => ({
          ...item,
          image: item.image?.startsWith("http") ? item.image : `${API_URL}/uploads/${item.image}`,
        }));
        setFoodList(normalizedFoods);
      }
    } catch (error) {
      setFoodList([]);
    }
  };

  const fetchUserProfile = async (authToken) => {
    try {
      const response = await fetch(`${API_URL}/api/user/profile`, {
        method: "GET",
        headers: {
          token: authToken,
        },
      });

      const data = await response.json();
      if (response.status === 401) {
        setToken("");
        setUser(null);
        setAdminDashboard(null);
        return;
      }

      if (data.success) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    }
  };

  const logout = () => {
    setToken("");
    setUser(null);
    setAdminDashboard(null);
    localStorage.removeItem("token");
  };

  const updateUserProfile = async (profileData) => {
    try {
      const response = await fetch(`${API_URL}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          token,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        return { success: true, message: data.message };
      }

      return { success: false, message: data.message || "Failed to update profile." };
    } catch (error) {
      return { success: false, message: "Cannot connect to server." };
    }
  };

  const fetchAdminDashboard = async () => {
    try {
      const response = await fetch(`${API_URL}/api/user/admin/dashboard`, {
        method: "GET",
        headers: {
          token,
        },
      });

      const data = await response.json();
      if (data.success) {
        setAdminDashboard(data.dashboard);
        return { success: true, dashboard: data.dashboard };
      }

      return { success: false, message: data.message || "Failed to load admin dashboard." };
    } catch (error) {
      return { success: false, message: "Cannot connect to server." };
    }
  };

  const createOrder = async (orderData) => {
    try {
      const response = await fetch(`${API_URL}/api/order/place`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token,
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      if (response.status === 401) {
        setToken("");
        setUser(null);
        setAdminDashboard(null);
        return { success: false, message: "Session expired. Please login again." };
      }

      if (data.success) {
        return { success: true, order: data.order };
      }

      return { success: false, message: data.message || "Failed to place order." };
    } catch (error) {
      return { success: false, message: "Cannot connect to server." };
    }
  };

  const fetchUserOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/api/order/user`, {
        method: "GET",
        headers: {
          token,
        },
      });

      const data = await response.json();
      if (data.success) {
        return { success: true, orders: data.orders };
      }

      return { success: false, message: data.message || "Failed to load orders." };
    } catch (error) {
      return { success: false, message: "Cannot connect to server." };
    }
  };

  const fetchUserOrderById = async (orderId) => {
    try {
      const response = await fetch(`${API_URL}/api/order/user/${orderId}`, {
        method: "GET",
        headers: {
          token,
        },
      });

      const data = await response.json();
      if (data.success) {
        return { success: true, order: data.order };
      }

      return { success: false, message: data.message || "Failed to load order." };
    } catch (error) {
      return { success: false, message: "Cannot connect to server." };
    }
  };

  const fetchAdminOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/api/order/admin`, {
        method: "GET",
        headers: {
          token,
        },
      });

      const data = await response.json();
      if (data.success) {
        return { success: true, orders: data.orders };
      }

      return { success: false, message: data.message || "Failed to load admin orders." };
    } catch (error) {
      return { success: false, message: "Cannot connect to server." };
    }
  };

  const updateAdminOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(`${API_URL}/api/order/admin/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          token,
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      if (data.success) {
        return { success: true, order: data.order };
      }

      return { success: false, message: data.message || "Failed to update order status." };
    } catch (error) {
      return { success: false, message: "Cannot connect to server." };
    }
  };

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      fetchUserProfile(token);
    } else {
      localStorage.removeItem("token");
      setUser(null);
    }
  }, [token]);

  useEffect(() => {
    fetchFoodList();
    const intervalId = setInterval(fetchFoodList, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const contextValue = {
    food_list: foodList,
    fetchFoodList,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    clearCart,
    getTotalCartAmount,
    apiUrl: API_URL,
    token,
    setToken,
    user,
    setUser,
    adminDashboard,
    setAdminDashboard,
    fetchUserProfile,
    fetchAdminDashboard,
    createOrder,
    fetchUserOrders,
    fetchUserOrderById,
    fetchAdminOrders,
    updateAdminOrderStatus,
    logout,
    updateUserProfile,
  };

  return <StoreContext.Provider value={contextValue}>{props.children}</StoreContext.Provider>;
};

export default StoreContextProvider;
