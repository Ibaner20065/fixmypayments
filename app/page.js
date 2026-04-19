"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function LandingPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={heroRef}
      className="landing-root"
      style={{ cursor: "default" }}
    >
      {/* ===== CINEMATIC GRADIENT BACKGROUND ===== */}
      <div className="landing-gradient" />

      {/* ===== NOISE OVERLAY ===== */}
      <div className="landing-noise" />

      {/* ===== MASSIVE BACKGROUND TEXT ===== */}
      <motion.h1
        className="landing-bigtext"
        style={{
          transform: `translate(calc(-50% + ${mousePos.x * -15}px), calc(-50% + ${mousePos.y * -10}px))`,
        }}
      >
        CONTROL
      </motion.h1>

      {/* ===== STATUE ===== */}
      <motion.img
        src="/statue.png"
        alt=""
        className="landing-statue"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
        style={{
          transform: `translate(${mousePos.x * 8}px, ${mousePos.y * 5}px)`,
        }}
      />

      {/* ===== CONTENT ===== */}
      <div className="landing-content">
        {/* Nav */}
        <motion.nav
          className="landing-nav"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="landing-nav__logo">
            <span className="landing-nav__icon">₹</span>
            <span className="landing-nav__brand">FixMyPayments</span>
          </div>
        </motion.nav>

        {/* Hero */}
        <div className="landing-hero">
          <motion.div
            className="landing-hero__badge"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            AI-Powered Finance
          </motion.div>

          <motion.h2
            className="landing-hero__title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            AI Financial
            <br />
            <span className="landing-hero__accent">Copilot</span>
          </motion.h2>

          <motion.p
            className="landing-hero__sub"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
          >
            Stop overspending before it happens.
            <br />
            Track every rupee with a single sentence.
          </motion.p>

          <motion.div
            className="landing-hero__actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <Link href="/login" className="landing-cta">
              Get Started
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                style={{ marginLeft: "8px" }}
              >
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <Link href="/dashboard" className="landing-cta-ghost">
              View Dashboard
            </Link>
          </motion.div>
        </div>

        {/* Feature strip */}
        <motion.div
          className="landing-features"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <div className="landing-feature">
            <span className="landing-feature__icon">⚡</span>
            <span className="landing-feature__text">Instant Logging</span>
          </div>
          <div className="landing-feature__divider" />
          <div className="landing-feature">
            <span className="landing-feature__icon">🧠</span>
            <span className="landing-feature__text">AI Categories</span>
          </div>
          <div className="landing-feature__divider" />
          <div className="landing-feature">
            <span className="landing-feature__icon">📊</span>
            <span className="landing-feature__text">Live Insights</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
