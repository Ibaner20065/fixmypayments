"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import TransactionInput from "../components/TransactionInput";
import SpendingChart from "../components/SpendingChart";
import TransactionList from "../components/TransactionList";
import { parseTransaction } from "../lib/classifier";

export default function DashboardPage() {
  const [transactions, setTransactions] = useState([]);
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [profileOpen, setProfileOpen] = useState(false);
  const statsRef = useRef(null);

  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: "" }), 2200);
  };

  const handleAddTransaction = (text) => {
    const parsed = parseTransaction(text);
    if (parsed.amount === 0) {
      showToast("⚠️ Couldn't find an amount — try \"Swiggy 300\"");
      return;
    }
    setTransactions((prev) => [...prev, parsed]);
    showToast(`${parsed.emoji} ₹${parsed.amount.toLocaleString("en-IN")} → ${parsed.category}`);
  };

  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  const categoryCount = [...new Set(transactions.map((t) => t.category))].length;

  const scrollToStats = () => {
    statsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <motion.div
      className="dark-app"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Toast */}
      <div className={`dark-toast ${toast.visible ? "dark-toast--show" : ""}`}>
        {toast.message}
      </div>

      {/* ===== TASKBAR ===== */}
      <nav className="taskbar">
        <div className="taskbar__left">
          <div className="taskbar__logo">
            <span className="taskbar__icon">₹</span>
            <span className="taskbar__brand">FixMyPayments</span>
          </div>
        </div>
        <div className="taskbar__center">
          <button className="taskbar__link taskbar__link--active">Dashboard</button>
          <button className="taskbar__link" onClick={scrollToStats}>Transactions</button>
          <button className="taskbar__link">Analytics</button>
        </div>
        <div className="taskbar__right">
          <button
            className="taskbar__profile"
            onClick={() => setProfileOpen(!profileOpen)}
            id="profile-btn"
          >
            <span className="taskbar__avatar">IN</span>
          </button>
          {profileOpen && (
            <motion.div
              className="profile-dropdown"
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="profile-dropdown__header">
                <div className="profile-dropdown__avatar">IN</div>
                <div>
                  <div className="profile-dropdown__name">Indrayudh</div>
                  <div className="profile-dropdown__email">indrayudh@email.com</div>
                </div>
              </div>
              <div className="profile-dropdown__divider" />
              <button className="profile-dropdown__item">⚙️ Settings</button>
              <button className="profile-dropdown__item">📊 Reports</button>
              <button className="profile-dropdown__item profile-dropdown__item--danger">🚪 Sign Out</button>
            </motion.div>
          )}
        </div>
      </nav>

      {/* ===== HERO — TEXT BEHIND STATUE ===== */}
      <section className="hero">
        <div className="hero__bg" />
        <div className="hero__noise" />

        {/* Layer 1: Massive text BEHIND the statue */}
        <div className="hero__bigtext-wrap">
          <motion.span
            className="hero__bigtext"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            CONTROL
          </motion.span>
        </div>

        {/* Layer 2: Statue ON TOP of the text */}
        <motion.img
          src="/statue.png"
          alt=""
          className="hero__statue"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        />

        {/* Layer 3: Content on top of everything */}
        <div className="hero__content">
          <motion.div
            className="hero__left"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="hero__badge">AI-POWERED FINANCE</div>
            <h1 className="hero__title">
              HIGH-PERFORMANCE<br />
              EXPENSE TRACKING<br />
              DESIGNED FOR<br />
              <span className="hero__accent">THOSE WHO</span><br />
              <span className="hero__accent">TAKE CONTROL</span>
            </h1>
            <p className="hero__desc">
              That require instant categorization,
              <br />real-time insights into spending,
              <br />and uninterrupted financial clarity.
            </p>
            <button className="hero__cta" onClick={scrollToStats}>
              View Your Stats
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M5 10l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </motion.div>
        </div>

        {/* Bottom bar with features */}
        <motion.div
          className="hero__bottom"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <div className="hero__bottom-item">
            <span className="hero__bottom-label">INSTANT</span>
            <span className="hero__bottom-value">Logging</span>
          </div>
          <div className="hero__bottom-divider" />
          <div className="hero__bottom-item">
            <span className="hero__bottom-label">AI-POWERED</span>
            <span className="hero__bottom-value">Categories</span>
          </div>
          <div className="hero__bottom-divider" />
          <div className="hero__bottom-item">
            <span className="hero__bottom-label">REAL-TIME</span>
            <span className="hero__bottom-value">Insights</span>
          </div>
        </motion.div>
      </section>

      {/* ===== STATS SECTION (SCROLLED DOWN) ===== */}
      <div className="dark-main" ref={statsRef}>
        {/* Live stats bar */}
        <motion.div
          className="stats-bar"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="stats-bar__item">
            <div className="stats-bar__value">₹{total.toLocaleString("en-IN")}</div>
            <div className="stats-bar__label">Total Tracked</div>
          </div>
          <div className="stats-bar__divider" />
          <div className="stats-bar__item">
            <div className="stats-bar__value">{transactions.length}</div>
            <div className="stats-bar__label">Transactions</div>
          </div>
          <div className="stats-bar__divider" />
          <div className="stats-bar__item">
            <div className="stats-bar__value">{categoryCount}</div>
            <div className="stats-bar__label">Categories</div>
          </div>
        </motion.div>

        {/* Transaction Input */}
        <motion.section
          className="dark-section"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="dark-section__title">
            <span className="dark-section__icon">⚡</span>
            Quick Add
          </h2>
          <TransactionInput onAdd={handleAddTransaction} />
        </motion.section>

        {/* Charts */}
        <motion.section
          className="dark-section"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="dark-section__title">
            <span className="dark-section__icon">📊</span>
            Spending Breakdown
          </h2>
          <SpendingChart transactions={transactions} />
        </motion.section>

        {/* Transactions */}
        <motion.section
          className="dark-section"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="dark-section__title">
            <span className="dark-section__icon">📋</span>
            Recent Activity
          </h2>
          <TransactionList transactions={transactions} />
        </motion.section>
      </div>

      {/* Footer */}
      <footer className="dark-footer">
        <span>FixMyPayments © 2026</span>
        <span>·</span>
        <span>AI-Powered Finance</span>
      </footer>
    </motion.div>
  );
}
