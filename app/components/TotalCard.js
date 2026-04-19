"use client";

export default function TotalCard({ transactions }) {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="total-card fade-in" id="total-spending-card">
      <div className="total-card__label">Total Spent</div>
      <div className="total-card__amount">
        <span className="total-card__currency">₹</span>
        {total.toLocaleString("en-IN")}
      </div>
      <div className="total-card__count">
        {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
