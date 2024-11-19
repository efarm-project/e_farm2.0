import React, { useState } from "react";

const CartModal = ({ cartItems, onClose, onRemoveItem, onPlaceOrder }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handleSelectItem = (cartID) => {
    if (selectedItems.includes(cartID)) {
      setSelectedItems(selectedItems.filter((id) => id !== cartID));
    } else {
      setSelectedItems([...selectedItems, cartID]);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      await onPlaceOrder(selectedItems); // Pass selected items to the parent for processing
      setOrderPlaced(true);
      setTimeout(() => {
        setOrderPlaced(false);
        setSelectedItems([]); // Reset selected items after confirmation
      }, 3000); // Reset after 3 seconds
    } catch (error) {
      console.error("Error placing order:", error);
    }
  };

  return (
    <div className="cart-modal">
      <div className="cart-content">
        <h3>Cart Items</h3>
        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          cartItems.map((item) => (
            <div key={item.cartID} className="cart-item">
              <input
                type="checkbox"
                checked={selectedItems.includes(item.cartID)}
                onChange={() => handleSelectItem(item.cartID)}
              />
              <span><strong>Product:</strong> {item.productName}</span>
              <span><strong>Vendor:</strong> {item.vendorName}</span>
              <span><strong>Quantity:</strong> {item.quantity}</span>
              <span><strong>Total:</strong> KSH {item.productPrice * item.quantity}</span>
              <button
                className="remove-button"
                onClick={() => onRemoveItem(item.cartID)}
              >
                Remove
              </button>
            </div>
          ))
        )}
        <div className="cart-actions">
          <button onClick={onClose} className="close-button">
            Close
          </button>
          <button
            onClick={handlePlaceOrder}
            className={`place-order-button ${orderPlaced ? "order-placed" : ""}`}
            disabled={selectedItems.length === 0 || orderPlaced}
          >
            {orderPlaced ? "Order Placed" : "Place Order"}
          </button>
          {orderPlaced && <p className="order-confirmation">Vendor has received your order!</p>}
        </div>
      </div>
    </div>
  );
};

export default CartModal;
