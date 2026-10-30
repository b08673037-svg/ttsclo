import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import "./WhatsAppWidget.css";

// --- CONFIGURATION ---
// Replace with your actual business phone number (include country code, NO + sign)
const WHATSAPP_NUMBER = "923001234567"; 
const WHATSAPP_MESSAGE = encodeURIComponent("Hello! I would like to know more about your products.");

export default function WhatsAppWidget() {
  const [showTooltip, setShowTooltip] = useState(true);

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

  return (
    <div className="whatsapp-widget">
      {/* Help Tooltip */}
      {showTooltip && (
        <div className="whatsapp-tooltip">
          <button 
            className="whatsapp-tooltip__close" 
            onClick={() => setShowTooltip(false)}
            aria-label="Close tooltip"
          >
            <FiX />
          </button>
          <a 
            href={whatsappUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="whatsapp-tooltip__content"
          >
            <strong>Need help?</strong>
            <span>Chat with us on WhatsApp</span>
          </a>
        </div>
      )}

      {/* Floating Button */}
      <a 
        href={whatsappUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="whatsapp-btn"
        aria-label="Chat on WhatsApp"
      >
        <FaWhatsapp />
      </a>
    </div>
  );
}