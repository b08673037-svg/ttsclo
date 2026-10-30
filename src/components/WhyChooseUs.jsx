import { FaStar, FaTruck, FaShieldAlt, FaTag, FaSyncAlt } from "react-icons/fa";
import "./WhyChooseUs.css";

const FEATURES = [
  {
    id: "delivery",
    title: "Same-Day Delivery",
    description: "Order before 2 PM and get it the same day in Toba Tek Singh city. Next-day in Gojra, Kamalia, and Pir Mahal.",
    icon: <FaTruck />,
  },
  {
    id: "genuine",
    title: "Genuine or Refunded",
    description: "Every item is quality-checked before dispatch. Fake or damaged product? Full refund, no questions asked.",
    icon: <FaShieldAlt />,
  },
  {
    id: "pricing",
    title: "Honest Pricing",
    description: "Fixed online prices with no haggling. Wholesale rates available for shops and resellers across the district.",
    icon: <FaTag />,
  },
  {
    id: "exchange",
    title: "7-Day Exchange",
    description: "Size doesn't fit? We'll pick it up and send the right size. No restocking fees, no arguments.",
    icon: <FaSyncAlt />,
  },
];

export default function WhyChooseUs() {
  return (
    <section className="why-section">
      <div className="why-container">
        
        {/* HEADER */}
        <div className="why-header">
          <div className="why-eyebrow">
            <FaStar className="eyebrow-icon" />
            <span>WHY CHOOSE US</span>
          </div>
          <h2 className="why-title">Real quality. Real fast. Real simple.</h2>
          <p className="why-desc">
            We're not a random online seller. We stock what we sell, and we stand behind every 
            item that ships — right here in Toba Tek Singh.
          </p>
        </div>

        {/* GRID */}
        <div className="why-grid">
          {FEATURES.map((feature) => (
            <div className="why-card" key={feature.id}>
              <div className="why-card__icon-wrapper">
                {feature.icon}
              </div>
              <h3 className="why-card__title">{feature.title}</h3>
              <p className="why-card__desc">{feature.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}