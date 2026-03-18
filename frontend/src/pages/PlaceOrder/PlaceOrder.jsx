import React, { useContext, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";

const PlaceOrder = () => {
  const { getTotalCartAmount, cartItems, food_list } = useContext(StoreContext);
  const navigate = useNavigate();
  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const deliveryFee = getTotalCartAmount() === 0 ? 0 : 100;
  const totalAmount = getTotalCartAmount() + deliveryFee;
  const orderedItems = food_list.filter((item) => cartItems[item._id] > 0);

  const handleProceedToPayment = (event) => {
    event.preventDefault();
    navigate("/payment", { state: { address } });
  };

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form className="place-order" onSubmit={handleProceedToPayment}>
      <div className="place-order-left">
        <button type="button" className="back-btn" onClick={() => navigate(-1)}>
          <span>{"<"}</span> Back
        </button>

        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input name="firstName" value={address.firstName} onChange={onChangeHandler} type="text" placeholder="First name" required />
          <input name="lastName" value={address.lastName} onChange={onChangeHandler} type="text" placeholder="Last name" required />
        </div>
        <input name="email" value={address.email} onChange={onChangeHandler} type="email" placeholder="Email address" required />
        <input name="street" value={address.street} onChange={onChangeHandler} type="text" placeholder="Street" required />
        <div className="multi-fields">
          <input name="city" value={address.city} onChange={onChangeHandler} type="text" placeholder="City" required />
          <input name="state" value={address.state} onChange={onChangeHandler} type="text" placeholder="State" required />
        </div>
        <div className="multi-fields">
          <input name="zipcode" value={address.zipcode} onChange={onChangeHandler} type="text" placeholder="Zip code" required />
          <input name="country" value={address.country} onChange={onChangeHandler} type="text" placeholder="Country" required />
        </div>
        <input name="phone" value={address.phone} onChange={onChangeHandler} type="text" placeholder="Phone" required />
      </div>

      <div className="place-order-right">
        <div className="cart-total order-card">
          <h2>Order Details</h2>

          <div className="order-items-list">
            {orderedItems.length === 0 && <p className="empty-order">Your cart is empty.</p>}

            {orderedItems.map((item) => (
              <div className="order-item-row" key={item._id}>
                <div className="order-item-left">
                  <img src={item.image} alt={item.name} />
                  <div>
                    <p className="item-name">{item.name}</p>
                    <p className="item-qty">Qty {cartItems[item._id]}</p>
                  </div>
                </div>
                <p className="item-total">Rs {item.price * cartItems[item._id]}</p>
              </div>
            ))}
          </div>

          <hr />

          <div className="cart-total-details">
            <div>
              <p>Subtotal</p>
              <p>Rs {getTotalCartAmount()}</p>
            </div>
            <hr />
            <div>
              <p>Delivery Fee</p>
              <p>Rs {deliveryFee}</p>
            </div>
            <hr />
            <div>
              <b>Total</b>
              <b>Rs {totalAmount}</b>
            </div>
          </div>
          <button type="submit">PROCEED TO PAYMENT</button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
