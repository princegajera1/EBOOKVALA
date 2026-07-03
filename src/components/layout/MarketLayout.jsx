import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "../common/Navbar";
import { Footer } from "../common/Footer";

export const MarketLayout = () => {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between transition-colors duration-300">
      <Navbar />
      
      {/* Main Content Area */}
      <main className="flex-grow pt-20 bg-brand-bg">
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
};

export default MarketLayout;
