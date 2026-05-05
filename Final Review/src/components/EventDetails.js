import React, { useState, useEffect } from "react";

function EventDetails({ event }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const eventDate = event.date.includes('T') ? new Date(event.date) : new Date("2026-04-20T10:00:00"); // fallback for hardcoded dates
      const difference = +eventDate - +new Date();
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        
        if (days > 0) setTimeLeft(`${days}d ${hours}h`);
        else setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft("Event Started");
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();
    return () => clearInterval(timer);
  }, [event.date]);
  
  // Calculate scarcity
  const isRunningLow = event.availableTickets <= 10 && event.availableTickets > 0;
  const isSoldOut = event.availableTickets === 0;

  return (
    <div className="glass-card fade-in">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <h2 style={{margin: 0}}>Event Details</h2>
        {timeLeft !== "Event Started" && (
          <div style={{background: 'rgba(54, 209, 220, 0.1)', color: 'var(--primary)', padding: '5px 12px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold'}}>
            Starts In: {timeLeft}
          </div>
        )}
      </div>
      
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
        <span className="detail-value">
          {event.date.includes('T') ? new Date(event.date).toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : event.date}
        </span>
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