import React, { useState, useEffect } from "react";
import EventDetails from "./components/EventDetails";
import BookingForm from "./components/BookingForm";
import TicketReceipt from "./components/TicketReceipt";
import "./App.css";

function App() {
  const [events, setEvents] = useState([
    {
      id: 1,
      mainEvent: "Tech Fest 2026",
      subEvents: [
        {
          id: "e1",
          name: "Coding Contest",
          department: "CSE",
          date: "20 April, 10:00 AM",
          venue: "Auditorium",
          price: 100,
          availableTickets: 50,
          bookedSeats: [], // newly added for seat selection
          totalSeats: 50
        },
        {
          id: "e2",
          name: "Hackathon",
          department: "CSE",
          date: "20 April, 2:00 PM",
          venue: "Lab 2",
          price: 150,
          availableTickets: 37,
          bookedSeats: ['1', '5', '12'], // dummy pre-booked seats
          totalSeats: 40
        },
        {
          id: "e3",
          name: "Paper Presentation",
          department: "ECE", // Changed one to ECE for filter testing
          date: "21 April, 11:00 AM",
          venue: "Seminar Hall",
          price: 80,
          availableTickets: 30,
          bookedSeats: [],
          totalSeats: 30
        },
        {
          id: "e4",
          name: "Seminar",
          department: "CSE",
          date: "22 April, 09:00 AM",
          venue: "Main Auditorium",
          price: 50,
          availableTickets: 60,
          bookedSeats: [],
          totalSeats: 60
        }
      ]
    }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubEventId, setSelectedSubEventId] = useState("e1");
  const [bookingHistory, setBookingHistory] = useState([]);
  const [latestBooking, setLatestBooking] = useState(null);
  
  // Toast Notification State
  const [toast, setToast] = useState(null);

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const getFilteredEvents = () => {
    return events[0].subEvents.filter(event => 
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      event.department.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredEvents = getFilteredEvents();
  
  // Defaulting to the first filtered element or null
  const selectedEvent = filteredEvents.find(e => e.id === selectedSubEventId) || filteredEvents[0];

  const updateSelectedEvent = (updatedEvent) => {
    const newEvents = [...events];
    const subEventIndex = newEvents[0].subEvents.findIndex(e => e.id === updatedEvent.id);
    if(subEventIndex > -1){
      newEvents[0].subEvents[subEventIndex] = updatedEvent;
      setEvents(newEvents);
    }
  };

  const handleBookingComplete = (bookingDetails, updatedEvent) => {
    updateSelectedEvent(updatedEvent);
    
    // Add to history
    const finalBooking = {
      ...bookingDetails, 
      id: `TKT-${Math.floor(Math.random() * 10000)}`,
      timestamp: new Date().toLocaleString()
    };
    
    setBookingHistory([finalBooking, ...bookingHistory]);
    setLatestBooking(finalBooking);

    showToast(`Successfully booked ${bookingDetails.tickets} tickets for ${updatedEvent.name}!`, 'success');
  };

  return (
    <div className="App">
      
      {/* Ticket Receipt Overlay */}
      {latestBooking && (
        <TicketReceipt 
          booking={latestBooking} 
          onClose={() => setLatestBooking(null)} 
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`toast-container`}>
          <div className={`toast ${toast.type}`}>
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)}>×</button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="app-header">
        <h1 className="app-title">🎟️ EventMaster</h1>
        <input 
          type="text" 
          className="search-box"
          placeholder="Search events or department..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </header>

      {/* Hero Section */}
      <div className="hero fade-in">
        <h2>{events[0].mainEvent}</h2>
        <p>Book your seat for the next innovation showcase. Secure tickets with real-time availability.</p>
      </div>

      <div className="main-grid">
        {/* LEFT COLUMN: Event Details & History */}
        <div className="fade-in" style={{animationDelay: '0.1s'}}>
          
          <div className="glass-card">
            <h2>Find Event</h2>
            {filteredEvents.length > 0 ? (
              <div className="event-selector">
                <select
                  value={selectedEvent?.id || ""}
                  onChange={(e) => setSelectedSubEventId(e.target.value)}
                >
                  {filteredEvents.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name} ({event.department})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p style={{color: 'var(--danger)'}}>No events found matching "{searchQuery}"</p>
            )}
          </div>

          {selectedEvent && <EventDetails event={selectedEvent} />}
          
          {/* Booking History Section */}
          <div className="glass-card history-section fade-in" style={{animationDelay: '0.3s'}}>
            <h2>My Tickets</h2>
            {bookingHistory.length === 0 ? (
              <div className="empty-state">No tickets booked yet.</div>
            ) : (
               bookingHistory.map(ticket => (
                 <div key={ticket.id} className="ticket-item">
                    <div>
                     <div style={{fontWeight: '500', fontSize: '18px'}}>{ticket.eventName}</div>
                     <div style={{color: 'var(--text-muted)', fontSize: '14px', marginTop: '5px'}}>
                       Total: ₹{ticket.total}
                     </div>
                     <div style={{color: 'var(--text-main)', fontSize: '14px', marginTop: '5px'}}>
                       {ticket.passengers.map(p => `Seat ${p.seat}: ${p.name}`).join(' | ')}
                     </div>
                   </div>
                   <div className="ticket-id">{ticket.id}</div>
                 </div>
               ))
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Booking Form & Seat Selection */}
        <div className="fade-in" style={{animationDelay: '0.2s'}}>
          {selectedEvent ? (
            <BookingForm 
              event={selectedEvent} 
              onBookingComplete={handleBookingComplete}
              showToast={showToast}
            />
          ) : (
            <div className="glass-card">
              <p>Please select an event to book.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default App;