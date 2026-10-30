import { useState } from "react";
import { FiUser, FiMail, FiSend } from "react-icons/fi";
import { saveContactMessage } from "../services/contactMessageService";
import "./ContactForm.css";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [errorMsg, setErrorMsg] = useState("");

  const MAX_CHARS = 500;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "message" && value.length > MAX_CHARS) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setErrorMsg("Please fill in all fields.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setStatus("loading");

    try {
      await saveContactMessage({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });

      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setStatus("idle"), 4000);
    } catch (err) {
      console.error("Failed to send message:", err);
      setStatus("error");
      setErrorMsg("Could not send your message. Please try again.");
    }
  };

  return (
    <div className="contact-form-panel">
      
      <div className="contact-form-header">
        <h2 className="contact-form-title">Send us a message</h2>
        <p className="contact-form-desc">Fill in the form below and we'll respond as soon as we can.</p>
      </div>

      <div className="contact-form-divider"></div>

      <form className="contact-form" onSubmit={handleSubmit}>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">
              <FiUser className="label-icon" /> YOUR NAME
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Jane Doe"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              <FiMail className="label-icon" /> EMAIL ADDRESS
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="subject">SUBJECT</label>
          <input
            type="text"
            id="subject"
            name="subject"
            placeholder="How can we help?"
            value={formData.subject}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="message">MESSAGE</label>
          <textarea
            id="message"
            name="message"
            placeholder="Tell us a bit more about your question or request..."
            value={formData.message}
            onChange={handleChange}
            rows={6}
          />
          <span className="char-counter">
            {formData.message.length}/{MAX_CHARS} characters
          </span>
        </div>

        {errorMsg && <p className="form-error">{errorMsg}</p>}
        {status === "success" && (
          <p className="form-success">Your message has been sent successfully!</p>
        )}

        <button type="submit" className="form-submit-btn" disabled={status === "loading"}>
          <FiSend /> {status === "loading" ? "Sending..." : "Send Message"}
        </button>

      </form>
    </div>
  );
}