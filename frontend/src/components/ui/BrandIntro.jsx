import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./brandintro.css";

/*
 * 4-second cinematic brand reveal. Each SOLEMATE letter starts as a
 * floating sneaker and flips into type, one by one, before the overlay
 * blur-fades away. Plays on the first visit of a browser session and
 * again right after login/register (pages set the sm_show_intro flag).
 */

const WORD = "SOLEMATE";
const DURATION_MS = 4000;

export function requestBrandIntro() {
  try {
    sessionStorage.setItem("sm_show_intro", "1");
  } catch (e) {
    /* storage unavailable — intro simply won't replay */
  }
}

function shouldPlay() {
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    if (sessionStorage.getItem("sm_show_intro") === "1") return true;
    return !sessionStorage.getItem("sm_intro_seen");
  } catch (e) {
    return false;
  }
}

function BrandIntro() {
  const { pathname } = useLocation();
  const [phase, setPhase] = useState("idle"); // idle | playing | leaving

  useEffect(() => {
    if (phase !== "idle" || !shouldPlay()) return undefined;

    try {
      sessionStorage.setItem("sm_intro_seen", "1");
      sessionStorage.removeItem("sm_show_intro");
    } catch (e) { /* ignore */ }

    setPhase("playing");
    document.body.style.overflow = "hidden";

    const leaveT = setTimeout(() => setPhase("leaving"), DURATION_MS - 600);
    const doneT = setTimeout(() => {
      setPhase("done");
      document.body.style.overflow = "";
    }, DURATION_MS);

    return () => {
      clearTimeout(leaveT);
      clearTimeout(doneT);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (phase !== "playing" && phase !== "leaving") return null;

  return (
    <div className={`bi-overlay${phase === "leaving" ? " is-leaving" : ""}`} aria-hidden="true">
      <div className="bi-glow" />
      <div className="bi-word">
        {WORD.split("").map((ch, i) => (
          <span className="bi-slot" key={i} style={{ "--d": `${0.25 + i * 0.32}s` }}>
            <span className="bi-shoe">👟</span>
            <span className="bi-letter">{ch}</span>
          </span>
        ))}
      </div>
      <div className="bi-tagline">Premium Sneakers · Modern Street Fashion</div>
      <div className="bi-progress"><span /></div>
    </div>
  );
}

export default BrandIntro;
