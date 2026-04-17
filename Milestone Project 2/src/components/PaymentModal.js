import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './PaymentModal.css';

function PaymentModal({ amount, onPaymentSuccess, onCancel }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');

  const handlePay = (e) => {
    e.preventDefault();
    if (cardNumber.replace(/\s/g, '').length < 16) {
      alert("Please enter a dummy 16-digit card number.");
      return;
    }

    setIsProcessing(true);

    // Simulate network delay for payment
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess();
    }, 2000); // 2 second delay
  };

  const modalContent = (
    <div className="modal-overlay">
      <div className="modal-content glass-card" style={{ padding: '30px' }}>
        <h2 style={{ marginBottom: "5px", borderBottom: 'none', paddingBottom: 0 }}>Secure Payment</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "25px" }}>This is a dummy environment.</p>
        
        {isProcessing ? (
          <div className="processing-container">
            <div className="spinner"></div>
            <h3>Processing Payment...</h3>
            <p style={{ color: "var(--text-muted)" }}>Please do not close this window.</p>
          </div>
        ) : (
          <form onSubmit={handlePay}>
            <div className="form-group" style={{ marginBottom: "25px" }}>
              <input
                id="cardNumber"
                type="text"
                className="form-input"
                placeholder=" "
                maxLength="19"
                value={cardNumber}
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, ''); // Extract only digits
                  val = val.replace(/(.{4})/g, '$1 ').trim(); // Add space mapping
                  setCardNumber(val);
                }}
              />
              <label htmlFor="cardNumber" className="form-label">Dummy Card Number</label>
            </div>
            
            <div style={{ display: 'flex', gap: '15px', marginBottom: "20px" }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <input id="expiry" type="text" className="form-input" placeholder=" " defaultValue="12/30" />
                <label htmlFor="expiry" className="form-label">Expiry</label>
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <input id="cvv" type="text" className="form-input" placeholder=" " defaultValue="123" maxLength="3" />
                <label htmlFor="cvv" className="form-label">CVV</label>
              </div>
            </div>

            <div style={{ fontSize: "18px", fontWeight: "bold", margin: "30px 0 20px 0", textAlign: "center" }}>
              Amount to Pay: <span style={{ color: "var(--success)" }}>₹{amount}</span>
            </div>

            <div className="btn-group" style={{ marginTop: "10px" }}>
              <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ background: "linear-gradient(135deg, #00e676, #1de9b6)", color: "#000" }}>
                Pay Now
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}

export default PaymentModal;
