import ContactInfo from "../components/ContactInfo";
import ContactForm from "../components/ContactForm";
import ContactFAQCTA from "../components/ContactFAQCTA"; // <-- Add this import
import "./Contact.css";

export default function Contact() {
  return (
    <div className="contact-page">
      {/* HERO */}
      <div className="contact-hero">
        <div className="contact-hero__content">
          <span className="contact-hero__eyebrow">Get in Touch</span>
          <h1 className="contact-hero__title">
            We'd love to <span className="highlight">hear from you.</span>
          </h1>
          <p className="contact-hero__description">
            Questions about an order, sizing, or a custom request? Send us a message or reach out 
            directly — we're a small team and we answer every message personally.
          </p>
        </div>
      </div>

      {/* TWO COLUMN INFO & FORM */}
      <div className="contact-section-wrapper">
        <div className="contact-section-grid">
          <ContactInfo />
          <ContactForm />
        </div>
      </div>

      {/* NEW FAQ CTA SECTION */}
      <ContactFAQCTA /> 
      
    </div>
  );
}