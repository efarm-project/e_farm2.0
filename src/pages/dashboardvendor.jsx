import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header/Header";
import UserProfileModal from "../components/UserProfileModal/UserProfileModal";
import LogoutButton from "../components/LogoutButton/LogoutButton";
import "./styles/vendorDashboard.css";

// Notification Icon Component
const NotificationIcon = ({ onClick, notifications }) => (
  <div className="notification-icon" onClick={onClick}>
    <i className="bell-icon">🔔</i>
    {notifications.length > 0 && (
      <span className="notification-count">{notifications.length}</span>
    )}
  </div>
);

// Notification Modal Component
const NotificationModal = ({ notifications, onClose, onMarkAsRead }) => (
  <div className="notification-modal">
    <div className="modal-content">
      <h2>Notifications</h2>
      {notifications.length === 0 ? (
        <p>No new notifications.</p>
      ) : (
        notifications.map((notification) => (
          <div key={notification.orderID} className="notification-item">
            <p>
              You have an order from {notification.farmerName} at{" "}
              {notification.order_time}
            </p>
            <button
              className="mark-as-read"
              onClick={() => onMarkAsRead(notification.orderID)}
            >
              Mark as Read
            </button>
          </div>
        ))
      )}
      <button className="close-modal" onClick={onClose}>
        Close
      </button>
    </div>
    <div className="modal-backdrop" onClick={onClose}></div>
  </div>
);

// Orders Table Component
const OrdersTable = ({ orders }) => (
  <div className="orders-table">
    <h2>Your Orders</h2>
    <table>
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Products</th>
          <th>Farmer</th>
          <th>Order Time</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order.orderID}>
            <td>{order.orderID}</td>
            <td>{order.products}</td>
            <td>{order.farmerName}</td>
            <td>{order.order_time}</td>
            <td>{order.resolved ? "Resolved" : "Pending"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const VendorDashboard = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [vendorProducts, setVendorProducts] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [showStock, setShowStock] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    productName: "",
    productPrice: "",
    stock: "",
    category: "",
    recommended: false,
    imageURL: "",
    imageFile: null,
  });
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [orders, setOrders] = useState([]);

  const navigate = useNavigate();

  const fetchVendorProducts = async () => {
    const token = localStorage.getItem("userToken");
    try {
      const response = await fetch("http://localhost:4000/api/vendor-products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setVendorProducts(data.products);
    } catch (error) {
      console.error("Error fetching vendor products:", error);
    }
  };

  const fetchNotifications = async () => {
    const token = localStorage.getItem("userToken");
    try {
      const response = await fetch(
        "http://localhost:4000/api/vendor-notifications",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const fetchOrders = async () => {
    const token = localStorage.getItem("userToken");
    try {
      const response = await fetch("http://localhost:4000/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchUserProfile = async () => {
    const token = localStorage.getItem("userToken");
    try {
      const response = await fetch("http://localhost:4000/api/user-profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setUserProfile(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const handleMarkAsRead = async (orderID) => {
    const token = localStorage.getItem("userToken");
    try {
      await fetch(`http://localhost:4000/api/mark-notification/${orderID}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    navigate("/login");
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setProductForm({ ...productForm, [name]: checked });
    } else {
      setProductForm({ ...productForm, [name]: value });
    }
  };

  const handleImageUpload = (e) => {
    setProductForm({ ...productForm, imageFile: e.target.files[0] });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!userProfile || !userProfile.id) {
      alert("User profile is not loaded. Please try again later.");
      return;
    }
    const formData = new FormData();
    formData.append("name", productForm.productName);
    formData.append("stock", productForm.stock);
    formData.append("price", productForm.productPrice);
    formData.append("recommended", productForm.recommended);
    formData.append("category", productForm.category);
    formData.append("vendorID", userProfile.id);
    if (productForm.imageFile) {
      formData.append("image", productForm.imageFile);
    } else {
      formData.append("imageURL", productForm.imageURL);
    }

    const token = localStorage.getItem("userToken");
    try {
      const response = await fetch("http://localhost:4000/api/products", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (response.ok) {
        alert("Product added successfully!");
        fetchVendorProducts();
      } else {
        const errorData = await response.json();
        alert(`Error adding product: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchVendorProducts();
    fetchNotifications();
    fetchOrders();
  }, []);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <Header onMarketClick={() => navigate("/market")} />
        <div className="dashboard-header-right">
          <NotificationIcon
            onClick={() => setShowNotifications(true)}
            notifications={notifications}
          />
          <div className="user-profile" onClick={() => setShowProfile(true)}>
            <span>{userProfile?.name || "Vendor"}</span>
          </div>
          <LogoutButton onLogout={handleLogout} />
        </div>
      </header>

      <main className="dashboard-main">
        <aside className="dashboard-aside">
          <button
            className="dashboard-button"
            onClick={() => setShowStock(!showStock)}
          >
            Manage Stock
          </button>
          <button
            className="dashboard-button"
            onClick={() => setShowAddProduct(!showAddProduct)}
          >
            {showAddProduct ? "Cancel" : "Add Product"}
          </button>
        </aside>
        <section className="dashboard-content">
          {showStock && (
            <div className="dashboard-card">
              <h2>Vendor Products</h2>
              <div className="item-list">
                {vendorProducts.map((product) => (
                  <div key={product.productID} className="item-card">
                    <h3>{product.productName}</h3>
                    <p>Stock: {product.stock}</p>
                    <p>Price: KSH {product.productPrice}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <OrdersTable orders={orders} />
        </section>
      </main>

      {showAddProduct && (
        <div className="add-product-modal">
          <form onSubmit={handleAddProduct}>
            <h2>Add New Product</h2>
            <label>Product Name:</label>
            <input
              type="text"
              name="productName"
              value={productForm.productName}
              onChange={handleInputChange}
              required
            />
            <label>Price:</label>
            <input
              type="number"
              name="productPrice"
              value={productForm.productPrice}
              onChange={handleInputChange}
              required
            />
            <label>Stock:</label>
            <input
              type="number"
              name="stock"
              value={productForm.stock}
              onChange={handleInputChange}
              required
            />
            <label>Category:</label>
            <input
              type="text"
              name="category"
              value={productForm.category}
              onChange={handleInputChange}
              required
            />
            <label>Recommended:</label>
            <input
              type="checkbox"
              name="recommended"
              checked={productForm.recommended}
              onChange={handleInputChange}
            />
            <label>Image URL:</label>
            <input
              type="text"
              name="imageURL"
              value={productForm.imageURL}
              onChange={handleInputChange}
            />
            <label>Or Upload Image:</label>
            <input
              type="file"
              name="imageFile"
              onChange={handleImageUpload}
            />
            <button type="submit">Add Product</button>
          </form>
        </div>
      )}

      {showNotifications && (
        <NotificationModal
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
          onMarkAsRead={handleMarkAsRead}
        />
      )}

      {showProfile && (
        <UserProfileModal
          userProfile={userProfile}
          onClose={() => setShowProfile(false)}
          onEdit={() => console.log("Edit Profile")}
        />
      )}
    </div>
  );
};

export default VendorDashboard;
