import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/marketPlace.css";
import { FaCartShopping } from "react-icons/fa6";
import Navbar from "../components/navbar";
import CartModal from "../components/CartModal/CartModal";

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("userToken")
  );
  const [userRole, setUserRole] = useState(null); // Store the user's role
  const [showCartModal, setShowCartModal] = useState(false); // For showing cart modal
  const [isCartAnimated, setIsCartAnimated] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/products?page=${page}&limit=10&category=${filter}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        setProducts(data.products);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [page, filter]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleFilterChange = (category) => {
    setFilter(category);
    setPage(1);
  };

  const handleAddToCart = (product) => {
    if (!isLoggedIn) {
      navigate("/login", { state: { redirectTo: "/marketplace" } });
      return;
    }

    setCartItems((prevCartItems) => [...prevCartItems, product]);

    // Trigger animation
    setIsCartAnimated(true);
    setTimeout(() => setIsCartAnimated(false), 500); // Reset animation after 500ms
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

  const handleCartClick = async () => {
    if (!isLoggedIn) {
      navigate("/login", { state: { redirectTo: "/marketplace" } });
      return;
    }

    try {
      const token = localStorage.getItem("userToken");
      const response = await fetch("http://localhost:4000/api/user-profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.role);
        console.log("User profile response:", data);
        setUserRole(data.role); // Update user role


        if (data.role === "farmer" || data.role === "worker") {
          setShowCartModal(true); // Show the CartModal if the user is valid
        } else {
          // Invalidate session if the user role is invalid
          alert("Session invalid. Please log in again.");
          localStorage.removeItem("userToken");
          setIsLoggedIn(false);
          navigate("/login");
        }
      } else {
        // Handle invalid token or session
        alert("Session expired. Please log in again.");
        localStorage.removeItem("userToken");
        setIsLoggedIn(false);
        navigate("/login");
      }
    } catch (error) {
      console.error("Error validating session:", error);
      alert("An error occurred. Please log in again.");
      localStorage.removeItem("userToken");
      setIsLoggedIn(false);
      navigate("/login");
    }
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
    <div className="marketplace">
      <Navbar />
      <header className="header">
        <h1 className="title">Shop Products for Agriculture</h1>
        <div className="categories">
          <button onClick={() => handleFilterChange("")}>All</button>
          <button onClick={() => handleFilterChange("Fertilizers")}>Fertilizers</button>
          <button onClick={() => handleFilterChange("Seeds")}>Seeds</button>
          <button onClick={() => handleFilterChange("Pesticides")}>Pesticides</button>
        </div>
      </header>

      <section className="products">
        <div className="product-grid">
          {products.map((product) => (
            <div className="product-card" key={product.productID}>
              <img
                className="product-image"
                src={product.imageURL}
                alt={product.productName}
              />
              <div className="product-details">
                <h3 className="product-name">{product.productName}</h3>
                <p className="vendor-name">Vendor: {product.vendorName}</p>
                <div className="product-price">
                  <span className="price">KSHS {product.productPrice}</span>
                </div>
                <button
                  className="add-to-cart"
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="pagination">
        <button onClick={() => handlePageChange(1)} disabled={page === 1}>
          First
        </button>
        <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>
          Next
        </button>
        <button onClick={() => handlePageChange(totalPages)} disabled={page === totalPages}>
          Last
        </button>
      </footer>

      {isLoggedIn && (
        <div
          className={`cart-button ${isCartAnimated ? "cart-button-animate" : ""}`}
          onClick={handleCartClick}
        >
          <div
            className={`cart-icon ${
              isCartAnimated ? "cart-icon-animate" : ""
            }`}
          >
            <FaCartShopping size={30} />
            <span className="cart-count">{cartItems.length}</span>
          </div>
        </div>
      )}

      {showCartModal && (
        <CartModal
          cartItems={cartItems}
          onClose={() => setShowCartModal(false)}
          onRemoveItem={handleRemoveItem} // Pass the function here
          onPlaceOrder={handlePlaceOrder}
        />
      )}
    </div>
  );
};

export default Marketplace;
