import { useState, useEffect, useRef, useCallback } from "react";

const CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

export function useDecryptText({
  text,
  duration = 1500,
  delay = 0,
  triggerOnView = true,
}) {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const ref = useRef(null);

  const animate = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    const startTime = Date.now();
    const textLength = text.length;
    const animateFrame = () => {
      const elapsed = Date.now() - startTime - delay;
      if (elapsed < 0) {
        requestAnimationFrame(animateFrame);
        return;
      }
      const progress = Math.min(elapsed / duration, 1);
      const revealedCount = Math.floor(progress * textLength);
      let result = "";
      for (let i = 0; i < textLength; i++) {
        if (text[i] === " ") {
          result += " ";
        } else if (i < revealedCount) {
          result += text[i];
        } else {
          result += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }
      setDisplayText(result);
      if (progress < 1) {
        requestAnimationFrame(animateFrame);
      } else {
        setDisplayText(text);
        setIsAnimating(false);
      }
    };
    requestAnimationFrame(animateFrame);
  }, [text, duration, delay, isAnimating]);

  useEffect(() => {
    if (!triggerOnView) {
      animate();
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggered) {
          setHasTriggered(true);
          animate();
          observer.unobserve(element);
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [triggerOnView, hasTriggered, animate]);

  return { displayText, ref, isAnimating, animate };
}
