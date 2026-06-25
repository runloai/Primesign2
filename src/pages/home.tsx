import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, X, PhoneCall, Star, MapPin, Mail, Clock, Upload, Send, SiWhatsapp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQuoteModal } from "@/context/QuoteModalContext";
import { PortfolioImage } from "@/components/ui/image-with-skeleton";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { ImageLightbox } from "@/components/ImageLightbox";
import { SiWhatsapp as WhatsAppIcon } from "react-icons/si";

// Types for admin config
interface Testimonial {
  id?: number;
  name?: string;
  author?: string;
  role?: string;
  text?: string;
  rating?: number;
  avatar?: string;
}

interface ServiceImage {
  url: string;
  label?: string;
}

interface ServiceConfig {
  id?: number;
  name: string;
  desc?: string;
  badge?: string;
  images?: ServiceImage[] | string[];
  category?: string;
}

interface PortfolioConfig {
  id: number;
  url: string;
  label?: string;
  category: string;
  featured?: boolean;
}

// Shared config cache
let sharedConfig: { portfolio?: PortfolioConfig[]; hero?: any; services?: ServiceConfig[]; testimonials?: Testimonial[]; contact?: any; settings?: any; aboutImages?: any[]; advantageImages?: any[]; colorScheme?: any; serviceCategories?: any[] } | null = null;
let sharedConfigFetched = false;

// Helper function to read admin config from localStorage (preview mode)
function getAdminConfig(): { portfolio?: PortfolioConfig[]; hero?: any; services?: ServiceConfig[]; testimonials?: Testimonial[]; contact?: any; settings?: any; aboutImages?: any[]; advantageImages?: any[]; colorScheme?: any; serviceCategories?: any[] } | null {
  try {
    // Admin/localStorage config takes priority for preview mode
    const stored = localStorage.getItem("primesign-config");
    if (stored) {
      const config = JSON.parse(stored);
      return {
        portfolio: config.portfolio,
        hero: config.hero,
        services: config.services,
        testimonials: config.testimonials,
        contact: config.contact,
        settings: config.settings,
        aboutImages: config.aboutImages,
        advantageImages: config.advantageImages,
        colorScheme: config.colorScheme,
        serviceCategories: config.serviceCategories,
      };
    }
  } catch (e) {
    // Silent fail - config not available
  }
  return null;
}

