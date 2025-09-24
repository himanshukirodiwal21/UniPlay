import React from "react";

function Footer() {
  return (
    <footer>
      <div className="container footer-grid">
        <div className="footer-col">
          <h3>UniPlay</h3>
          <p>The central hub for university sports and gaming. Celebrating competition and teamwork in Kota.</p>
        </div>
        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#events">Events</a></li>
            <li><a href="#leaderboards">Leaderboards</a></li>
            <li><a href="#news">News</a></li>
            <li><a href="#about">About Us</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Connect With Us</h4>
          <div className="social-icons">
            <a href="#"><i className="fab fa-instagram"></i></a>
            <a href="#"><i className="fab fa-facebook-f"></i></a>
            <a href="#"><i className="fab fa-twitter"></i></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2025 UniPlay. All Rights Reserved. | <a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a></p>
      </div>
    </footer>
  );
}

export default Footer;
