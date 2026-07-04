import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "../common/Navbar";
import { Footer } from "../common/Footer";
import { motion, AnimatePresence } from "framer-motion";

export const MarketLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between transition-colors duration-300">
      <Navbar />
      
      {/* Main Content Area */}
      <main className="flex-grow pt-[76px] bg-brand-bg overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      
      <Footer />
    </div>
  );
};

export default MarketLayout;
