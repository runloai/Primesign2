import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ChevronDown, Clock, Phone, Mail, Facebook, Instagram, Youtube } from "lucide-react";
import { useQuoteModal } from "@/context/QuoteModalContext";

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

interface DropdownMenuItem {
  name: string;
  href: string;
  filter?: string;
  serviceId?: string;
}

interface DropdownMenuProps {
  title: string;
  items: DropdownMenuItem[];
  isOpen: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}

function DropdownMenu({ title, items, isOpen, onMouseEnter, onMouseLeave, onClick }: DropdownMenuProps) {
  return (
    <div 
      className="relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <button
        onClick={onClick}
        className="flex items-center gap-1 text-sm font-medium text-foreground/80 hover:text-primary transition-colors uppercase tracking-wider font-display focus:outline-none py-2"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {title}
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {/* Mega Dropdown */}
      <div
        className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 transition-all duration-200 ${
          isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2 pointer-events-none'
        }`}
      >
        <div className="bg-card/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden w-[280px]">
          <div className="p-2">
            {items.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => {
                  if (item.filter) {
                    sessionStorage.setItem("arsenal-category", item.filter);
                    window.dispatchEvent(new CustomEvent("arsenal-filter", { detail: item.filter }));
                    if (item.serviceId) {
                      setTimeout(() => {
                        window.dispatchEvent(new CustomEvent("scroll-to-service", { detail: { category: item.filter, serviceId: item.serviceId } }));
                      }, 100);
                    }
                  }
                  document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="block px-4 py-2.5 text-sm text-foreground/80 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const { open } = useQuoteModal();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scheme, setScheme] = useState("Obsidian Gold");
  const [useTextLogo, setUseTextLogo] = useState(false);
  const [logoSrc, setLogoSrc] = useState("https://raw.githubusercontent.com/runloai/PrimeSign/main/data/logo/logo.webp");
  const [serviceMenu, setServiceMenu] = useState<Record<string, DropdownMenuItem[]>>({});
  const [serviceCategories, setServiceCategories] = useState<{ id: string; label: string }[]>([]);
  const [configContact, setConfigContact] = useState<{ phones?: string[]; emails?: string[]; facebook?: string; instagram?: string; youtube?: string } | null>(null);
  const [workingHours, setWorkingHours] = useState("Mon-Sat: 9:00 AM - 7:00 PM<br>Sunday: Closed");

  useEffect(() => {
    fetch("/config.json?t=" + Date.now()).then(r => r.json()).then(c => {
      if (c.settings?.logoType === "text") setUseTextLogo(true);
      if (c.settings?.logoUrl) setLogoSrc(c.settings.logoUrl);
      const schemeName = c.settings?.scheme as keyof typeof COLOR_SCHEMES;
      if (schemeName && schemeName in COLOR_SCHEMES) setScheme(schemeName);
      if (c.settings?.workingHours) setWorkingHours(c.settings.workingHours);
      if (c.contact) setConfigContact(c.contact);
      if (c.serviceCategories) setServiceCategories(c.serviceCategories);
      if (c.services && c.services.length > 0) {
        const categories = c.serviceCategories || [];
        const catLabelMap: Record<string, string> = {};
        categories.forEach((cat: { id: string; label: string }) => { catLabelMap[cat.id] = cat.label; });
        const grouped: Record<string, DropdownMenuItem[]> = {};
        c.services.forEach((s: any) => {
          const cat = s.category || "General";
          const title = catLabelMap[cat] || cat.toUpperCase();
          if (!grouped[title]) grouped[title] = [];
          const serviceId = s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
          grouped[title].push({ name: s.name, href: "/#services", filter: cat, serviceId });
        });
        setServiceMenu(grouped);
      }
    }).catch(() => {});
  }, []);
  const [location] = useLocation();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showTopBar, setShowTopBar] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const root = document.documentElement;
    const s = COLOR_SCHEMES[scheme as keyof typeof COLOR_SCHEMES];
    root.style.setProperty("--primary", s.p);
    root.style.setProperty("--secondary", s.s);
    root.style.setProperty("--background", s.b);
    root.style.setProperty("--foreground", s.f);
  }, [scheme]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);
      
      // Hide/show top bar on scroll
      if (currentScrollY > 100) {
        setShowTopBar(currentScrollY < lastScrollY.current);
      } else {
        setShowTopBar(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
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

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
    if (href.startsWith("/#")) {
      if (location === "/") {
        const element = document.querySelector(href.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  const handleDropdownToggle = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  const handleDropdownEnter = (dropdown: string) => {
    setOpenDropdown(dropdown);
  };

  const handleDropdownLeave = () => {
    setOpenDropdown(null);
  };

  return (
    <>
      {/* Top Bar with Hours, Phone, Email, Social */}
      <div 
        className={`fixed top-0 left-0 right-0 z-[60] bg-black/90 border-b border-white/5 transition-all duration-300 ${
          showTopBar ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-10 text-xs">
            {/* Left - Hours & Contact */}
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2 text-foreground/60">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span dangerouslySetInnerHTML={{ __html: workingHours }} />
              </div>
              <a 
                href={`tel:${configContact?.phones?.[0]?.replace(/\s/g, '') || '+916366525253'}`} 
                className="flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-primary" />
                <span>{configContact?.phones?.[0] || '+91 6366 525 253'}</span>
              </a>
              <a 
                href={`mailto:${configContact?.emails?.[0] || 'primesign2021@gmail.com'}`} 
                className="hidden lg:flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-primary" />
                <span>{configContact?.emails?.[0] || 'primesign2021@gmail.com'}</span>
              </a>
            </div>

            {/* Right - Social Links */}
            <div className="flex items-center gap-1 ml-auto">
              <span className="hidden sm:inline text-foreground/40 mr-2">Follow us:</span>
              <a 
                href={configContact?.facebook || 'https://www.facebook.com/primesign.in'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 text-foreground/60 hover:text-primary hover:bg-white/5 rounded-lg transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href={configContact?.instagram || 'https://www.instagram.com/primesignpvtltd/'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 text-foreground/60 hover:text-primary hover:bg-white/5 rounded-lg transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href={configContact?.youtube || 'https://www.youtube.com/@PrimesignBangalore'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 text-foreground/60 hover:text-primary hover:bg-white/5 rounded-lg transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <header
        className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
          showTopBar ? 'top-10' : 'top-0'
        } ${
          isScrolled
            ? "bg-background/95 backdrop-blur-md border-b border-white/10 py-3 shadow-lg"
            : "bg-transparent py-4"
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 z-50 relative">
            {useTextLogo ? (
              <span className="text-2xl md:text-3xl font-display font-black tracking-tight">
                <span className="text-primary">PRIME</span><span className="text-foreground">SIGN</span>
              </span>
            ) : (
              <img src={logoSrc} alt="Primesign Logo" className="h-8 md:h-10 w-auto object-contain" />
            )}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6" aria-label="Main navigation">
            {/* Multi-level Dropdown Menus */}
            {serviceCategories.map((cat) => (
              <DropdownMenu
                key={cat.id}
                title={cat.label}
                items={serviceMenu[cat.label] || []}
                isOpen={openDropdown === cat.label}
                onMouseEnter={() => handleDropdownEnter(cat.label)}
                onMouseLeave={handleDropdownLeave}
                onClick={() => handleDropdownToggle(cat.label)}
              />
            ))}
            
            {/* Direct Links */}
            <Link
              href="/#portfolio"
              onClick={() => handleNavClick("/#portfolio")}
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors uppercase tracking-wider font-display"
            >
              WORK GALLERY
            </Link>
            <Link
              href="/#contact"
              onClick={() => handleNavClick("/#contact")}
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors uppercase tracking-wider font-display"
            >
              CONTACT
            </Link>

            {/* Theme Selector */}
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

            {/* CTA Button */}
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
            className="lg:hidden text-foreground z-50 relative focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-sm p-1"
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
            className={`fixed inset-0 bg-background/98 backdrop-blur-xl z-40 flex flex-col transition-all duration-300 ${
              isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            {/* Mobile Menu Content */}
            <div className="flex-1 overflow-y-auto pt-24 pb-8 px-6">
              <nav className="flex flex-col gap-2">
                {serviceCategories.map((cat) => (
                  <MobileDropdownSection
                    key={cat.id}
                    title={cat.label}
                    items={serviceMenu[cat.label] || []}
                    onItemClick={() => setIsMobileMenuOpen(false)}
                  />
                ))}

                {/* Direct Links */}
                <Link
                  href="/#portfolio"
                  onClick={() => handleNavClick("/#portfolio")}
                  className="text-lg font-display font-bold uppercase tracking-widest hover:text-primary transition-colors py-3 border-b border-white/10"
                >
                  WORK GALLERY
                </Link>
                <Link
                  href="/#contact"
                  onClick={() => handleNavClick("/#contact")}
                  className="text-lg font-display font-bold uppercase tracking-widest hover:text-primary transition-colors py-3 border-b border-white/10"
                >
                  CONTACT
                </Link>

                {/* Mobile Contact Info */}
                <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
                  <a 
                    href={`tel:${configContact?.phones?.[0]?.replace(/\s/g, '') || '+916366525253'}`} 
                    className="flex items-center gap-3 text-foreground/70 hover:text-primary transition-colors"
                  >
                    <Phone className="w-5 h-5 text-primary" />
                    <span>{configContact?.phones?.[0] || '+91 6366 525 253'}</span>
                  </a>
                  <a 
                    href={`mailto:${configContact?.emails?.[0] || 'primesign2021@gmail.com'}`} 
                    className="flex items-center gap-3 text-foreground/70 hover:text-primary transition-colors"
                  >
                    <Mail className="w-5 h-5 text-primary" />
                    <span>{configContact?.emails?.[0] || 'primesign2021@gmail.com'}</span>
                  </a>
                  <div className="flex items-center gap-3 text-foreground/70">
                    <Clock className="w-5 h-5 text-primary" />
                    <span dangerouslySetInnerHTML={{ __html: workingHours }} />
                  </div>
                </div>

                {/* Mobile Social Links */}
                <div className="flex items-center gap-4 mt-6">
                  <a 
                    href={configContact?.facebook || 'https://www.facebook.com/primesign.in'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 bg-white/5 rounded-lg text-foreground/60 hover:text-primary hover:bg-white/10 transition-colors"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a 
                    href={configContact?.instagram || 'https://www.instagram.com/primesignpvtltd/'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 bg-white/5 rounded-lg text-foreground/60 hover:text-primary hover:bg-white/10 transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a 
                    href={configContact?.youtube || 'https://www.youtube.com/@PrimesignBangalore'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 bg-white/5 rounded-lg text-foreground/60 hover:text-primary hover:bg-white/10 transition-colors"
                  >
                    <Youtube className="w-5 h-5" />
                  </a>
                </div>

                {/* Mobile CTA Button */}
                <button
                  className="mt-8 bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold text-lg uppercase tracking-wide hover:bg-primary/90 transition-all box-glow"
                  onClick={() => { setIsMobileMenuOpen(false); open(); }}
                  data-testid="button-mobile-quote"
                >
                  Get a Quote
                </button>
              </nav>
            </div>
          </div>
        </div>
      </header>

    </>
  );
}

// Mobile Dropdown Section Component
interface MobileDropdownSectionProps {
  title: string;
  items: { name: string; href: string; filter?: string; serviceId?: string }[];
  onItemClick: () => void;
}

function MobileDropdownSection({ title, items, onItemClick }: MobileDropdownSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useLocation();

  const handleItemClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Close the mobile menu first
    onItemClick();
    
    // Handle navigation with filter if present
    const item = items.find(i => i.href === href);
    if (item && 'filter' in item && item.filter) {
      // Navigate to services with filter
      setLocation('/#services');
      sessionStorage.setItem('arsenal-category', item.filter as string);
      window.dispatchEvent(new CustomEvent("arsenal-filter", { detail: item.filter }));
      // Scroll to specific service if serviceId exists
      if ('serviceId' in item && item.serviceId) {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("scroll-to-service", { 
            detail: { category: item.filter, serviceId: item.serviceId } 
          }));
        }, 150);
      }
    } else {
      setLocation(href);
    }
  };

  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 text-lg font-display font-bold uppercase tracking-widest hover:text-primary transition-colors"
        aria-expanded={isOpen}
      >
        {title}
        <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="pb-4 pl-4 space-y-1">
          {items.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={(e) => handleItemClick(e, item.href)}
              className="block py-2 text-sm text-foreground/70 hover:text-primary transition-colors cursor-pointer"
            >
              {item.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
