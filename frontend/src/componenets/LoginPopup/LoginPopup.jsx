import React, { useContext, useState } from "react";
import "./LoginPopup.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";

const LoginPopup = ({ setShowLogin }) => {
  const navigate = useNavigate();
  const [currState, setCurrState] = useState("Login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const { apiUrl, setToken, setUser } = useContext(StoreContext);

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setError("");

    const endpoint = currState === "Login" ? "login" : "register";

    try {
      const response = await fetch(`${apiUrl}/api/user/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const rawBody = await response.text();
      let data = {};

      try {
        data = rawBody ? JSON.parse(rawBody) : {};
      } catch (parseError) {
        data = {};
      }

      if (!response.ok || !data.success) {
        setError(data.message || `Request failed (${response.status}).`);
        return;
      }

      setToken(data.token);
      setUser(data.user);
      setShowLogin(false);
      setFormData({ name: "", email: "", phone: "", password: "", role: "user" });
      if (data.user?.role === "admin") {
        navigate("/admin");
      }
    } catch (submitError) {
      setError("Cannot connect to server. Check backend is running.");
    }
  };

  return (
    <div className="login-popup" onClick={() => setShowLogin(false)}>
      <form className="login-popup-container" onClick={(e) => e.stopPropagation()} onSubmit={onSubmitHandler}>
        <div className="login-popup-title">
          <h2>{currState}</h2>
          <span className="close-btn" onClick={() => setShowLogin(false)}>
            x
          </span>
        </div>
        <div className="login-popup-inputs">
          {currState === "Sign Up" && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Your name"
                value={formData.name}
                onChange={onChangeHandler}
                required
              />
              <select name="role" value={formData.role} onChange={onChangeHandler} required>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              {formData.role === "user" && (
                <input
                  type="text"
                  name="phone"
                  placeholder="Your phone number"
                  value={formData.phone}
                  onChange={onChangeHandler}
                  required
                />
              )}
            </>
          )}
          <input
            type="email"
            name="email"
            placeholder="Your email"
            value={formData.email}
            onChange={onChangeHandler}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={onChangeHandler}
            required
          />
        </div>
        {error && (
          <p className="switch-state" style={{ color: "red" }}>
            {error}
          </p>
        )}
        <button type="submit">{currState === "Sign Up" ? "Create account" : "Login"}</button>
        <div className="login-popup-condition">
          <input type="checkbox" required />
          <p>By continuing, I agree to the terms of use & privacy policy.</p>
        </div>
        {currState === "Login" ? (
          <p className="switch-state">
            Create a new account? <span onClick={() => setCurrState("Sign Up")}>Click here</span>
          </p>
        ) : (
          <p className="switch-state">
            Already have an account? <span onClick={() => setCurrState("Login")}>Login here</span>
          </p>
        )}
      </form>
    </div>
  );
};

export default LoginPopup;
