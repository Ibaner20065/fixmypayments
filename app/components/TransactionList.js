"use client";

import { CATEGORY_COLORS } from "../lib/classifier";

function formatDate(isoDate) {
  const date = new Date(isoDate);
  const now = new Date();
  const diff = now - date;

  // Less than 1 minute
  if (diff < 60000) return "Just now";

  // Less than 1 hour
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return `${mins}m ago`;
  }

  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }

  // Otherwise use date
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export default function TransactionList({ transactions }) {
  if (transactions.length === 0) {
    return (
      <div className="transactions-card fade-in" id="transactions-list">
        <div className="transactions-card__header">
          <div className="transactions-card__title">Recent Transactions</div>
        </div>
        <div className="empty-state">
          <div className="empty-state__icon">✨</div>
          <div className="empty-state__text">No transactions yet</div>
          <div className="empty-state__hint">
            Type something like &quot;Swiggy 300&quot; above
          </div>
        </div>
      </div>
    );
  }

  // Show newest first, limit to 20
  const recent = [...transactions].reverse().slice(0, 20);

  return (
    <div className="transactions-card fade-in" id="transactions-list">
      <div className="transactions-card__header">
        <div className="transactions-card__title">Recent Transactions</div>
      </div>
      <ul className="transaction-list">
        {recent.map((t) => (
          <li key={t.id} className="transaction-item">
            <div className="transaction-item__left">
              <div
                className="transaction-item__icon"
                style={{
                  backgroundColor:
                    (CATEGORY_COLORS[t.category] || "#D4D4D4") + "18",
                  color: CATEGORY_COLORS[t.category] || "#737373",
                }}
              >
                {t.emoji}
              </div>
              <div className="transaction-item__details">
                <div className="transaction-item__text">{t.text}</div>
                <div className="transaction-item__meta">
                  {t.category} · {formatDate(t.date)}
                </div>
              </div>
            </div>
            <div className="transaction-item__right">
              <div className="transaction-item__amount">
                ₹{t.amount.toLocaleString("en-IN")}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
