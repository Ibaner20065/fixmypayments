'use client';

import React from 'react';
import CardNav from './components/CardNav';
import type { CardNavItem } from './components/CardNav';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, X, Zap, TrendingUp, Shield, ChevronRight, Star } from 'lucide-react';

const navItems: CardNavItem[] = [
  {
    label: 'PRODUCT',
    bgColor: 'var(--d-volt)',
    textColor: 'var(--d-black)',
    links: [
      { label: 'DASHBOARD', href: '/dashboard', ariaLabel: 'View Dashboard' },
      { label: 'AI CLASSIFIER', href: '/dashboard', ariaLabel: 'AI Classification' },
      { label: 'ANALYTICS', href: '/dashboard', ariaLabel: 'Spending Analytics' },
    ],
  },
  {
    label: 'WEB3',
    bgColor: 'var(--d-dark)',
    textColor: 'var(--d-white)',
    links: [
      { label: 'ZAAP BUNDLER', href: '/zaap', ariaLabel: 'Bundle Transactions' },
      { label: 'PAYMASTER', href: '/zaap', ariaLabel: 'Paymaster Config' },
      { label: 'AML STATUS', href: '/zaap', ariaLabel: 'AML Verification' },
      { label: 'KYC ORCHESTRATOR', href: '/kyc', ariaLabel: 'Identity Orchestrator' },
    ],
  },
  {
    label: 'COMPANY',
    bgColor: 'var(--bg-secondary)',
    textColor: 'var(--d-volt)',
    links: [
      { label: 'ABOUT', href: '/', ariaLabel: 'About Us' },
      { label: 'BLOG', href: '/', ariaLabel: 'Blog' },
      { label: 'CONTACT', href: '/', ariaLabel: 'Contact Us' },
    ],
  },
];

const features = [
  { icon: <Zap size={24} />, title: 'Instant Classification', desc: 'Type "Swiggy 300" and AI instantly categorizes it. No forms, no friction.' },
  { icon: <TrendingUp size={24} />, title: 'Real-Time Analytics', desc: 'See your spending breakdown update live with every transaction you add.' },
  { icon: <Shield size={24} />, title: 'AML-Verified DeFi', desc: 'PureFi Paymaster blocks flagged addresses. Your funds stay compliant.' },
];

const steps = [
  { num: '01', title: 'CONNECT', desc: 'Link your wallet or start typing transactions in natural language.' },
  { num: '02', title: 'CLASSIFY', desc: 'AI categorizes every transaction across 8 spending categories instantly.' },
  { num: '03', title: 'VERIFY', desc: 'Privacy-first Identity Orchestration verifies your profile without exposing raw data.' },
  { num: '04', title: 'CONTROL', desc: 'Bundle DeFi operations gaslessly. Track, swap, and transfer in one click.' },
];

const personas = [
  { type: 'FREELANCER', title: 'Track Every Rupee', desc: 'Natural language expense logging makes tax season painless.', bg: '#b7c6c2', color: '#000' },
  { type: 'DEFI NATIVE', title: 'Bundle & Save', desc: 'ZAAP bundles 3 DeFi steps into 1 gasless transaction on zkSync.', bg: '#ffe17c', color: '#000', featured: true },
  { type: 'TEAM LEAD', title: 'Full Visibility', desc: 'Real-time dashboards with AI-powered category breakdowns.', bg: '#272727', color: '#fff' },
];

const testimonials = [
  { name: 'Arjun K.', role: 'DeFi Developer', text: 'ZAAP bundling saved me hundreds in gas fees. The AML verification is seamless.', rating: 5 },
  { name: 'Priya S.', role: 'Freelance Designer', text: 'I just type "Figma 1200" and it categorizes everything. So fast.', rating: 5 },
  { name: 'Rohit M.', role: 'Startup Founder', text: 'Finally a finance tool that speaks both Web2 and Web3.', rating: 5 },
];

const marqueeNames = ['ZKSYNC', 'AAVE', 'UNISWAP', 'MUTE.IO', 'PUREFI', 'RECHARTS', 'CLAUDE AI', 'NEXT.JS'];

