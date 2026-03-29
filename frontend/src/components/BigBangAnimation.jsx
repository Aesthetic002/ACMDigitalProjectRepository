import { useEffect, useRef, useState } from "react";
import { createTimeline, stagger, random } from "animejs";

export default function BigBangAnimation({ onComplete }) {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const sphereRef = useRef(null);
  
  // Use React state to render particles
  const [particles] = useState(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      color: ["#3B82F6", "#8B5CF6", "#F59E0B", "#10B981", "#EF4444"][Math.floor(Math.random() * 5)]
    }));
  });
  
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    if (!isAnimating) return;

    // In animejs v4, we use createTimeline()
    const timeline = createTimeline({
      defaults: {
        easing: "easeOutExpo",
      },
      onComplete: () => {
        setIsAnimating(false);
        if (onComplete) onComplete();
      }
    });

    // v4 timeline.add(targets, parameters, position)
    timeline
      // 1. Initial appearance - small glowing sphere
      .add(sphereRef.current, {
        scale: [0, 1],
        opacity: [0, 1],
        duration: 800,
        easing: "easeOutElastic(1, .8)"
      })
      // 2. Text appears inside
      .add(textRef.current, {
        opacity: [0, 1],
        scale: [0.5, 1],
        duration: 800,
      }, "-=400")
      // 3. Keep it pulsing for a moment
      .add(sphereRef.current, {
        scale: [1, 1.1],
        duration: 1000,
        easing: "easeInOutSine",
        direction: "alternate",
        loop: 1
      })
      // 4. The Big Bang
      .add(sphereRef.current, {
        scale: [1, 50],
        opacity: [1, 0],
        duration: 800,
        easing: "easeInExpo"
      })
      .add(textRef.current, {
        scale: [1, 3],
        opacity: [1, 0],
        duration: 600,
        easing: "easeInExpo"
      }, "-=800")
      // 5. Particles explode
      .add(".particle-element", {
        translateX: () => random(-500, 500),
        translateY: () => random(-500, 500),
        scale: [0, () => random(1, 3)],
        opacity: [1, 0],
        duration: 1000,
        easing: "easeOutExpo",
        delay: stagger(10)
      }, "-=800")
      // 6. Fade out entire container
      .add(containerRef.current, {
        opacity: [1, 0],
        duration: 500,
        easing: "linear"
      });

  }, [isAnimating, onComplete]);

  if (!isAnimating) return null;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#090E1A] overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        {particles.map(p => (
          <div
            key={p.id}
            className="particle-element absolute w-1 h-1 rounded-full opacity-0"
            style={{
              backgroundColor: p.color,
              top: "50%",
              left: "50%"
            }}
          />
        ))}
      </div>
      <div
        ref={sphereRef}
        className="absolute w-40 h-40 rounded-full bg-primary/20 backdrop-blur-xl border border-primary/50 shadow-[0_0_100px_rgba(59,130,246,0.5)] flex items-center justify-center opacity-0"
      >
        <span 
          ref={textRef}
          className="text-4xl font-black text-white uppercase tracking-widest italic opacity-0"
        >
          ACM
        </span>
      </div>
    </div>
  );
}
