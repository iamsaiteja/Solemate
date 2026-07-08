import React, { useCallback, useRef } from "react";

/*
 * Pointer-tracked 3D tilt with a moving light sheen.
 * Pure CSS-variable updates batched through rAF — no re-renders, no layout.
 * Inert on touch devices and for reduced-motion users.
 */
function Tilt({ children, max = 7, className = "", style, onClick, ...rest }) {
  const ref = useRef(null);
  const raf = useRef(0);

  const canTilt = () =>
    window.matchMedia("(hover: hover)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const handleMove = useCallback(
    (e) => {
      const el = ref.current;
      if (!el || !canTilt()) return;
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        el.style.setProperty("--ry", `${(px - 0.5) * 2 * max}deg`);
        el.style.setProperty("--rx", `${(0.5 - py) * 2 * max}deg`);
        el.style.setProperty("--mx", `${px * 100}%`);
        el.style.setProperty("--my", `${py * 100}%`);
      });
    },
    [max]
  );

  const handleLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(raf.current);
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }, []);

  return (
    <div
      ref={ref}
      className={`cin-tilt ${className}`}
      style={{ position: "relative", ...style }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      onClick={onClick}
      {...rest}
    >
      {children}
      <span className="cin-tilt-shine" aria-hidden="true" />
    </div>
  );
}

export default Tilt;
