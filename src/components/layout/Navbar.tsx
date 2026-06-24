import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Palette } from "lucide-react";
import { useQuoteModal } from "@/context/QuoteModalContext";
const LOGO_URL = "https://raw.githubusercontent.com/runloai/PrimeSign/main/data/logo/logo.webp";

// Complete color scheme definitions with ALL CSS variables
// Each scheme includes proper contrast ratios and harmonious color progression
const COLOR_SCHEMES = {
  "Obsidian Gold": {
    primary: "38 95% 55%",
    secondary: "190 100% 55%",
    background: "220 15% 6%",
    foreground: "0 0% 98%",
    card: "220 15% 9%",
    muted: "220 15% 15%",
    mutedForeground: "220 10% 65%",
    accent: "220 15% 18%",
    border: "220 15% 20%",
    input: "220 15% 15%",
    ring: "38 95% 55%",
    popover: "220 15% 9%",
    cardBorder: "220 15% 22%",
    popoverBorder: "220 15% 22%",
    sidebar: "220 15% 8%",
    sidebarBorder: "220 15% 25%",
    chart1: "38 95% 55%",
    chart2: "190 100% 55%",
    chart3: "280 80% 60%",
    chart4: "45 90% 55%",
    chart5: "350 80% 60%",
    overlayLight: "0 0% 100%",
    overlayDark: "220 15% 6%",
  },
  "Plasma Purple": {
    primary: "280 95% 60%",
    secondary: "45 100% 55%",
    background: "270 25% 5%",
    foreground: "0 0% 98%",
    card: "270 25% 10%",
    muted: "270 20% 18%",
    mutedForeground: "270 15% 65%",
    accent: "270 25% 22%",
    border: "270 20% 22%",
    input: "270 20% 18%",
    ring: "280 95% 60%",
    popover: "270 25% 10%",
    cardBorder: "270 20% 25%",
    popoverBorder: "270 20% 25%",
    sidebar: "270 25% 8%",
    sidebarBorder: "270 20% 28%",
    chart1: "280 95% 60%",
    chart2: "45 100% 55%",
    chart3: "320 90% 60%",
    chart4: "190 95% 55%",
    chart5: "160 80% 50%",
    overlayLight: "0 0% 100%",
    overlayDark: "270 25% 5%",
  },
  "Electric Blue": {
    primary: "210 100% 55%",
    secondary: "180 90% 50%",
    background: "220 30% 5%",
    foreground: "0 0% 98%",
    card: "220 30% 8%",
    muted: "220 25% 18%",
    mutedForeground: "220 20% 65%",
    accent: "220 30% 15%",
    border: "220 25% 22%",
    input: "220 25% 18%",
    ring: "210 100% 55%",
    popover: "220 30% 8%",
    cardBorder: "220 25% 25%",
    popoverBorder: "220 25% 25%",
    sidebar: "220 30% 7%",
    sidebarBorder: "220 25% 28%",
    chart1: "210 100% 55%",
    chart2: "180 90% 50%",
    chart3: "280 80% 60%",
    chart4: "45 95% 55%",
    chart5: "340 80% 60%",
    overlayLight: "0 0% 100%",
    overlayDark: "220 30% 5%",
  },
  "Crimson Noir": {
    primary: "350 95% 55%",
    secondary: "45 100% 55%",
    background: "350 20% 5%",
    foreground: "0 0% 98%",
    card: "350 20% 10%",
    muted: "350 15% 18%",
    mutedForeground: "350 15% 65%",
    accent: "350 20% 15%",
    border: "350 15% 22%",
    input: "350 15% 18%",
    ring: "350 95% 55%",
    popover: "350 20% 10%",
    cardBorder: "350 15% 25%",
    popoverBorder: "350 15% 25%",
    sidebar: "350 20% 8%",
    sidebarBorder: "350 15% 28%",
    chart1: "350 95% 55%",
    chart2: "45 100% 55%",
    chart3: "280 80% 60%",
    chart4: "190 90% 55%",
    chart5: "160 80% 50%",
    overlayLight: "0 0% 100%",
    overlayDark: "350 20% 5%",
  },
  "Emerald Glow": {
    primary: "145 90% 50%",
    secondary: "45 95% 55%",
    background: "145 20% 5%",
    foreground: "0 0% 98%",
    card: "145 20% 8%",
    muted: "145 15% 15%",
    mutedForeground: "145 15% 65%",
    accent: "145 20% 15%",
    border: "145 15% 20%",
    input: "145 15% 15%",
    ring: "145 90% 50%",
    popover: "145 20% 8%",
    cardBorder: "145 15% 23%",
    popoverBorder: "145 15% 23%",
    sidebar: "145 20% 7%",
    sidebarBorder: "145 15% 25%",
    chart1: "145 90% 50%",
    chart2: "45 95% 55%",
    chart3: "190 100% 55%",
    chart4: "280 80% 60%",
    chart5: "350 80% 60%",
    overlayLight: "0 0% 100%",
    overlayDark: "145 20% 5%",
  },
  "Neon Nights": {
    primary: "320 100% 60%",
    secondary: "170 100% 50%",
    background: "260 30% 5%",
    foreground: "0 0% 98%",
    card: "260 30% 10%",
    muted: "260 25% 18%",
    mutedForeground: "260 20% 65%",
    accent: "260 30% 15%",
    border: "260 25% 22%",
    input: "260 25% 18%",
    ring: "320 100% 60%",
    popover: "260 30% 10%",
    cardBorder: "260 25% 25%",
    popoverBorder: "260 25% 25%",
    sidebar: "260 30% 8%",
    sidebarBorder: "260 25% 28%",
    chart1: "320 100% 60%",
    chart2: "170 100% 50%",
    chart3: "45 95% 55%",
    chart4: "280 80% 60%",
    chart5: "190 95% 55%",
    overlayLight: "0 0% 100%",
    overlayDark: "260 30% 5%",
  },
  "Arctic White": {
    primary: "210 90% 45%",
    secondary: "210 40% 60%",
    background: "0 0% 98%",
    foreground: "220 20% 10%",
    card: "0 0% 100%",
    muted: "220 15% 92%",
    mutedForeground: "220 15% 45%",
    accent: "210 40% 96%",
    border: "220 15% 88%",
    input: "220 15% 92%",
    ring: "210 90% 45%",
    popover: "0 0% 100%",
    cardBorder: "220 15% 90%",
    popoverBorder: "220 15% 90%",
    sidebar: "0 0% 96%",
    sidebarBorder: "220 15% 88%",
    chart1: "210 90% 45%",
    chart2: "210 40% 60%",
    chart3: "280 60% 55%",
    chart4: "45 80% 50%",
    chart5: "350 70% 55%",
    overlayLight: "220 20% 10%",
    overlayDark: "0 0% 98%",
  },
  "Sandstone": {
    primary: "25 90% 45%",
    secondary: "35 70% 55%",
    background: "40 30% 96%",
    foreground: "30 20% 15%",
    card: "40 30% 98%",
    muted: "40 20% 88%",
    mutedForeground: "40 15% 45%",
    accent: "40 30% 92%",
    border: "40 20% 85%",
    input: "40 20% 88%",
    ring: "25 90% 45%",
    popover: "40 30% 98%",
    cardBorder: "40 20% 90%",
    popoverBorder: "40 20% 90%",
    sidebar: "40 30% 95%",
    sidebarBorder: "40 20% 88%",
    chart1: "25 90% 45%",
    chart2: "35 70% 55%",
    chart3: "210 60% 50%",
    chart4: "145 60% 45%",
    chart5: "280 60% 55%",
    overlayLight: "30 20% 15%",
    overlayDark: "40 30% 96%",
  },
  "Cloud Gray": {
    primary: "220 60% 45%",
    secondary: "220 30% 55%",
    background: "220 10% 96%",
    foreground: "220 20% 12%",
    card: "0 0% 100%",
    muted: "220 15% 90%",
    mutedForeground: "220 15% 45%",
    accent: "220 20% 94%",
    border: "220 15% 88%",
    input: "220 15% 90%",
    ring: "220 60% 45%",
    popover: "0 0% 100%",
    cardBorder: "220 15% 92%",
    popoverBorder: "220 15% 92%",
    sidebar: "220 10% 94%",
    sidebarBorder: "220 15% 90%",
    chart1: "220 60% 45%",
    chart2: "220 30% 55%",
    chart3: "280 50% 50%",
    chart4: "45 70% 50%",
    chart5: "350 60% 50%",
    overlayLight: "220 20% 12%",
    overlayDark: "220 10% 96%",
  },
  "Royal Velvet": {
    primary: "270 80% 55%",
    secondary: "45 95% 55%",
    background: "270 30% 5%",
    foreground: "0 0% 98%",
    card: "270 30% 10%",
    muted: "270 25% 18%",
    mutedForeground: "270 20% 65%",
    accent: "270 30% 15%",
    border: "270 25% 22%",
    input: "270 25% 18%",
    ring: "45 95% 55%",
    popover: "270 30% 10%",
    cardBorder: "270 25% 25%",
    popoverBorder: "270 25% 25%",
    sidebar: "270 30% 8%",
    sidebarBorder: "270 25% 28%",
    chart1: "270 80% 55%",
    chart2: "45 95% 55%",
    chart3: "320 80% 60%",
    chart4: "190 90% 55%",
    chart5: "350 80% 60%",
    overlayLight: "0 0% 100%",
    overlayDark: "270 30% 5%",
  },
  "Thunderbolt": {
    primary: "195 100% 55%",
    secondary: "220 15% 95%",
    background: "210 40% 4%",
    foreground: "0 0% 98%",
    card: "210 40% 8%",
    muted: "210 30% 18%",
    mutedForeground: "210 25% 65%",
    accent: "210 40% 15%",
    border: "210 30% 25%",
    input: "210 30% 18%",
    ring: "195 100% 55%",
    popover: "210 40% 8%",
    cardBorder: "210 30% 28%",
    popoverBorder: "210 30% 28%",
    sidebar: "210 40% 6%",
    sidebarBorder: "210 30% 30%",
    chart1: "195 100% 55%",
    chart2: "220 15% 95%",
    chart3: "45 95% 55%",
    chart4: "280 80% 60%",
    chart5: "160 80% 50%",
    overlayLight: "0 0% 100%",
    overlayDark: "210 40% 4%",
  },
  "Forest Ember": {
    primary: "140 80% 40%",
    secondary: "30 95% 55%",
    background: "140 20% 5%",
    foreground: "0 0% 98%",
    card: "140 20% 9%",
    muted: "140 15% 18%",
    mutedForeground: "140 15% 65%",
    accent: "140 20% 15%",
    border: "140 15% 22%",
    input: "140 15% 18%",
    ring: "30 95% 55%",
    popover: "140 20% 9%",
    cardBorder: "140 15% 25%",
    popoverBorder: "140 15% 25%",
    sidebar: "140 20% 7%",
    sidebarBorder: "140 15% 28%",
    chart1: "140 80% 40%",
    chart2: "30 95% 55%",
    chart3: "45 90% 55%",
    chart4: "190 90% 55%",
    chart5: "350 80% 60%",
    overlayLight: "0 0% 100%",
    overlayDark: "140 20% 5%",
  },
  "Monolith": {
    primary: "0 0% 75%",
    secondary: "0 0% 55%",
    background: "0 0% 6%",
    foreground: "0 0% 98%",
    card: "0 0% 10%",
    muted: "0 0% 20%",
    mutedForeground: "0 0% 65%",
    accent: "0 0% 15%",
    border: "0 0% 25%",
    input: "0 0% 20%",
    ring: "0 0% 75%",
    popover: "0 0% 10%",
    cardBorder: "0 0% 28%",
    popoverBorder: "0 0% 28%",
    sidebar: "0 0% 8%",
    sidebarBorder: "0 0% 30%",
    chart1: "0 0% 75%",
    chart2: "0 0% 55%",
    chart3: "220 60% 60%",
    chart4: "45 80% 55%",
    chart5: "350 70% 60%",
    overlayLight: "0 0% 100%",
    overlayDark: "0 0% 6%",
  },
  "Sunset Boulevard": {
    primary: "15 95% 60%",
    secondary: "210 25% 35%",
    background: "210 25% 6%",
    foreground: "0 0% 98%",
    card: "210 25% 10%",
    muted: "210 20% 18%",
    mutedForeground: "210 15% 65%",
    accent: "210 25% 15%",
    border: "210 20% 22%",
    input: "210 20% 18%",
    ring: "15 95% 60%",
    popover: "210 25% 10%",
    cardBorder: "210 20% 25%",
    popoverBorder: "210 20% 25%",
    sidebar: "210 25% 8%",
    sidebarBorder: "210 20% 28%",
    chart1: "15 95% 60%",
    chart2: "210 25% 35%",
    chart3: "45 90% 55%",
    chart4: "280 70% 60%",
    chart5: "190 80% 55%",
    overlayLight: "0 0% 100%",
    overlayDark: "210 25% 6%",
  },
  "Cyberpunk": {
    primary: "320 100% 55%",
    secondary: "60 100% 55%",
    background: "280 30% 5%",
    foreground: "0 0% 98%",
    card: "280 30% 9%",
    muted: "280 25% 18%",
    mutedForeground: "280 20% 65%",
    accent: "280 30% 15%",
    border: "280 25% 25%",
    input: "280 25% 18%",
    ring: "320 100% 55%",
    popover: "280 30% 9%",
    cardBorder: "280 25% 28%",
    popoverBorder: "280 25% 28%",
    sidebar: "280 30% 7%",
    sidebarBorder: "280 25% 30%",
    chart1: "320 100% 55%",
    chart2: "60 100% 55%",
    chart3: "190 100% 55%",
    chart4: "45 95% 55%",
    chart5: "280 90% 60%",
    overlayLight: "0 0% 100%",
    overlayDark: "280 30% 5%",
  },
  "Midnight Copper": {
    primary: "25 85% 55%",
    secondary: "220 60% 55%",
    background: "220 20% 5%",
    foreground: "0 0% 98%",
    card: "220 20% 9%",
    muted: "220 15% 18%",
    mutedForeground: "220 15% 65%",
    accent: "220 20% 15%",
    border: "220 15% 22%",
    input: "220 15% 18%",
    ring: "25 85% 55%",
    popover: "220 20% 9%",
    cardBorder: "220 15% 25%",
    popoverBorder: "220 15% 25%",
    sidebar: "220 20% 7%",
    sidebarBorder: "220 15% 28%",
    chart1: "25 85% 55%",
    chart2: "220 60% 55%",
    chart3: "190 95% 55%",
    chart4: "45 90% 55%",
    chart5: "280 75% 60%",
    overlayLight: "0 0% 100%",
    overlayDark: "220 20% 5%",
  },
};

