"use client";

import { useState } from "react";

export default function TransactionInput({ onAdd }) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    setIsSubmitting(true);

    // Slight delay for feel
    await new Promise((r) => setTimeout(r, 150));

    onAdd(trimmed);
    setText("");
    setIsSubmitting(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  return (
    <section className="input-section fade-in">
      <form onSubmit={handleSubmit} className="input-wrapper">
        <input
          id="transaction-input"
          type="text"
          className="input-field"
          placeholder='Try "Swiggy 300" or "Uber 150"'
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          autoFocus
        />
      </form>
      <button
        id="submit-btn"
        className="submit-btn"
        onClick={handleSubmit}
        disabled={!text.trim() || isSubmitting}
      >
        {isSubmitting ? "Adding..." : "Add Transaction"}
      </button>
    </section>
  );
}
