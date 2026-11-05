import { useEffect, useRef, type PropsWithChildren } from "react";
import { motion, useAnimationControls } from "framer-motion";

export default function FeedReveal({ children }: PropsWithChildren) {
  const ref = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();
  useEffect(() => {
    const element = ref.current;
    const preference = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!element || !window.IntersectionObserver || preference?.matches || element.getBoundingClientRect().top < window.innerHeight) return;
    // SSR and the first hydration are visible. Only offscreen blocks are enhanced.
    controls.set({ opacity: 0, y: 16 });
    let revealed = false;
    const reveal = (animate: boolean) => {
      if (revealed && animate) return;
      revealed = true;
      observer.disconnect();
      if (animate) void controls.start({ opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } });
      else { controls.stop(); controls.set({ opacity: 1, y: 0 }); }
    };
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) reveal(true);
    }, { threshold: 0, rootMargin: "0px 0px -24px 0px" });
    observer.observe(element);
    const onPreference = () => { if (preference?.matches) reveal(false); };
    const onFocus = () => reveal(false);
    preference?.addEventListener?.("change", onPreference);
    element.addEventListener("focusin", onFocus);
    return () => {
      observer.disconnect(); controls.stop();
      preference?.removeEventListener?.("change", onPreference);
      element.removeEventListener("focusin", onFocus);
    };
  }, [controls]);
  return <motion.div ref={ref} initial={false} animate={controls} className="min-w-0">{children}</motion.div>;
}
