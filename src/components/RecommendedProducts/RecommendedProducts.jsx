import React from "react";
import { Package } from "lucide-react";


const RecommendedProducts = ({ products, onProductClick }) => (
  <div className="dashboard-card">
    <div className="card-header">
      <h2 className="card-title">
        <Package size={20} />
        Recommended Products
      </h2>
    </div>
    <div className="item-list">
      {products.map((product) => (
        <div
          key={product.productID}
          className="item-card"
          onClick={() => onProductClick(product)}
        >
          <h3 className="item-title">{product.productName}</h3>
          <p>KSH {product.productPrice}</p>
        </div>
      ))}
    </div>
  </div>
);

export default RecommendedProducts;
