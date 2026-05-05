import React, { useState, useEffect } from "react";
import PaymentModal from "./PaymentModal";

function BookingForm({ event, onBookingComplete, showToast, currentUser, requireAuth }) {
  const [form, setForm] = useState({
    email: "",
    department: ""
  });

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatNames, setSeatNames] = useState({});

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [pendingBookingDetails, setPendingBookingDetails] = useState(null);
  const [pendingUpdatedEvent, setPendingUpdatedEvent] = useState(null);

  // Reset local state when event changes
  useEffect(() => {
    setSelectedSeats([]);
    setSeatNames({});
  }, [event.id]);

  // Auto-fill email from logged-in user
  useEffect(() => {
    if (currentUser) {
      setForm(prev => ({ ...prev, email: currentUser.email }));
    }
  }, [currentUser]);

  // Handle Form Input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle Dynamic Seat Input
  const handleSeatNameChange = (seatId, value) => {
    setSeatNames({ ...seatNames, [seatId]: value });
  };

  // Seat toggle logic
  const handleSeatClick = (seatNumber) => {
    const seatId = seatNumber.toString();
    if (event.bookedSeats.includes(seatId)) return; // Already booked
    
    if (selectedSeats.includes(seatId)) {
      // Remove seat
      setSelectedSeats(selectedSeats.filter(s => s !== seatId));
      
      // Cleanup name mapping
      const updatedNames = { ...seatNames };
      delete updatedNames[seatId];
      setSeatNames(updatedNames);
    } else {
      // Add seat
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  // Validation
  const validate = () => {
    if (!form.email || !form.department) {
      return "Please fill your email and department.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(form.email)) {
      return "Please enter a valid email address.";
    }

    if (selectedSeats.length === 0) {
      return "Please select at least one seat.";
    }

    for (let seat of selectedSeats) {
       if (!seatNames[seat] || seatNames[seat].trim() === "") {
          return `Please enter a passenger name for Seat ${seat}.`;
       }
    }

    return "";
  };

  // Pre-Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!currentUser) {
      requireAuth();
      return;
    }

    const err = validate();
    if (err) {
      showToast(err, "error");
      return;
    }

    const total = selectedSeats.length * event.price;

    const passengers = selectedSeats.map(seat => ({
       seat: seat,
       name: seatNames[seat].trim()
    }));

    const bookingDetails = {
      eventId: event.id,
      eventName: event.name,
      passengers: passengers,
      email: form.email,
      department: form.department,
      tickets: selectedSeats.length,
      seats: selectedSeats,
      total: total
    };

    const updatedEvent = {
      ...event,
      availableTickets: event.availableTickets - selectedSeats.length,
      bookedSeats: [...event.bookedSeats, ...selectedSeats]
    };

    // Store pending state and trigger payment modal
    setPendingBookingDetails(bookingDetails);
    setPendingUpdatedEvent(updatedEvent);
    setIsPaymentModalOpen(true);
  };

  // Payment Success Handler
  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    onBookingComplete(pendingBookingDetails, pendingUpdatedEvent);

    // Reset Form
    setForm({
      email: "",
      department: ""
    });
    setSelectedSeats([]);
    setSeatNames({});
  };

  const handleReset = () => {
    setForm({
      email: "",
      department: ""
    });
    setSelectedSeats([]);
    setSeatNames({});
  };

  // Generate an array for the seats map
  const renderSeats = () => {
    let seats = [];
    for (let i = 1; i <= event.totalSeats; i++) {
      const seatId = i.toString();
      const isBooked = event.bookedSeats.includes(seatId);
      const isSelected = selectedSeats.includes(seatId);
      
      let classNames = "seat";
      if (isBooked) classNames += " booked";
      if (isSelected) classNames += " selected";

      seats.push(
        <div 
          key={i} 
          className={classNames} 
          onClick={() => handleSeatClick(i)}
          title={isBooked ? "Booked" : `Seat ${i}`}
        >
          {i}
        </div>
      );
    }
    return seats;
  };

  return (
    <>
      {isPaymentModalOpen && (
        <PaymentModal 
          amount={selectedSeats.length * event.price}
          onPaymentSuccess={handlePaymentSuccess}
          onCancel={() => setIsPaymentModalOpen(false)}
        />
      )}

      <div className="glass-card">
        <h2 style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          Secure Your Spot
          <span style={{fontSize: '12px', background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '10px', color: 'var(--text-muted)'}}>
            {event.name}
          </span>
        </h2>

        <div className="seat-map fade-in">
          <div style={{textAlign: 'center', marginBottom: '20px'}}>
             <h3 style={{fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px'}}>Stage / Screen</h3>
             <div className="screen"></div>
          </div>
          
          <div className="seats-grid">
            {renderSeats()}
          </div>
          
          <div style={{display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '25px', fontSize: '11px', fontWeight: '500', textTransform: 'uppercase'}}>
             <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
               <div className="seat" style={{width: '12px', height: '12px', cursor: 'default', margin: 0}}></div> Available
             </div>
             <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
               <div className="seat selected" style={{width: '12px', height: '12px', cursor: 'default', margin: 0}}></div> Selected
             </div>
             <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
               <div className="seat booked" style={{width: '12px', height: '12px', cursor: 'default', margin: 0}}></div> Occupied
             </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{marginTop: '30px'}}>
          
          {/* Dynamic Passenger Inputs */}
          {selectedSeats.length > 0 && (
             <div style={{ marginBottom: "20px", padding: "15px", background: "rgba(0,0,0,0.2)", borderRadius: "10px" }}>
               <h4 style={{marginTop: 0, marginBottom: "15px", fontSize: "14px", color: "var(--text-muted)"}}>Passenger Details</h4>
               {selectedSeats.map(seat => (
                  <div className="form-group" key={seat}>
                    <input
                      id={`name-${seat}`}
                      type="text"
                      className="form-input"
                      placeholder=" "
                      value={seatNames[seat] || ""}
                      onChange={(e) => handleSeatNameChange(seat, e.target.value)}
                    />
                    <label htmlFor={`name-${seat}`} className="form-label">Name for Seat {seat}</label>
                  </div>
               ))}
             </div>
          )}

          <div className="form-group">
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder=" "
              value={form.email}
              onChange={handleChange}
            />
            <label htmlFor="email" className="form-label">Contact Email Address</label>
          </div>

          <div className="form-group">
            <input
              id="department"
              name="department"
              type="text"
              className="form-input"
              placeholder=" "
              value={form.department}
              onChange={handleChange}
            />
            <label htmlFor="department" className="form-label">Department / Organization</label>
          </div>

          <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{color: "var(--text-muted)"}}>Selected:</span> {selectedSeats.length} ticket(s)
            </div>
            <div>
              <span style={{color: "var(--text-muted)"}}>Total:</span> <span style={{color: 'var(--success)', fontWeight: 'bold', fontSize: '1.2em'}}>₹{selectedSeats.length * event.price}</span>
            </div>
          </div>

          <div className="btn-group">
            <button type="button" className="btn btn-secondary" onClick={handleReset}>Reset</button>
            <button type="submit" className="btn btn-primary" disabled={event.availableTickets === 0 || selectedSeats.length === 0}>
              {event.availableTickets === 0 ? "Sold Out" : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default BookingForm;