// Helper to fetch shared config from config.json (public shared config)
async function fetchSharedConfig(): Promise<{ portfolio?: PortfolioConfig[]; hero?: any; services?: ServiceConfig[]; testimonials?: Testimonial[]; contact?: any; settings?: any; aboutImages?: any[]; advantageImages?: any[]; colorScheme?: any; serviceCategories?: any[] } | null> {
  if (sharedConfigFetched) return sharedConfig;
  
  try {
    const response = await fetch('/config.json', { 
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (response.ok) {
      const config = await response.json();
      sharedConfig = {
        portfolio: config.portfolio,
        hero: config.hero,
        services: config.services,
        testimonials: config.testimonials,
        contact: config.contact,
        settings: config.settings,
        aboutImages: config.aboutImages,
        advantageImages: config.advantageImages,
        colorScheme: config.colorScheme,
        serviceCategories: config.serviceCategories,
      };
    }
  } catch (e) {
    // Silent fail - shared config not available
  }
  
  sharedConfigFetched = true;
  return sharedConfig;
}

// Get effective config (localStorage overrides shared config for admin preview)
async function getEffectiveConfig(): Promise<{ portfolio?: PortfolioConfig[]; hero?: any; services?: ServiceConfig[]; testimonials?: Testimonial[]; contact?: any; settings?: any; aboutImages?: any[]; advantageImages?: any[]; colorScheme?: any; serviceCategories?: any[] } | null> {
  // First fetch the shared config from config.json
  const shared = await fetchSharedConfig();
  // Then check for admin/localStorage override (preview mode)
  const admin = getAdminConfig();
  // Admin/localStorage override takes priority for preview
  return admin || shared;
}

// Synchronous version for backward compatibility (fallback only)
function getEffectiveConfigSync(): { portfolio?: PortfolioConfig[]; hero?: any; services?: ServiceConfig[]; testimonials?: Testimonial[]; contact?: any; settings?: any; aboutImages?: any[]; advantageImages?: any[]; colorScheme?: any; serviceCategories?: any[] } | null {
  // First try localStorage/admin config (preview)
  const admin = getAdminConfig();
  if (admin) return admin;
  // Fall back to cached shared config
  return sharedConfig;
}

// Fetch config on module load (silent - doesn't block rendering)
fetchSharedConfig().catch(() => {});

const HERO_SLIDES = [
  "/images/portfolio/01.webp",
  "/images/portfolio/03.webp",
  "/images/portfolio/04.webp",
  "/images/portfolio/05.webp",
  "/images/portfolio/06.webp",
];

// ============ EXPANDED SERVICES (4 CATEGORIES, 20+ SERVICES) ============
const SERVICES_CATEGORIES = [
  {
    id: "sign-boards",
    title: "SIGN BOARDS",
    description: "Premium signage solutions for every business need",
    icon: "sign",
    items: [
      { name: "LED Signs", desc: "Ultra-bright LED boards with ACP backing", img: "/images/led/1.webp", badge: "Popular" },
      { name: "Glow Signs", desc: "Illuminated glow signs visible day and night", img: "/images/glow/1.webp" },
      { name: "Acrylic Signs", desc: "Laser-cut precision acrylic", img: "/images/acrylic/1.webp" },
      { name: "Wall Branding", desc: "Custom vinyl graphics and murals", img: "/images/wall/1.webp" },
      { name: "Non-Light Sign Board", desc: "Non-illuminated signage", img: "/images/led/1.webp" },
      { name: "3D LED Letters", desc: "Dimensional illuminated letters", img: "/images/led/2.webp" },
      { name: "Glow Sign Board", desc: "Backlit sign boards", img: "/images/glow/2.webp" },
      { name: "Acrylic Sign Board", desc: "Premium acrylic signage", img: "/images/acrylic/2.webp" },
      { name: "PVC/SS Letter Sign", desc: "Metal and PVC letters", img: "/images/pvc/1.webp" },
      { name: "Vehicle Wraps", desc: "Full and partial vehicle wraps", img: "/images/vehicle/1.webp" },
      { name: "PVC & Flex", desc: "Durable flex printing", img: "/images/pvc/1.webp" },
      { name: "Hoardings", desc: "Large outdoor displays", img: "/images/wall/2.webp" },
      { name: "One Way Vision", desc: "See-through window vinyl", img: "/images/vehicle/2.webp" },
      { name: "Gloss Branding", desc: "High-gloss finish signage", img: "/images/led/3.webp" },
      { name: "Wall Graphics", desc: "Custom wall murals", img: "/images/wall/3.webp" },
    ]
  },
  {
    id: "promotional",
    title: "PROMOTIONAL DISPLAY",
    description: "Display solutions for events & marketing",
    icon: "display",
    items: [
      { name: "Promotional Tents", desc: "Branded event tents", img: "/images/portfolio/01.webp" },
      { name: "Roll Up Standees", desc: "Retractable banner stands", img: "/images/portfolio/03.webp" },
    ]
  },
  {
    id: "print",
    title: "DIGITAL PRINTS",
    description: "High-quality digital printing",
    icon: "print",
    items: [
      { name: "Posters", desc: "Large-format posters", img: "/images/wall/4.webp" },
      { name: "Visiting Cards", desc: "Premium business cards", img: "/images/square/4.webp" },
      { name: "ID Cards", desc: "Employee ID cards", img: "/images/square/5.webp" },
      { name: "T-Shirts", desc: "Custom apparel printing", img: "/images/square/6.webp" },
      { name: "Quick Printing", desc: "Fast turnaround digital printing", img: "/images/square/2.webp" },
    ]
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (prefersReducedMotion: boolean) => ({
    opacity: 1,
    y: 0,
    transition: { 
      duration: prefersReducedMotion ? 0.01 : 0.8, 
      ease: "easeOut" 
    }
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: (prefersReducedMotion: boolean) => ({
    opacity: 1,
    transition: { 
      staggerChildren: prefersReducedMotion ? 0 : 0.1 
    }
  }),
};

const services = [
  {
    title: "LED Signs",
    desc: "Ultra-bright, energy-efficient LED boards engineered for maximum daylight visibility.",
    images: ["/images/led/1.webp","/images/led/2.webp","/images/led/3.webp","/images/led/4.webp","/images/led/5.webp"],
    tag: "Most Popular",
    category: "led",
  },
  {
    title: "Glow Signs",
    desc: "Illuminated channel-letter installations that blaze through the Bangalore night.",
    images: ["/images/glow/1.webp","/images/glow/2.webp","/images/glow/3.webp","/images/glow/4.webp","/images/glow/5.webp"],
    tag: null,
    category: "glow",
  },
  {
    title: "Acrylic Signs",
    desc: "Precision-routed acrylic lettering — crisp, clean, and unmistakably premium.",
    images: ["/images/acrylic/1.webp","/images/acrylic/2.webp","/images/acrylic/3.webp","/images/acrylic/4.webp"],
    tag: null,
    category: "acrylic",
  },
  {
    title: "Wall Branding",
    desc: "Large-format wall murals and architectural graphics for offices and retail.",
    images: ["/images/wall/1.webp","/images/wall/2.webp","/images/wall/3.webp","/images/wall/4.webp","/images/wall/5.webp"],
    tag: null,
    category: "wall",
  },
  {
    title: "Vehicle Wraps",
    desc: "Turn your entire fleet into high-impact moving billboards across the city.",
    images: ["/images/vehicle/1.webp","/images/vehicle/2.webp","/images/vehicle/3.webp"],
    tag: null,
    category: "vehicle",
  },
  {
    title: "PVC & Flex",
    desc: "Durable outdoor flex printing for hoardings, banners, and retail displays.",
    images: ["/images/pvc/1.webp", ...["/images/wall/1.webp","/images/wall/2.webp","/images/wall/3.webp","/images/wall/4.webp"]],
    tag: null,
    category: "pvc",
  },
  {
    title: "Non-Light Sign Board",
    desc: "Elegant non-illuminated signage boards for professional storefront branding and daytime visibility.",
    images: [],
    tag: null,
    category: "non-light-sign-board",
  },
  {
    title: "3D LED Letters",
    desc: "Premium dimensional illuminated letters with striking depth and brilliance.",
    images: [],
    tag: null,
    category: "3d-led-letters",
  },
  {
    title: "Glow Sign Board",
    desc: "Eye-catching backlit sign boards that create a luminous brand presence.",
    images: [],
    tag: null,
    category: "glow-sign-board",
  },
  {
    title: "Acrylic Sign Board",
    desc: "High-gloss acrylic sign boards with precision-cut edges and sleek finish.",
    images: [],
    tag: null,
    category: "acrylic-sign-board",
  },
  {
    title: "PVC/SS Letter",
    desc: "Durable PVC and stainless steel lettering solutions for long-lasting signage.",
    images: [],
    tag: null,
    category: "pvc-ss-letter",
  },
  {
    title: "Hoardings",
    desc: "Large-format outdoor hoarding installations for maximum brand exposure.",
    images: [],
    tag: null,
    category: "hoardings",
  },
  {
    title: "One Way Vision",
    desc: "Perforated vinyl graphics for see-through window and vehicle branding.",
    images: [],
    tag: null,
    category: "one-way-vision",
  },
  {
    title: "Gloss Branding",
    desc: "High-gloss premium finish branding solutions with a sophisticated sheen.",
    images: [],
    tag: null,
    category: "gloss-branding",
  },
  {
    title: "Wall Graphics",
    desc: "Custom wall murals and large-format graphics for interior and exterior spaces.",
    images: [],
    tag: null,
    category: "wall-graphics",
  },
  {
    title: "Promo Tents",
    desc: "Branded promotional tents and canopies for events and outdoor activations.",
    images: [],
    tag: null,
    category: "promo-tents",
  },
  {
    title: "Roll Up Standees",
    desc: "Portable retractable banner stands for trade shows and retail displays.",
    images: [],
    tag: null,
    category: "roll-up-standees",
  },
  {
    title: "Posters",
    desc: "Vibrant high-resolution poster printing for indoor and outdoor advertising.",
    images: [],
    tag: null,
    category: "posters",
  },
  {
    title: "Visiting Cards",
    desc: "Premium business card printing with various finishes and stock options.",
    images: [],
    tag: null,
    category: "visiting-cards",
  },
  {
    title: "ID Cards",
    desc: "Custom employee ID cards and access badge printing solutions.",
    images: [],
    tag: null,
    category: "id-cards",
  },
  {
    title: "T-Shirts",
    desc: "Custom t-shirt printing for corporate uniforms, events, and merchandise.",
    images: [],
    tag: null,
    category: "t-shirts",
  },
  {
    title: "Quick Printing",
    desc: "Fast turnaround digital printing services for urgent business needs.",
    images: [],
    tag: null,
    category: "quick-printing",
  },
];

const reasons = [
  "Premium Quality Materials",
  "Rapid Turnaround Times",
  "Expert Installation Team",
  "End-to-End Service",
  "Competitive Pricing",
  "Bangalore-Based Manufacturing",
];

const testimonials = [
  {
    id: 1,
    text: "Primesign completely transformed our storefront. The 3D LED letters are incredibly bright and the finishing is flawless. Highly professional team.",
    author: "Rajesh K.",
    name: "Rajesh K.",
    role: "Restaurant Owner, Indiranagar",
    rating: 5,
    avatar: "",
  },
  {
    id: 2,
    text: "We needed massive corporate branding for our new tech park. Primesign delivered ahead of schedule with exceptional quality. Their attention to detail is unmatched.",
    author: "Priya M.",
    name: "Priya M.",
    role: "Facility Manager, Whitefield",
    rating: 5,
    avatar: "",
  },
  {
    id: 3,
    text: "The custom neon sign they built for our cafe has become the main photo spot for our customers. Fast, affordable, and brilliant execution.",
    author: "Arjun S.",
    name: "Arjun S.",
    role: "Cafe Founder, Koramangala",
    rating: 5,
    avatar: "",
  },
];

// Helper to get dynamic testimonials from config/localStorage (preview mode only)
function getDynamicTestimonials(): Testimonial[] | null {
  try {
    const stored = localStorage.getItem("primesign-config");
    if (stored) {
      const config = JSON.parse(stored);
      if (config.testimonials && config.testimonials.length > 0) {
        return config.testimonials.map((t: Testimonial) => ({
          ...t,
          avatar: t.avatar || "",
          name: t.name || t.author || "Client",
        }));
      }
    }
  } catch (e) {
    // Silent fail
  }
  return null;
}

// Helper to extract image URL from service image
function extractImageUrl(img: ServiceImage | string): string {
  if (typeof img === 'string') return img;
  return img?.url || '';
}

// Helper to get fallback image for service category
function getServiceImage(serviceName: string): string {
  const name = serviceName.toLowerCase();
  if (name.includes("led")) return "/images/led/1.webp";
  if (name.includes("glow")) return "/images/glow/1.webp";
  if (name.includes("acrylic")) return "/images/acrylic/1.webp";
  if (name.includes("wall")) return "/images/wall/1.webp";
  if (name.includes("vehicle")) return "/images/vehicle/1.webp";
  if (name.includes("pvc") || name.includes("flex")) return "/images/pvc/1.webp";
  return "/images/led/1.webp";
}

// Extract category from service name
function getCategoryFromServiceName(serviceName: string): string {
  const name = serviceName.toLowerCase();
  if (name.includes("led")) return "led";
  if (name.includes("glow")) return "glow";
  if (name.includes("acrylic")) return "acrylic";
  if (name.includes("wall")) return "wall";
  if (name.includes("vehicle")) return "vehicle";
  if (name.includes("pvc") || name.includes("flex")) return "pvc";
  const firstWord = name.split(/\s+/)[0];
  return firstWord || "led";
}

// Helper to get dynamic services from admin config (preview mode only)
function getDynamicServices(): any[] | null {
  try {
    const stored = localStorage.getItem("primesign-config");
    if (stored) {
      const config = JSON.parse(stored);
      if (config.services && config.services.length > 0) {
        return config.services
          .filter((s: ServiceConfig) => s.name)
          .map((s: ServiceConfig) => {
            const serviceImages = s.images && s.images.length > 0
              ? s.images.map((img: ServiceImage | string) => extractImageUrl(img)).filter(Boolean)
              : [getServiceImage(s.name)];
            
            return {
              title: s.name,
              desc: s.desc || "",
              images: serviceImages,
              thumbnail: serviceImages[0] || getServiceImage(s.name),
              tag: s.badge === "popular" ? "Most Popular" : s.badge === "new" ? "New" : null,
              category: getCategoryFromServiceName(s.name),
            };
          });
      }
    }
  } catch (e) {
    // Silent fail
  }
  return null;
}

// Build services categories from admin config (preview mode only)
function getDynamicServiceCategories(): typeof SERVICES_CATEGORIES | null {
  try {
    const stored = localStorage.getItem("primesign-config");
    if (stored) {
      const config = JSON.parse(stored);
      if (config.serviceCategories && config.serviceCategories.length > 0) {
        return config.serviceCategories;
      }
      if (config.services && config.services.length > 0) {
        // Group services by category
        const grouped: Record<string, any[]> = {};
        config.services.forEach((s: ServiceConfig) => {
          const cat = s.category || "General";
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push(s);
        });
        
        return Object.entries(grouped).map(([catName, items], idx) => ({
          id: catName.toLowerCase().replace(/\s+/g, '-'),
          title: catName.toUpperCase(),
          description: "Professional " + catName.toLowerCase() + " services",
          icon: "sign",
          items: items.map((s: any) => ({
            name: s.name,
            desc: s.desc || "",
            img: s.images?.[0]?.url || s.images?.[0] || "/images/led/1.webp",
            badge: s.badge
          }))
        }));
      }
    }
  } catch (e) {
    // Silent fail
  }
  return null;
}

// Service Image Gallery Carousel Component
interface ServiceGalleryProps {
  images: string[];
  serviceTitle: string;
  prefersReducedMotion: boolean;
}

function ServiceImageGallery({ images, serviceTitle, prefersReducedMotion }: ServiceGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);

  const displayImages = images.length > 0 ? images : ["/images/led/1.webp"];
  const totalImages = displayImages.length;

  useEffect(() => {
    if (isHovering || totalImages <= 1) return;
    
    autoScrollRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalImages);
    }, 3500);

    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
    };
  }, [isHovering, totalImages]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const scrollAmount = currentIndex * scrollContainerRef.current.offsetWidth;
      scrollContainerRef.current.scrollTo({
        left: scrollAmount,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    }
  }, [currentIndex, prefersReducedMotion]);

  const goToNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % totalImages);
  };

  const goToPrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  const goToIndex = (index: number) => {
    setCurrentIndex(index);
  };

  const showNavigation = totalImages > 1;

  return (
    <div 
      className="relative w-full h-full"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div 
        ref={scrollContainerRef}
        className="flex w-full h-full overflow-hidden scroll-smooth"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {displayImages.map((img, idx) => (
          <div 
            key={idx}
            className="flex-shrink-0 w-full h-full"
            style={{ scrollSnapAlign: 'start' }}
          >
            <img
              src={img}
              alt={`${serviceTitle} - Image ${idx + 1}`}
              className="w-full h-full object-cover"
              loading={idx === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>

      {showNavigation && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity duration-200 hover:bg-black/80 z-10"
            aria-label="Previous image"
            style={{ opacity: isHovering ? 1 : undefined }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity duration-200 hover:bg-black/80 z-10"
            aria-label="Next image"
            style={{ opacity: isHovering ? 1 : undefined }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {showNavigation && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
          {displayImages.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => { e.stopPropagation(); goToIndex(idx); }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? "bg-primary w-4"
                  : "bg-white/60 hover:bg-white/80"
              }`}
              aria-label={`Go to image ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {showNavigation && (
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full z-10">
          {currentIndex + 1} / {totalImages}
        </div>
      )}
    </div>
  );
}

// Client Logos Carousel Component
function ClientLogosCarousel({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  
  const clients = [];
  // Double the logos for seamless loop
  const displayClients = [...clients, ...clients];

  useEffect(() => {
    if (prefersReducedMotion || isPaused) return;
    
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationId: number;
    let scrollPos = 0;
    const speed = 0.5;

    const animate = () => {
      if (!isPaused && scrollContainer) {
        scrollPos += speed;
        // Reset when we've scrolled through half (the duplicated set)
        const maxScroll = scrollContainer.scrollWidth / 2;
        if (scrollPos >= maxScroll) {
          scrollPos = 0;
        }
        scrollContainer.scrollLeft = scrollPos;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused, prefersReducedMotion]);

  return (
    <div 
      className="relative w-full overflow-hidden py-8"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Gradient masks */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-card to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-card to-transparent z-10 pointer-events-none" />
      
      <div 
        ref={scrollRef}
        className="flex gap-12 items-center overflow-x-hidden"
        style={{ scrollBehavior: 'auto' }}
      >
        {displayClients.map((src, i) => (
          <div 
            key={i}
            className="flex-shrink-0 w-32 h-16 flex items-center justify-center"
          >
            <img
              src={src}
              alt={`Client ${(i % clients.length) + 1}`}
              className="h-12 w-full object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Contact Form Component
function ContactSection({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    message: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Format message for WhatsApp
    const lines = [
      `*New Contact Form Submission - PrimeSign*`,
      ``,
      `*Name:* ${formData.name}`,
      `*Email:* ${formData.email}`,
      `*Phone:* ${formData.phone}`,
      formData.address ? `*Address:* ${formData.address}` : null,
      ``,
      `*Message:*`,
      formData.message,
      file ? `\n*Attachment:* ${file.name}` : null,
    ].filter(Boolean).join("\n");

    const url = `https://wa.me/916366525253?text=${encodeURIComponent(lines)}`;
    window.open(url, "_blank");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <section id="contact" className="py-24 bg-card relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm text-primary font-bold tracking-widest uppercase mb-4">Contact Us</h2>
          <h3 className="text-4xl md:text-5xl font-display font-bold leading-tight">GET IN TOUCH</h3>
          <p className="text-muted-foreground mt-4 text-lg">
            Ready to transform your brand visibility? Let's discuss your project.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.6 }}
            className="bg-background/50 backdrop-blur-sm p-8 rounded-2xl border border-white/5"
          >
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                  <Send className="w-9 h-9 text-primary" />
                </div>
                <h4 className="text-2xl font-display font-bold mb-3">Message Sent!</h4>
                <p className="text-muted-foreground">Redirecting you to WhatsApp...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-muted-foreground mb-2 block">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="bg-background/60 border-white/10 focus:border-primary/60"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-muted-foreground mb-2 block">
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="bg-background/60 border-white/10 focus:border-primary/60"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-muted-foreground mb-2 block">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="bg-background/60 border-white/10 focus:border-primary/60"
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="text-sm font-medium text-muted-foreground mb-2 block">
                    Address / Location
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Your address or area in Bangalore"
                    className="bg-background/60 border-white/10 focus:border-primary/60"
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-sm font-medium text-muted-foreground mb-2 block">
                    Message *
                  </Label>
                  <Textarea
                    id="message"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your project requirements..."
                    rows={5}
                    className="bg-background/60 border-white/10 focus:border-primary/60 resize-none"
                  />
                </div>

                <div>
                  <Label htmlFor="file" className="text-sm font-medium text-muted-foreground mb-2 block">
                    Attachment (Optional)
                  </Label>
                  <div className="relative">
                    <Input
                      id="file"
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*,.pdf,.doc,.docx"
                      className="bg-background/60 border-white/10 focus:border-primary/60 file:bg-primary/10 file:text-primary file:border-0 file:rounded-md"
                    />
                    {file && (
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                        <Upload className="w-3 h-3" />
                        {file.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    type="submit"
                    size="lg"
                    className="flex-1 h-12 rounded-full font-bold uppercase tracking-wide box-glow"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send via WhatsApp
                  </Button>
                  <a
                    href="https://wa.me/916366525253?text=Hello%20PrimeSign%2C%20I%27d%20like%20to%20know%20more%20about%20your%20services."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="w-full h-12 rounded-full font-bold uppercase tracking-wide border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10"
                    >
                      <WhatsAppIcon className="w-5 h-5 mr-2" />
                      Chat on WhatsApp
                    </Button>
                  </a>
                </div>
              </form>
            )}
          </motion.div>

          {/* Contact Info & Map */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.6 }}
            className="space-y-8"
          >
            {/* Contact Details */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-background/50 backdrop-blur-sm p-6 rounded-xl border border-white/5 hover:border-primary/30 transition-colors">
                <MapPin className="w-8 h-8 text-primary mb-4" />
                <h4 className="font-bold text-lg mb-2">Visit Us</h4>
                <p className="text-muted-foreground text-sm">
                  PrimeSign Private Limited<br />
                  Bangalore, Karnataka<br />
                  India
                </p>
              </div>
              <div className="bg-background/50 backdrop-blur-sm p-6 rounded-xl border border-white/5 hover:border-primary/30 transition-colors">
                <PhoneCall className="w-8 h-8 text-primary mb-4" />
                <h4 className="font-bold text-lg mb-2">Call Us</h4>
                <p className="text-muted-foreground text-sm">
                  <a href="tel:+916366525253" className="hover:text-primary transition-colors">
                    +91 63665 25253
                  </a>
                </p>
              </div>
              <div className="bg-background/50 backdrop-blur-sm p-6 rounded-xl border border-white/5 hover:border-primary/30 transition-colors">
                <Mail className="w-8 h-8 text-primary mb-4" />
                <h4 className="font-bold text-lg mb-2">Email Us</h4>
                <p className="text-muted-foreground text-sm">
                  <a href="mailto:hello@primesign.in" className="hover:text-primary transition-colors">
                    hello@primesign.in
                  </a>
                </p>
              </div>
              <div className="bg-background/50 backdrop-blur-sm p-6 rounded-xl border border-white/5 hover:border-primary/30 transition-colors">
                <Clock className="w-8 h-8 text-primary mb-4" />
                <h4 className="font-bold text-lg mb-2">Working Hours</h4>
                <p className="text-muted-foreground text-sm">
                  Mon - Sat: 9:00 AM - 7:00 PM<br />
                  Sunday: Closed
                </p>
              </div>
            </div>

            {/* Google Maps Embed */}
            <div className="rounded-2xl overflow-hidden border border-white/10 h-64">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d248849.8865401047!2d77.46612999155236!3d12.953945337580189!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4a3e!2sBangalore%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1703123456789!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(100%) invert(92%) contrast(83%)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="PrimeSign Location"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Main Home Component
export default function Home() {
  const { open: openQuote } = useQuoteModal();
  const [heroIndex, setHeroIndex] = useState(0);
  const [portfolioFilter] = useState<string | null>(null);
  const [activeServiceCategory, setActiveServiceCategory] = useState<string>(() => {
    const stored = sessionStorage.getItem("arsenal-category");
    if (stored) { sessionStorage.removeItem("arsenal-category"); return stored; }
    return "sign-boards";
  });
  const [adminConfig, setAdminConfig] = useState<{ portfolio?: PortfolioConfig[]; hero?: any; testimonials?: Testimonial[]; services?: ServiceConfig[]; contact?: any; settings?: any; aboutImages?: any[]; advantageImages?: any[]; colorScheme?: any; serviceCategories?: any[] } | null>(null);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  // Load config from localStorage (preview) or config.json (shared) on mount
  useEffect(() => {
    const loadConfig = async () => {
      const config = await getEffectiveConfig();
      if (config) {
        setAdminConfig(config);
      }
    };
    loadConfig();
  }, []);

  // Listen for navbar dropdown category changes + specific service scroll
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setActiveServiceCategory(e.detail);
      document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
    };
    const svcHandler = (e: CustomEvent) => {
      setActiveServiceCategory(e.detail.category);
      setTimeout(() => {
        document.getElementById(`svc-${e.detail.serviceId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    };
    window.addEventListener("arsenal-filter", handler as EventListener);
    window.addEventListener("scroll-to-service", svcHandler as EventListener);
    return () => {
      window.removeEventListener("arsenal-filter", handler as EventListener);
      window.removeEventListener("scroll-to-service", svcHandler as EventListener);
    };
  }, []);

  // Get services from config or fallback to hardcoded
  const dynamicServices = getDynamicServices();
  const rawDisplayServices = dynamicServices || adminConfig?.services || services;
  
  const displayServices = useMemo(() => {
    return rawDisplayServices.map((s: any) => ({
      ...s,
      images: s.images || (s.img ? [s.img] : ["/images/led/1.webp"]),
      thumbnail: s.thumbnail || s.img || (s.images?.[0]) || "/images/led/1.webp",
    }));
  }, [rawDisplayServices]);

  // Get service categories from config or fallback
  const dynamicServiceCategories = getDynamicServiceCategories();
  const serviceCategories = dynamicServiceCategories || SERVICES_CATEGORIES;

  // Get hero data from config or fallback
  const heroBgImage = adminConfig?.hero?.bgImage || "/images/portfolio/01.webp";
  const heroBadgeText = adminConfig?.hero?.badge || "Bangalore's Premier Signage Studio";
  const heroHeadline = adminConfig?.hero?.headline;
  const heroSubtitle = adminConfig?.hero?.subtitle || "From bold LED boards to precision 3D channel letters. We engineer high-impact signage that lights up Bangalore and makes your brand impossible to ignore.";

  // Get testimonials from config or fallback
  const dynamicTestimonials = getDynamicTestimonials();
  const displayTestimonials = dynamicTestimonials || adminConfig?.testimonials || testimonials;

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % displayTestimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [displayTestimonials.length]);

  // Get portfolio items
  const getPortfolioItems = () => {
    if (displayServices && displayServices.length > 0) {
      const serviceGalleryItems: { img: string; label: string; cat: string; featured: boolean }[] = [];
      
      displayServices.forEach((service: any, serviceIdx: number) => {
        const serviceImages = service.images || [];
        const category = service.category || getCategoryFromServiceName(service.title);
        
        serviceImages.forEach((img: string, imgIdx: number) => {
          if (img) {
            serviceGalleryItems.push({
              img,
              label: imgIdx === 0 ? `${service.title} - Featured` : `${service.title} - Sample`,
              cat: category,
              featured: serviceIdx === 0 && imgIdx === 0,
            });
          }
        });
      });
      
      if (serviceGalleryItems.length > 0) {
        return serviceGalleryItems;
      }
    }
    
    if (adminConfig?.portfolio && adminConfig.portfolio.length > 0) {
      return adminConfig.portfolio
        .filter((item: PortfolioConfig) => item.url)
        .map((item: PortfolioConfig) => ({
          img: item.url,
          label: item.label || "Installation",
          cat: item.category || "led",
          featured: item.featured || false,
        }));
    }
    
    return [
      { img: "/images/portfolio/01.webp", label: "Storefront LED Branding", cat: "led", featured: true },
      { img: "/images/glow/4.webp", label: "Glow Sign", cat: "glow", featured: false },
      { img: "/images/square/brass.webp", label: "LED Channel", cat: "led", featured: false },
      { img: "/images/vehicle/3.webp", label: "Vehicle Wrap", cat: "vehicle", featured: false },
      { img: "/images/wall/4.webp", label: "Wall Branding", cat: "wall", featured: false },
      { img: "/images/portfolio/02.webp", label: "Retail Signage", cat: "led", featured: false },
      { img: "/images/acrylic/2.webp", label: "Acrylic Letters", cat: "acrylic", featured: false },
      { img: "/images/glow/5.webp", label: "Neon Glow", cat: "glow", featured: false },
      { img: "/images/portfolio/04.webp", label: "Corporate Lobby", cat: "acrylic", featured: false },
    ];
  };

  const allPortfolioItems = getPortfolioItems();
  
  const featuredItem = useMemo(() => {
    return allPortfolioItems.find(item => item.featured) || null;
  }, [allPortfolioItems]);
  
  const nonFeaturedItems = useMemo(() => {
    return allPortfolioItems.filter(item => !item.featured);
  }, [allPortfolioItems]);

  const aboutImages = adminConfig?.aboutImages && adminConfig.aboutImages.length >= 4
    ? adminConfig.aboutImages.slice(0, 4).map((img: any) => img.url || img)
    : ["/images/glow/3.webp", "/images/wall/3.webp", "/images/led/2.webp", "/images/square/brass.webp"];

  const displayReasons = adminConfig?.advantageImages && adminConfig.advantageImages.length >= 6
    ? adminConfig.advantageImages.slice(0, 6).map((img: any) => img.label || img.toString())
    : reasons;

  const portfolioCategories = useMemo(() => {
    const categories: string[] = [];
    const seen = new Set<string>();
    displayServices.forEach((service: any) => {
      if (service.category && !seen.has(service.category.toLowerCase())) {
        seen.add(service.category.toLowerCase());
        categories.push(service.category.toLowerCase());
      }
    });
    return categories;
  }, [displayServices]);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const getLightboxImages = useCallback(() => {
    const images: { src: string; alt: string; label: string }[] = [];
    const items = [];
    if (featuredItem) items.push(featuredItem);
    items.push(...nonFeaturedItems);
    
    items.forEach((item: any) => {
      images.push({ src: item.img, alt: item.label, label: item.label });
    });
    
    return images;
  }, [featuredItem, nonFeaturedItems]);

  const lightboxImages = getLightboxImages();

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const filteredFeaturedItem = useMemo(() => featuredItem, [featuredItem]);

  const filteredNonFeaturedItems = useMemo(() => nonFeaturedItems, [nonFeaturedItems]);

  // Service detail state
  const [selectedService, setSelectedService] = useState<{ name: string; desc: string; images: string[] } | null>(null);
  const [selectedServiceImageIndex, setSelectedServiceImageIndex] = useState(0);

  // Build a name-to-images lookup from displayServices
  const serviceImagesLookup = useMemo(() => {
    const map = new Map<string, string[]>();
    (displayServices || []).forEach((s: any) => {
      if (s.title) {
        const key = s.title.toLowerCase().replace(/\s+/g, ' ').trim();
        map.set(key, (s.images || []).filter(Boolean));
      }
    });
    return map;
  }, [displayServices]);

  const getServiceImages = useCallback((serviceName: string, fallbackImg?: string): string[] => {
    const normalized = serviceName.toLowerCase().replace(/\s+/g, ' ').trim();
    const exact = serviceImagesLookup.get(normalized);
    if (exact && exact.length > 0) return exact;
    const noTrailS = normalized.replace(/s$/, '');
    for (const [key, imgs] of serviceImagesLookup) {
      if (key.replace(/s$/, '') === noTrailS && imgs.length > 0) return imgs;
      if (key.includes(noTrailS) || noTrailS.includes(key)) {
        if (imgs.length > 0) return imgs;
      }
    }
    return fallbackImg ? [fallbackImg] : ["/images/led/1.webp"];
  }, [serviceImagesLookup]);

  const openServiceDetail = useCallback((item: { name: string; desc: string; img?: string }) => {
    const images = getServiceImages(item.name, item.img);
    setSelectedService({ name: item.name, desc: item.desc, images });
    setSelectedServiceImageIndex(0);
  }, [getServiceImages]);

  // Keyboard navigation for service detail
  useEffect(() => {
    if (!selectedService) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedService(null);
      if (e.key === 'ArrowRight') {
        setSelectedServiceImageIndex(prev => (prev + 1) % selectedService.images.length);
      }
      if (e.key === 'ArrowLeft') {
        setSelectedServiceImageIndex(prev => (prev - 1 + selectedService.images.length) % selectedService.images.length);
      }
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [selectedService]);

  // Get current category services
  const currentCategory = serviceCategories.find(c => c.id === activeServiceCategory) || serviceCategories[0];

  return (
    <div className="w-full">
      {/* ============ HERO SECTION ============ */}
      <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <img
            src={heroBgImage}
            alt="Primesign signage"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto px-4 md:px-6 py-16 pb-28 md:py-32">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-block border border-primary/30 bg-primary/10 px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm"
            >
              <span className="text-primary font-bold text-sm tracking-wider uppercase">
                {heroBadgeText}
              </span>
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-bold leading-[1.1] mb-6 tracking-tight"
              dangerouslySetInnerHTML={{
                __html: heroHeadline
                  ? heroHeadline.replace(/<br\s*\/?>/gi, '<br />')
                  : "WE BUILD <br />UNFORGETTABLE<br />VISIBILITY."
              }}
            />
            <motion.p
              variants={fadeInUp}
              className="text-base sm:text-xl md:text-2xl text-muted-foreground font-light max-w-2xl mb-10 leading-relaxed"
            >
              {heroSubtitle}
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={openQuote}
                className="h-12 sm:h-14 px-6 sm:px-8 rounded-full text-sm sm:text-lg font-bold uppercase tracking-wide box-glow w-full sm:w-auto group"
                data-testid="button-hero-whatsapp"
              >
                Get a Free Quote
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <a 
                href="https://wa.me/916366525253?text=Hello%20PrimeSign%2C%20I%27d%20like%20to%20get%20a%20quote%20for%20signage%20services."
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 sm:h-14 px-6 sm:px-8 rounded-full text-sm sm:text-lg font-bold uppercase tracking-wide bg-white/5 border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10 w-full sm:w-auto"
                >
                  <WhatsAppIcon className="w-5 h-5 mr-2" />
                  WhatsApp Us
                </Button>
              </a>
              <a href="#portfolio">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 sm:h-14 px-6 sm:px-8 rounded-full text-sm sm:text-lg font-bold uppercase tracking-wide bg-white/5 border-white/20 hover:bg-white/10 w-full sm:w-auto"
                  data-testid="button-hero-portfolio"
                >
                  View Our Work
                </Button>
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* Stat strip */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/40 border-t border-white/10 backdrop-blur-sm py-3 z-10">
          <div className="container mx-auto px-4 flex flex-wrap justify-center md:justify-between gap-6 text-center">
            {[["500+", "Projects"], ["5+", "Years"], ["100%", "Satisfaction"], ["Bangalore", "Based"]].map(([val, label]) => (
              <div key={label}>
                <span className="text-primary font-display font-bold text-xl mr-1">{val}</span>
                <span className="text-muted-foreground text-sm uppercase tracking-wider">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ABOUT SECTION ============ */}
      <section id="about" className="py-24 bg-card relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: prefersReducedMotion ? 0.01 : 0.8 }}
            >
              <h2 className="text-sm text-primary font-bold tracking-widest uppercase mb-4">About Primesign</h2>
              <h3 className="text-4xl md:text-5xl font-display font-bold leading-tight mb-6">
                BORN IN BANGALORE.<br />BUILT FOR IMPACT.
              </h3>
              <p className="text-lg text-muted-foreground font-light leading-relaxed mb-6">
                Founded in 2021, Primesign Private Limited has rapidly become Bangalore's go-to
                studio for premium signage and architectural branding.
              </p>
              <p className="text-lg text-muted-foreground font-light leading-relaxed mb-8">
                We don't just print signs — we engineer visibility. Our obsession with quality
                materials, cutting-edge lighting technology, and flawless execution ensures every
                installation makes a statement. When your brand needs to own the street, you call
                Primesign.
              </p>
              <div className="grid grid-cols-2 gap-8 border-t border-border pt-8">
                <div>
                  <div className="text-4xl font-display font-bold text-foreground mb-1">500+</div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wider">Projects Completed</div>
                </div>
                <div>
                  <div className="text-4xl font-display font-bold text-foreground mb-1">100%</div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wider">Quality Guarantee</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: prefersReducedMotion ? 0.01 : 0.8 }}
              className="grid grid-cols-2 gap-3"
            >
              {aboutImages.map((src: string, i: number) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden">
                  <img
                    src={src}
                    alt={`Primesign signage work sample ${i + 1}`}
                    loading={i < 2 ? "eager" : "lazy"}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    data-testid={`img-about-${i}`}
                  />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ EXPANDED SERVICES SECTION ============ */}
      <section id="services" className="py-24 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-sm text-primary font-bold tracking-widest uppercase mb-4">Our Expertise</h2>
            <h3 className="text-4xl md:text-6xl font-display font-bold leading-tight mb-4">THE ARSENAL</h3>
            <p className="text-muted-foreground text-lg">
              Comprehensive signage solutions across {serviceCategories.length} categories
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {serviceCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveServiceCategory(category.id)}
                className={`px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                  activeServiceCategory === category.id
                    ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(240,168,48,0.3)]"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {category.title}
              </button>
            ))}
          </div>

          {/* Active Category Description */}
          <div className="text-center mb-10">
            <p className="text-muted-foreground text-lg">{currentCategory.description}</p>
          </div>

          {/* Services Grid */}
          <motion.div
            key={activeServiceCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {currentCategory.items.map((service, index) => (
              <motion.div
                key={service.name}
                id={`svc-${service.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: prefersReducedMotion ? 0.01 : 0.5, delay: index * 0.05 }}
                className="group relative bg-card rounded-2xl overflow-hidden border border-white/5 hover:border-primary/50 hover:shadow-[0_0_40px_rgba(240,168,48,0.15)] transition-all duration-500 cursor-pointer"
                onClick={() => {
                  openServiceDetail(service);
                }}
              >
                {service.badge && (
                  <div className="absolute top-3 right-3 z-20 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    {service.badge}
                  </div>
                )}
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={service.img}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h4 className="text-lg font-display font-bold mb-1 group-hover:text-primary transition-colors">
                    {service.name}
                  </h4>
                  <p className="text-muted-foreground text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {service.desc}
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); openServiceDetail(service); }}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:text-primary/80 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    See Work →
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* View All CTA */}
          <div className="text-center mt-12">
            <Button
              size="lg"
              onClick={openQuote}
              className="h-12 px-8 rounded-full font-bold uppercase tracking-wide box-glow"
            >
              Get Quote for Any Service
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ============ PORTFOLIO SECTION ============ */}
      <section id="portfolio" className="py-24 bg-background relative border-t border-white/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-sm text-primary font-bold tracking-widest uppercase mb-4">Our Work</h2>
              <h3 className="text-4xl md:text-5xl font-display font-bold leading-tight">REAL INSTALLATIONS</h3>
            </div>
            <a href="https://www.youtube.com/@PrimesignBangalore" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="rounded-full border-white/20 uppercase tracking-widest font-bold">
                Watch on YouTube
              </Button>
            </a>
          </div>


          {/* Portfolio Grid */}
          <div id="portfolio-grid" role="tabpanel" aria-label="Portfolio gallery">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              {filteredFeaturedItem && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="col-span-2 row-span-2 aspect-square rounded-2xl overflow-hidden relative group cursor-pointer"
                  onClick={() => openLightbox(0)}
                >
                  <PortfolioImage src={filteredFeaturedItem.img} alt={filteredFeaturedItem.label} />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <span className="text-white font-display font-bold uppercase tracking-widest text-lg">{filteredFeaturedItem.label}</span>
                  </div>
                </motion.div>
              )}

              {filteredNonFeaturedItems.slice(0, filteredFeaturedItem ? 4 : 5).map((item: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i + 1) * 0.08 }}
                  className="aspect-square rounded-2xl overflow-hidden relative group cursor-pointer"
                  onClick={() => openLightbox(filteredFeaturedItem ? i + 1 : i)}
                >
                  <PortfolioImage src={item.img} alt={item.label} />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="text-white font-bold uppercase tracking-widest text-sm">{item.label}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredNonFeaturedItems.length > (filteredFeaturedItem ? 4 : 5) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {filteredNonFeaturedItems.slice(filteredFeaturedItem ? 4 : 5, filteredFeaturedItem ? 12 : 13).map((item: any, i: number) => (
                  <motion.div
                    key={i + 100}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="aspect-square rounded-2xl overflow-hidden relative group cursor-pointer"
                    onClick={() => openLightbox((filteredFeaturedItem ? 5 : 5) + i)}
                  >
                    <PortfolioImage src={item.img} alt={item.label} />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <span className="text-white font-bold uppercase tracking-widest text-sm">{item.label}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============ CLIENT LOGOS CAROUSEL SECTION ============ */}
      <section className="py-16 bg-card border-t border-white/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-8">
            <h2 className="text-sm text-primary font-bold tracking-widest uppercase mb-2">Trusted By</h2>
            <h3 className="text-2xl md:text-3xl font-display font-bold">OUR CLIENTS</h3>
          </div>
          <ClientLogosCarousel prefersReducedMotion={prefersReducedMotion} />
        </div>
      </section>

      {/* ============ WHY CHOOSE US / ADVANTAGES ============ */}
      <section id="why-us" className="py-24 bg-card text-card-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent opacity-50" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-sm font-bold tracking-widest uppercase mb-4 text-white/80">The Primesign Advantage</h2>
              <h3 className="text-4xl md:text-6xl font-display font-bold leading-tight mb-8">
                ENGINEERED FOR EXCELLENCE.
              </h3>
              <p className="text-xl font-light leading-relaxed mb-10 text-white/90">
                In a crowded city like Bangalore, standing out requires more than just a bright light.
                It requires structural integrity, flawless design, and reliable execution.
              </p>
              <div className="grid sm:grid-cols-2 gap-6">
                {displayReasons.map((reason: string, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5" />
                    <span className="font-bold text-lg">{reason}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {["/images/glow/6.webp", "/images/wall/5.webp", "/images/led/3.webp", "/images/square/resto-square.webp"].map((src, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden">
                  <img 
                    src={src} 
                    alt={`Primesign quality work sample ${i + 1}`} 
                    loading="lazy"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS SECTION ============ */}
      <section id="testimonials" className="py-24 bg-card overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm text-primary font-bold tracking-widest uppercase mb-4">Client Feedback</h2>
            <h3 className="text-4xl md:text-5xl font-display font-bold leading-tight mb-6">
              TRUSTED BY BANGALORE BUSINESSES
            </h3>
            <a 
              href="https://wa.me/916366525253?text=Hello%20PrimeSign%2C%20I%27d%20like%20to%20submit%20a%20review%20for%20your%20services." 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
            >
              <Star className="w-4 h-4" />
              Add Your Review
            </a>
          </div>

          {/* Carousel Container */}
          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={testimonialIndex}
                  initial={{ opacity: prefersReducedMotion ? 1 : 0, x: prefersReducedMotion ? 0 : 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: prefersReducedMotion ? 0.01 : 0.4 }}
                  className="bg-background p-8 md:p-12 rounded-3xl border border-white/5 relative text-center"
                >
                  <div className="text-primary text-8xl font-serif leading-none absolute top-4 left-8 opacity-10">"</div>
                  
                  {displayTestimonials[testimonialIndex]?.avatar && (
                    <img 
                      src={displayTestimonials[testimonialIndex].avatar} 
                      alt={displayTestimonials[testimonialIndex]?.name || "Client"}
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-6 border-4 border-primary/20"
                    />
                  )}
                  
                  <div className="flex justify-center gap-1 mb-6">
                    {Array.from({ length: displayTestimonials[testimonialIndex]?.rating || 5 }).map((_, s) => (
                      <Star key={s} className="w-5 h-5 fill-primary text-primary" />
                    ))}
                  </div>
                  
                  <p className="text-xl md:text-2xl text-foreground/90 font-light leading-relaxed mb-8 max-w-2xl mx-auto relative z-10">
                    {displayTestimonials[testimonialIndex]?.text}
                  </p>
                  
                  <div>
                    <div className="font-bold text-foreground font-display uppercase tracking-wider text-lg">
                      {displayTestimonials[testimonialIndex]?.name || displayTestimonials[testimonialIndex]?.author}
                    </div>
                    <div className="text-primary/80">{displayTestimonials[testimonialIndex]?.role}</div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {displayTestimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setTestimonialIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === testimonialIndex
                      ? "bg-primary w-8"
                      : "bg-primary/30 hover:bg-primary/50"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={() => setTestimonialIndex((prev) => (prev - 1 + displayTestimonials.length) % displayTestimonials.length)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-16 w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setTestimonialIndex((prev) => (prev + 1) % displayTestimonials.length)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-16 w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* ============ CONTACT SECTION ============ */}
      <ContactSection prefersReducedMotion={prefersReducedMotion} />

      {/* ============ CTA SECTION ============ */}
      <section className="py-24 relative overflow-hidden" id="cta">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: prefersReducedMotion ? 0.01 : 0.6 }}
            >
              <h2 className="text-sm text-primary font-bold tracking-widest uppercase mb-4">Ready to Get Started?</h2>
              <h3 className="text-4xl md:text-6xl font-display font-bold leading-tight mb-6">
                LET'S BUILD<br />SOMETHING ICONIC.
              </h3>
              <p className="text-xl text-muted-foreground font-light mb-10 max-w-2xl mx-auto">
                From concept to installation, we handle every detail. Your brand deserves to be seen — let's make it unforgettable.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={openQuote}
                  className="h-14 px-8 rounded-full text-lg font-bold uppercase tracking-wide box-glow group"
                >
                  Get Your Free Quote
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <a 
                  href="https://wa.me/916366525253?text=Hello%20PrimeSign%2C%20I%27d%20like%20to%20discuss%20a%20project%20with%20you."
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 rounded-full text-lg font-bold uppercase tracking-wide border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10"
                  >
                    <WhatsAppIcon className="mr-2 w-5 h-5" />
                    WhatsApp Us
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <ImageLightbox
        images={lightboxImages}
        isOpen={lightboxOpen}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
      />

      {/* Service Detail Overlay */}
      <AnimatePresence>
        {selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm"
            onClick={() => setSelectedService(null)}
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedService.name} detail view`}
          >
            {/* Back button */}
            <div className="absolute top-4 left-4 z-20">
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedService(null); }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white text-sm font-bold uppercase tracking-wider"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Arsenal
              </button>
            </div>

            {/* Close button */}
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedService(null); }}
              className="absolute top-4 right-4 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Close detail view"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Service info */}
            <div className="text-center pt-20 pb-4 px-4 z-10">
              <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
                {selectedService.name}
              </h3>
              <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto mb-2">
                {selectedService.desc}
              </p>
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
                {selectedService.images.length} Image{selectedService.images.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Image gallery */}
            <div className="flex-1 relative flex items-center justify-center px-4 pb-4">
              {/* Counter */}
              <div className="absolute top-4 right-4 md:right-8 z-10 px-4 py-2 rounded-full bg-black/60 text-white text-sm font-medium">
                {selectedServiceImageIndex + 1} / {selectedService.images.length}
              </div>

              {/* Prev arrow */}
              {selectedService.images.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedServiceImageIndex(prev => (prev - 1 + selectedService.images.length) % selectedService.images.length); }}
                  className="absolute left-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
              )}

              {/* Main image */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedServiceImageIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="relative max-w-[90vw] max-h-[60vh] flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={selectedService.images[selectedServiceImageIndex]}
                    alt={`${selectedService.name} - Image ${selectedServiceImageIndex + 1}`}
                    className="max-w-full max-h-[60vh] object-contain rounded-lg"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Next arrow */}
              {selectedService.images.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedServiceImageIndex(prev => (prev + 1) % selectedService.images.length); }}
                  className="absolute right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              )}

              {/* Thumbnail strip */}
              {selectedService.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 max-w-[80vw] overflow-x-auto px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm">
                  {selectedService.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => { e.stopPropagation(); setSelectedServiceImageIndex(idx); }}
                      className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                        idx === selectedServiceImageIndex
                          ? 'border-primary ring-2 ring-primary/50'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                      aria-label={`Go to image ${idx + 1}`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
