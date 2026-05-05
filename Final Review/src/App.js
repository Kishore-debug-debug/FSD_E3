import React, { useState, useEffect } from "react";
import EventDetails from "./components/EventDetails";
import BookingForm from "./components/BookingForm";
import TicketReceipt from "./components/TicketReceipt";
import AuthModal from "./components/AuthModal";
import ProfileModal from "./components/ProfileModal";
import AdminDashboard from "./components/AdminDashboard";
import HeroCarousel from "./components/HeroCarousel";
import "./App.css";

const initialEventsData = [
  {
    mainEvent: "Tech Fest 2026",
    subEvents: [
      { id: "e1", name: "Coding Contest", department: "CSE", category: "Tech", date: "20 April, 10:00 AM", venue: "Auditorium", price: 100, availableTickets: 50, bookedSeats: [], totalSeats: 50 },
      { id: "e2", name: "Hackathon", department: "CSE", category: "Tech", date: "20 April, 2:00 PM", venue: "Lab 2", price: 150, availableTickets: 40, bookedSeats: ["1A", "1B", "1C"], totalSeats: 40 },
      { id: "e3", name: "Paper Presentation", department: "ECE", category: "Tech", date: "21 April, 11:00 AM", venue: "Seminar Hall", price: 80, availableTickets: 30, bookedSeats: [], totalSeats: 30 },
      { id: "e4", name: "Robotics Workshop", department: "MECH", category: "Tech", date: "21 April, 2:00 PM", venue: "Workshop Lab", price: 200, availableTickets: 25, bookedSeats: [], totalSeats: 25 },
      { id: "e5", name: "Guest Lecture", department: "IT", category: "Tech", date: "22 April, 09:00 AM", venue: "Main Auditorium", price: 50, availableTickets: 100, bookedSeats: [], totalSeats: 100 },
      { id: "e6", name: "Modern Art Expo", department: "S&H", category: "Arts", date: "23 April, 10:00 AM", venue: "Exhibition Hall", price: 120, availableTickets: 60, bookedSeats: [], totalSeats: 60 },
      { id: "e7", name: "Acoustic Night", department: "Music Club", category: "Music", date: "23 April, 6:00 PM", venue: "Open Air Theatre", price: 300, availableTickets: 200, bookedSeats: [], totalSeats: 200 },
      { id: "e8", name: "Futsal Tournament", department: "Sports", category: "Sports", date: "24 April, 09:00 AM", venue: "Sports Ground", price: 150, availableTickets: 16, bookedSeats: [], totalSeats: 16 },
    ],
  },
];

