import React from "react";
import { X, Plus, Minus } from "lucide-react";

const Tooltip = ({ tooltip, onClose, onAddToCart, onQuantityChange }) => {
  const [isAdded, setIsAdded] = React.useState(false);

  const handleAddClick = async () => {
    try {
      await onAddToCart(tooltip.product.productID, tooltip.quantity);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 3000); // Reset after 3 seconds
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  return (
    <div className="tooltip centered">
      <button onClick={onClose}>
        <X size={16} />
      </button>
      <div>
        <h4>{tooltip.product.productName}</h4>
        <p>Stock: {tooltip.product.stock}</p>
        <div>
          <button onClick={() => onQuantityChange(Math.max(tooltip.quantity - 1, 1))}>
            <Minus size={16} />
          </button>
          <span>{tooltip.quantity}</span>
          <button onClick={() => onQuantityChange(tooltip.quantity + 1)}>
            <Plus size={16} />
          </button>
        </div>
        <p>Total Price: KSH {tooltip.price}</p>
        <button
          onClick={handleAddClick}
          className={isAdded ? "added" : ""}
        >
          {isAdded ? "Added" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default Tooltip;
