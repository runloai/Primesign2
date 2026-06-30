import { Link, useLocation } from "wouter";
import { SiWhatsapp, SiYoutube, SiInstagram, SiFacebook, SiGooglemaps, SiThreads } from "react-icons/si";
import { Mail, MapPin, Phone } from "lucide-react";
import { useState, useEffect } from "react";
import { imageUrl } from "@/lib/site-config";
import { useSiteConfig } from "@/hooks/use-site-config";

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

interface FooterConfig {
  companyName?: string;
  tagline?: string;
  copyright?: string;
  taglineFooter?: string;
  showSocialLinks?: boolean;
  socialLinks?: { platform: string; url?: string; enabled: boolean }[];
  quickLinks?: { name: string; href: string }[];
  expertise?: string[];
}

interface SettingsConfig {
  logoType?: "image" | "text";
  logoUrl?: string;
}

const DEFAULT_CONTACT: ContactConfig = {
  phones: ["+91 6366525253", "+91 8861848284"],
  emails: ["primesign2021@gmail.com"],
  address: "#35, Ramamurthy Nagar Signal, T C Palya Main Road, Bangalore 560016",
  whatsapp: "+91 6366525253",
  youtube: "https://www.youtube.com/@PrimesignBangalore",
  instagram: "https://www.instagram.com/primesignpvtltd/",
  facebook: "https://www.facebook.com/primesign.in",
  threadsUrl: "",
  mapsUrl: "https://maps.google.com/?q=Primesign+Ramamurthy+Nagar+Bangalore"
};

const DEFAULT_FOOTER: FooterConfig = {
  companyName: "Primesign Private Limited",
  tagline: "Bangalore's premier signage and branding studio. We build bold, high-impact visual communication that makes your business unforgettable.",
  copyright: "",
  taglineFooter: "Built for bold brands.",
  showSocialLinks: true,
  socialLinks: [],
  quickLinks: [
    { name: "Services", href: "/#services" },
    { name: "Portfolio", href: "/#portfolio" },
    { name: "About Us", href: "/#about" },
    { name: "Why Us", href: "/#why-us" },
    { name: "Contact", href: "/contact" }
  ],
  expertise: [
    "LED & Neon Signs",
    "3D Channel Letters",
    "Acrylic Signage",
    "Outdoor Hoardings",
    "Corporate Branding"
  ]
};

export default function Footer() {
  const { data: siteConfig } = useSiteConfig();
  const [useTextLogo, setUseTextLogo] = useState(false);
  const [logoSrc, setLogoSrc] = useState("/images/logo/logo.webp");
  const [contact, setContact] = useState<ContactConfig>(DEFAULT_CONTACT);
  const [footer, setFooter] = useState<FooterConfig>(DEFAULT_FOOTER);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!siteConfig) return;
    setUseTextLogo(siteConfig.settings?.logoType === "text");
    const logo = imageUrl(siteConfig.settings?.logo, siteConfig.settings?.logoUrl);
    setLogoSrc(logo || "/images/logo/logo.webp");

    const footerConfig = { ...DEFAULT_FOOTER, ...siteConfig.footer };
    if (footerConfig.copyright) {
      const currentYear = new Date().getFullYear();
      footerConfig.copyright = footerConfig.copyright.replace(/{year}/g, currentYear.toString());
    }

    const socialPlatforms = [
      { platform: "whatsapp", url: siteConfig.contact?.whatsapp || DEFAULT_CONTACT.whatsapp },
      { platform: "youtube", url: siteConfig.contact?.youtube || DEFAULT_CONTACT.youtube },
      { platform: "instagram", url: siteConfig.contact?.instagram || DEFAULT_CONTACT.instagram },
      { platform: "facebook", url: siteConfig.contact?.facebook || DEFAULT_CONTACT.facebook },
      { platform: "threads", url: siteConfig.contact?.threadsUrl || DEFAULT_CONTACT.threadsUrl },
      { platform: "maps", url: siteConfig.contact?.mapsUrl || DEFAULT_CONTACT.mapsUrl }
    ];

    if (!footerConfig.socialLinks || footerConfig.socialLinks.length === 0) {
      footerConfig.socialLinks = socialPlatforms.map(p => ({ ...p, enabled: !!p.url }));
    } else {
      footerConfig.socialLinks = footerConfig.socialLinks.map((link: { platform: string; url?: string; enabled: boolean }) => {
        const platformData = socialPlatforms.find(p => p.platform === link.platform);
        if (platformData && (!link.url || link.url === "")) {
          return { ...link, url: platformData.url };
        }
        return link;
      });
    }

    setFooter(footerConfig);
    if (siteConfig.contact) {
      setContact({ ...DEFAULT_CONTACT, ...siteConfig.contact });
    }
  }, [siteConfig]);

  const phones = contact.phones?.length ? contact.phones : DEFAULT_CONTACT.phones || [];
  const emails = contact.emails?.length ? contact.emails : DEFAULT_CONTACT.emails || [];

  const handleNavClick = (href: string) => {
    if (href.startsWith("/#")) {
      if (location === "/") {
        const element = document.querySelector(href.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        setLocation(href);
      }
    }
  };

  const currentYear = new Date().getFullYear();
  const copyright = footer.copyright || `© ${currentYear} ${footer.companyName || "Primesign Private Limited"}. All rights reserved.`;

  // Get enabled social links
  const enabledSocialLinks = footer.socialLinks?.filter(link => link.enabled && link.url) || [];

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
              <img src={logoSrc} alt="Primesign" className="h-10 w-auto" />
            )}
            <p className="text-muted-foreground font-light leading-relaxed max-w-xs">
              {footer.tagline}
            </p>
            {footer.showSocialLinks && enabledSocialLinks.length > 0 && (
              <div className="flex gap-4">
                {enabledSocialLinks.map(link => {
                  const url = link.url || "";
                  const platform = link.platform;
                  return (
                    <a
                      key={platform}
                      href={platform === "whatsapp" ? `https://wa.me/${url.replace(/\D/g, '')}` : url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                    >
                      {platform === "whatsapp" && <SiWhatsapp size={20} aria-label="WhatsApp"/>}
                      {platform === "youtube" && <SiYoutube size={20} aria-label="YouTube"/>}
                      {platform === "instagram" && <SiInstagram size={20} aria-label="Instagram"/>}
                      {platform === "facebook" && <SiFacebook size={20} aria-label="Facebook"/>}
                      {platform === "threads" && <SiThreads size={20} aria-label="Threads"/>}
                      {platform === "maps" && <SiGooglemaps size={18} aria-label="Google Maps"/>}
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-display font-bold uppercase tracking-wider mb-6">Quick Links</h4>
            <ul className="space-y-4">
              {(footer.quickLinks || DEFAULT_FOOTER.quickLinks)!.map((link) => (
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

          {/* Services / Expertise */}
          <div>
            <h4 className="text-lg font-display font-bold uppercase tracking-wider mb-6">Expertise</h4>
            <ul className="space-y-4">
              {(footer.expertise || DEFAULT_FOOTER.expertise)!.map((item, idx) => (
                <li key={idx} className="text-muted-foreground">{item}</li>
              ))}
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
            {copyright}
          </p>
          <p className="text-sm text-muted-foreground">
            {footer.taglineFooter}
          </p>
        </div>
      </div>
    </footer>
  );
}
