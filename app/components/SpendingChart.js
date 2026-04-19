"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { CATEGORY_COLORS, CATEGORY_EMOJIS } from "../lib/classifier";

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        style={{
          background: "white",
          padding: "8px 14px",
          borderRadius: "10px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          border: "1px solid rgba(0,0,0,0.06)",
          fontSize: "0.8125rem",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <span style={{ fontWeight: 500 }}>
          {CATEGORY_EMOJIS[data.name] || "📦"} {data.name}
        </span>
        <br />
        <span style={{ color: "#737373" }}>
          ₹{data.value.toLocaleString("en-IN")} ({data.percent}%)
        </span>
      </div>
    );
  }
  return null;
}

export default function SpendingChart({ transactions }) {
  // Aggregate by category
  const categoryTotals = {};
  transactions.forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const total = transactions.reduce((s, t) => s + t.amount, 0);

  const data = Object.entries(categoryTotals)
    .map(([name, value]) => ({
      name,
      value,
      percent: total > 0 ? Math.round((value / total) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return (
      <div className="chart-card fade-in">
        <div className="chart-card__title">Spending by Category</div>
        <div className="empty-state">
          <div className="empty-state__icon">📊</div>
          <div className="empty-state__text">
            Add transactions to see your breakdown
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card fade-in" id="spending-chart">
      <div className="chart-card__title">Spending by Category</div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
              animationBegin={0}
              animationDuration={600}
              animationEasing="ease-out"
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={CATEGORY_COLORS[entry.name] || "#D4D4D4"}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="category-legend">
        {data.map((entry) => (
          <div key={entry.name} className="category-legend__item">
            <span
              className="category-legend__dot"
              style={{
                backgroundColor:
                  CATEGORY_COLORS[entry.name] || "#D4D4D4",
              }}
            />
            {entry.name} · {entry.percent}%
          </div>
        ))}
      </div>
    </div>
  );
}
