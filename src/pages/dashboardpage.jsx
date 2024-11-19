import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header/Header";
import UserProfileModal from "../components/UserProfileModal/UserProfileModal";
import CartModal from "../components/CartModal/CartModal";
import RecommendedProducts from "../components/RecommendedProducts/RecommendedProducts";
import Tooltip from "../components/ToolTip1/ToolTip";
import LogoutButton from "../components/LogoutButton/LogoutButton";
import "./styles/farmerDashboard.css";

const FarmerDashboard = () => {
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/products?recommended=true");
        const data = await response.json();
        setRecommendedProducts(data.products);
      } catch (error) {
        console.error("Error fetching recommended products:", error);
      }
    };
    fetchRecommendedProducts();
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("userToken");
        const response = await fetch("http://localhost:4000/api/user-profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setUserProfile(data.user);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    fetchUserProfile();
  }, []);

  const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    navigate("/login");
  };

  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const response = await fetch("http://localhost:4000/api/farmer_cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setCartItems(data);
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  const handleAddToCart = async (productID, quantity) => {
    try {
      const token = localStorage.getItem("userToken");
      await fetch("http://localhost:4000/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productID, quantity }),
      });
      fetchCartItems();
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const handleTooltip = (product) => {
    setTooltip({
      product,
      quantity: 1,
      price: product.productPrice,
    });
  };
  const handleRemoveItem = async (cartID) => {
    try {
      const token = localStorage.getItem("userToken");
      await fetch(`http://localhost:4000/api/cart/${cartID}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchCartItems(); // Refresh cart items after deletion
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };
  
  const handlePlaceOrder = async (selectedItems) => {
    try {
      const token = localStorage.getItem("userToken");
  
      // Prepare the data for the order
      const orderData = selectedItems.map((item) => ({
        productID: item.productID,
        vendorID: item.vendorID,
        quantity: item.quantity,
      }));
  
      // Send the order to the backend
      const response = await fetch("http://localhost:4000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ products: orderData }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // If the order was placed successfully, delete the selected items from the cart
        await Promise.all(
          selectedItems.map(async (item) => {
            await fetch(`http://localhost:4000/api/cart/${item.cartID}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
          })
        );
  
        alert("Order placed successfully! The vendor has been notified.");
        fetchCartItems(); // Refresh the cart to remove the deleted items
      } else {
        console.error("Error placing order:", data.message);
        alert("Failed to place the order. Please try again.");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place the order. Please try again.");
    }
  };
  
  
  return (
    <div className="dashboard-container">
      <Header
        onMarketClick={() => navigate("/market")}
        onWorkersClick={() => navigate("/jobmatching")}
        onCartClick={() => { setShowCartModal(true); fetchCartItems(); }}
        onProfileClick={() => setShowProfile(true)}
      />
      <div className="cards-grid">
        <RecommendedProducts
          products={recommendedProducts}
          onProductClick={handleTooltip}
        />
      </div>
      <LogoutButton onLogout={handleLogout} />
      {showProfile && (
        <UserProfileModal
          userProfile={userProfile}
          onClose={() => setShowProfile(false)}
          onEdit={() => console.log("Edit Profile")}
        />
      )}
      {showCartModal && (
        <CartModal
          cartItems={cartItems}
          onClose={() => setShowCartModal(false)}
          onRemoveItem={handleRemoveItem} // Pass the function here
          onPlaceOrder={handlePlaceOrder}
        />
      )}
      {tooltip && (
        <Tooltip
          tooltip={tooltip}
          onClose={() => setTooltip(null)}
          onAddToCart={handleAddToCart}
          onQuantityChange={(quantity) => setTooltip({ ...tooltip, quantity })}
        />
      )}
    </div>
  );
};

export default FarmerDashboard;
