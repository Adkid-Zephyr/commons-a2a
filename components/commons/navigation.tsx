"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import type { Tab } from "./use-commons-app";

const navLinks: { tab: Tab; name: string }[] = [
  { tab: "network", name: "Agent network" },
  { tab: "inbox", name: "Your inbox" },
  { tab: "members", name: "Members" },
];

export function Navigation({ tab, pending, onTab, onMeet, canMeet }: { tab: Tab; pending: number; onTab: (t: Tab) => void; onMeet: () => void; canMeet: boolean }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const go = (t: Tab) => {
    setIsMobileMenuOpen(false);
    onTab(t);
  };

  return (
    <header
      className={`fixed z-50 transition-all duration-500 ${
        isScrolled
          ? "top-4 left-4 right-4"
          : "top-0 left-0 right-0"
      }`}
    >
      <nav
        className={`mx-auto transition-all duration-500 ${
          isScrolled || isMobileMenuOpen
            ? "bg-background/80 backdrop-blur-xl border border-foreground/10 rounded-2xl shadow-lg max-w-[1200px]"
            : "bg-transparent max-w-[1400px]"
        }`}
      >
        <div
          className={`flex items-center justify-between transition-all duration-500 px-6 lg:px-8 ${
            isScrolled ? "h-14" : "h-20"
          }`}
        >
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <span className={`font-display tracking-tight transition-all duration-500 ${isScrolled ? "text-xl text-foreground" : "text-2xl text-white"}`}>Commons</span>
            <span className={`font-mono transition-all duration-500 ${isScrolled ? "text-[10px] mt-0.5 text-muted-foreground" : "text-xs mt-1 text-white/60"}`}>A2A</span>
          </a>

          {/* Desktop Navigation: the app's own views */}
          <div className="hidden md:flex items-center gap-12">
            {navLinks.map((link) => (
              <button
                key={link.tab}
                onClick={() => go(link.tab)}
                className={`text-sm transition-colors duration-300 relative group ${
                  isScrolled ? (tab === link.tab ? "text-foreground" : "text-foreground/70 hover:text-foreground") : "text-white/70 hover:text-white"
                }`}
              >
                {link.name}
                {link.tab === "inbox" && pending > 0 && (
                  <span className="ml-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-pink px-1 font-mono text-[10px] text-black">{pending}</span>
                )}
                <span className={`absolute -bottom-1 left-0 h-px transition-all duration-300 group-hover:w-full ${isScrolled && tab === link.tab ? "w-full" : "w-0"} ${isScrolled ? "bg-foreground" : "bg-white"}`} />
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={onMeet}
              disabled={!canMeet}
              className={`rounded-full text-sm font-medium transition-all duration-500 disabled:opacity-40 ${isScrolled ? "bg-foreground hover:bg-foreground/90 text-background px-4 h-8 text-xs" : "bg-white hover:bg-white/90 text-black px-6 h-9"}`}
            >
              Meet your agent
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 transition-colors duration-500 ${isScrolled || isMobileMenuOpen ? "text-foreground" : "text-white"}`}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

      </nav>

      {/* Mobile Menu - Full Screen Overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-background z-40 transition-all duration-500 ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        style={{ top: 0 }}
      >
        <div className="flex flex-col h-full px-8 pt-28 pb-8">
          <div className="flex-1 flex flex-col justify-center gap-8">
            {navLinks.map((link, i) => (
              <button
                key={link.tab}
                onClick={() => go(link.tab)}
                className={`text-left text-5xl font-display text-foreground hover:text-muted-foreground transition-all duration-500 ${
                  isMobileMenuOpen
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: isMobileMenuOpen ? `${i * 75}ms` : "0ms" }}
              >
                {link.name}
                {link.tab === "inbox" && pending > 0 && <span className="ml-3 align-middle font-mono text-base text-accent-pink">{pending}</span>}
              </button>
            ))}
          </div>

          <div className={`pt-8 border-t border-foreground/10 transition-all duration-500 ${
            isMobileMenuOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: isMobileMenuOpen ? "300ms" : "0ms" }}
          >
            <button
              disabled={!canMeet}
              onClick={() => {
                setIsMobileMenuOpen(false);
                onMeet();
              }}
              className="btn btn-primary w-full h-14 text-base"
            >
              Meet your agent
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
