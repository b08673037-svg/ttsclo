import { FiMail, FiPhone, FiMapPin, FiClock } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useStoreSettings } from "../hooks/useStoreSettings";
import "./ContactInfo.css";

export default function ContactInfo() {
  const { settings } = useStoreSettings();
  
  const whatsappNumber = settings?.whatsappNumber || "923001234567";
  const email = settings?.contactEmail || "hello@ttscollection.com";
  const phone = settings?.contactPhone || "+1 (234) 567-890";
  
  const WHATSAPP_MESSAGE = encodeURIComponent("Hi, I have a question about your products.");
  const WHATSAPP_URL = `https://wa.me/${whatsappNumber}?text=${WHATSAPP_MESSAGE}`;

  const CONTACT_CARDS = [
    {
      id: "email",
      icon: <FiMail />,
      label: "EMAIL",
      primary: email,
      link: `mailto:${email}`,
      secondary: "We reply within 24 hours",
    },
    {
      id: "phone",
      icon: <FiPhone />,
      label: "PHONE",
      primary: phone,
      link: `tel:${phone.replace(/\s+/g, '')}`,
      secondary: "Mon–Fri, 9am–6pm EST",
    },
    {
      id: "studio",
      icon: <FiMapPin />,
      label: "STUDIO",
      primary: "123 Fashion Ave",
      secondaryLine: "New York, NY 10012",
      secondary: "Visits by appointment",
    },
    {
      id: "response",
      icon: <FiClock />,
      label: "RESPONSE TIME",
      primary: "Under 24 hours",
      secondary: "Often much faster",
    },
  ];

  return (
    <div className="contact-info">
      <div className="contact-info__cards">
        {CONTACT_CARDS.map((card) => (
          <div className="contact-card" key={card.id}>
            <div className="contact-card__icon">{card.icon}</div>
            <div className="contact-card__content">
              <span className="contact-card__label">{card.label}</span>
              {card.link ? (
                <a href={card.link} className="contact-card__primary">{card.primary}</a>
              ) : (
                <span className="contact-card__primary">
                  {card.primary}
                  {card.secondaryLine && <><br />{card.secondaryLine}</>}
                </span>
              )}
              <span className="contact-card__secondary">{card.secondary}</span>
            </div>
          </div>
        ))}
      </div>

      <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="contact-whatsapp-btn">
        <FaWhatsapp /> Chat on WhatsApp
      </a>
    </div>
  );
}