'use client';

import React, { useRef, useState, useLayoutEffect, useCallback } from 'react';
import gsap from 'gsap';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export interface CardNavLink {
  label: string;
  href: string;
  ariaLabel: string;
}

export interface CardNavItem {
  label: string;
  bgColor: string;
  textColor: string;
  links: CardNavLink[];
}

interface CardNavProps {
  logo?: string;
  logoAlt?: string;
  brandName?: string;
  items: CardNavItem[];
  className?: string;
  ease?: string;
  baseColor?: string;
  menuColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  buttonText?: string;
  buttonHref?: string;
  variant?: 'disruptor' | 'yellow-saas';
}

import ThemeToggle from './ThemeToggle';

export default function CardNav({
  brandName = 'FixMyPayments',
  items,
  className = '',
  ease = 'power3.out',
  baseColor = 'var(--bg-primary)',
  menuColor = 'var(--text-primary)',
  buttonBgColor = 'var(--d-volt)',
  buttonTextColor = 'var(--d-black)',
  buttonText = 'LAUNCH APP',
  buttonHref = '/dashboard',
  variant = 'disruptor',
}: CardNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  const isDisruptor = variant === 'disruptor';
  const borderWidth = isDisruptor ? '4px' : '2px';
  const shadowStyle = isDisruptor
    ? 'var(--d-shadow-lg)'
    : 'var(--d-shadow-lg)';
  const fontFamily = isDisruptor
    ? "'Space Mono', monospace"
    : "'Plus Jakarta Sans', sans-serif";

  const calculateHeight = useCallback(() => {
    if (!cardsRef.current) return 280;
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      return cardsRef.current.scrollHeight + 80;
    }
    return 280;
  }, []);

  useLayoutEffect(() => {
    if (!navRef.current || !cardsRef.current) return;

    ctxRef.current = gsap.context(() => {
      const cards = cardsRef.current!.querySelectorAll('.cardnav-card');

      gsap.set(cards, { y: 30, opacity: 0 });

      tlRef.current = gsap.timeline({ paused: true })
        .to(navRef.current, {
          height: calculateHeight(),
          duration: 0.5,
          ease,
        })
        .to(cards, {
          y: 0,
          opacity: 1,
          duration: 0.35,
          stagger: 0.08,
          ease,
        }, '-=0.2');
    }, navRef);

    const handleResize = () => {
      if (isOpen && tlRef.current) {
        gsap.to(navRef.current, {
          height: calculateHeight(),
          duration: 0.3,
          ease,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      ctxRef.current?.revert();
    };
  }, [ease, calculateHeight, isOpen]);

  const toggleMenu = () => {
    if (!tlRef.current) return;

    if (isOpen) {
      tlRef.current.reverse();
      tlRef.current.eventCallback('onReverseComplete', () => {
        setIsOpen(false);
      });
    } else {
      setIsOpen(true);
      // Recalculate in case of layout changes
      tlRef.current.invalidate();
      tlRef.current.vars.targets = navRef.current;
      requestAnimationFrame(() => {
        if (tlRef.current) {
          // Update the height target
          const tl = tlRef.current;
          tl.clear();
          const cards = cardsRef.current!.querySelectorAll('.cardnav-card');
          gsap.set(cards, { y: 30, opacity: 0 });
          tl.to(navRef.current, {
            height: calculateHeight(),
            duration: 0.5,
            ease,
          })
          .to(cards, {
            y: 0,
            opacity: 1,
            duration: 0.35,
            stagger: 0.08,
            ease,
          }, '-=0.2');
          tl.play(0);
        }
      });
    }
  };

  return (
    <nav
      ref={navRef}
      className={`cardnav ${className}`}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        height: 60,
        overflow: 'hidden',
        background: baseColor,
        borderBottom: `${borderWidth} solid var(--d-black)`,
        boxShadow: isOpen ? shadowStyle : 'none',
        transition: 'box-shadow 0.3s ease',
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 60,
          padding: '0 24px',
        }}
      >
        {/* Brand */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: isDisruptor ? 'var(--d-volt)' : 'var(--d-black)',
              border: `${borderWidth} solid var(--d-black)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Ranchers', cursive",
              fontSize: 14,
              color: isDisruptor ? 'var(--d-black)' : 'var(--d-white)',
              fontWeight: 700,
            }}
          >
            ₹
          </div>
          <span
            style={{
              fontFamily: isDisruptor ? "'Space Mono', monospace" : "'Cabinet Grotesk', sans-serif",
              fontSize: isDisruptor ? '0.875rem' : '1.125rem',
              fontWeight: 700,
              color: menuColor,
              textTransform: isDisruptor ? 'uppercase' : 'none',
              letterSpacing: isDisruptor ? '0.05em' : '-0.02em',
            }}
          >
            {brandName}
          </span>
        </Link>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link
            href={buttonHref}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 20px',
              background: buttonBgColor,
              color: buttonTextColor,
              border: `${borderWidth} solid var(--d-black)`,
              boxShadow: '4px 4px 0px var(--d-black)',
              fontFamily: fontFamily,
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: isDisruptor ? 'uppercase' : 'none',
              letterSpacing: isDisruptor ? '0.05em' : '0',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translate(2px, 2px)';
              e.currentTarget.style.boxShadow = '2px 2px 0px var(--d-black)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translate(0, 0)';
              e.currentTarget.style.boxShadow = '4px 4px 0px var(--d-black)';
            }}
          >
            {buttonText}
          </Link>

          <ThemeToggle />

          <button
            onClick={toggleMenu}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            id="cardnav-toggle"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: menuColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
            }}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Cards Container */}
      <div
        ref={cardsRef}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${items.length}, 1fr)`,
          gap: 16,
          padding: '16px 24px 24px',
        }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            className="cardnav-card"
            style={{
              background: item.bgColor,
              border: `${borderWidth} solid var(--d-black)`,
              boxShadow: '4px 4px 0px var(--d-black)',
              padding: 20,
              opacity: 0,
            }}
          >
            <div
              style={{
                fontFamily: fontFamily,
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: isDisruptor ? 'uppercase' : 'none',
                letterSpacing: isDisruptor ? '0.1em' : '0.02em',
                color: item.textColor,
                marginBottom: 16,
                borderBottom: `${borderWidth} solid ${item.textColor}40`,
                paddingBottom: 8,
              }}
            >
              {item.label}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {item.links.map((link, j) => (
                <Link
                  key={j}
                  href={link.href}
                  aria-label={link.ariaLabel}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontFamily: fontFamily,
                    fontSize: '0.8125rem',
                    fontWeight: isDisruptor ? 700 : 500,
                    textTransform: isDisruptor ? 'uppercase' : 'none',
                    color: item.textColor,
                    textDecoration: 'none',
                    padding: '4px 0',
                    transition: 'opacity 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.7'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                >
                  {link.label}
                  <ArrowUpRight size={14} />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile override */}
      <style>{`
        @media (max-width: 768px) {
          .cardnav [style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </nav>
  );
}
