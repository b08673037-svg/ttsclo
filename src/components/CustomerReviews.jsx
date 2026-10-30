import { FaStar } from "react-icons/fa";
import { customerReviews } from "../data/customerReviews";
import "./CustomerReviews.css";

export default function CustomerReviews() {
  return (
    <section className="reviews-section">
      <div className="reviews-container">
        
        {/* HEADER */}
        <div className="reviews-header">
          <div className="reviews-eyebrow">
            <FaStar className="eyebrow-icon" />
            <span>CUSTOMER REVIEWS</span>
          </div>
          <h2 className="reviews-title">What customers in Toba Tek Singh say</h2>
          <p className="reviews-desc">
            6,000+ orders delivered across Toba Tek Singh district — here's what a few customers think.
          </p>
        </div>

        {/* GRID */}
        <div className="reviews-grid">
          {customerReviews.map((review) => (
            <div className="review-card" key={review.id}>
              
              {/* STARS */}
              <div className="review-stars">
                {[...Array(review.rating)].map((_, i) => (
                  <FaStar key={i} />
                ))}
              </div>

              {/* TEXT */}
              <p className="review-text">{review.review}</p>

              {/* REVIEWER INFO */}
              <div className="review-author">
                <div className="review-avatar">
                  {review.initials}
                </div>
                <div className="review-author-details">
                  <span className="review-name">{review.name}</span>
                  <span className="review-location">{review.location}</span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}