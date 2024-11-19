import React from "react";
import { User } from "lucide-react";


const UserProfileModal = ({ userProfile, onClose, onEdit }) => (
  <div className="profile-modal">
    <div className="profile-content">
      <div className="profile-pic">
        <User size={60} color="#16a34a" />
      </div>
      <h3>{userProfile?.name || "Loading..."}</h3>
      <p>Phone: {userProfile?.phonenumber}</p>
      <p>Location: {userProfile?.location}</p>
      <button className="edit-button" onClick={onEdit}>
        Edit Info
      </button>
    </div>
    <div className="backdrop" onClick={onClose}></div>
  </div>
);

export default UserProfileModal;
