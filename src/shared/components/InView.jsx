import { useInView } from "react-intersection-observer";

// CSS-only stand-in for framer-motion's `whileInView` fade+rise pattern
// (opacity 0->1, y 20px->0) used across the marketing pages. Kept out of
// the eager bundle's dependency graph — no framer-motion needed for a
// one-shot fade-in.
export default function InView({
  as = "div",
  delayMs = 0,
  className = "",
  triggerOnce = true,
  amount = 0.2,
  children,
  ...props
}) {
  const Tag = as;
  const [ref, inView] = useInView({ triggerOnce, threshold: amount });

  return (
    <Tag
      ref={ref}
      className={`transition-all duration-500 ease-out ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
      } ${className}`}
      style={{ transitionDelay: `${delayMs}ms` }}
      {...props}
    >
      {children}
    </Tag>
  );
}
