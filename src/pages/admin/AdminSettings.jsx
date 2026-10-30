import { useState, useEffect } from "react";
import {
  FiSave, FiShoppingBag, FiTruck, FiHome, FiHelpCircle,
  FiPlus, FiTrash2, FiCheck,
} from "react-icons/fi";
import { subscribeToSettings, updateSettings } from "../../services/settingsService";
import "./AdminSettings.css";

const TABS = [
  { id: "store", label: "Store Info", icon: <FiShoppingBag /> },
  { id: "delivery", label: "Delivery", icon: <FiTruck /> },
  { id: "homepage", label: "Homepage", icon: <FiHome /> },
  { id: "faqs", label: "FAQs", icon: <FiHelpCircle /> },
];

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("store");
  const [settings, setSettings] = useState({
    storeName: "TTS Collection",
    contactEmail: "hello@ttscollection.com",
    contactPhone: "+1 (234) 567-890",
    whatsappNumber: "923001234567",
    deliveryFee: 200,
    deliveryCity: "Toba Tek Singh",
    heroHeading1: "Undergarments.",
    heroHeading2: "Peshawari Chappals.",
    heroHeading3: "Delivered Fast.",
    heroSubtitle: "Toba Tek Singh's trusted online store...",
    faqs: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => setLoading(false), 2500);
    const unsub = subscribeToSettings((data) => {
      clearTimeout(timeoutId);
      setSettings((prev) => ({ ...prev, ...data }));
      setLoading(false);
    });
    return () => { clearTimeout(timeoutId); unsub(); };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert("Failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFaqChange = (idx, field, value) => {
    const newFaqs = [...settings.faqs];
    newFaqs[idx][field] = value;
    setSettings((prev) => ({ ...prev, faqs: newFaqs }));
    setSaved(false);
  };

  const addFaq = () => {
    setSettings((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { question: "", answer: "" }],
    }));
  };

  const removeFaq = (idx) => {
    setSettings((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== idx),
    }));
  };

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="spinner" /><p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="admin-settings">
      <div className="settings-header">
        <div>
          <h2 className="page-title">Store Settings</h2>
          <p className="page-subtitle">Manage storefront content and configuration.</p>
        </div>
        <button className="settings-save-btn" onClick={handleSave} disabled={saving}>
          {saved ? <><FiCheck /> Saved!</> : <><FiSave /> {saving ? "Saving..." : "Save Changes"}</>}
        </button>
      </div>

      <div className="settings-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`settings-tab ${activeTab === t.id ? "active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="settings-content">

        {activeTab === "store" && (
          <div className="settings-section">
            <h3 className="settings-section-title">Store Information</h3>
            <div className="settings-row">
              <div className="settings-group">
                <label>Store Name</label>
                <input type="text" name="storeName" value={settings.storeName} onChange={handleChange} />
              </div>
              <div className="settings-group">
                <label>Contact Email</label>
                <input type="email" name="contactEmail" value={settings.contactEmail} onChange={handleChange} />
              </div>
            </div>
            <div className="settings-row">
              <div className="settings-group">
                <label>Contact Phone</label>
                <input type="text" name="contactPhone" value={settings.contactPhone} onChange={handleChange} />
              </div>
              <div className="settings-group">
                <label>WhatsApp Number (no +)</label>
                <input type="text" name="whatsappNumber" value={settings.whatsappNumber} onChange={handleChange} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "delivery" && (
          <div className="settings-section">
            <h3 className="settings-section-title">Delivery Configuration</h3>
            <div className="settings-row">
              <div className="settings-group">
                <label>Delivery Fee (Rs.)</label>
                <input type="number" name="deliveryFee" value={settings.deliveryFee} onChange={handleChange} />
              </div>
              <div className="settings-group">
                <label>Primary City</label>
                <input type="text" name="deliveryCity" value={settings.deliveryCity} onChange={handleChange} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "homepage" && (
          <div className="settings-section">
            <h3 className="settings-section-title">Homepage Hero</h3>
            <div className="settings-group">
              <label>Heading Line 1 (White)</label>
              <input type="text" name="heroHeading1" value={settings.heroHeading1} onChange={handleChange} />
            </div>
            <div className="settings-group">
              <label>Heading Line 2 (Gold)</label>
              <input type="text" name="heroHeading2" value={settings.heroHeading2} onChange={handleChange} />
            </div>
            <div className="settings-group">
              <label>Heading Line 3 (White)</label>
              <input type="text" name="heroHeading3" value={settings.heroHeading3} onChange={handleChange} />
            </div>
            <div className="settings-group">
              <label>Hero Subtitle</label>
              <textarea name="heroSubtitle" value={settings.heroSubtitle} onChange={handleChange} rows={3} />
            </div>
          </div>
        )}

        {activeTab === "faqs" && (
          <div className="settings-section">
            <div className="settings-faq-head">
              <h3 className="settings-section-title">Frequently Asked Questions</h3>
              <button className="settings-add-faq" onClick={addFaq}><FiPlus /> Add FAQ</button>
            </div>
            {settings.faqs.length === 0 ? (
              <p className="settings-empty">No FAQs yet. Click "Add FAQ" to create one.</p>
            ) : (
              settings.faqs.map((faq, idx) => (
                <div className="settings-faq-item" key={idx}>
                  <div className="settings-group">
                    <label>Question {idx + 1}</label>
                    <input type="text" value={faq.question}
                      onChange={(e) => handleFaqChange(idx, "question", e.target.value)} />
                  </div>
                  <div className="settings-group">
                    <label>Answer</label>
                    <textarea value={faq.answer} rows={3}
                      onChange={(e) => handleFaqChange(idx, "answer", e.target.value)} />
                  </div>
                  <button className="settings-remove-faq" onClick={() => removeFaq(idx)}>
                    <FiTrash2 /> Remove
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}