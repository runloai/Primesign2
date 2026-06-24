import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Palette } from "lucide-react";
import { useQuoteModal } from "@/context/QuoteModalContext";
const LOGO_URL = "https://raw.githubusercontent.com/runloai/PrimeSign/main/data/logo/logo.webp";

const COLOR_SCHEMES = {
  "Obsidian Gold": { p: "38 95% 55%", s: "190 100% 55%", b: "220 15% 6%", f: "0 0% 98%" },
  "Plasma Purple": { p: "280 95% 60%", s: "45 100% 55%", b: "270 25% 5%", f: "0 0% 98%" },
  "Electric Blue": { p: "210 100% 55%", s: "38 95% 55%", b: "222 30% 8%", f: "0 0% 98%" },
  "Crimson Noir": { p: "350 90% 55%", s: "45 100% 55%", b: "0 0% 6%", f: "0 0% 98%" },
  "Emerald Glow": { p: "160 90% 50%", s: "38 95% 55%", b: "170 20% 6%", f: "0 0% 98%" },
  "Neon Nights": { p: "320 100% 55%", s: "180 100% 55%", b: "260 20% 5%", f: "0 0% 98%" },
  "Arctic White": { p: "210 90% 45%", s: "215 25% 30%", b: "0 0% 98%", f: "220 15% 10%" },
  "Sandstone": { p: "30 80% 50%", s: "200 60% 40%", b: "35 50% 97%", f: "30 15% 15%" },
  "Royal Velvet": { p: "270 90% 55%", s: "45 100% 55%", b: "260 30% 6%", f: "0 0% 98%" },
  "Thunderbolt": { p: "195 100% 55%", s: "45 100% 55%", b: "220 15% 5%", f: "0 0% 98%" },
  "Midnight Copper": { p: "20 90% 55%", s: "200 90% 50%", b: "222 40% 5%", f: "0 0% 98%" },
  "Sky Light": { p: "210 90% 40%", s: "30 70% 60%", b: "210 50% 97%", f: "210 20% 15%" },
  "Warm Cream": { p: "35 85% 45%", s: "15 60% 35%", b: "40 60% 97%", f: "30 20% 12%" },
  "Mint Fresh": { p: "160 60% 40%", s: "200 50% 45%", b: "150 30% 96%", f: "160 25% 15%" },
  "Lavender Dream": { p: "270 60% 55%", s: "330 50% 60%", b: "260 40% 97%", f: "260 25% 15%" },
};

export default function Navbar() {
  const { open } = useQuoteModal();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scheme, setScheme] = useState(() => localStorage.getItem("primesign-scheme") || "Obsidian Gold");
  const [useTextLogo, setUseTextLogo] = useState(() => localStorage.getItem("primesign-logo") === "text");
  const [location] = useLocation();

  useEffect(() => {
    const root = document.documentElement;
    const s = COLOR_SCHEMES[scheme as keyof typeof COLOR_SCHEMES];
    root.style.setProperty("--primary", s.p);
    root.style.setProperty("--secondary", s.s);
    root.style.setProperty("--background", s.b);
    root.style.setProperty("--foreground", s.f);
    localStorage.setItem("primesign-scheme", scheme);
  }, [scheme]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: "Services", href: "/#services" },
    { name: "Work", href: "/#portfolio" },
    { name: "Why Us", href: "/#why-us" },
    { name: "Contact", href: "/contact" },
  ];

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    if (href.startsWith("/#")) {
      if (location === "/") {
        // Already on home page, just scroll
        const element = document.querySelector(href.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        // On a different page, navigate to home first
        // Note: the Link component will handle the navigation
        // Return false to let default link behavior work
      }
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/90 backdrop-blur-md border-b border-white/10 py-3 shadow-lg"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 z-50 relative">
          {useTextLogo ? (
            <span className="text-2xl md:text-3xl font-display font-black tracking-tight">
              <span className="text-primary">PRIME</span><span className="text-foreground">SIGN</span>
            </span>
          ) : (
            <img src={LOGO_URL} alt="Primesign Logo" className="h-8 md:h-10 w-auto object-contain" />
          )}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => handleNavClick(link.href)}
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors uppercase tracking-wider font-display focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-sm px-1"
              aria-label={`Navigate to ${link.name}`}
            >
              {link.name}
            </Link>
          ))}
          <select
            value={scheme}
            onChange={(e) => setScheme(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-full px-3 py-1.5 text-xs text-foreground/80 focus:outline-none focus:border-primary cursor-pointer"
            aria-label="Select color theme"
          >
            {Object.keys(COLOR_SCHEMES).map((name) => (
              <option key={name} value={name} className="bg-background text-foreground">{name}</option>
            ))}
          </select>
          <button
            onClick={open}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wide hover:bg-primary/90 transition-all box-glow focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            data-testid="button-nav-quote"
            aria-label="Get a free quote"
          >
            Get a Quote
          </button>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-foreground z-50 relative focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-sm p-1"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Mobile Nav */}
        <div
          id="mobile-menu"
          className={`fixed inset-0 bg-background/95 backdrop-blur-xl z-40 flex flex-col items-center justify-center transition-all duration-300 ${
            isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          <nav className="flex flex-col items-center gap-8 text-center">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-2xl font-display font-bold uppercase tracking-widest hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <select
              value={scheme}
              onChange={(e) => setScheme(e.target.value)}
              className="bg-foreground/10 border border-foreground/20 rounded-full px-4 py-2 text-sm text-foreground/80 focus:outline-none focus:border-primary cursor-pointer mt-4"
            >
              {Object.keys(COLOR_SCHEMES).map((name) => (
                <option key={name} value={name} className="bg-background text-foreground">{name}</option>
              ))}
            </select>
            <button
              className="mt-4 bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold text-lg uppercase tracking-wide hover:bg-primary/90 transition-all box-glow"
              onClick={() => { setIsMobileMenuOpen(false); open(); }}
              data-testid="button-mobile-quote"
            >
              Get a Quote
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
