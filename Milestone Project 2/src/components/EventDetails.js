import React from "react";

function EventDetails({ event }) {
  
  // Calculate scarcity
  const isRunningLow = event.availableTickets <= 10 && event.availableTickets > 0;
  const isSoldOut = event.availableTickets === 0;

  return (
    <div className="glass-card">
      <h2>Event Details</h2>
      
      <div className="detail-item">
        <span className="detail-label">Event Name</span>
        <span className="detail-value">{event.name}</span>
      </div>
      
      <div className="detail-item">
        <span className="detail-label">Department</span>
        <span className="detail-value">{event.department}</span>
      </div>
      
      <div className="detail-item">
        <span className="detail-label">Date & Time</span>
        <span className="detail-value">{event.date}</span>
      </div>
      
      <div className="detail-item">
        <span className="detail-label">Venue</span>
        <span className="detail-value">{event.venue}</span>
      </div>
      
      <div className="detail-item">
        <span className="detail-label">Ticket Price</span>
        <span className="detail-value detail-price">₹{event.price}</span>
      </div>
      
      <div className="detail-item" style={{ borderBottom: "none" }}>
        <span className="detail-label">Availability</span>
        <span className={`detail-value ${isRunningLow ? 'ticket-scarcity' : ''}`}>
          {isSoldOut ? (
            <span style={{ color: "var(--danger)" }}>Sold Out!</span>
          ) : isRunningLow ? (
            <span>Only {event.availableTickets} left! 🔥</span>
          ) : (
            <span>{event.availableTickets} Tickets</span>
          )}
        </span>
      </div>
    </div>
  );
}

export default EventDetails;