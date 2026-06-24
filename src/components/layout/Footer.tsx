import { Link, useLocation } from "wouter";
import { SiWhatsapp, SiYoutube, SiInstagram, SiFacebook, SiGooglemaps, SiThreads } from "react-icons/si";
import { Mail, MapPin, Phone } from "lucide-react";
import { useState, useEffect } from "react";

interface ContactConfig {
  phones?: string[];
  emails?: string[];
  address?: string;
  whatsapp?: string;
  youtube?: string;
  instagram?: string;
  facebook?: string;
  threadsUrl?: string;
  mapsUrl?: string;
}

const LOGO_URL = "https://raw.githubusercontent.com/runloai/PrimeSign/main/data/logo/logo.webp";

const DEFAULT_CONTACT: ContactConfig = {
  phones: ["+91 6366525253", "+91 8861848284"],
  emails: ["primesign2021@gmail.com"],
  address: "Bangalore, Karnataka, India",
  whatsapp: "+91 6366525253",
  youtube: "https://www.youtube.com/@PrimesignBangalore",
  instagram: "https://www.instagram.com/primesignpvtltd/",
  facebook: "https://www.facebook.com/primesign.in",
  threadsUrl: "",
  mapsUrl: "https://maps.google.com/?q=Primesign+Ramamurthy+Nagar+Bangalore"
};

function getContactConfig(): ContactConfig {
  try {
    const stored = localStorage.getItem("primesign-config");
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.contact || DEFAULT_CONTACT;
    }
  } catch {
    console.warn("Failed to load contact config");
  }
  return DEFAULT_CONTACT;
}

export default function Footer() {
  const [useTextLogo] = useState(() => typeof window !== "undefined" && localStorage.getItem("primesign-logo") === "text");
  const [contact, setContact] = useState<ContactConfig>(DEFAULT_CONTACT);
  const [location, setLocation] = useLocation();
  
  useEffect(() => {
    setContact(getContactConfig());
  }, []);

  const phones = contact.phones?.length ? contact.phones : DEFAULT_CONTACT.phones || [];
  const emails = contact.emails?.length ? contact.emails : DEFAULT_CONTACT.emails || [];

  const handleNavClick = (href: string) => {
    if (href.startsWith("/#")) {
      if (location === "/") {
        // Already on home page, just scroll
        const element = document.querySelector(href.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        // On a different page, navigate to home first then scroll
        setLocation(href);
      }
    }
  };

  const quickLinks = [
    { name: "Services", href: "/#services" },
    { name: "Portfolio", href: "/#portfolio" },
    { name: "About Us", href: "/#about" },
    { name: "Why Us", href: "/#why-us" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <footer className="bg-black border-t border-white/10 pt-20 pb-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            {useTextLogo ? (
              <span className="text-2xl font-display font-black tracking-tight">
                <span className="text-primary">PRIME</span><span className="text-foreground">SIGN</span>
              </span>
            ) : (
              <img src={LOGO_URL} alt="Primesign" className="h-10 w-auto" />
            )}
            <p className="text-muted-foreground font-light leading-relaxed max-w-xs">
              Bangalore's premier signage and branding studio. We build bold, high-impact visual communication that makes your business unforgettable.
            </p>
            <div className="flex gap-4">
              {contact.whatsapp && (
                <a href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background">
                  <SiWhatsapp size={20} aria-label="WhatsApp"/>
                </a>
              )}
              {contact.youtube && (
                <a href={contact.youtube} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background">
                  <SiYoutube size={20} aria-label="YouTube"/>
                </a>
              )}
              {contact.instagram && (
                <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background">
                  <SiInstagram size={20} aria-label="Instagram"/>
                </a>
              )}
              {contact.facebook && (
                <a href={contact.facebook} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background">
                  <SiFacebook size={20} aria-label="Facebook"/>
                </a>
              )}
              {contact.threadsUrl && (
                <a href={contact.threadsUrl} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background">
                  <SiThreads size={20} aria-label="Threads"/>
                </a>
              )}
              {contact.mapsUrl && (
                <a href={contact.mapsUrl} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background">
                  <SiGooglemaps size={18} aria-label="Google Maps"/>
                </a>
              )}
            </div>
          </div>

          {/* Qualit Links */}
          <div>
            <h4 className="text-lg font-display font-bold uppercase tracking-wider mb-6">Quick Links</h4>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    onClick={() => handleNavClick(link.href)}
                    className="text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-sm px-1"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-display font-bold uppercase tracking-wider mb-6">Expertise</h4>
            <ul className="space-y-4">
              <li className="text-muted-foreground">LED & Neon Signs</li>
              <li className="text-muted-foreground">3D Channel Letters</li>
              <li className="text-muted-foreground">Acrylic Signage</li>
              <li className="text-muted-foreground">Outdoor Hoardings</li>
              <li className="text-muted-foreground">Corporate Branding</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-display font-bold uppercase tracking-wider mb-6">Get in Touch</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-muted-foreground">
                <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  {phones.map((phone, i) => (
                    <a key={i} 
                       href={`tel:${phone.replace(/\s/g, '')}`} 
                       className="block hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-sm px-1">
                      {phone}
                    </a>
                  ))}
                </div>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  {emails.map((email, i) => (
                    <a key={i} 
                       href={`mailto:${email}`} 
                       className="block hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-sm px-1">
                      {email}
                    </a>
                  ))}
                </div>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>{contact.address || DEFAULT_CONTACT.address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Primesign Private Limited. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Built for bold brands.
          </p>
        </div>
      </div>
    </footer>
  );
}
