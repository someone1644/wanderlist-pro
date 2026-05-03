import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Sub components
function MapFlyTo({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 12, { animate: true, duration: 1.5 });
  }, [center, map]);
  return null;
}

// Main App
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [trips, setTrips] = useState(() => JSON.parse(localStorage.getItem('wanderTrips')) || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapCenter, setMapCenter] = useState([48.8566, 2.3522]); // Default: Paris
  const [calcDisplay, setCalcDisplay] = useState("");
  const [photos, setPhotos] = useState([]);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    localStorage.setItem('wanderTrips', JSON.stringify(trips));
  }, [trips]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    let newErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) newErrors.email = 'Invalid email format';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) setIsAuthenticated(true);
  };

  const searchLocation = async () => {
    if (!searchQuery) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
      const data = await res.json();
      if (data.length > 0) {
        const place = data[0];
        const cityName = place.display_name.split(',')[0];
        const newTrip = {
          id: Date.now(),
          name: cityName,
          desc: place.display_name,
          lat: parseFloat(place.lat),
          lon: parseFloat(place.lon),
          status: 'bucket',
          visitDate: null
        };
        setTrips([newTrip, ...trips]);
        setMapCenter([place.lat, place.lon]);
        setSearchQuery(""); 
      } else {
        alert("Location not found.");
      }
    } catch (error) {
      console.error("Geocoding API Error:", error);
    }
  };

  const updateTripStatus = (id, newStatus) => {
    setTrips(trips.map(trip => {
      if (trip.id === id) {
        const visitDate = newStatus === 'completed' ? new Date().toLocaleDateString() : null;
        return { ...trip, status: newStatus, visitDate };
      }
      return trip;
    }));
  };

  const deleteTrip = (id) => {
    if (window.confirm("Remove this destination from your planner?")) {
      setTrips(trips.filter(t => t.id !== id));
    }
  };

  const handleCalcClick = (val) => {
    if (val === 'C') setCalcDisplay("");
    else if (val === 'back') setCalcDisplay(calcDisplay.slice(0, -1));
    else if (val === '=') {
      try { 
        setCalcDisplay(String(Function('"use strict";return (' + calcDisplay + ')')())); 
      } 
      catch { setCalcDisplay("Error"); }
    } else {
      setCalcDisplay(calcDisplay + val);
    }
  };

  // Auth View
  if (!isAuthenticated) {
    return (
      <div className="auth-wrapper">
        <div className="form-container">
          <h2>Join WanderList</h2>
          <form onSubmit={handleLogin} noValidate>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className={errors.fullName ? 'invalid' : ''} placeholder="John Doe" />
              {errors.fullName && <span className="error">{errors.fullName}</span>}
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={errors.email ? 'invalid' : ''} placeholder="john@example.com" />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleInputChange} className={errors.password ? 'invalid' : ''} placeholder="Min 6 characters" />
              {errors.password && <span className="error">{errors.password}</span>}
            </div>
            <button type="submit" className="btn-submit">Start Planning</button>
          </form>
        </div>
      </div>
    );
  }

  // Main Dash
  return (
    <div className="dashboard-container">
      <header className="hero">
        <div className="overlay"></div>
        <div className="hero-content">
          <h1>WanderList Planner</h1>
          <div className="search-box">
            <input 
              type="text" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
              placeholder="Search a city (e.g., Tokyo, Madrid)..." 
            />
            <button onClick={searchLocation}>Add Destination</button>
          </div>
        </div>
      </header>
      <div className="main-layout">
        <aside className="sidebar">
          <div className="widget">
            <h3>🧮 Budget Calculator</h3>
            <div className="calculator">
              <input type="text" id="calc-display" readOnly value={calcDisplay} placeholder="0" />
              <div className="calc-buttons">
                {['C', 'back', '%', '/', '7', '8', '9', '*', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '='].map(btn => (
                  <button 
                    key={btn} 
                    className={btn === '=' ? 'equal' : ['C','back'].includes(btn) ? 'ctrl' : ['%','/','*','-','+'].includes(btn) ? 'op' : ''}
                    style={btn === '=' ? { gridColumn: 'span 2' } : {}}
                    onClick={() => handleCalcClick(btn)}
                  >
                    {btn === 'back' ? '⌫' : btn}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>
        <main className="planner-area">
          <div id="map" className="map-container">
            <MapContainer center={mapCenter} zoom={3} style={{ height: '100%', width: '100%', borderRadius: '16px' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
              <MapFlyTo center={mapCenter} />
              {trips.filter(t => t.lat && t.lon).map(trip => (
                <Marker key={trip.id} position={[trip.lat, trip.lon]}>
                  <Popup>{trip.name}</Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          <div className="planner-grid">
            {['bucket', 'active', 'completed'].map(colStatus => (
              <section key={colStatus} className={`column ${colStatus}-col`}>
                <div className="col-header">
                  <h2>{colStatus === 'bucket' ? 'Bucket List' : colStatus === 'active' ? 'Active Itinerary' : 'Completed'}</h2>
                  <span className={`badge ${colStatus}`}>
                    {trips.filter(t => t.status === colStatus).length}
                  </span>
                </div>
                <div className="card-stack">
                  {trips.filter(t => t.status === colStatus).map(trip => (
                    <div key={trip.id} className={`place-card ${trip.status === 'completed' ? 'is-completed' : ''}`}>
                      <h3>{trip.name}</h3>
                      <p>{trip.desc.substring(0, 45)}...</p>
                      {trip.visitDate && <span className="visit-tag">Visited: {trip.visitDate}</span>}
                      <div className="card-actions">
                        {trip.status === 'bucket' && <button className="action-btn" onClick={() => updateTripStatus(trip.id, 'active')}>🚀 Plan</button>}
                        {trip.status === 'active' && <button className="action-btn" onClick={() => updateTripStatus(trip.id, 'completed')}>✅ Complete</button>}
                        {trip.status === 'completed' && <button className="action-btn" onClick={() => updateTripStatus(trip.id, 'bucket')}>↺ Re-plan</button>}
                        <button className="action-btn btn-del" onClick={() => deleteTrip(trip.id)}>🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}