import { FaWhatsapp, FaInstagram, FaFacebookF, FaTiktok } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const PHONE = "+1234567890";
const PHONE_DISPLAY = "+1 (234) 567-890";

export default function AnnouncementBar() {
  return (
    <div className="announcement">
      <div className="announcement__left">
        <span className="offer-badge">OFFER</span>
        <span className="announcement__text">
          Free shipping on orders over $50
        </span>
      </div>

      <div className="announcement__right">
        <a
          href={`https://wa.me/${PHONE.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="announcement__icon"
        >
          <FaWhatsapp />
        </a>
        <a
          href={`tel:${PHONE}`}
          className="announcement__phone"
          aria-label={`Call ${PHONE_DISPLAY}`}
        >
          {PHONE_DISPLAY}
        </a>
        <a
          href="https://instagram.com/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="announcement__icon"
        >
          <FaInstagram />
        </a>
        <a
          href="https://facebook.com/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          className="announcement__icon"
        >
          <FaFacebookF />
        </a>
        <a
          href="https://twitter.com/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X (Twitter)"
          className="announcement__icon"
        >
          <FaXTwitter />
        </a>
        <a
          href="https://tiktok.com/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="TikTok"
          className="announcement__icon"
        >
          <FaTiktok />
        </a>
      </div>
    </div>
  );
}