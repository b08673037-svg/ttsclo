import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiX, FiSearch } from "react-icons/fi";
import "./SearchPanel.css";

export default function SearchPanel({ open, onClose }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    setQuery("");
    onClose();
  };

  return (
    <div id="search-panel" className={`search-panel ${open ? "is-open" : ""}`} aria-hidden={!open}>
      <form className="search-panel__form" onSubmit={handleSubmit}>
        <FiSearch className="search-panel__icon" />
        <input
          type="text"
          placeholder="Search for products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus={open}
          aria-label="Search products"
        />
        <button type="submit" className="search-panel__submit">Search</button>
        <button type="button" className="search-panel__close" onClick={onClose} aria-label="Close search">
          <FiX />
        </button>
      </form>
    </div>
  );
}