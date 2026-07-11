import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import "./sneaker3d.css";

/*
 * Scroll-driven cinematic 3D experience.
 * A sticky full-viewport WebGL canvas is pinned while the outer track
 * (TRACK_VH tall) scrolls; scroll progress scrubs the shoe through
 * keyframed "frames" below, switching material colorways along the way.
 */

const MODEL_URL = "/models/sneaker.glb";
const TRACK_VH = 500;

const FRAMES = [
  {
    eyebrow: "THE SOLEMATE 3D EXPERIENCE",
    title: "SOLEMATE",
    body: "Discover premium sneakers crafted for comfort, performance and modern street fashion.",
    align: "center",
    hero: true,
    ghost: "SNEAKERS",
    variant: "midnight",
    bg: ["#0a0a0e", "#17171f"],
    accent: "#fa5400",
    shoe: { pos: [0, -0.05, 0], rot: [0.12, -0.55, -0.08], scale: 1.0 },
  },
  {
    eyebrow: "01 · Performance",
    title: "BUILT FOR SPEED",
    body: "Featherweight engineered mesh over a full-length energy foam midsole. Every stride loads up and fires back.",
    align: "left",
    ghost: "SPEED",
    variant: "midnight",
    bg: ["#04102a", "#0b1f4b"],
    accent: "#5b8cff",
    shoe: { pos: [0.62, -0.02, 0], rot: [0.02, 0.3, -0.22], scale: 1.04 },
  },
  {
    eyebrow: "02 · Craft",
    title: "CRAFTED IN DETAIL",
    body: "Flip it over. Sculpted traction geometry, hand-finished seams and a heel counter tuned for lockdown.",
    align: "right",
    ghost: "DETAIL",
    variant: "beach",
    bg: ["#1a120a", "#3a2812"],
    accent: "#ffb35c",
    shoe: { pos: [-0.58, 0.05, 0.1], rot: [-1.15, 1.4, 0.3], scale: 1.1 },
  },
  {
    eyebrow: "03 · Style",
    title: "STREET DNA",
    body: "Bold silhouettes born on the street. A colorway for every mood, built to turn heads on every step.",
    align: "left",
    ghost: "STREET",
    variant: "street",
    bg: ["#1a0505", "#4d0f0f"],
    accent: "#ff4545",
    shoe: { pos: [0.6, -0.02, 0], rot: [0.12, 2.6, 0], scale: 1.06 },
  },
  {
    eyebrow: "The Collection",
    title: "STEP INTO THE FUTURE",
    body: "Premium drops, heat-certified classics and everyday icons — all in one place.",
    align: "center",
    cta: true,
    ghost: "FUTURE",
    variant: "midnight",
    bg: ["#0a0a0e", "#101018"],
    accent: "#fa5400",
    shoe: { pos: [0, -0.05, 0], rot: [0.12, Math.PI * 2 - 0.55, -0.08], scale: 1.0 },
  },
];

const SEGMENTS = FRAMES.length - 1;

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smoothstep = (t) => t * t * (3 - 2 * t);

