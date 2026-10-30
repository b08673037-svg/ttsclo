import { Link } from "react-router-dom";
import "./ContactFAQCTA.css";

export default function ContactFAQCTA() {
  return (
    <div className="contact-faq-cta-wrapper">
      <div className="contact-faq-cta">
        <h2 className="contact-faq-cta__title">Looking for quick answers?</h2>
        <p className="contact-faq-cta__description">
          Many questions about shipping, returns, and sizing are answered in our FAQ.
        </p>
        <Link to="/faq" className="contact-faq-cta__button">
          Visit the FAQ
        </Link>
      </div>
    </div>
  );
}