function App() {
  // --- DATABASE STATE (LocalStorage) ---
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('events');
    return saved ? JSON.parse(saved) : initialEventsData;
  });

  const [bookingHistory, setBookingHistory] = useState(() => {
    const saved = localStorage.getItem('bookingHistory');
    return saved ? JSON.parse(saved) : [];
  });

  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const saved = localStorage.getItem('registeredUsers');
    const users = saved ? JSON.parse(saved) : [];
    if (!users.find(u => u.email === 'admin@eventmaster.com')) {
      users.push({ name: 'Master Admin', email: 'admin@eventmaster.com', password: 'admin', isAdmin: true });
    }
    return users;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  // --- LOCAL UI STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubEventId, setSelectedSubEventId] = useState(events[0].subEvents[0]?.id || "");
  const [latestBooking, setLatestBooking] = useState(null);
  const [toast, setToast] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentView, setCurrentView] = useState("catalog");

  // --- PERSISTENCE HOOKS ---
  useEffect(() => { localStorage.setItem('events', JSON.stringify(events)); }, [events]);
  useEffect(() => { localStorage.setItem('bookingHistory', JSON.stringify(bookingHistory)); }, [bookingHistory]);
  useEffect(() => { localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers)); }, [registeredUsers]);
  useEffect(() => { localStorage.setItem('currentUser', JSON.stringify(currentUser)); }, [currentUser]);

  // Theme Sync
  useEffect(() => {
    document.body.dataset.theme = isDarkMode ? 'dark' : 'light';
  }, [isDarkMode]);

  // Loading Simulation
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

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

  // --- AUTH METHODS ---
  const handleLogin = (email, password) => {
    if (email === 'admin@eventmaster.com' && password === 'admin') {
      const adminUser = { name: 'Master Admin', email: 'admin@eventmaster.com', password: 'admin', isAdmin: true };
      setCurrentUser(adminUser);
      setShowAuthModal(false);
      showToast(`Welcome back, Master Admin!`, 'success');
      return true;
    }
    const user = registeredUsers.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      setShowAuthModal(false);
      showToast(`Welcome back, ${user.name}!`, 'success');
      return true;
    } else {
      showToast("Invalid email or password.", "error");
      return false;
    }
  };

  const handleSignup = (name, email, password) => {
    if (registeredUsers.find(u => u.email === email)) {
      showToast("Email already registered.", "error");
      return false;
    }
    const isAdmin = email === 'admin@eventmaster.com';
    const newUser = { name, email, password, isAdmin };
    setRegisteredUsers([...registeredUsers, newUser]);
    setCurrentUser(newUser);
    setShowAuthModal(false);
    showToast(`Account created successfully! Welcome, ${name}.`, 'success');
    return true;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('catalog');
    showToast('Logged out successfully.', 'info');
  };

  const handleUpdateProfile = (newName, newPassword) => {
    const updatedUsers = registeredUsers.map(u => {
      if (u.email === currentUser.email) {
        return { ...u, name: newName, password: newPassword };
      }
      return u;
    });
    setRegisteredUsers(updatedUsers);
    setCurrentUser({ ...currentUser, name: newName, password: newPassword });
    setShowProfileModal(false);
    showToast('Profile updated successfully!', 'success');
  };

  const handleDeleteAccount = () => {
    const userTickets = bookingHistory.filter(b => b.email === currentUser.email);
    const newEventsState = [...events];
    userTickets.forEach(ticket => {
      const eventIndex = newEventsState[0].subEvents.findIndex(e => e.id === ticket.eventId);
      if (eventIndex !== -1) {
         newEventsState[0].subEvents[eventIndex].bookedSeats = newEventsState[0].subEvents[eventIndex].bookedSeats.filter(seat => !ticket.seats.includes(seat));
         newEventsState[0].subEvents[eventIndex].availableTickets += ticket.tickets;
      }
    });
    setEvents(newEventsState);
    const filteredHistory = bookingHistory.filter(b => b.email !== currentUser.email);
    setBookingHistory(filteredHistory);
    const filteredUsers = registeredUsers.filter(u => u.email !== currentUser.email);
    setRegisteredUsers(filteredUsers);
    setCurrentUser(null);
    setShowProfileModal(false);
    setCurrentView('catalog');
    showToast('Account and all associated tickets have been completely deleted.', 'info');
  };

  // --- EVENT FILTERING ---
  const categories = ["All", "Tech", "Arts", "Music", "Sports"];

  const getFilteredEvents = () => {
    return events[0].subEvents.filter(event => {
      const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           event.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || event.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  };

  const filteredEvents = getFilteredEvents();
  const selectedEvent = filteredEvents.find(e => e.id === selectedSubEventId) || filteredEvents[0];

  const userBookingHistory = bookingHistory.filter(b => b.email === currentUser?.email);

  const handleExplore = (eventId, category) => {
    setSelectedCategory(category || "All");
    setSelectedSubEventId(eventId);
    const element = document.getElementById("event-catalog");
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookingComplete = (bookingDetails) => {
    const newEventsState = [...events];
    const eventIndex = newEventsState[0].subEvents.findIndex(e => e.id === bookingDetails.eventId);
    if (eventIndex !== -1) {
      newEventsState[0].subEvents[eventIndex].bookedSeats.push(...bookingDetails.seats);
      newEventsState[0].subEvents[eventIndex].availableTickets -= bookingDetails.tickets;
      setEvents(newEventsState);
    }
    const finalBooking = {
      ...bookingDetails,
      id: `TKT-${Math.floor(Math.random() * 100000)}`,
      timestamp: new Date().toLocaleString()
    };
    setBookingHistory([finalBooking, ...bookingHistory]);
    setLatestBooking(finalBooking);
    showToast(`Successfully booked ${bookingDetails.tickets} tickets!`, 'success');
  };

  return (
    <div className="App">
      {showAuthModal && (
        <AuthModal 
          onLogin={handleLogin} 
          onSignup={handleSignup} 
          onClose={() => setShowAuthModal(false)} 
        />
      )}

      {showProfileModal && currentUser && (
        <ProfileModal
          currentUser={currentUser}
          onUpdate={handleUpdateProfile}
          onDelete={handleDeleteAccount}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {latestBooking && (
        <TicketReceipt 
          booking={latestBooking} 
          onClose={() => setLatestBooking(null)} 
        />
      )}

      {toast && (
        <div className={`toast-container`}>
          <div className={`toast ${toast.type}`}>
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)}>×</button>
          </div>
        </div>
      )}

      <header className="app-header">
        <h1 className="app-title">🎟️ EventMaster</h1>
        
        <input 
          type="text" 
          className="search-box"
          placeholder="Search events..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <div className="auth-controls" style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '15px'}}>
          <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? '☀️' : '🌙'}
          </button>

          {currentUser ? (
            <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
              {currentUser.isAdmin && (
                <button 
                  className="btn" 
                  style={{background: 'rgba(245, 175, 25, 0.2)', border: '1px solid #f5af19', color: '#f5af19', padding: '8px 15px'}}
                  onClick={() => setCurrentView(currentView === 'admin' ? 'catalog' : 'admin')}
                >
                  {currentView === 'admin' ? 'Exit Admin' : 'Admin Panel'}
                </button>
              )}
              <span className="user-name" style={{fontWeight: 500}}>Hello, {currentUser.name}</span>
              <button className="btn btn-secondary" onClick={() => setShowProfileModal(true)} style={{padding: '8px 15px'}}>⚙️ Settings</button>
              <button className="btn btn-secondary" onClick={handleLogout} style={{padding: '8px 15px'}}>Logout</button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={() => setShowAuthModal(true)} style={{padding: '8px 20px'}}>Login / Sign Up</button>
          )}
        </div>
      </header>

      {currentView === 'admin' ? (
        <AdminDashboard 
          events={events}
          setEvents={setEvents}
          bookingHistory={bookingHistory}
          setBookingHistory={setBookingHistory}
          showToast={showToast}
        />
      ) : (
        <>
          <HeroCarousel onExplore={handleExplore} />

          <div id="event-catalog" className="category-bar">
            {categories.map(cat => (
              <div 
                key={cat} 
                className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </div>
            ))}
          </div>

          <div className="main-grid">
            {isLoading ? (
              <>
                <div className="skeleton" style={{height: '400px'}}></div>
                <div className="skeleton" style={{height: '400px'}}></div>
              </>
            ) : (
              <>
                <div className="fade-in">
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
                      <p style={{color: 'var(--danger)'}}>No events found matching filters.</p>
                    )}
                  </div>

                  {selectedEvent && <EventDetails event={selectedEvent} />}
                  
                  <div className="glass-card history-section">
                    <h2>My Tickets</h2>
                    {!currentUser ? (
                      <div className="empty-state">
                        Please <span style={{color: 'var(--secondary)', cursor: 'pointer', textDecoration: 'underline'}} onClick={() => setShowAuthModal(true)}>log in</span> to view your bookings.
                      </div>
                    ) : userBookingHistory.length === 0 ? (
                      <div className="empty-state">No tickets booked yet.</div>
                    ) : (
                       userBookingHistory.map(ticket => (
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

                <div className="fade-in" style={{animationDelay: '0.1s'}}>
                  {selectedEvent ? (
                    <BookingForm 
                      event={selectedEvent} 
                      onBookingComplete={handleBookingComplete}
                      showToast={showToast}
                      currentUser={currentUser}
                      requireAuth={() => {
                        showToast("You must log in to book a ticket.", "error");
                        setShowAuthModal(true);
                      }}
                    />
                  ) : (
                    <div className="glass-card">
                      <p>Please select an event to book.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;