export default function LandingPage() {
  const router = useRouter();
  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* ═══ NAV ═══ */}
      <CardNav
        brandName="FIXMYPAYMENTS"
        items={navItems}
        baseColor="var(--bg-primary)"
        menuColor="var(--text-primary)"
        buttonBgColor="var(--d-volt)"
        buttonTextColor="var(--d-black)"
        buttonText="START FREE"
        buttonHref="/auth"
        variant="disruptor"
      />

      {/* ═══ HERO ═══ */}
      <section
        className="y-dot-pattern"
        style={{
          background: 'var(--bg-primary)',
          padding: '80px 24px 60px',
          borderBottom: 'var(--d-border)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
          {/* Left */}
          <div>
            <span className="y-badge" style={{ marginBottom: 20, display: 'inline-block' }}>
              NEW: AI FINANCE ASSISTANT
            </span>
            <h1
              className="y-heading"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1.05, marginBottom: 20 }}
            >
              TRACK SPENDING.
              <br />
              <span className="y-heading--outline">BUNDLE</span> DEFI.
              <br />
              SHIP FASTER.
            </h1>
            <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: 32, maxWidth: 480, lineHeight: 1.7 }}>
              AI-powered expense tracking meets gasless DeFi. Type a transaction, see it classified instantly, and bundle multi-step DeFi into one click.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link href="/auth" className="y-btn-primary">
                LAUNCH APP <ArrowRight size={16} />
              </Link>
              <button 
                onClick={() => {
                  localStorage.setItem('fb-id-token', 'demo-token');
                  router.push('/dashboard');
                }}
               className="y-btn-secondary"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer', border: 'var(--d-border-thin)' }}
              >
                DEMO LOGIN
              </button>
            </div>
          </div>

          {/* Right — Browser Mockup */}
           <div
            style={{
              background: 'var(--bg-secondary)',
              border: 'var(--d-border)',
              boxShadow: 'var(--d-shadow-lg)',
              overflow: 'hidden',
            }}
          >
            {/* Browser header */}
            <div
              style={{
                background: '#000',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
            </div>
            {/* Browser content */}
            <div style={{ padding: 20 }}>
               <div style={{ background: 'var(--d-volt)', border: 'var(--d-border-thin)', padding: 16, marginBottom: 12, color: 'var(--d-black)' }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                  TOTAL SPENDING
                </div>
                <div style={{ fontFamily: "'Ranchers', cursive", fontSize: '2rem' }}>₹12,450</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: 'var(--d-black)', color: 'var(--d-white)', border: 'var(--d-border-thin)', padding: 12 }}>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.625rem', textTransform: 'uppercase', opacity: 0.7 }}>FOOD</div>
                  <div style={{ fontFamily: "'Ranchers', cursive", fontSize: '1.25rem', color: 'var(--d-volt)' }}>₹4,200</div>
                </div>
                <div style={{ background: 'var(--d-black)', color: 'var(--d-white)', border: 'var(--d-border-thin)', padding: 12 }}>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.625rem', textTransform: 'uppercase', opacity: 0.7 }}>TRANSPORT</div>
                  <div style={{ fontFamily: "'Ranchers', cursive", fontSize: '1.25rem', color: 'var(--d-volt)' }}>₹2,100</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Responsive */}
        <style>{`
          @media (max-width: 768px) {
            section > div[style*="grid-template-columns: 1fr 1fr"] {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </section>

      {/* ═══ SOCIAL PROOF MARQUEE ═══ */}
       <section
        style={{
          background: 'var(--d-black)',
          borderBottom: 'var(--d-border)',
          padding: '16px 0',
          overflow: 'hidden',
        }}
      >
        <div className="marquee-track">
          {[...marqueeNames, ...marqueeNames].map((name, i) => (
            <span
              key={i}
              style={{
                fontFamily: "'Cabinet Grotesk', sans-serif",
                 fontSize: '1rem',
                fontWeight: 800,
                color: 'var(--text-muted)',
                opacity: 0.5,
                padding: '0 40px',
                whiteSpace: 'nowrap',
              }}
            >
              {name}
            </span>
          ))}
        </div>
      </section>

       {/* ═══ PROBLEM vs SOLUTION ═══ */}
      <section style={{ background: 'var(--bg-primary)', padding: '80px 24px', borderBottom: 'var(--d-border)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          {/* Problem */}
           <div
            style={{
              background: 'var(--bg-secondary)',
              border: '2px dashed var(--text-muted)',
              padding: 32,
              opacity: 0.7,
            }}
          >
             <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 800, marginBottom: 20, color: 'var(--text-primary)' }}>
              THE OLD WAY
            </div>
            {['Manual expense spreadsheets', 'Multiple DeFi transactions = multiple gas fees', 'No AML verification', 'Complex multi-step forms'].map((t, i) => (
               <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
                <X size={16} style={{ color: '#ff4444', flexShrink: 0 }} />
                {t}
              </div>
            ))}
          </div>

          {/* Solution */}
           <div
            style={{
              background: 'var(--d-volt)',
              border: 'var(--d-border)',
              boxShadow: 'var(--d-shadow-lg)',
              padding: 32,
              color: 'var(--d-black)',
            }}
          >
            <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 800, marginBottom: 20 }}>
              THE BETTER WAY
            </div>
             {['Type "Swiggy 300" → auto-classified', 'ZAAP bundles 3 steps into 1 tx', 'PureFi AML at contract level', 'Single text input, zero friction'].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, fontSize: '0.9375rem', fontWeight: 500, color: 'var(--d-black)' }}>
                <Check size={16} style={{ color: '#008800', flexShrink: 0 }} />
                {t}
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            section:nth-of-type(3) > div { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

      {/* ═══ FEATURES GRID ═══ */}
       <section
        id="features"
        className="y-dot-pattern"
        style={{
          background: 'var(--bg-primary)',
          padding: '80px 24px',
          borderTop: 'var(--d-border)',
          borderBottom: 'var(--d-border)',
        }}
      >
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.6875rem',
               textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 8,
              color: 'var(--text-secondary)',
            }}
          >
            CAPABILITIES
          </div>
          <h2 className="y-heading" style={{ fontSize: '2.5rem', marginBottom: 48, color: 'var(--text-primary)' }}>
            EVERYTHING YOU NEED
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {features.map((f, i) => (
              <div
                key={i}
                 className="y-card"
                style={{
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  cursor: 'default',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: 'var(--d-border)',
                  boxShadow: 'var(--d-shadow-sm)',
                }}
                 onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--d-shadow-lg)';
                }}
                 onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--d-shadow-sm)';
                }}
              >
                <div
                   style={{
                     width: 48,
                     height: 48,
                     background: 'var(--bg-secondary)',
                     border: 'var(--d-border-thin)',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     marginBottom: 16,
                     transition: 'background 0.2s ease',
                   }}
                 >
                   {f.icon}
                 </div>
                 <h3 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '1.25rem', fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            #features div[style*="repeat(3"] { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

       {/* ═══ HOW IT WORKS (DARK) ═══ */}
      <section style={{ background: 'var(--d-black)', padding: '80px 24px', color: 'var(--d-white)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
         <h2 className="y-heading" style={{ color: 'var(--d-white)', fontSize: '2.5rem', marginBottom: 60 }}>
            HOW IT WORKS
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 48, flexWrap: 'wrap' }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 240 }}>
                <div
                   style={{
                     width: 80,
                     height: 80,
                     borderRadius: '50%',
                     border: '3px solid var(--d-volt)',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     fontFamily: "'Ranchers', cursive",
                     fontSize: '1.5rem',
                     marginBottom: 20,
                     boxShadow: 'var(--d-shadow-volt)',
                   }}
                 >
                   {s.num}
                 </div>
                 <h3 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '1.25rem', fontWeight: 800, marginBottom: 8, color: 'var(--d-white)' }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--d-volt)', lineHeight: 1.6, opacity: 0.8 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

       {/* ═══ PERSONAS / BENTO ═══ */}
      <section style={{ background: 'var(--bg-primary)', padding: '80px 24px', borderTop: 'var(--d-border)', borderBottom: 'var(--d-border)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
           <h2 className="y-heading" style={{ fontSize: '2.5rem', marginBottom: 48, textAlign: 'center', color: 'var(--text-primary)' }}>
            BUILT FOR YOU
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {personas.map((p, i) => (
              <div
                key={i}
                 style={{
                  background: p.bg === '#272727' ? 'var(--d-dark)' : p.bg,
                  color: p.color === '#fff' ? 'var(--d-white)' : p.color,
                  border: 'var(--d-border)',
                  boxShadow: p.featured ? 'var(--d-shadow-lg)' : 'var(--d-shadow-sm)',
                  padding: 28,
                }}
              >
                 <span
                  style={{
                    display: 'inline-block',
                    background: 'var(--bg-primary)',
                    border: 'var(--d-border-thin)',
                    padding: '4px 12px',
                    fontSize: '0.625rem',
                    fontFamily: "'Space Mono', monospace",
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: 16,
                    color: 'var(--text-primary)',
                  }}
                >
                  {p.type}
                </span>
                <h3 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>
                  {p.title}
                </h3>
                <p style={{ fontSize: '0.875rem', opacity: 0.85, lineHeight: 1.6 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            section:nth-of-type(6) div[style*="repeat(3"] { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

       {/* ═══ TESTIMONIALS ═══ */}
      <section style={{ background: 'var(--bg-secondary)', padding: '80px 24px', borderBottom: 'var(--d-border)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
           <h2 className="y-heading" style={{ fontSize: '2.5rem', marginBottom: 48, textAlign: 'center', color: 'var(--text-primary)' }}>
            WHAT THEY SAY
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {testimonials.map((t, i) => (
              <div
                key={i}
                 style={{
                  background: 'var(--bg-primary)',
                  border: 'var(--d-border)',
                  boxShadow: 'var(--d-shadow-sm)',
                  padding: 24,
                  borderRadius: '2px 24px 2px 24px',
                }}
              >
                <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={16} fill="#febc2e" color="#febc2e" />
                  ))}
                </div>
                 <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, marginBottom: 16, color: 'var(--text-primary)' }}>"{t.text}"</p>
                 <div>
                  <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{t.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            section:nth-of-type(7) div[style*="repeat(3"] { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

      {/* ═══ FINAL CTA ═══ */}
       <section
        className="y-dot-pattern"
        style={{
          background: 'var(--bg-primary)',
          padding: '80px 24px',
          textAlign: 'center',
          borderBottom: 'var(--d-border)',
        }}
      >
         <h2 className="y-heading" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: 24, color: 'var(--text-primary)' }}>
          READY TO TAKE CONTROL?
        </h2>
         <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
          Start tracking expenses and bundling DeFi transactions in seconds. No setup required.
        </p>
        <Link href="/auth" className="y-btn-primary" style={{ fontSize: '1.125rem', padding: '16px 40px' }}>
          START FREE <ChevronRight size={18} />
        </Link>
      </section>

       {/* ═══ FOOTER ═══ */}
      <footer style={{ background: 'var(--d-black)', color: 'var(--text-muted)', padding: '60px 24px 40px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40 }}>
          <div>
             <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: '1.125rem', color: 'var(--d-white)', marginBottom: 16 }}>
              FixMyPayments
            </div>
             <p style={{ fontSize: '0.8125rem', lineHeight: 1.7, opacity: 0.7, color: 'var(--text-muted)' }}>
              AI-powered finance meets gasless DeFi on zkSync Era.
            </p>
          </div>
          <div>
             <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--d-white)', marginBottom: 16 }}>
              PRODUCT
            </div>
            {['Dashboard', 'ZAAP Bundler', 'Analytics'].map((l) => (
              <div key={l} style={{ fontSize: '0.8125rem', marginBottom: 8, opacity: 0.6 }}>{l}</div>
            ))}
          </div>
          <div>
             <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--d-white)', marginBottom: 16 }}>
              WEB3
            </div>
            {['Paymaster', 'AML Verify', 'zkSync Era'].map((l) => (
              <div key={l} style={{ fontSize: '0.8125rem', marginBottom: 8, opacity: 0.6 }}>{l}</div>
            ))}
          </div>
          <div>
             <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--d-white)', marginBottom: 16 }}>
              CONNECT
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['X', 'GH', 'DC'].map((l) => (
                <div
                  key={l}
                   style={{
                    width: 36,
                    height: 36,
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.6875rem',
                    fontFamily: "'Space Mono', monospace",
                    fontWeight: 700,
                    cursor: 'pointer',
                     transition: 'background 0.15s ease, border-color 0.15s ease, color 0.15s ease',
                    color: 'var(--text-muted)',
                  }}
                  onMouseEnter={(e) => {
                     e.currentTarget.style.background = 'var(--d-volt)';
                    e.currentTarget.style.color = 'var(--d-black)';
                    e.currentTarget.style.borderColor = 'var(--d-black)';
                  }}
                   onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--bg-secondary)';
                    e.currentTarget.style.color = 'var(--text-muted)';
                    e.currentTarget.style.borderColor = 'var(--text-muted)';
                  }}
                >
                  {l}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 1000, margin: '40px auto 0', borderTop: '1px solid #333', paddingTop: 20, fontSize: '0.75rem', opacity: 0.5 }}>
          © 2026 FixMyPayments. All rights reserved.
        </div>

        <style>{`
          @media (max-width: 768px) {
            footer > div:first-child { grid-template-columns: 1fr 1fr !important; }
          }
        `}</style>
      </footer>
    </div>
  );
}
