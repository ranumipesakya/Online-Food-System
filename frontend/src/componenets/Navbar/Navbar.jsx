import React, { useContext, useEffect, useRef, useState } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { Link } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("home");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", email: "", phone: "" });
  const [profileError, setProfileError] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const menuRef = useRef(null);
  const { getTotalCartAmount, user, logout, updateUserProfile } = useContext(StoreContext);

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || "", email: user.email || "", phone: user.phone || "" });
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileError("");
    setProfileLoading(true);

    const result = await updateUserProfile(profileForm);
    setProfileLoading(false);

    if (!result.success) {
      setProfileError(result.message);
      return;
    }

    setShowEditProfile(false);
    setShowProfileMenu(false);
  };

  return (
    <div className="navbar">
      <Link to="/">
        <img src={assets.logo} alt="" className="logo" />
      </Link>

        <ul className="navbar-menu">
          <Link to="/" onClick={() => setMenu("home")} className={menu === "home" ? "active" : ""}>
            home
          </Link>
          <a href="#explore-menu" onClick={() => setMenu("menu")} className={menu === "menu" ? "active" : ""}>
            menu
          </a>
          <a
            href="#app-download"
            onClick={() => setMenu("mobile-app")}
            className={menu === "mobile-app" ? "active" : ""}
          >
            mobile-app
          </a>
          <a href="#footer" onClick={() => setMenu("contact-us")} className={menu === "contact-us" ? "active" : ""}>
            contact-us
          </a>
        </ul>

        <div className="navbar-right">
            <div className="navbar-search-icon">
            <Link to="/cart">
              <img src={assets.basket_icon} alt="" />
            </Link>
            <div className={getTotalCartAmount() === 0 ? "" : "dot"}></div>
          </div>

          {user ? (
            <>
              {user.role === "user" && (
                <Link to="/order-status" className="order-status-link">
                  Order Status
                </Link>
              )}
              <div className="profile-menu-wrapper" ref={menuRef}>
                <button className="profile-trigger" onClick={() => setShowProfileMenu((prev) => !prev)}>
                  <img src={assets.profile_icon} alt="Profile" />
                  <span>{user.name}</span>
                </button>

                {showProfileMenu && (
                  <div className="profile-dropdown">
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setShowEditProfile(true);
                        setShowProfileMenu(false);
                      }}
                    >
                      Edit Profile
                    </button>
                    <button className="dropdown-item logout-item" onClick={logout}>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button onClick={() => setShowLogin(true)}>Sign in</button>
          )}
        </div>

      {showEditProfile && (
        <div className="profile-popup-overlay" onClick={() => setShowEditProfile(false)}>
          <form className="profile-popup-card" onClick={(e) => e.stopPropagation()} onSubmit={handleProfileSubmit}>
            <h3>Edit Profile</h3>
            <input
              type="text"
              placeholder="Your name"
              value={profileForm.name}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
            <input
              type="email"
              placeholder="Your email"
              value={profileForm.email}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
            {user?.role === "user" && (
              <input
                type="text"
                placeholder="Your phone number"
                value={profileForm.phone}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                required
              />
            )}
            {profileError && <p className="profile-error">{profileError}</p>}
            <div className="profile-popup-actions">
              <button type="button" className="cancel-btn" onClick={() => setShowEditProfile(false)}>
                Cancel
              </button>
              <button type="submit" disabled={profileLoading}>
                {profileLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Navbar;
