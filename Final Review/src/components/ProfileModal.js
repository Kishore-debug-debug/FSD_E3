import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './ProfileModal.css';

function ProfileModal({ currentUser, onUpdate, onDelete, onClose }) {
  const [formData, setFormData] = useState({
    name: currentUser.name,
    password: currentUser.password
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.password) {
      alert("Name and password cannot be empty.");
      return;
    }
    onUpdate(formData.name, formData.password);
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay fade-in">
      <div className="profile-modal glass-card fade-in">
        <button className="close-btn" onClick={onClose}>×</button>
        
        <h2>⚙️ Profile Settings</h2>
        <p className="profile-email">{currentUser.email}</p>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <input 
              type="text" 
              name="name" 
              className="form-input" 
              placeholder=" " 
              value={formData.name} 
              onChange={handleChange} 
            />
            <label className="form-label">Full Name</label>
          </div>

          <div className="form-group">
            <input 
              type="text" 
              name="password" 
              className="form-input" 
              placeholder=" " 
              value={formData.password} 
              onChange={handleChange} 
            />
            <label className="form-label">Password</label>
          </div>

          <button type="submit" className="btn btn-primary" style={{width: '100%'}}>Save Changes</button>
        </form>

        {!currentUser.isAdmin && (
          <div className="danger-zone">
            <h3>Danger Zone</h3>
            {!showDeleteConfirm ? (
              <button className="btn btn-danger-outline" onClick={() => setShowDeleteConfirm(true)}>
                Delete Account Permanently
              </button>
            ) : (
              <div className="delete-confirm-box fade-in">
                <p>Are you absolutely sure? This will delete your account and instantly cancel all your booked tickets.</p>
                <div style={{display: 'flex', gap: '10px', marginTop: '15px'}}>
                  <button className="btn btn-secondary" style={{flex: 1}} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                  <button className="btn btn-danger" style={{flex: 1}} onClick={onDelete}>Yes, Delete</button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>,
    document.body
  );
}

export default ProfileModal;
