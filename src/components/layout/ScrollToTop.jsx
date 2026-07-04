import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // We scroll instantly to top when path changes
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    
    // Safety fallback for browsers or smooth-scrolling containers
    const mainEl = document.querySelector("main");
    if (mainEl) {
      mainEl.scrollTop = 0;
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;
