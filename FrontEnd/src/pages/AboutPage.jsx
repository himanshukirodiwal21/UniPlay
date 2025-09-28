import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function eventPage() {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState('');
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEvent = { name, date, location, image };
    const events = JSON.parse(localStorage.getItem('uniplay_events')) || [];
    events.unshift(newEvent);
    localStorage.setItem('uniplay_events', JSON.stringify(events));

    setSuccess(true);
    setName(''); setDate(''); setLocation(''); setImage('');

    // Redirect to homepage after 2 seconds
    setTimeout(() => navigate('/'), 2000);
  };

  return (
    <div className="registration-container">
      <h2 className="section-title">📢 Create a New Event</h2>

      {success && <div id="successMessage">Event created successfully! Redirecting...</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Event Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Date</label>
          <input type="text" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Location / Venue</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Image URL</label>
          <input type="url" value={image} onChange={(e) => setImage(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary">Publish Event</button>
      </form>
    </div>
  );
}

export default eventPage;
