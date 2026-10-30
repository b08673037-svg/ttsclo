import { useState } from "react";
import { addSubscriber } from "../services/subscriberService";
import "./Newsletter.css";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    try {
      await addSubscriber(email);
      setStatus("success");
      setMessage("Thanks for subscribing! Check your email for 15% off.");
      setEmail("");
      
      // Reset after 4 seconds
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 4000);
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <section className="newsletter-section">
      <div className="newsletter-container">
        
        <div className="newsletter-content">
          <h2 className="newsletter-title">Join the TTS Family</h2>
          <p className="newsletter-desc">
            Subscribe for exclusive drops, early access, and 15% off your first order.
          </p>
        </div>

        <form className="newsletter-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={status === "loading"}
            aria-label="Email address"
          />
          <button 
            type="submit" 
            className="newsletter-btn" 
            disabled={status === "loading"}
          >
            {status === "loading" ? "Subscribing..." : "Subscribe"}
          </button>
        </form>
      </div>
      
      {message && (
        <p className={`newsletter-msg ${status === "error" ? "error" : "success"}`}>
          {message}
        </p>
      )}
    </section>
  );
}