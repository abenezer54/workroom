"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type AnimatedProgressBarProps = {
  value: number;
  className?: string;
  barClassName?: string;
  delay?: number;
  duration?: number;
  label?: string;
};

export function AnimatedProgressBar({
  value,
  className,
  barClassName,
  delay = 100,
  duration = 900,
  label = "Progress",
}: AnimatedProgressBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const clampedValue = Math.min(100, Math.max(0, value));

  useEffect(() => {
    const node = ref.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.35,
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-label={label}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={clampedValue}
      className={cn("h-2 overflow-hidden rounded-full bg-white/[0.08]", className)}
      role="progressbar"
    >
      <div
        className={cn(
          "h-full rounded-full bg-accent transition-[width] ease-out motion-reduce:transition-none",
          barClassName,
        )}
        style={{
          transitionDelay: isVisible ? `${delay}ms` : "0ms",
          transitionDuration: `${duration}ms`,
          width: isVisible ? `${clampedValue}%` : "0%",
        }}
      />
    </div>
  );
}
