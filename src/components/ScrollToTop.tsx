import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const shouldReduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: shouldReduceMotion ? "auto" : "smooth",
    });
  }, [pathname, shouldReduceMotion]);

  return null;
};

export default ScrollToTop;
