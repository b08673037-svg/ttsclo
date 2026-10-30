import { Link } from "react-router-dom";
import { FaStar, FaArrowRight } from "react-icons/fa";
import { GiClothes, GiRunningShoe, GiConverseShoe } from "react-icons/gi";
import { MdGridOn } from "react-icons/md";
import "./CategorySection.css";

const CATEGORIES = [
  {
    id: "undergarments",
    title: "Undergarments",
    description: "Vests, briefs, boxers, camisoles",
    icon: <GiClothes />,
    path: "/collection/undergarments",
    iconBg: "#201915",
    iconColor: "#9A6138",
  },
  {
    id: "peshawari-chappals",
    title: "Peshawari Chappals",
    description: "Handmade leather, Kaptaan, Kheri style",
    icon: <GiRunningShoe />, // Replaced with a guaranteed valid icon
    path: "/collection/peshawari-chappals",
    iconBg: "#241D13",
    iconColor: "#F59E0B",
  },
  {
    id: "footwear",
    title: "Footwear",
    description: "Shoes, sandals, khussa, joggers",
    icon: <GiConverseShoe />,
    path: "/collection/footwear",
    iconBg: "#10231D",
    iconColor: "#10D6A0",
  },
  {
    id: "fabrics",
    title: "Fabrics & Suits",
    description: "Unstitched, lawn, cotton, khaddar",
    icon: <MdGridOn />,
    path: "/collection/fabrics-and-suits",
    iconBg: "#141F31",
    iconColor: "#3986FF",
  },
];

export default function CategorySection() {
// ... rest of the component stays exactly the same
  return (
    <section className="category-section">
      <div className="category-container">
        
        {/* HEADER */}
        <div className="category-header">
          <div className="category-eyebrow">
            <FaStar className="eyebrow-icon" />
            <span>SHOP BY CATEGORY</span>
          </div>
          <h2 className="category-title">What are you looking for today?</h2>
          <p className="category-desc">
            From everyday essentials to traditional footwear — everything verified for quality, delivered to your door.
          </p>
        </div>

        {/* GRID */}
        <div className="category-grid">
          {CATEGORIES.map((cat) => (
            <Link to={cat.path} className="category-card" key={cat.id}>
              <div 
                className="category-icon-wrapper"
                style={{ backgroundColor: cat.iconBg, color: cat.iconColor }}
              >
                {cat.icon}
              </div>
              <h3 className="category-card-title">{cat.title}</h3>
              <p className="category-card-desc">{cat.description}</p>
              <div className="category-card-action">
                Browse <FaArrowRight className="action-arrow" />
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}