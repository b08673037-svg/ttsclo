import { useState } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import { useStoreSettings } from "../hooks/useStoreSettings";
import "./FAQ.css";

export default function FAQ() {
  const { settings } = useStoreSettings();
  const [openId, setOpenId] = useState(null);

  // Use FAQs from settings, fallback to empty array
  const faqs = settings?.faqs || [];
  const activeFaqs = faqs.filter(f => f.question && f.answer);

  const toggleAccordion = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="faq-section">
      <div className="faq-container">
        <div className="faq-header">
          <h2 className="faq-title">Frequently Asked Questions</h2>
          <p className="faq-desc">
            Can't find your answer? WhatsApp us anytime — we reply fast.
          </p>
        </div>

        <div className="faq-list">
          {activeFaqs.length === 0 ? (
            <p className="text-muted" style={{ textAlign: 'center' }}>No FAQs available at the moment.</p>
          ) : (
            activeFaqs.map((item, index) => {
              const isOpen = openId === index;
              return (
                <div className={`faq-card ${isOpen ? "is-open" : ""}`} key={index}>
                  <button
                    className="faq-card__header"
                    onClick={() => toggleAccordion(index)}
                    aria-expanded={isOpen}
                  >
                    <span className="faq-card__question">{item.question}</span>
                    <span className="faq-card__icon">
                      {isOpen ? <FaTimes /> : <FaPlus />}
                    </span>
                  </button>
                  <div className="faq-card__body">
                    <div className="faq-card__answer">{item.answer}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}