import { useState, useEffect, useMemo } from "react";
import {
  FiStar, FiSearch, FiCheck, FiX, FiTrash2, FiMessageSquare,
  FiUser, FiPackage, FiClock, FiThumbsUp, FiThumbsDown,
  FiTrendingUp, FiEyeOff,
} from "react-icons/fi";
import {
  subscribeToReviews,
  updateReviewStatus,
  toggleFeatured,
  deleteReview,
} from "../../services/reviewService";
import "./AdminReviews.css";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => setLoading(false), 2500);
    const unsub = subscribeToReviews((data) => {
      clearTimeout(timeoutId);
      setReviews(data);
      setLoading(false);
    });
    return () => {
      clearTimeout(timeoutId);
      unsub();
    };
  }, []);

  const stats = useMemo(() => {
    const total = reviews.length;
    const pending = reviews.filter((r) => r.status === "pending" || !r.status).length;
    const approved = reviews.filter((r) => r.status === "approved").length;
    const rejected = reviews.filter((r) => r.status === "rejected").length;
    const avgRating =
      total > 0
        ? reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / total
        : 0;
    return { total, pending, approved, rejected, avgRating };
  }, [reviews]);

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      const q = search.toLowerCase();
      const matchSearch =
        (r.customerName || "").toLowerCase().includes(q) ||
        (r.productName || "").toLowerCase().includes(q) ||
        (r.reviewText || r.comment || "").toLowerCase().includes(q);

      let matchFilter = true;
      if (filter === "pending") matchFilter = r.status === "pending" || !r.status;
      else if (filter === "approved") matchFilter = r.status === "approved";
      else if (filter === "rejected") matchFilter = r.status === "rejected";

      let matchRating = true;
      if (ratingFilter !== "all") matchRating = Number(r.rating) === Number(ratingFilter);

      return matchSearch && matchFilter && matchRating;
    });
  }, [reviews, search, filter, ratingFilter]);

  const handleStatus = async (reviewId, status) => {
    setBusyId(reviewId);
    try {
      await updateReviewStatus(reviewId, status);
    } catch (err) {
      alert("Failed: " + err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleFeature = async (review) => {
    setBusyId(review.id);
    try {
      await toggleFeatured(review.id, !review.isFeatured);
    } catch (err) {
      alert("Failed: " + err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (reviewId) => {
    if (window.confirm("Delete this review permanently?")) {
      try {
        await deleteReview(reviewId);
      } catch (err) {
        alert("Failed to delete: " + err.message);
      }
    }
  };

  const formatDate = (ts) => {
    if (!ts) return "—";
    return new Date(ts).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="rev-stars">
        {[1, 2, 3, 4, 5].map((n) => (
          <FiStar
            key={n}
            className={`rev-star ${n <= rating ? "filled" : ""}`}
          />
        ))}
      </div>
    );
  };

  const getStatusBadge = (status) => {
    const s = status || "pending";
    const map = {
      pending: { cls: "pending", label: "Pending" },
      approved: { cls: "approved", label: "Approved" },
      rejected: { cls: "rejected", label: "Rejected" },
    };
    const info = map[s] || map.pending;
    return <span className={`rev-status ${info.cls}`}>{info.label}</span>;
  };

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="spinner" />
        <p>Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="admin-reviews">

      {/* HEADER */}
      <div className="rev-header">
        <div>
          <h2 className="page-title">Reviews & Ratings</h2>
          <p className="page-subtitle">Moderate customer feedback and feature top testimonials.</p>
        </div>
      </div>

      {/* STATS */}
      <div className="rev-stats">
        <div className="rev-stat-card">
          <div className="rev-stat-icon gold"><FiMessageSquare /></div>
          <div className="rev-stat-info">
            <span className="rev-stat-label">Total Reviews</span>
            <span className="rev-stat-value">{stats.total}</span>
          </div>
        </div>
        <div className="rev-stat-card">
          <div className="rev-stat-icon amber"><FiClock /></div>
          <div className="rev-stat-info">
            <span className="rev-stat-label">Pending</span>
            <span className="rev-stat-value">{stats.pending}</span>
          </div>
        </div>
        <div className="rev-stat-card">
          <div className="rev-stat-icon green"><FiThumbsUp /></div>
          <div className="rev-stat-info">
            <span className="rev-stat-label">Approved</span>
            <span className="rev-stat-value">{stats.approved}</span>
          </div>
        </div>
        <div className="rev-stat-card">
          <div className="rev-stat-icon purple"><FiStar /></div>
          <div className="rev-stat-info">
            <span className="rev-stat-label">Avg. Rating</span>
            <span className="rev-stat-value">
              {stats.avgRating.toFixed(1)} ★
            </span>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="rev-filters">
        <div className="rev-search">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by customer, product or review..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="rev-filter-tabs">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              className={`rev-filter-btn ${filter === f.id ? "active" : ""}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <select
          className="rev-rating-select"
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
        >
          <option value="all">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
      </div>

      {/* REVIEWS LIST */}
      {filtered.length === 0 ? (
        <div className="rev-empty">
          <FiMessageSquare size={40} />
          <p>{search || filter !== "all" ? "No reviews match your filter." : "No customer reviews yet."}</p>
        </div>
      ) : (
        <div className="rev-grid">
          {filtered.map((r) => (
            <div className={`rev-card ${r.isFeatured ? "featured" : ""}`} key={r.id}>
              {r.isFeatured && (
                <div className="rev-featured-ribbon">
                  <FiStar /> Featured
                </div>
              )}

              <div className="rev-card-head">
                <div className="rev-customer">
                  <div className="rev-avatar">
                    <FiUser />
                  </div>
                  <div>
                    <span className="rev-customer-name">{r.customerName || "Anonymous"}</span>
                    <span className="rev-date">
                      <FiClock /> {formatDate(r.createdAt)}
                    </span>
                  </div>
                </div>
                {getStatusBadge(r.status)}
              </div>

              <div className="rev-rating-row">
                {renderStars(Number(r.rating || 0))}
                <span className="rev-rating-num">{Number(r.rating || 0).toFixed(1)}</span>
              </div>

              {r.productName && (
                <div className="rev-product">
                  <FiPackage /> <span>{r.productName}</span>
                </div>
              )}

              <p className="rev-text">
                "{r.reviewText || r.comment || "No review text provided."}"
              </p>

              <div className="rev-card-actions">
                {r.status !== "approved" && (
                  <button
                    className="rev-action-btn approve"
                    onClick={() => handleStatus(r.id, "approved")}
                    disabled={busyId === r.id}
                  >
                    <FiCheck /> Approve
                  </button>
                )}
                {r.status !== "rejected" && (
                  <button
                    className="rev-action-btn reject"
                    onClick={() => handleStatus(r.id, "rejected")}
                    disabled={busyId === r.id}
                  >
                    <FiX /> Reject
                  </button>
                )}
                {r.status === "approved" && (
                  <button
                    className={`rev-action-btn feature ${r.isFeatured ? "active" : ""}`}
                    onClick={() => handleFeature(r)}
                    disabled={busyId === r.id}
                  >
                    <FiStar /> {r.isFeatured ? "Unfeature" : "Feature"}
                  </button>
                )}
                <button
                  className="rev-action-btn delete"
                  onClick={() => handleDelete(r.id)}
                  disabled={busyId === r.id}
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}