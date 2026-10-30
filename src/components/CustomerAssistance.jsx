import { Link } from "react-router-dom";
import { FaStar, FaCheck, FaWhatsapp, FaSearch } from "react-icons/fa";
import { GiClothes, GiSandal, GiConverseShoe } from "react-icons/gi";
import "./CustomerAssistance.css";

const CHECKLIST = [
  "Free size consultation via WhatsApp",
  "Genuine leather Peshawari chappals — handmade Kheri & Kaptaan",
  "Soft, breathable undergarments for all seasons",
  "Wholesale & bulk pricing for shops in Toba Tek Singh",
];

const CATEGORIES = [
  {
    id: "undergarments",
    title: "Undergarments",
    subtitle: "Vests · Briefs · Boxers",
    icon: <GiClothes />,
    iconBg: "#201915",
    iconColor: "#9A6138",
  },
  {
    id: "peshawari",
    title: "Peshawari Chappals",
    subtitle: "Kheri · Kaptaan · Handmade",
    icon: <GiSandal />,
    iconBg: "#241D13",
    iconColor: "#F59E0B",
  },
  {
    id: "footwear",
    title: "Footwear",
    subtitle: "Shoes · Khussa · Sandals",
    icon: <GiConverseShoe />,
    iconBg: "#10231D",
    iconColor: "#10D6A0",
  },
];

// --- CONFIGURATION ---
// Replace this phone number with your actual business number (no + sign)
const WHATSAPP_NUMBER = "923001234567";
const WHATSAPP_MESSAGE = encodeURIComponent("Hi, I need help choosing the right size and product.");
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

export default function CustomerAssistance() {
  return (
    <section className="assistance">
      <div className="assistance__container">
        
        {/* LEFT COLUMN */}
        <div className="assistance__content">
          <div className="assistance__eyebrow">
            <FaStar className="eyebrow-icon" />
            <span>NEED HELP CHOOSING THE RIGHT SIZE?</span>
          </div>

          <h2 className="assistance__title">
            <span className="text-white">Tell us what you need.</span>
            <span className="text-gold">We'll sort it out.</span>
          </h2>

          <p className="assistance__desc">
            Not sure about sizing or which chappal style suits you? Send us a WhatsApp 
            message with your measurements or a photo of what you like. Our team will 
            recommend the right product, confirm availability, and reserve it for you — within 15 minutes.
          </p>

          <ul className="assistance__checklist">
            {CHECKLIST.map((item, index) => (
              <li key={index}>
                <span className="check-icon-wrapper">
                  <FaCheck className="check-icon" />
                </span>
                {item}
              </li>
            ))}
          </ul>

          <div className="assistance__actions">
            <Link to="/collection#categories" className="btn btn--gold">
              <FaSearch /> Browse Categories
            </Link>
            <a 
              href={WHATSAPP_URL} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn--outline"
            >
              Talk to Us on WhatsApp
            </a>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="assistance__cards">
          {CATEGORIES.map((cat) => (
            <Link to={`/collection/${cat.id}`} className="assistance-card" key={cat.id}>
              <div 
                className="assistance-card__icon"
                style={{ backgroundColor: cat.iconBg, color: cat.iconColor }}
              >
                {cat.icon}
              </div>
              <div className="assistance-card__text">
                <h3>{cat.title}</h3>
                <p>{cat.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}