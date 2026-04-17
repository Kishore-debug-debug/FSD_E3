import React from 'react';
import ReactDOM from 'react-dom';
import './TicketReceipt.css';

function TicketReceipt({ booking, onClose }) {
  const handleDownload = () => {
    window.print(); // Triggers the native browser print/save-to-PDF dialog
  };

  const modalContent = (
    <div className="ticket-modal-overlay print-transparent">
      <div className="ticket-modal-content print-reset-layout">
        
        {/* The Ticket to be printed */}
        <div className="ticket-printable-area" id="ticket-print-area">
          <div className="ticket-header">
            <h2>🎟️ EventMaster Ticket</h2>
            <div className="ticket-id-badge">ID: {booking.id}</div>
          </div>
          
          <div className="ticket-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="ticket-event-details">
              <h3>{booking.eventName}</h3>
              <p>Reserved for: {booking.name || booking.email}</p>
              <p>Total Paid: ₹{booking.total}</p>
              <p>Purchased: {booking.timestamp}</p>
            </div>
            
            {/* QR CODE ADDED HERE */}
            <div className="ticket-qr">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${booking.id}`} 
                alt="Ticket QR Code" 
                style={{ borderRadius: "8px", border: "4px solid white", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}
              />
            </div>
          </div>

          <div style={{ padding: '0 30px' }}>
            <div className="ticket-seat-divider"></div>

            <div className="ticket-passengers">
              <h4>Seat Assignments ({booking.tickets} Tickets)</h4>
              <div className="passenger-grid">
                {booking.passengers && booking.passengers.map((p, idx) => (
                  <div key={idx} className="passenger-card">
                    <span className="seat-badge">Seat {p.seat}</span>
                    <span className="passenger-name">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="ticket-footer" style={{ marginTop: "20px" }}>
            Please present this ticket at the venue. Scan the code or present your ID.
          </div>
        </div>

        {/* Action Buttons (Not Printed) */}
        <div className="ticket-actions no-print">
          <p style={{textAlign: 'center', marginBottom: '15px'}}>Your ticket is confirmed and ready!</p>
          <div className="btn-group">
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
            <button className="btn btn-primary" onClick={handleDownload}>Download PDF</button>
          </div>
        </div>

      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}

export default TicketReceipt;
