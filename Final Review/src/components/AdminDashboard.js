import React, { useState } from 'react';
import './AdminDashboard.css';

function AdminDashboard({ events, setEvents, bookingHistory, setBookingHistory, showToast }) {
  const [activeTab, setActiveTab] = useState('manage'); // 'log', 'create', 'manage'

  // --- CREATE EVENT STATE ---
  const [newEvent, setNewEvent] = useState({
    name: '', department: '', category: 'Tech', date: '', venue: '', price: '', totalSeats: ''
  });

  // --- EDIT EVENT STATE ---
  const [editingEventId, setEditingEventId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // --- DELETE WARNING STATE ---
  const [eventToDelete, setEventToDelete] = useState(null);

  // ==========================================
  // CREATE EVENT LOGIC
  // ==========================================
  const handleFormChange = (e) => {
    setNewEvent({ ...newEvent, [e.target.name]: e.target.value });
  };

  const handleCreateEvent = (e) => {
    e.preventDefault();
    if (!newEvent.name || !newEvent.department || !newEvent.date || !newEvent.venue || !newEvent.price || !newEvent.totalSeats) {
      showToast('Please fill in all event details.', 'error');
      return;
    }

    const price = Number(newEvent.price);
    const capacity = Number(newEvent.totalSeats);

    if (price < 0 || capacity <= 0) {
      showToast('Price must be positive and Capacity must be greater than zero.', 'error');
      return;
    }

    const createdEvent = {
      id: `e${Math.floor(Math.random() * 100000)}`,
      name: newEvent.name,
      department: newEvent.department,
      category: newEvent.category,
      date: newEvent.date,
      venue: newEvent.venue,
      price: price,
      availableTickets: capacity,
      bookedSeats: [],
      totalSeats: capacity
    };

    const newEventsState = [...events];
    newEventsState[0].subEvents.push(createdEvent);
    setEvents(newEventsState);

    showToast(`Event '${createdEvent.name}' launched successfully!`, 'success');
    
    setNewEvent({ name: '', department: '', category: 'Tech', date: '', venue: '', price: '', totalSeats: '' });
    setActiveTab('manage');
  };

  // ==========================================
  // EDIT EVENT LOGIC
  // ==========================================
  const handleEditClick = (event) => {
    setEditingEventId(event.id);
    setEditFormData({ ...event });
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditSave = () => {
    const price = Number(editFormData.price);
    const capacity = Number(editFormData.totalSeats);

    if (price < 0 || capacity < editFormData.bookedSeats.length) {
      showToast(`Invalid numbers. Capacity cannot be less than currently booked seats (${editFormData.bookedSeats.length}).`, 'error');
      return;
    }

    const newEventsState = [...events];
    const subEvents = newEventsState[0].subEvents;
    const index = subEvents.findIndex(e => e.id === editingEventId);
    
    if (index > -1) {
      const oldEventName = subEvents[index].name;
      
      // Update event
      subEvents[index] = {
        ...subEvents[index],
        ...editFormData,
        price: price,
        totalSeats: capacity,
        availableTickets: capacity - subEvents[index].bookedSeats.length // Recalculate dynamically
      };
      setEvents(newEventsState);

      // If name changed, update all existing tickets in history
      if (oldEventName !== editFormData.name) {
        const updatedHistory = bookingHistory.map(ticket => {
          if (ticket.eventId === editingEventId) {
             return { ...ticket, eventName: editFormData.name };
          }
          // Legacy support if eventId wasn't saved previously
          if (!ticket.eventId && ticket.eventName === oldEventName) {
             return { ...ticket, eventName: editFormData.name };
          }
          return ticket;
        });
        setBookingHistory(updatedHistory);
      }

      showToast('Event updated successfully!', 'success');
      setEditingEventId(null);
    }
  };

  // ==========================================
  // DELETE EVENT LOGIC
  // ==========================================
  const handleDeleteClick = (event) => {
    if (event.bookedSeats.length > 0) {
      setEventToDelete(event); // Triggers the warning modal
    } else {
      executeDelete(event); // Safe to delete immediately
    }
  };

  const executeDelete = (event) => {
    // 1. Delete from Events Array
    const newEventsState = [...events];
    newEventsState[0].subEvents = newEventsState[0].subEvents.filter(e => e.id !== event.id);
    setEvents(newEventsState);

    // 2. Cascade Delete Tickets from History
    const updatedHistory = bookingHistory.filter(ticket => {
       if (ticket.eventId) return ticket.eventId !== event.id;
       return ticket.eventName !== event.name; // Legacy fallback
    });
    setBookingHistory(updatedHistory);

    showToast(`Event '${event.name}' completely deleted.`, 'info');
    setEventToDelete(null);
  };


  return (
    <div className="admin-dashboard fade-in">
      
      {/* DELETE WARNING MODAL */}
      {eventToDelete && (
        <div className="admin-warning-overlay">
          <div className="admin-warning-card glass-card">
            <h3>⚠️ Warning: Active Bookings Detected</h3>
            <p style={{marginBottom: '20px'}}>
              The event <strong>{eventToDelete.name}</strong> currently has <strong>{eventToDelete.bookedSeats.length} active tickets</strong> booked by users.
            </p>
            <p style={{color: 'var(--danger)', marginBottom: '30px', fontSize: '14px'}}>
              Proceeding will permanently delete the event AND wipe out the tickets from the users' "My Tickets" history.
            </p>
            <div className="btn-group">
              <button className="btn btn-secondary" onClick={() => setEventToDelete(null)}>Cancel / Discard</button>
              <button className="btn btn-primary" style={{background: 'var(--danger)'}} onClick={() => executeDelete(eventToDelete)}>Delete Anyway</button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Header & Tabs */}
      <div className="admin-header glass-card">
        <h2>🛠️ Admin Control Panel</h2>
        <p style={{color: 'var(--text-muted)'}}>Manage your platform events and oversee all user bookings globally.</p>
        
        <div className="admin-tabs">
          <button className={`admin-tab ${activeTab === 'manage' ? 'active' : ''}`} onClick={() => setActiveTab('manage')}>Manage Events</button>
          <button className={`admin-tab ${activeTab === 'log' ? 'active' : ''}`} onClick={() => setActiveTab('log')}>Master Booking Log</button>
          <button className={`admin-tab ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')}>Launch New Event</button>
        </div>
      </div>

      {/* VIEW: Manage Events (CRUD) */}
      {activeTab === 'manage' && (
        <div className="glass-card admin-panel fade-in">
          <h3>Manage Catalog</h3>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Dept & Category</th>
                  <th>Venue & Date</th>
                  <th>Price</th>
                  <th>Capacity (Booked/Total)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events[0].subEvents.map(event => (
                  <tr key={event.id}>
                    {editingEventId === event.id ? (
                      // EDIT MODE ROW
                      <>
                        <td><input type="text" name="name" value={editFormData.name} onChange={handleEditChange} className="edit-input" /></td>
                        <td>
                          <input type="text" name="department" value={editFormData.department} onChange={handleEditChange} className="edit-input" />
                          <select name="category" value={editFormData.category} onChange={handleEditChange} className="edit-input" style={{marginTop: '5px'}}>
                            <option value="Tech">Tech</option>
                            <option value="Arts">Arts</option>
                            <option value="Music">Music</option>
                            <option value="Sports">Sports</option>
                          </select>
                        </td>
                        <td>
                          <input type="text" name="venue" value={editFormData.venue} onChange={handleEditChange} className="edit-input" placeholder="Venue"/>
                          <input type="datetime-local" name="date" value={editFormData.date} onChange={handleEditChange} className="edit-input" style={{marginTop: '5px'}} />
                        </td>
                        <td><input type="number" name="price" value={editFormData.price} onChange={handleEditChange} className="edit-input" style={{width: '70px'}}/></td>
                        <td><input type="number" name="totalSeats" value={editFormData.totalSeats} onChange={handleEditChange} className="edit-input" style={{width: '70px'}}/></td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn-small success" onClick={handleEditSave}>Save</button>
                            <button className="btn-small secondary" onClick={() => setEditingEventId(null)}>Cancel</button>
                          </div>
                        </td>
                      </>
                    ) : (
                      // VIEW MODE ROW
                      <>
                        <td style={{fontWeight: '500'}}>{event.name}</td>
                        <td>
                          <div>{event.department}</div>
                          <span style={{fontSize: '11px', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', color: 'var(--primary)'}}>{event.category}</span>
                        </td>
                        <td style={{fontSize: '14px'}}>{event.venue}<br/>
                          <span style={{color: 'var(--text-muted)', fontSize: '12px'}}>
                            {event.date.includes('T') ? new Date(event.date).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : event.date}
                          </span>
                        </td>
                        <td>₹{event.price}</td>
                        <td>
                           <div className="capacity-bar-container">
                             <div className="capacity-bar" style={{width: `${(event.bookedSeats.length / event.totalSeats) * 100}%`}}></div>
                           </div>
                           <span style={{fontSize: '12px'}}>{event.bookedSeats.length} / {event.totalSeats}</span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn-small primary" onClick={() => handleEditClick(event)}>Edit</button>
                            <button className="btn-small danger" onClick={() => handleDeleteClick(event)}>Delete</button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: Master Booking Log */}
      {activeTab === 'log' && (
        <div className="glass-card admin-panel fade-in">
          <h3>Global Ticket Ledger</h3>
          <p style={{color: 'var(--text-muted)', marginBottom: '20px'}}>Showing {bookingHistory.length} total tickets sold across all events.</p>
          
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Purchaser Email</th>
                  <th>Event Name</th>
                  <th>Seats</th>
                  <th>Total Paid</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {bookingHistory.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{textAlign: 'center', padding: '30px', color: 'var(--text-muted)'}}>
                      No bookings have been made yet on the platform.
                    </td>
                  </tr>
                ) : (
                  bookingHistory.map(ticket => (
                    <tr key={ticket.id}>
                      <td className="mono">{ticket.id}</td>
                      <td>{ticket.email}</td>
                      <td style={{fontWeight: '500'}}>{ticket.eventName}</td>
                      <td>{ticket.seats.join(', ')}</td>
                      <td style={{color: 'var(--success)', fontWeight: 'bold'}}>₹{ticket.total}</td>
                      <td style={{color: 'var(--text-muted)', fontSize: '13px'}}>{ticket.timestamp}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: Event Creator */}
      {activeTab === 'create' && (
        <div className="glass-card admin-panel fade-in">
          <h3>Deploy a New Event</h3>
          <p style={{color: 'var(--text-muted)', marginBottom: '25px'}}>Fill out the details below. Once launched, this event will instantly be available to all users.</p>
          
          <form onSubmit={handleCreateEvent} className="admin-form">
            <div className="form-row">
              <div className="form-group">
                <input type="text" name="name" className="form-input" placeholder=" " value={newEvent.name} onChange={handleFormChange} />
                <label className="form-label">Event Name</label>
              </div>
              <div className="form-group">
                <input type="text" name="department" className="form-input" placeholder=" " value={newEvent.department} onChange={handleFormChange} />
                <label className="form-label">Host Department</label>
              </div>
              <div className="form-group">
                <select name="category" className="form-input" value={newEvent.category} onChange={handleFormChange}>
                  <option value="Tech">Tech</option>
                  <option value="Arts">Arts</option>
                  <option value="Music">Music</option>
                  <option value="Sports">Sports</option>
                </select>
                <label className="form-label" style={{top: '-10px', fontSize: '12px'}}>Category</label>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <input type="datetime-local" name="date" className="form-input" placeholder=" " value={newEvent.date} onChange={handleFormChange} />
                <label className="form-label">Date & Time</label>
              </div>
              <div className="form-group">
                <input type="text" name="venue" className="form-input" placeholder=" " value={newEvent.venue} onChange={handleFormChange} />
                <label className="form-label">Venue Location</label>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <input type="number" name="price" className="form-input" placeholder=" " value={newEvent.price} onChange={handleFormChange} min="0" />
                <label className="form-label">Ticket Price (₹)</label>
              </div>
              <div className="form-group">
                <input type="number" name="totalSeats" className="form-input" placeholder=" " value={newEvent.totalSeats} onChange={handleFormChange} min="1" />
                <label className="form-label">Maximum Capacity</label>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{marginTop: '10px', background: 'linear-gradient(135deg, #f12711, #f5af19)', border: 'none'}}>
              🚀 Launch Event to Catalog
            </button>
          </form>
        </div>
      )}

    </div>
  );
}

export default AdminDashboard;
