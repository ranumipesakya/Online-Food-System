import React, { useContext } from 'react'
import './Cart.css'
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {

    const {cartItems, food_list, removeFromCart} = useContext(StoreContext);
    const navigate = useNavigate();

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                let itemInfo = food_list.find((product) => product._id === item);
                if (itemInfo) {
                    totalAmount += itemInfo.price * cartItems[item];
                }
            }
        }
        return totalAmount;
    }

    return (
        <div className='cart'>
            <div className="cart-items">
                <div className="cart-items-title">
                    <p>Items</p>
                    <p>Title</p>
                    <p>Price</p>
                    <p>Quantity</p>
                    <p>Total</p>
                    <p>Remove</p>
                </div>
                <br/>
                <hr/>
                {food_list.map((item, index) => {
                    if (cartItems[item._id] > 0) {
                        return (
                            <div key={index}>
                                <div className="cart-items-title cart-items-item">
                                    <img src={item.image} alt=""/>
                                    <p>{item.name}</p>
                                    <p>Rs {item.price}</p>
                                    <p>{cartItems[item._id]}</p>
                                    <p>Rs {item.price * cartItems[item._id]}</p>
                                    <p onClick={() => removeFromCart(item._id)}>x</p>
                                </div>
                                <hr/>
                            </div>
                        )
                    }
                })}
            </div>
            <div className="cart-bottom">
                <div className="cart-total">
                    <h2>Cart Totals</h2>
                    <div className="cart-total-details">
                        <div>
                            <p>Subtotal</p>
                            <p>Rs {getTotalCartAmount()}</p>
                        </div>
                        <hr/>
                        <div>
                            <p>Delivery Fee</p>
                            <p>Rs {getTotalCartAmount() === 0 ? 0 : 100}</p>
                        </div>
                        <hr/>
                        <div>
                            <b>Total</b>
                            <b>Rs {getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 100}</b>
                        </div>
                    </div>
                    <button onClick={() => navigate('/order')}>PROCEED TO CHECKOUT</button>
                </div>
                <div className="cart-promocode">
                    <div>
                        <p>If you have a promo code, Enter it here</p>
                        <div className="cart-promocode-input">
                            <input type="text" placeholder='promo code'/>
                            <button>Submit</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Cart
