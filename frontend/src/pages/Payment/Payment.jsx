import React, { useContext, useState } from 'react';
import './Payment.css';
import { StoreContext } from '../../context/StoreContext';
import { useLocation, useNavigate } from 'react-router-dom';

const Payment = () => {
    const { getTotalCartAmount, cartItems, food_list, createOrder, clearCart, token } = useContext(StoreContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [isProcessing, setIsProcessing] = useState(false);
    const [showThreeDS, setShowThreeDS] = useState(false);
    const [paymentError, setPaymentError] = useState("");

    const [paymentData, setPaymentData] = useState({
        email: '',
        cardNumber: '',
        expiry: '',
        cvc: '',
        cardName: '',
        country: 'India'
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentData({ ...paymentData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setPaymentError("");
        setIsProcessing(true);

        setTimeout(() => {
            setIsProcessing(false);
            setShowThreeDS(true);
        }, 1400);
    };

    const handleThreeDSFail = () => {
        setShowThreeDS(false);
        setPaymentError("Authentication failed. Please try again.");
    };

    const handleThreeDSComplete = () => {
        if (!token) {
            setShowThreeDS(false);
            setPaymentError("Please login before placing order.");
            return;
        }

        const address = location.state?.address;
        if (!address) {
            setShowThreeDS(false);
            setPaymentError("Delivery information is missing. Please go back and fill details.");
            return;
        }

        const orderedItems = food_list
            .filter((item) => cartItems[item._id] > 0)
            .map((item) => ({
                foodId: item._id,
                name: item.name,
                image: item.image,
                quantity: cartItems[item._id],
                price: item.price,
            }));

        const orderPayload = {
            address,
            amount: getTotalCartAmount() + 100,
            items: orderedItems,
        };

        (async () => {
            const result = await createOrder(orderPayload);
            if (!result.success) {
                setShowThreeDS(false);
                setPaymentError(result.message || "Failed to place order.");
                return;
            }

            setShowThreeDS(false);
            clearCart();
            alert("Payment Successful!");
            navigate(`/order-status/${result.order._id}`);
        })();
    };

    return (
        <div className='payment-container'>
            <div className="payment-left">
                <div className="payment-header">
                    <button type="button" className="back-arrow-btn" onClick={() => navigate(-1)}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <span className="course-badge">Order</span>
                    <span className="test-mode-tag">TEST MODE</span>
                </div>

                <p className="pay-label">Pay Order</p>
                <h1 className="amount-display">Rs {(getTotalCartAmount() + 100).toFixed(2)}</h1>

                <div className="items-summary">
                    {food_list.map((item) => {
                        if (cartItems[item._id] > 0) {
                            return (
                                <div className="summary-item" key={item._id}>
                                    <div className="item-details">
                                        <p className="name">{item.name}</p>
                                        <p className="qty">Qty {cartItems[item._id]}</p>
                                    </div>
                                    <div className="price-details">
                                        <p className="total">Rs {item.price * cartItems[item._id]}.00</p>
                                        <p className="unit">Rs {item.price}.00 each</p>
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    })}

                    <div className="summary-item delivery-row">
                        <div className="item-details">
                            <p className="name">Delivery Charge</p>
                            <p className="qty">Qty 1</p>
                        </div>
                        <p className="total">Rs 100.00</p>
                    </div>
                </div>

                <div className="stripe-footer">
                    <span>Powered by <b>stripe</b></span>
                    <div className="footer-links">
                        <span>Terms</span>
                        <span>Privacy</span>
                    </div>
                </div>
            </div>

            <div className="payment-right">
                <form className="payment-form-box" onSubmit={handleSubmit}>
                    <h2>Pay with card</h2>

                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email" onChange={handleInputChange} required placeholder="email@example.com" />
                    </div>

                    <div className="form-group">
                        <label>Card information</label>
                        <div className="stripe-card-element">
                            <div className="card-number-wrapper">
                                <input type="text" name="cardNumber" placeholder="1234 1234 1234 1234" onChange={handleInputChange} className="card-num-input" />
                                <div className="card-brand-icons">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" />
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" />
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="Amex" style={{width: '20px'}} />
                                </div>
                            </div>
                            <div className="card-extra-wrapper">
                                <input type="text" name="expiry" placeholder="MM / YY" onChange={handleInputChange} className="expiry-input" />
                                <div className="cvc-wrapper">
                                    <input type="text" name="cvc" placeholder="CVC" onChange={handleInputChange} className="cvc-input" />
                                    <svg className="cvc-icon" width="20" height="20" viewBox="0 0 24 24" fill="#aab7c4"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Cardholder name</label>
                        <input type="text" name="cardName" placeholder="Full name on card" onChange={handleInputChange} required />
                    </div>

                    
                    <button type="submit" className="stripe-pay-button">Pay</button>
                    {paymentError && <p className="payment-error">{paymentError}</p>}
                </form>
            </div>

            {isProcessing && (
                <div className="payment-overlay">
                    <div className="processing-box">Processing...</div>
                </div>
            )}

            {showThreeDS && (
                <div className="payment-overlay">
                    <div className="threeds-modal">
                        <div className="threeds-header">
                            <span>3D Secure 2 Test Page</span>
                            <button type="button" onClick={() => setShowThreeDS(false)}>CANCEL</button>
                        </div>
                        <div className="threeds-body">
                            <p>This is a test 3D Secure 2 authentication page.</p>
                            <p>Select COMPLETE to confirm payment.</p>
                        </div>
                        <div className="threeds-actions">
                            <button type="button" className="fail-btn" onClick={handleThreeDSFail}>FAIL</button>
                            <button type="button" className="complete-btn" onClick={handleThreeDSComplete}>COMPLETE</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payment;
