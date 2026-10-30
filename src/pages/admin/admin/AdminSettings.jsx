import { useState, useEffect } from "react";
import { FiSave } from "react-icons/fi";
import { subscribeToSettings, updateSettings } from "../../services/settingsService";
import "./AdminSettings.css";

const TABS = ["Store Info", "Delivery", "Homepage", "FAQs"];

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("Store Info");
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
    faqs: [], // Array of { question, answer }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToSettings((data) => {
      setSettings((prev) => ({ ...prev, ...data }));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(settings);
      alert("Settings saved successfully!");
    } catch (error) {
      alert("Failed to save settings: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  // FAQ Handlers
  const handleFaqChange = (index, field, value) => {
    const newFaqs = [...settings.faqs];
    newFaqs[index][field] = value;
    setSettings((prev) => ({ ...prev, faqs: newFaqs }));
  };

  const addFaq = () => {
    setSettings((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { question: "", answer: "" }],
    }));
  };

  const removeFaq = (index) => {
    const newFaqs = settings.faqs.filter((_, i) => i !== index);
    setSettings((prev) => ({ ...prev, faqs: newFaqs }));
  };

  if (loading) return <div className="loading-state">Loading Settings...</div>;

  return (
    <div className="admin-settings">
      <div className="page-header">
        <div>
          <h2 className="page-title">Store Settings</h2>
          <p className="page-subtitle">Manage your storefront content and configuration.</p>
        </div>
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          <FiSave /> {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="settings-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="settings-content">
        {/* STORE INFO */}
        {activeTab === "Store Info" && (
          <div className="form-section">
            <h3 className="section-title">Store Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Store Name</label>
                <input type="text" name="storeName" value={settings.storeName} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Contact Email</label>
                <input type="email" name="contactEmail" value={settings.contactEmail} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Contact Phone</label>
                <input type="text" name="contactPhone" value={settings.contactPhone} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>WhatsApp Number (with country code, no +)</label>
                <input type="text" name="whatsappNumber" value={settings.whatsappNumber} onChange={handleChange} />
              </div>
            </div>
          </div>
        )}

        {/* DELIVERY */}
        {activeTab === "Delivery" && (
          <div className="form-section">
            <h3 className="section-title">Delivery Configuration</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Delivery Fee (Rs.)</label>
                <input type="number" name="deliveryFee" value={settings.deliveryFee} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Primary Delivery City</label>
                <input type="text" name="deliveryCity" value={settings.deliveryCity} onChange={handleChange} />
              </div>
            </div>
          </div>
        )}

        {/* HOMEPAGE CONTENT */}
        {activeTab === "Homepage" && (
          <div className="form-section">
            <h3 className="section-title">Homepage Hero Section</h3>
            <div className="form-group full-width">
              <label>Heading Line 1 (White)</label>
              <input type="text" name="heroHeading1" value={settings.heroHeading1} onChange={handleChange} />
            </div>
            <div className="form-group full-width">
              <label>Heading Line 2 (Gold)</label>
              <input type="text" name="heroHeading2" value={settings.heroHeading2} onChange={handleChange} />
            </div>
            <div className="form-group full-width">
              <label>Heading Line 3 (White)</label>
              <input type="text" name="heroHeading3" value={settings.heroHeading3} onChange={handleChange} />
            </div>
            <div className="form-group full-width">
              <label>Hero Subtitle</label>
              <textarea name="heroSubtitle" value={settings.heroSubtitle} onChange={handleChange} rows={3} />
            </div>
          </div>
        )}

        {/* FAQS */}
        {activeTab === "FAQs" && (
          <div className="form-section">
            <div className="faq-header">
              <h3 className="section-title">Frequently Asked Questions</h3>
              <button className="btn-secondary" onClick={addFaq}>+ Add FAQ</button>
            </div>
            {settings.faqs.length === 0 ? (
              <p className="text-muted">No FAQs added yet.</p>
            ) : (
              settings.faqs.map((faq, index) => (
                <div className="faq-item" key={index}>
                  <div className="form-group full-width">
                    <label>Question</label>
                    <input 
                      type="text" 
                      value={faq.question} 
                      onChange={(e) => handleFaqChange(index, "question", e.target.value)} 
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Answer</label>
                    <textarea 
                      value={faq.answer} 
                      onChange={(e) => handleFaqChange(index, "answer", e.target.value)} 
                      rows={3}
                    />
                  </div>
                  <button className="btn-danger" onClick={() => removeFaq(index)}>Remove</button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}