function makeRadialTexture(inner, outer) {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function StaticHeroFallback({ onCta }) {
  return (
    <section
      style={{
        height: "100vh",
        backgroundImage:
          "linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.55)),url('https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1800&auto=format&fit=crop')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(40px, 12vw, 110px)",
          letterSpacing: "6px",
          color: "#fff",
          marginBottom: "20px",
        }}
      >
        SOLEMATE
      </h1>
      <p style={{ maxWidth: "800px", fontSize: "22px", color: "rgba(255,255,255,.85)", lineHeight: "1.8" }}>
        Discover premium sneakers crafted for comfort, performance and modern street fashion.
      </p>
      <div style={{ display: "flex", gap: "20px", marginTop: "40px", flexWrap: "wrap", justifyContent: "center" }}>
        <button className="s3d-btn s3d-btn-primary" onClick={onCta}>Shop Now</button>
        <button className="s3d-btn s3d-btn-ghost" onClick={onCta}>Explore Collection</button>
      </div>
    </section>
  );
}

function Sneaker3DExperience({ onCta }) {
  const trackRef = useRef(null);
  const canvasRef = useRef(null);
  const bgRef = useRef(null);
  const glowRef = useRef(null);
  const hintRef = useRef(null);
  const ctaRowRef = useRef(null);
  const frameRefs = useRef([]);
  const titleRefs = useRef([]);
  const ghostRefs = useRef([]);

  const [loadPct, setLoadPct] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [activeFrame, setActiveFrame] = useState(0);

  useEffect(() => {
    if (reducedMotion || failed) return undefined;

    const canvas = canvasRef.current;
    const track = trackRef.current;
    if (!canvas || !track) return undefined;

    let disposed = false;
    let rafId = 0;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch (e) {
      setFailed(true);
      return undefined;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.85;

    const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 40);
    const cameraRig = new THREE.Group();
    cameraRig.add(camera);
    camera.position.set(0, 0.08, 3.4);
    scene.add(cameraRig);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(2.5, 4, 3);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xfa5400, 4.5);
    rimLight.position.set(-3, 2.2, -3.5);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-2, -1.5, 2.5);
    scene.add(fillLight);

    scene.add(new THREE.AmbientLight(0xffffff, 0.25));

    // Shoe hierarchy: shoeGroup carries scroll position/scale, spinGroup carries rotation
    const shoeGroup = new THREE.Group();
    const spinGroup = new THREE.Group();
    shoeGroup.add(spinGroup);
    scene.add(shoeGroup);

    // Soft contact shadow under the shoe
    const shadowTex = makeRadialTexture("rgba(0,0,0,0.62)", "rgba(0,0,0,0)");
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.2), shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -0.78;
    scene.add(shadow);

    // Ambient floating particles
    const particleCount = 240;
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 7;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4.2;
      positions[i * 3 + 2] = -1.6 + Math.random() * 2.2;
      speeds[i] = 0.0025 + Math.random() * 0.006;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.028,
      map: makeRadialTexture("rgba(255,255,255,1)", "rgba(255,255,255,0)"),
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ---- model loading -------------------------------------------------
    let baseScale = 1;
    let variantApi = null;
    let lastVariant = null;

    const applyVariant = (name) => {
      if (!variantApi || name === lastVariant) return;
      lastVariant = name;
      variantApi.select(name);
    };

    const loader = new GLTFLoader();
    loader.load(
      MODEL_URL,
      (gltf) => {
        if (disposed) return;
        const model = gltf.scene;

        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        baseScale = 2.15 / Math.max(size.x, size.y, size.z);

        spinGroup.add(model);

        const parser = gltf.parser;
        const rootExt = gltf.userData.gltfExtensions?.KHR_materials_variants;
        if (rootExt) {
          const names = rootExt.variants.map((v) => v.name);
          variantApi = {
            select: (name) => {
              const idx = names.indexOf(name);
              if (idx < 0) return;
              model.traverse((obj) => {
                if (!obj.isMesh || !obj.userData.gltfExtensions) return;
                const meshExt = obj.userData.gltfExtensions.KHR_materials_variants;
                if (!meshExt) return;
                if (!obj.userData.originalMaterial) obj.userData.originalMaterial = obj.material;
                const mapping = meshExt.mappings.find((m) => m.variants.includes(idx));
                if (mapping) {
                  parser.getDependency("material", mapping.material).then((mat) => {
                    if (disposed) return;
                    obj.material = mat;
                    parser.assignFinalMaterial(obj);
                  });
                } else {
                  obj.material = obj.userData.originalMaterial;
                }
              });
            },
          };
          // Warm every variant's materials so scroll switches never hitch
          rootExt.variants.forEach((_, vi) => {
            model.traverse((obj) => {
              const meshExt = obj.userData?.gltfExtensions?.KHR_materials_variants;
              const mapping = meshExt?.mappings.find((m) => m.variants.includes(vi));
              if (mapping) parser.getDependency("material", mapping.material);
            });
          });
          applyVariant(FRAMES[0].variant);
        }

        setReady(true);
      },
      (xhr) => {
        if (!disposed && xhr.total) setLoadPct(Math.round((xhr.loaded / xhr.total) * 100));
      },
      () => {
        if (!disposed) setFailed(true);
      }
    );

    // ---- interaction state ----------------------------------------------
    let current = 0;
    let mouseX = 0;
    let mouseY = 0;
    let extraYaw = 0;
    let dragging = false;
    let lastPointerX = 0;
    let isMobile = window.innerWidth < 768;
    let visible = true;
    let lastActive = -1;

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(track);

    const onResize = () => {
      isMobile = window.innerWidth < 768;
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      // Pull the camera back on narrow screens so the shoe never overflows
      camera.position.z = camera.aspect < 0.8 ? 4.7 : 3.4;
      camera.updateProjectionMatrix();
    };
    onResize();
    const onPointerMove = (e) => {
      mouseX = e.clientX / window.innerWidth - 0.5;
      mouseY = e.clientY / window.innerHeight - 0.5;
      if (dragging) {
        extraYaw += (e.clientX - lastPointerX) * 0.005;
        lastPointerX = e.clientX;
      }
    };
    const onPointerDown = (e) => {
      dragging = true;
      lastPointerX = e.clientX;
    };
    const onPointerUp = () => {
      dragging = false;
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);

    const bgA = new THREE.Color();
    const bgB = new THREE.Color();
    const accent = new THREE.Color();
    const tmpA = new THREE.Color();
    const tmpB = new THREE.Color();

    const clock = new THREE.Clock();

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      if (!visible) return;

      const dt = Math.min(clock.getDelta(), 0.1);
      const t = clock.getElapsedTime();
      const rect = track.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const target = scrollable > 0 ? clamp01(-rect.top / scrollable) : 0;
      // Frame-rate independent damping so the scrub feels identical at any Hz
      current = lerp(current, target, 1 - Math.exp(-5.5 * dt));
      if (Math.abs(current - target) < 0.0004) current = target;

      const scaled = current * SEGMENTS;
      const seg = Math.min(Math.floor(scaled), SEGMENTS - 1);
      const local = smoothstep(clamp01(scaled - seg));
      const a = FRAMES[seg];
      const b = FRAMES[seg + 1];

      // --- shoe transform ---
      const mobilePosMul = isMobile ? 0.25 : 1;
      const mobileScaleMul = isMobile ? 0.66 : 1;
      const bob = Math.sin(t * 1.3) * 0.03;

      shoeGroup.position.set(
        lerp(a.shoe.pos[0], b.shoe.pos[0], local) * mobilePosMul,
        lerp(a.shoe.pos[1], b.shoe.pos[1], local) + bob + (isMobile ? 0.28 : 0),
        lerp(a.shoe.pos[2], b.shoe.pos[2], local)
      );
      const s = baseScale * lerp(a.shoe.scale, b.shoe.scale, local) * mobileScaleMul;
      shoeGroup.scale.setScalar(s);

      if (!dragging) extraYaw *= 0.94;
      spinGroup.rotation.set(
        lerp(a.shoe.rot[0], b.shoe.rot[0], local),
        lerp(a.shoe.rot[1], b.shoe.rot[1], local) + Math.sin(t * 0.4) * 0.05 + extraYaw,
        lerp(a.shoe.rot[2], b.shoe.rot[2], local)
      );

      // --- shadow follows shoe ---
      shadow.position.x = shoeGroup.position.x;
      shadow.scale.setScalar(lerp(a.shoe.scale, b.shoe.scale, local) * mobileScaleMul);
      shadowMat.opacity = 0.85 - bob * 6;

      // --- camera parallax ---
      cameraRig.rotation.y = lerp(cameraRig.rotation.y, -mouseX * 0.07, 0.05);
      cameraRig.rotation.x = lerp(cameraRig.rotation.x, mouseY * 0.05, 0.05);

      // --- particles drift + scroll parallax ---
      const pos = particleGeo.attributes.position;
      for (let i = 0; i < particleCount; i++) {
        let y = pos.getY(i) + speeds[i] * 0.4;
        if (y > 2.2) y = -2.2;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
      particles.position.y = -current * 0.9;
      particles.rotation.y = current * 0.4;

      // --- background gradient + accent glow + rim light ---
      bgA.set(a.bg[0]).lerp(tmpA.set(b.bg[0]), local);
      bgB.set(a.bg[1]).lerp(tmpB.set(b.bg[1]), local);
      accent.set(a.accent).lerp(tmpA.set(b.accent), local);
      rimLight.color.copy(accent);

      if (bgRef.current) {
        bgRef.current.style.background = `linear-gradient(160deg, #${bgA.getHexString()} 0%, #${bgB.getHexString()} 100%)`;
      }
      if (glowRef.current) {
        glowRef.current.style.background = `radial-gradient(circle at ${
          50 + shoeGroup.position.x * 18
        }% 55%, #${accent.getHexString()}24 0%, transparent 55%)`;
      }

      // --- text frames, ghost words, hint ---
      for (let i = 0; i < FRAMES.length; i++) {
        const centerP = i / SEGMENTS;
        const d = (current - centerP) * SEGMENTS; // -1..1 within neighbour frames
        const vis = smoothstep(clamp01(1 - Math.abs(d) * 2.1));

        const el = frameRefs.current[i];
        if (el) {
          el.style.opacity = vis;
          el.style.transform = `translateY(${d * -70}px)`;
          el.style.pointerEvents = FRAMES[i].cta && vis > 0.5 ? "auto" : "none";
        }
        const title = titleRefs.current[i];
        if (title) title.style.letterSpacing = `${2 + (1 - vis) * 14}px`;

        const ghost = ghostRefs.current[i];
        if (ghost) {
          ghost.style.opacity = vis * 0.9;
          ghost.style.transform = `translate(calc(-50% + ${d * -160}px), -50%)`;
        }
      }
      if (hintRef.current) {
        hintRef.current.style.opacity = clamp01(1 - current * 14);
      }

      // --- active frame: dots + colorway switch ---
      const active = Math.round(current * SEGMENTS);
      if (active !== lastActive) {
        lastActive = active;
        setActiveFrame(active);
        applyVariant(FRAMES[active].variant);
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      io.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => {
            Object.values(m).forEach((v) => {
              if (v && v.isTexture) v.dispose();
            });
            m.dispose();
          });
        }
      });
      pmrem.dispose();
      renderer.dispose();
    };
  }, [reducedMotion, failed]);

  if (reducedMotion || failed) {
    return <StaticHeroFallback onCta={onCta} />;
  }

  const scrollToFrame = (i) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const top = window.scrollY + rect.top;
    const scrollable = track.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + (scrollable * i) / SEGMENTS, behavior: "smooth" });
  };

  return (
    <section ref={trackRef} className="s3d-track" style={{ height: `${TRACK_VH}vh` }}>
      <div className="s3d-sticky">
        <div ref={bgRef} className="s3d-bg" style={{ background: "#0a0a0e" }} />
        <div ref={glowRef} className="s3d-glow" />

        {FRAMES.map((f, i) => (
          <div key={`ghost-${f.ghost}-${i}`} ref={(el) => (ghostRefs.current[i] = el)} className="s3d-ghost">
            {f.ghost}
          </div>
        ))}

        <canvas ref={canvasRef} className={`s3d-canvas${ready ? " is-ready" : ""}`} />
        <div className="s3d-vignette" />

        {FRAMES.map((f, i) => (
          <div
            key={f.title}
            ref={(el) => (frameRefs.current[i] = el)}
            className={`s3d-frame align-${f.align}`}
          >
            <div className="s3d-frame-inner">
              <span className="s3d-eyebrow" style={{ color: f.accent }}>
                {f.eyebrow}
              </span>
              <h1
                ref={(el) => (titleRefs.current[i] = el)}
                className={`s3d-title${f.hero ? " is-hero" : ""}`}
              >
                {f.title}
              </h1>
              <p className="s3d-body">{f.body}</p>
              {f.cta && (
                <div ref={ctaRowRef} className="s3d-cta-row">
                  <button className="s3d-btn s3d-btn-primary" onClick={onCta}>
                    Shop Now
                  </button>
                  <button className="s3d-btn s3d-btn-ghost" onClick={onCta}>
                    Explore Collection
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        <div ref={hintRef} className="s3d-hint">
          <span>Scroll</span>
          <div className="s3d-hint-line" />
        </div>

        <div className="s3d-rail">
          {FRAMES.map((f, i) => (
            <button
              key={f.title}
              aria-label={`Go to ${f.title}`}
              className={`s3d-dot${activeFrame === i ? " is-active" : ""}`}
              onClick={() => scrollToFrame(i)}
            />
          ))}
        </div>

        <div className="s3d-counter">
          <b>{String(activeFrame + 1).padStart(2, "0")}</b> / {String(FRAMES.length).padStart(2, "0")}
        </div>

        {!ready && (
          <div className="s3d-loader">
            <span>Loading Experience</span>
            <div className="s3d-loader-bar">
              <span style={{ width: `${loadPct}%` }} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default Sneaker3DExperience;
