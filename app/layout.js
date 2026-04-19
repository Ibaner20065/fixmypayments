import "./globals.css";

export const metadata = {
  title: "FixMyPayments — Smart Expense Tracker",
  description:
    "AI-powered personal finance assistant. Log transactions in natural language, see instant spending insights.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
