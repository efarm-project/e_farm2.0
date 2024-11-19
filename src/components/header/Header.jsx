import React from "react";
import { User, ShoppingBag, Users, ShoppingCart } from "lucide-react";


const Header = ({ onMarketClick, onWorkersClick, onCartClick, onProfileClick }) => (
  <div className="header-container">
    <div className="button-group">
      <button className="dashboard-button" onClick={onMarketClick}>
        <ShoppingBag size={20} />
        Market
      </button>
      {onWorkersClick && (
        <button className="dashboard-button" onClick={onWorkersClick}>
          <Users size={20} />
          Workers
        </button>
      )}
    </div>
    {onCartClick && (
      <div className="cart-icon" onClick={onCartClick}>
        <ShoppingCart size={24} color="#16a34a" />
      </div>
    )}
    <div className="user-profile" onClick={onProfileClick}>
      <User size={24} color="#16a34a" />
    </div>
  </div>
);

export default Header;
