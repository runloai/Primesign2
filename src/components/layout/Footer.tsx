import { Link } from "wouter";
import { SiWhatsapp, SiYoutube, SiGooglemaps } from "react-icons/si";
import { Mail, MapPin, Phone } from "lucide-react";
const LOGO_URL = "https://raw.githubusercontent.com/runloai/PrimeSign/main/data/logo/logo.webp";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 pt-20 pb-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <img src={LOGO_URL} alt="Primesign" className="h-10 w-auto" />
            <p className="text-muted-foreground font-light leading-relaxed max-w-xs">
              Bangalore's premier signage and branding studio. We build bold, high-impact visual communication that makes your business unforgettable.
            </p>
            <div className="flex gap-4">
              <a href="https://wa.me/916366525253" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all">
                <SiWhatsapp size={20} />
              </a>
              <a href="https://www.youtube.com/@PrimesignBangalore" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all">
                <SiYoutube size={20} />
              </a>
              <a href="https://g.co/kgs/Usqtga" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all">
                <SiGooglemaps size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-display font-bold uppercase tracking-wider mb-6">Quick Links</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/#services" className="text-muted-foreground hover:text-primary transition-colors">Our Services</Link>
              </li>
              <li>
                <Link href="/#portfolio" className="text-muted-foreground hover:text-primary transition-colors">Portfolio</Link>
              </li>
              <li>
                <Link href="/#about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link>
              </li>
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
                  <a href="tel:+916366525253" className="block hover:text-foreground transition-colors">+91 63665 25253</a>
                  <a href="tel:+918861848284" className="block hover:text-foreground transition-colors">+91 88618 48284</a>
                </div>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <a href="mailto:primesign2021@gmail.com" className="hover:text-foreground transition-colors">primesign2021@gmail.com</a>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>Bangalore, Karnataka, India</span>
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
