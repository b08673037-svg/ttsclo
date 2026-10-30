import { FaInstagram, FaFacebookF, FaTiktok, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export const socialLinks = [
  { id: "instagram", icon: <FaInstagram />, url: "https://instagram.com/", label: "Instagram" },
  { id: "facebook", icon: <FaFacebookF />, url: "https://facebook.com/", label: "Facebook" },
  { id: "twitter", icon: <FaXTwitter />, url: "https://twitter.com/", label: "X (Twitter)" },
  { id: "tiktok", icon: <FaTiktok />, url: "https://tiktok.com/", label: "TikTok" },
  { id: "whatsapp", icon: <FaWhatsapp />, url: "https://wa.me/923001234567", label: "WhatsApp" },
];

export const shopLinks = [
  { label: "All Products", path: "/collection" },
  { label: "New Arrivals", path: "/collection/new-arrivals" },
  { label: "Best Sellers", path: "/collection/best-sellers" },
  { label: "Sale", path: "/collection/sale" },
  { label: "Accessories", path: "/collection/accessories" },
];

export const helpLinks = [
  { label: "Shipping Info", path: "/shipping" },
  { label: "Returns & Exchanges", path: "/returns" },
  { label: "Size Guide", path: "/size-guide" },
  { label: "FAQ", path: "/faq" },
  { label: "Track Order", path: "/track-order" },
];

export const contactInfo = {
  email: "hello@ttscollection.com",
  phone: "+1234567890",
  phoneDisplay: "+1 (234) 567-890",
  whatsapp: "https://wa.me/923001234567",
  address: "123 Fashion Ave, New York, NY",
};

export const paymentMethods = ["VISA", "MASTERCARD", "AMEX", "PAYPAL", "APPLE PAY"];

export const legalLinks = [
  { label: "Privacy Policy", path: "/privacy" },
  { label: "Terms of Service", path: "/terms" },
  { label: "Cookies", path: "/cookies" },
];