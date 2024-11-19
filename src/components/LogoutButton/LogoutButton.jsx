import React from "react";
import { LogOut } from "lucide-react";


const LogoutButton = ({ onLogout }) => (
  <button className="logout-button" onClick={onLogout}>
    <LogOut size={20} />
    Logout
  </button>
);

export default LogoutButton;
