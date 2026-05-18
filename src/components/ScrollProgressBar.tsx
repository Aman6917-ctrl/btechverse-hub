import { motion, useScroll, useSpring } from "framer-motion";

/** Thin top bar that fills as the user scrolls — works on all routes. */
export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.12 });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-0.5 z-[60] origin-left pointer-events-none"
      style={{ scaleX }}
      aria-hidden
    >
      <div className="h-full w-full bg-gradient-to-r from-primary via-emerald-500/80 to-accent opacity-95 shadow-[0_1px_10px_hsl(var(--primary)/0.28)]" />
    </motion.div>
  );
}
