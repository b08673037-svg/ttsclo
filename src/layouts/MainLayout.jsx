import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Newsletter from "../components/Newsletter"; // Import
import Footer from "../components/Footer"; // Import

export default function MainLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Newsletter /> {/* Appears globally */}
      <Footer />     {/* Appears globally */}
    </>
  );
}