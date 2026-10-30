import { Link } from "react-router-dom";
import { FaEnvelope, FaPhone, FaWhatsapp, FaMapMarkerAlt } from "react-icons/fa";
// Change the import path to .jsx
import { 
  socialLinks, 
  shopLinks, 
  helpLinks, 
  contactInfo, 
  paymentMethods, 
  legalLinks 
} from "../data/footerConfig.jsx"; 
import "./Footer.css";

export default function Footer() {
// ... rest of the code stays exactly the same
  return (
    <footer className="footer-section">
      <div className="footer-container">
        
        {/* TOP 4 COLUMNS */}
        <div className="footer-grid">
          
          {/* COLUMN 1: BRAND & SOCIAL */}
          <div className="footer-col">
            <div className="footer-brand">
              <span className="brand-main">TTS</span>
              <span className="brand-sub">COLLECTION</span>
            </div>
            <p className="footer-desc">
              Premium clothing for the modern individual. Designed in studio, made with care.
            </p>
            <div className="footer-socials">
              {socialLinks.map((social) => (
                <a 
                  key={social.id} 
                  href={social.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* COLUMN 2: SHOP */}
          <div className="footer-col">
            <h4 className="footer-heading">SHOP</h4>
            <ul className="footer-links">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.path}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3: HELP */}
          <div className="footer-col">
            <h4 className="footer-heading">HELP</h4>
            <ul className="footer-links">
              {helpLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.path}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4: CONTACT */}
          <div className="footer-col">
            <h4 className="footer-heading">CONTACT US</h4>
            <ul className="footer-contact">
              <li>
                <FaEnvelope className="contact-icon" />
                <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
              </li>
              <li>
                <FaPhone className="contact-icon" />
                <a href={`tel:${contactInfo.phone}`}>{contactInfo.phoneDisplay}</a>
              </li>
              <li>
                <FaWhatsapp className="contact-icon" />
                <a href={contactInfo.whatsapp} target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>
              </li>
              <li>
                <FaMapMarkerAlt className="contact-icon" />
                <span>{contactInfo.address}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* DIVIDER */}
        <div className="footer-divider"></div>

        {/* PAYMENT ROW */}
        <div className="footer-payment-row">
          <span className="payment-label">Secure payment:</span>
          <div className="payment-badges">
            {paymentMethods.map((method) => (
              <span className="payment-badge" key={method}>{method}</span>
            ))}
          </div>
        </div>

        {/* DIVIDER */}
        <div className="footer-divider"></div>

        {/* COPYRIGHT & LEGAL */}
        <div className="footer-bottom">
          <p className="copyright">© {new Date().getFullYear()} TTS Collection. All rights reserved.</p>
          <div className="legal-links">
            {legalLinks.map((link, index) => (
              <span key={link.label}>
                <Link to={link.path}>{link.label}</Link>
                {index < legalLinks.length - 1 && <span className="dot">·</span>}
              </span>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}