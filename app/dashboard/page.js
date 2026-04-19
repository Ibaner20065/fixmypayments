"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import TransactionInput from "../components/TransactionInput";
import TotalCard from "../components/TotalCard";
import SpendingChart from "../components/SpendingChart";
import TransactionList from "../components/TransactionList";
import { parseTransaction } from "../lib/classifier";
import Link from "next/link";

export default function DashboardPage() {
  const [transactions, setTransactions] = useState([]);
  const [toast, setToast] = useState({ visible: false, message: "" });

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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
    >
      {/* Toast notification */}
      <div
        className={`toast ${toast.visible ? "toast--visible" : ""}`}
        id="toast"
      >
        {toast.message}
      </div>

      <main className="app-container">
        {/* Section 1: Dashboard Header */}
        <motion.header
          className="dash-header"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="dash-header__top">
            <div>
              <div className="dash-header__greeting">Good evening 👋</div>
              <h1 className="dash-header__title">Your Spending</h1>
            </div>
            <Link href="/" className="dash-header__logo">
              <span className="dash-header__logo-icon">₹</span>
            </Link>
          </div>

          {/* Inline total */}
          <motion.div
            className="dash-header__total"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <span className="dash-header__total-currency">₹</span>
            <span className="dash-header__total-amount">
              {total.toLocaleString("en-IN")}
            </span>
            <span className="dash-header__total-label">
              {transactions.length === 0
                ? "No transactions yet"
                : `across ${transactions.length} transaction${transactions.length !== 1 ? "s" : ""}`}
            </span>
          </motion.div>
        </motion.header>

        {/* Section 2: Transaction Input */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <TransactionInput onAdd={handleAddTransaction} />
        </motion.div>

        {/* Section 3: Dashboard */}
        <motion.section
          className="dashboard"
          id="dashboard"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <SpendingChart transactions={transactions} />
          <TransactionList transactions={transactions} />
        </motion.section>
      </main>
    </motion.div>
  );
}