export default function Navbar() {
  const { open } = useQuoteModal();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scheme, setScheme] = useState(() => localStorage.getItem("primesign-scheme") || "Gold Premium");
  const [location] = useLocation();

  useEffect(() => {
    const root = document.documentElement;
    const s = COLOR_SCHEMES[scheme as keyof typeof COLOR_SCHEMES];
    
    // Core colors
    root.style.setProperty("--primary", s.primary);
    root.style.setProperty("--secondary", s.secondary);
    root.style.setProperty("--background", s.background);
    root.style.setProperty("--foreground", s.foreground);
    
    // Component colors
    root.style.setProperty("--card", s.card);
    root.style.setProperty("--card-foreground", s.foreground);
    root.style.setProperty("--card-border", s.cardBorder);
    
    root.style.setProperty("--popover", s.popover);
    root.style.setProperty("--popover-foreground", s.foreground);
    root.style.setProperty("--popover-border", s.popoverBorder);
    
    root.style.setProperty("--muted", s.muted);
    root.style.setProperty("--muted-foreground", s.mutedForeground);
    
    root.style.setProperty("--accent", s.accent);
    root.style.setProperty("--accent-foreground", s.foreground);
    
    root.style.setProperty("--border", s.border);
    root.style.setProperty("--input", s.input);
    root.style.setProperty("--ring", s.ring);
    
    // Sidebar colors
    root.style.setProperty("--sidebar", s.sidebar);
    root.style.setProperty("--sidebar-foreground", s.foreground);
    root.style.setProperty("--sidebar-border", s.sidebarBorder);
    root.style.setProperty("--sidebar-primary", s.primary);
    root.style.setProperty("--sidebar-primary-foreground", s.foreground);
    root.style.setProperty("--sidebar-accent", s.accent);
    root.style.setProperty("--sidebar-accent-foreground", s.foreground);
    root.style.setProperty("--sidebar-ring", s.primary);
    
    // Chart colors
    root.style.setProperty("--chart-1", s.chart1);
    root.style.setProperty("--chart-2", s.chart2);
    root.style.setProperty("--chart-3", s.chart3);
    root.style.setProperty("--chart-4", s.chart4);
    root.style.setProperty("--chart-5", s.chart5);
    
    // Overlay reference colors (for components to use)
    root.style.setProperty("--overlay-light", s.overlayLight);
    root.style.setProperty("--overlay-dark", s.overlayDark);
    
    localStorage.setItem("primesign-scheme", scheme);
  }, [scheme]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Services", href: "/#services" },
    { name: "Work", href: "/#portfolio" },
    { name: "Why Us", href: "/#why-us" },
    { name: "Contact", href: "/contact" },
  ];

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    if (href.startsWith("/#") && location === "/") {
      const element = document.querySelector(href.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/90 backdrop-blur-md border-b border-foreground/10 py-3 shadow-lg"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 z-50 relative">
          <img src={LOGO_URL} alt="Primesign Logo" className="h-8 md:h-10 w-auto object-contain" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => handleNavClick(link.href)}
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors uppercase tracking-wider font-display"
            >
              {link.name}
            </Link>
          ))}
          <select
            value={scheme}
            onChange={(e) => setScheme(e.target.value)}
            className="bg-foreground/10 border border-foreground/20 rounded-full px-3 py-1.5 text-xs text-foreground/80 focus:outline-none focus:border-primary cursor-pointer"
          >
            {Object.keys(COLOR_SCHEMES).map((name) => (
              <option key={name} value={name} className="bg-background text-foreground">{name}</option>
            ))}
          </select>
          <button
            onClick={open}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wide hover:bg-primary/90 transition-all box-glow"
            data-testid="button-nav-quote"
          >
            Get a Quote
          </button>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-foreground z-50 relative"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Mobile Nav */}
        <div
          className={`fixed inset-0 bg-background/95 backdrop-blur-xl z-40 flex flex-col items-center justify-center transition-all duration-300 ${
            isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
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
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Color Scheme</span>
              <select
                value={scheme}
                onChange={(e) => setScheme(e.target.value)}
                className="bg-foreground/10 border border-foreground/20 rounded-full px-4 py-2 text-sm text-foreground/80 focus:outline-none focus:border-primary cursor-pointer"
              >
                {Object.keys(COLOR_SCHEMES).map((name) => (
                  <option key={name} value={name} className="bg-background text-foreground">{name}</option>
                ))}
              </select>
            </div>
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
