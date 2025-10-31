import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface Circle {
  id: number;
  initialX: number;
  initialY: number;
  x: number;
  y: number;
  color: string;
}

interface HaloEffectProps {
  count1?: number;
  count2?: number;
  count3?: number;
  size?: number;
  speed?: number;
  blur?: number;
  color1?: string;
  color2?: string;
  color3?: string;
}

export default function HaloEffect({
  count1 = 3,
  count2 = 3,
  count3 = 3,
  size = 300,
  speed = 5,
  blur = 60,
  color1 = "#FFFFFF",
  color2 = "#FFFFFF",
  color3 = "#FFFFFF"
}: HaloEffectProps) {
  const [circles, setCircles] = useState<Circle[]>([]);

  useEffect(() => {
    // Initialize circles with random starting positions
    const initialCircles: Circle[] = [
      // Set 1: Circles with color1
      ...Array.from({ length: count1 }, () => ({
        id: Math.random(),
        initialX: Math.random() * (window.innerWidth - size),
        initialY: Math.random() * (window.innerHeight - size),
        x: Math.random() * (window.innerWidth - size),
        y: Math.random() * (window.innerHeight - size),
        color: color1
      })),
      // Set 2: Circles with color2
      ...Array.from({ length: count2 }, () => ({
        id: Math.random(),
        initialX: Math.random() * (window.innerWidth - size),
        initialY: Math.random() * (window.innerHeight - size),
        x: Math.random() * (window.innerWidth - size),
        y: Math.random() * (window.innerHeight - size),
        color: color2
      })),
      // Set 3: Circles with color3
      ...Array.from({ length: count3 }, () => ({
        id: Math.random(),
        initialX: Math.random() * (window.innerWidth - size),
        initialY: Math.random() * (window.innerHeight - size),
        x: Math.random() * (window.innerWidth - size),
        y: Math.random() * (window.innerHeight - size),
        color: color3
      }))
    ];
    
    setCircles(initialCircles);

    // Set interval to update position after the initial rendering
    const interval = setInterval(() => {
      setCircles((prevCircles) =>
        prevCircles.map((circle) => ({
          ...circle,
          x: Math.random() * (window.innerWidth - size),
          y: Math.random() * (window.innerHeight - size)
        }))
      );
    }, speed * 1000); // Update position based on the speed prop

    return () => clearInterval(interval);
  }, [size, speed, blur, count1, count2, count3, color1, color2, color3]);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0
      }}
    >
      {circles.map((circle) => (
        <motion.div
          key={circle.id}
          animate={{
            x: circle.x,
            y: circle.y
          }}
          initial={{
            x: circle.initialX,
            y: circle.initialY
          }}
          transition={{
            duration: speed,
            ease: "easeInOut"
          }}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            backgroundColor: circle.color,
            position: "absolute",
            filter: `blur(${blur}px)`,
            opacity: 0.3
          }}
        />
      ))}
    </div>
  );
}
