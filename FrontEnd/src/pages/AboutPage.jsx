// src/pages/AboutPage.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const AboutPage = () => {
  return (
    <>
      <Header />

      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content">
            <h1>The Team Behind The Game</h1>
            <p>
              We're a passionate group of students dedicated to revolutionizing
              sports on campus.
            </p>
          </div>
        </section>

        {/* Our Story Section */}
        <section id="our-story" className="section">
          <div className="container">
            <h2 className="section-title">Our Story</h2>
            <div className="about-story-grid">
              <div className="story-text">
                <h3>From a Simple Idea to a Campus-Wide Platform.</h3>
                <p>
                  UniPlay was born from a simple idea: organizing sports on
                  campus should be easy and exciting. We were tired of scattered
                  information, confusing group chats, and missed opportunities
                  to play the games we loved. We envisioned a single, dynamic
                  platform that would bring players, organizers, and fans
                  together.
                </p>
                <p>
                  Our goal was to create a space that not only lists events but
                  also builds a culture. A place to track your team's progress,
                  celebrate big wins, find new teammates, and share in the
                  collective energy of university sports. That vision is now
                  UniPlay.
                </p>
              </div>
              <div className="story-image">
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop"
                  alt="Team collaborating on a project"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section
          id="team"
          className="section"
          style={{ backgroundColor: "var(--light-color)" }}
        >
          <div className="container">
            <h2 className="section-title">Meet The Founding Team</h2>
            <div className="card-grid">
              {[
                { name: "Himanshu", text: "HK" },
                { name: "Himanshu Chauhan", text: "HC" },
                { name: "Ravi Swami", text: "RS" },
                { name: "Mohit Joshi", text: "MJ" },
              ].map((member, i) => (
                <div className="card team-card" key={i}>
                  <img
                    src={`https://placehold.co/400x400/005A9E/FFFFFF?text=${member.text}`}
                    alt={`Team Member ${member.name}`}
                  />
                  <div className="card-content">
                    <h3>{member.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <h2>Ready to Join The Game?</h2>
          <p>
            Whether you have a question, a suggestion, or want to partner with
            us, we'd love to hear from you!
          </p>
          <a
            href="mailto:himanshukirodiwal21@gmail.com"
            className="btn btn-primary"
          >
            Contact Us Now
          </a>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default AboutPage;