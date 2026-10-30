import { FaRegHeart, FaLeaf, FaAward } from "react-icons/fa";
import { FiSun } from "react-icons/fi";
import "./PrinciplesSection.css";

const PRINCIPLES_DATA = [
  {
    id: "crafted",
    title: "Crafted with Intention",
    description: "Every stitch, seam, and silhouette is designed with purpose — nothing is accidental.",
    icon: <FiSun />,
  },
  {
    id: "lasting",
    title: "Built to Last",
    description: "We choose premium materials and slow-fashion practices so your pieces stay with you.",
    icon: <FaRegHeart />,
  },
  {
    id: "mindful",
    title: "Mindful & Ethical",
    description: "Fair labor, low-waste production, and packaging that respects the planet.",
    icon: <FaLeaf />,
  },
  {
    id: "quality",
    title: "Quality Over Quantity",
    description: "Small, focused collections. Every release is a considered edit — not a race.",
    icon: <FaAward />,
  },
];

export default function PrinciplesSection() {
  return (
    <section className="principles-section">
      <div className="principles-section__container">
        
        {/* HEADER */}
        <div className="principles-section__header">
          <span className="principles-section__label">What We Stand For</span>
          <h2 className="principles-section__heading">
            Four principles, one<br className="desktop-break" /> wardrobe.
          </h2>
        </div>

        {/* GRID */}
        <div className="principles-section__grid">
          {PRINCIPLES_DATA.map((principle) => (
            <div className="principles-card" key={principle.id}>
              <div className="principles-card__icon">
                {principle.icon}
              </div>
              <h3 className="principles-card__title">{principle.title}</h3>
              <p className="principles-card__description">{principle.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}