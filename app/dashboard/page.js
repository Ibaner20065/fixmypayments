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
  const inputRef = useRef(null);

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
    showToast(
      `${parsed.emoji} ₹${parsed.amount.toLocaleString("en-IN")} → ${parsed.category}`
    );
  };

  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  const categoryCount = [...new Set(transactions.map((t) => t.category))].length;

  const scrollToInput = () => {
    inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
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
          <button className="taskbar__link" onClick={scrollToInput}>Transactions</button>
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
          {/* Profile dropdown */}
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
              <button className="profile-dropdown__item profile-dropdown__item--danger">
                🚪 Sign Out
              </button>
            </motion.div>
          )}
        </div>
      </nav>

      {/* ===== HERO / BRAND SECTION ===== */}
      <section className="dark-hero">
        <div className="dark-hero__bg" />
        <div className="dark-hero__noise" />
        <div className="dark-hero__glow" />

        <motion.div
          className="dark-hero__content"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="dark-hero__badge">AI-POWERED FINANCE</div>
          <h1 className="dark-hero__title">
            Take <span className="dark-hero__accent">Control</span> of
            <br />
            Your Money
          </h1>
          <p className="dark-hero__subtitle">
            Track every rupee with a single sentence.
            <br />
            AI-powered categorization. Real-time insights.
          </p>

          {/* Stats row */}
          <div className="dark-hero__stats">
            <div className="dark-hero__stat">
              <div className="dark-hero__stat-value">
                ₹{total.toLocaleString("en-IN")}
              </div>
              <div className="dark-hero__stat-label">Total Tracked</div>
            </div>
            <div className="dark-hero__stat-divider" />
            <div className="dark-hero__stat">
              <div className="dark-hero__stat-value">{transactions.length}</div>
              <div className="dark-hero__stat-label">Transactions</div>
            </div>
            <div className="dark-hero__stat-divider" />
            <div className="dark-hero__stat">
              <div className="dark-hero__stat-value">{categoryCount}</div>
              <div className="dark-hero__stat-label">Categories</div>
            </div>
          </div>

          <button className="dark-hero__cta" onClick={scrollToInput}>
            Add Transaction
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M5 10l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </motion.div>
      </section>

      {/* ===== MAIN CONTENT ===== */}
      <div className="dark-main">
        {/* Transaction Input */}
        <motion.section
          className="dark-section"
          ref={inputRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
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
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
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
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
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
