import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { FiUsers, FiFeather } from "react-icons/fi";
import "./About.css";
import PrinciplesSection from "./PrinciplesSection";
import AboutCTA from "../components/AboutCTA";

const STATS_DATA = [
  { value: "2018", label: "FOUNDED" },
  { value: "25k+", label: "HAPPY CUSTOMERS" },
  { value: "60+", label: "COUNTRIES SHIPPED" },
  { value: "4.9★", label: "AVERAGE RATING" },
];

export default function About() {
  return (
    <div className="about-page">
      <div className="about-container">
        
        {/* --- HERO SECTION --- */}
        <div className="about-content">
          <span className="about-label">Our Story</span>
          
          <h1 className="about-heading">
            Timeless design,<br />
            <span className="highlight">modern spirit.</span>
          </h1>
          
          <p className="about-desc">
            TTS Collection was born from a simple idea: that everyday clothing should feel as 
            good as it looks. We design considered pieces for people who care about quality, 
            comfort, and craft — not fast trends.
          </p>

          <div className="about-actions">
            <Link to="/collection" className="about-btn about-btn--primary">
              Explore the Collection <FaArrowRight className="btn-arrow" />
            </Link>
            <Link to="/contact" className="about-btn about-btn--secondary">
              Get in Touch
            </Link>
          </div>
        </div>

        {/* --- STATS CARD --- */}
        <div className="about-stats-card">
          {STATS_DATA.map((stat, index) => (
            <div className="stat-column" key={index}>
              <span className="stat-number">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* --- MISSION SECTION --- */}
        <section className="about-mission">
          
          <div className="about-mission__content">
            <span className="about-mission__label">The Mission</span>
            <h2 className="about-mission__heading">
              Clothing that respects your wardrobe<br className="desktop-break" /> — and the world.
            </h2>
            
            <p className="about-mission__description">
              We're not chasing volume. We release small, focused collections of pieces we 
              genuinely believe in. Each one is designed to outlast seasons, trends, and the way the 
              industry usually works.
            </p>
            
            <p className="about-mission__description">
              Our studio in New York works directly with a tight circle of makers we trust. Materials 
              are sourced with intention. Every decision — from the thread to the tag — is made to 
              give you something that actually lasts.
            </p>
          </div>

          <div className="about-mission__cards">
            <div className="about-mission__card">
              <FiUsers className="about-mission__icon" />
              <h3 className="about-mission__card-title">Small Team</h3>
              <p className="about-mission__card-desc">Direct from our studio</p>
            </div>

            <div className="about-mission__card">
              <FiFeather className="about-mission__icon" />
              <h3 className="about-mission__card-title">Sustainable</h3>
              <p className="about-mission__card-desc">Low-waste production</p>
            </div>
          </div>

        </section>

        {/* --- NEW PRINCIPLES SECTION --- */}
        <PrinciplesSection />


        <AboutCTA /> 

      </div>
    </div>
  );
}