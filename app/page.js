"use client";

import { useState, useCallback } from "react";
import TransactionInput from "./components/TransactionInput";
import TotalCard from "./components/TotalCard";
import SpendingChart from "./components/SpendingChart";
import TransactionList from "./components/TransactionList";
import { parseTransaction } from "./lib/classifier";

export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const [toast, setToast] = useState({ visible: false, message: "" });

  const showToast = useCallback((message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: "" }), 2200);
  }, []);

  const handleAddTransaction = useCallback(
    (text) => {
      const parsed = parseTransaction(text);

      if (parsed.amount === 0) {
        showToast("⚠️ Couldn't find an amount — try \"Swiggy 300\"");
        return;
      }

      setTransactions((prev) => [...prev, parsed]);
      showToast(
        `${parsed.emoji} ₹${parsed.amount.toLocaleString("en-IN")} → ${parsed.category}`
      );
    },
    [showToast]
  );

  return (
    <>
      {/* Toast notification */}
      <div
        className={`toast ${toast.visible ? "toast--visible" : ""}`}
        id="toast"
      >
        {toast.message}
      </div>

      <main className="app-container">
        {/* Section 1: Branding */}
        <header className="header">
          <div className="header__logo">
            <div className="header__icon">₹</div>
            <h1 className="header__title">FixMyPayments</h1>
          </div>
          <p className="header__subtitle">
            Track spending in plain English
          </p>
        </header>

        {/* Section 2: Transaction Input */}
        <TransactionInput onAdd={handleAddTransaction} />

        {/* Section 3: Dashboard */}
        <section className="dashboard" id="dashboard">
          <TotalCard transactions={transactions} />
          <SpendingChart transactions={transactions} />
          <TransactionList transactions={transactions} />
        </section>
      </main>
    </>
  );
}
