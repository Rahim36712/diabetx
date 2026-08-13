"use client";

import { animate, stagger } from "animejs";
import { useEffect, useRef } from "react";

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function AnimeMotionScope({ children, motionKey, className = "" }: { children: React.ReactNode; motionKey: string; className?: string }) {
  const scopeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope || reducedMotion()) return;
    const panels = Array.from(scope.querySelectorAll<HTMLElement>("[data-anime-panel]"));
    const bars = Array.from(scope.querySelectorAll<HTMLElement>("[data-anime-bar]"));
    const lifts = Array.from(scope.querySelectorAll<HTMLElement>("[data-anime-lift]"));

    if (panels.length) {
      animate(panels, {
        opacity: [0, 1],
        translateY: [16, 0],
        scale: [0.988, 1],
        delay: stagger(52, { from: "first" }),
        duration: 520,
        ease: "outExpo",
      });
    }
    if (lifts.length) {
      animate(lifts, {
        opacity: [0, 1],
        translateY: [10, 0],
        delay: stagger(38, { from: "first" }),
        duration: 420,
        ease: "outQuart",
      });
    }
    bars.forEach((bar, index) => {
      const target = bar.style.width || `${bar.getBoundingClientRect().width}px`;
      bar.style.width = "0px";
      animate(bar, {
        width: target,
        delay: 180 + index * 34,
        duration: 650,
        ease: "outExpo",
      });
    });
  }, [motionKey]);

  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope || reducedMotion()) return;
    const press = (event: PointerEvent) => {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>("button");
      if (!target || !scope.contains(target)) return;
      animate(target, { scale: [1, 0.965, 1], duration: 240, ease: "outElastic(1, .6)" });
    };
    scope.addEventListener("pointerdown", press);
    return () => scope.removeEventListener("pointerdown", press);
  }, []);

  return <div ref={scopeRef} className={className}>{children}</div>;
}

export function useAnimePulse(targetRef: React.RefObject<HTMLElement | null>, dependencies: readonly unknown[]) {
  useEffect(() => {
    const target = targetRef.current;
    if (!target || reducedMotion()) return;
    animate(target, { scale: [1, 1.02, 1], duration: 680, ease: "outElastic(1, .55)" });
  // The caller controls when the explicit dependency array changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}
