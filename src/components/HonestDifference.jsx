import { FaStar, FaTimes, FaCheck } from "react-icons/fa";
import "./HonestDifference.css";

const BAZAAR_LIST = [
  "Walk from shop to shop — maybe they have your size, maybe not",
  "Negotiate price every single time",
  "Fake or low-quality items sold as \"original\"",
  "No bill, no exchange, no returns",
  "No idea what's actually in stock",
];

const STORE_LIST = [
  "Live stock shown — order from your phone in 60 seconds",
  "Fixed online prices — no haggling, no surprises",
  "100% quality-checked — genuine leather, soft fabrics",
  "Digital receipt + 7-day exchange + warranty",
  "Same-day delivery in Toba Tek Singh city",
];

export default function HonestDifference() {
  return (
    <section className="honest-section">
      <div className="honest-container">
        
        {/* HEADER */}
        <div className="honest-header">
          <div className="honest-eyebrow">
            <FaStar className="eyebrow-icon" />
            <span>THE HONEST DIFFERENCE</span>
          </div>
          <h2 className="honest-title">Buying from us vs. going to the bazaar</h2>
          <p className="honest-desc">
            We're not saying the local bazaar is bad. Just that we're faster, more convenient, and more accountable.
          </p>
        </div>

        {/* COMPARISON PANEL */}
        <div className="honest-comparison">
          
          {/* LEFT PANEL */}
          <div className="honest-panel honest-panel--dark">
            <span className="panel-label">THE LOCAL BAZAAR</span>
            <h3 className="panel-title">What you're used to</h3>
            
            <ul className="panel-list">
              {BAZAAR_LIST.map((item, index) => (
                <li key={index}>
                  <span className="icon-wrapper icon-wrapper--red">
                    <FaTimes />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT PANEL */}
          <div className="honest-panel honest-panel--gold">
            <span className="panel-label">WITH OUR STORE</span>
            <h3 className="panel-title">The modern way</h3>
            
            <ul className="panel-list">
              {STORE_LIST.map((item, index) => (
                <li key={index}>
                  <span className="icon-wrapper icon-wrapper--white">
                    <FaCheck />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>
    </section>
  );
}