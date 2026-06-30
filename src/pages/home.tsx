import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link } from "wouter";
import { SiWhatsapp } from "react-icons/si";
import { ArrowRight, ChevronLeft, ChevronRight, X, PhoneCall, Star, MapPin, Mail, Clock, Upload, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQuoteModal } from "@/context/QuoteModalContext";
import { PortfolioImage } from "@/components/ui/image-with-skeleton";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { ImageLightbox } from "@/components/ImageLightbox";
import { useSiteConfig } from "@/hooks/use-site-config";
import {
  getServicesByCategory,
  imageUrl
} from "@/lib/site-config";

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
  description?: string;
  badge?: string;
  heroImage?: ServiceImage | string;
  galleryImages?: ServiceImage[] | string[];
  images?: ServiceImage[] | string[];
  categoryId?: string;
  category?: string;
}

interface PortfolioConfig {
  id: number;
  url: string;
  label?: string;
  category: string;
  featured?: boolean;
}

interface ServiceCategoryItem {
  id?: string;
  name: string;
  desc: string;
  img: string;
  images?: string[];
  badge?: string;
  categoryId?: string;
}

interface ServiceCategory {
  id: string;
  label?: string;
  title: string;
  description?: string;
  icon?: string;
  items: ServiceCategoryItem[];
}



// Cache-busting helper: append timestamp to any URL
const cacheBustUrl = (url: string | null | undefined): string => {
  if (!url || typeof url !== 'string') return '/images/led/1.webp';
  return url + (url.includes('?') ? '&' : '?') + 't=' + Date.now();
};

const HERO_SLIDES = [
  "/images/portfolio/01.webp",
  "/images/portfolio/03.webp",
  "/images/portfolio/04.webp",
  "/images/portfolio/05.webp",
  "/images/portfolio/06.webp",
];

// ============ SERVICES CATEGORIES ============
// Built dynamically from the shared site config, with static demo content as a last resort.

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
    images: ["/images/services/sign-boards/pvc-ss-1.png", "/images/services/sign-boards/pvc-ss-2.png", "/images/services/sign-boards/pvc-ss-3.png", "/images/services/sign-boards/hoardings-3.png", "/images/services/sign-boards/hoardings-4.png"],
    tag: null,
    category: "pvc",
  },
  {
    title: "PVC/SS Letter Sign",
    desc: "Durable PVC and stainless steel lettering solutions for long-lasting signage.",
    images: ["/images/services/sign-boards/pvc-ss-4.png", "/images/services/sign-boards/pvc-ss-5.png", "/images/services/sign-boards/pvc-ss-6.png", "/images/services/sign-boards/pvc-ss-7.png", "/images/services/sign-boards/pvc-ss-8.png"],
    tag: null,
    category: "pvc-ss-letter",
  },
  {
    title: "Non-Light Sign Board",
    desc: "Elegant non-illuminated signage boards for professional storefront branding and daytime visibility.",
    images: ["/images/services/sign-boards/nonlight-1.png", "/images/services/sign-boards/nonlight-2.png", "/images/services/sign-boards/nonlight-3.png"],
    tag: null,
    category: "non-light-sign-board",
  },
  {
    title: "Hoardings",
    desc: "Large-format outdoor hoarding installations for maximum brand exposure.",
    images: ["/images/services/sign-boards/hoardings-1.png", "/images/services/sign-boards/hoardings-2.png", "/images/services/sign-boards/hoardings-3.png", "/images/services/sign-boards/hoardings-4.png", "/images/services/sign-boards/hoardings-5.png", "/images/services/sign-boards/hoardings-6.png"],
    tag: null,
    category: "hoardings",
  },
  {
    title: "One Way Vision",
    desc: "Perforated vinyl graphics for see-through window and vehicle branding.",
    images: ["/images/services/sign-boards/house-1.png", "/images/services/sign-boards/house-2.png", "/images/services/sign-boards/house-3.png", "/images/services/sign-boards/house-4.png", "/images/services/sign-boards/house-5.png"],
    tag: null,
    category: "one-way-vision",
  },
  {
    title: "Promotional Tents",
    desc: "Branded promotional tents and canopies for events and outdoor activations.",
    images: ["/images/services/promotional/tent-1.png", "/images/services/promotional/tent-2.png", "/images/services/promotional/tent-3.png", "/images/services/promotional/tent-4.png"],
    tag: null,
    category: "promo-tents",
  },
  {
    title: "Roll Up Standees",
    desc: "Portable retractable banner stands for trade shows and retail displays.",
    images: ["/images/services/promotional/rollup-1.png", "/images/services/promotional/rollup-2.png", "/images/services/promotional/rollup-3.png"],
    tag: null,
    category: "roll-up-standees",
  },
  {
    title: "Posters",
    desc: "Vibrant high-resolution poster printing for indoor and outdoor advertising.",
    images: ["/images/square/1.webp", "/images/square/2.webp", "/images/square/3.webp", "/images/square/4.webp", "/images/square/5.webp"],
    tag: null,
    category: "posters",
  },
  {
    title: "Visiting Cards",
    desc: "Premium business card printing with various finishes and stock options.",
    images: ["/images/square/brass.webp", "/images/square/6.webp", "/images/square/7.webp", "/images/square/8.webp"],
    tag: null,
    category: "visiting-cards",
  },
  {
    title: "ID Cards",
    desc: "Custom employee ID cards and access badge printing solutions.",
    images: ["/images/portfolio/01.webp", "/images/portfolio/03.webp", "/images/portfolio/04.webp", "/images/portfolio/05.webp"],
    tag: null,
    category: "id-cards",
  },
  {
    title: "T-Shirts",
    desc: "Custom t-shirt printing for corporate uniforms, events, and merchandise.",
    images: ["/images/portfolio/06.webp", "/images/portfolio/07.webp", "/images/portfolio/3.webp", "/images/portfolio/4.webp"],
    tag: null,
    category: "t-shirts",
  },
  {
    title: "Quick Printing",
    desc: "Fast turnaround digital printing services for urgent business needs.",
    images: ["/images/portfolio/005.webp", "/images/portfolio/006.webp", "/images/portfolio/007.webp", "/images/portfolio/008.webp"],
    tag: null,
    category: "quick-printing",
  },
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

// Testimonials are read from shared site config inside the Home component.
function getDynamicTestimonials(): Testimonial[] | null {
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
  if (name.includes("led")) return cacheBustUrl("/images/led/1.webp");
  if (name.includes("non-light") || name.includes("nonlight")) return cacheBustUrl("/images/services/sign-boards/nonlight-1.png");
  if (name.includes("hoarding")) return cacheBustUrl("/images/services/sign-boards/hoardings-1.png");
  if (name.includes("one way") || name.includes("one-way") || name.includes("oneway")) return cacheBustUrl("/images/services/sign-boards/house-1.png");
  if (name.includes("gloss")) return cacheBustUrl("/images/led/1.webp");
  if (name.includes("glow")) return cacheBustUrl("/images/glow/1.webp");
  if (name.includes("acrylic")) return cacheBustUrl("/images/services/sign-boards/acrylic-1.png");
  if (name.includes("wall")) return cacheBustUrl("/images/services/sign-boards/wall-1.jpg");
  if (name.includes("vehicle")) return cacheBustUrl("/images/services/sign-boards/vehicle-1.jpg");
  if (name.includes("pvc") || name.includes("flex")) return cacheBustUrl("/images/services/sign-boards/pvc-ss-1.png");
  if (name.includes("promotional") || name.includes("tent")) return cacheBustUrl("/images/services/promotional/tent-1.png");
  if (name.includes("poster")) return cacheBustUrl("/images/square/1.webp");
  if (name.includes("visiting")) return cacheBustUrl("/images/square/brass.webp");
  if (name.includes("id")) return cacheBustUrl("/images/portfolio/01.webp");
  if (name.includes("t-shirt") || name.includes("tshirt")) return cacheBustUrl("/images/portfolio/06.webp");
  if (name.includes("quick")) return cacheBustUrl("/images/portfolio/005.webp");
  if (name.includes("roll-up") || name.includes("rollup") || name.includes("roll up")) return cacheBustUrl("/images/services/promotional/rollup-1.png");
  return cacheBustUrl("/images/led/1.webp");
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

// Category display names and descriptions
const CATEGORY_DETAILS: Record<string, { title: string; description: string }> = {
  "sign-boards": { title: "SIGN BOARDS", description: "Premium signage solutions including LED, glow, acrylic, wall branding, vehicle wraps, hoardings & more" },
  "promotional": { title: "PROMOTIONAL DISPLAY", description: "Eye-catching display solutions for events & marketing" },
  "digital": { title: "DIGITAL PRINTS", description: "High-quality digital printing services" },
};

// Build service categories from a fallback services array when no shared config is available.
function buildServiceCategoriesFromServices(services: ServiceConfig[]): ServiceCategory[] {
  const grouped = new Map<string, { id: string; title: string; description: string; icon: string; items: any[] }>();
  services.forEach(s => {
    const cat = s.categoryId || s.category || "General";
    if (!grouped.has(cat)) {
      const details = CATEGORY_DETAILS[cat] || { title: cat.toUpperCase(), description: "Professional " + cat + " services" };
      grouped.set(cat, { id: cat, title: details.title, description: details.description, icon: "sign", items: [] });
    }
    const heroImg = extractImageUrl(s.heroImage as any);
    const galleryImages = (s.galleryImages?.length ? s.galleryImages : s.images || [])
      .map((img: ServiceImage | string) => cacheBustUrl(extractImageUrl(img)))
      .filter(Boolean);
    const thumbnail = cacheBustUrl(heroImg || galleryImages[0] || getServiceImage(s.name));
    grouped.get(cat)!.items.push({
      name: s.name,
      desc: s.description || s.desc || "",
      img: thumbnail,
      images: [thumbnail, ...galleryImages].filter((src, idx, arr) => src && arr.indexOf(src) === idx),
      badge: s.badge === "popular" ? "Most Popular" : s.badge === "new" ? "New" : s.badge || undefined,
      categoryId: cat,
    });
  });
  const order = ["sign-boards", "promotional", "digital"];
  return [
    ...order.filter(catId => grouped.has(catId)).map(catId => grouped.get(catId)!),
    ...Array.from(grouped.entries()).filter(([catId]) => !order.includes(catId)).map(([, val]) => val),
  ];
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
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center hover:opacity-100 focus:opacity-100 transition-opacity duration-200 hover:bg-black/80 z-10"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center hover:opacity-100 focus:opacity-100 transition-opacity duration-200 hover:bg-black/80 z-10"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6 sm:w-5 sm:h-5" />
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
  
  const clients: { name: string; src: string }[] = [
    { name: "Client 1", src: "/images/clients/1.webp" },
    { name: "Client 2", src: "/images/clients/2.webp" },
    { name: "Client 3", src: "/images/clients/3.webp" },
    { name: "Client 4", src: "/images/clients/4.webp" },
    { name: "Client 5", src: "/images/clients/5.webp" },
    { name: "Client 6", src: "/images/clients/6.webp" },
    { name: "Client 7", src: "/images/clients/7.webp" },
    { name: "Client 8", src: "/images/clients/8.webp" },
    { name: "Client 9", src: "/images/clients/9.webp" },
    { name: "Client 10", src: "/images/clients/10.webp" },
  ];
  const hasRealClients = clients.some(c => c.src);
  
  // Double the logos for seamless loop
  const displayClients = hasRealClients ? [...clients, ...clients] : [];

  useEffect(() => {
    if (!hasRealClients || prefersReducedMotion || isPaused) return;
    
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
  }, [isPaused, prefersReducedMotion, hasRealClients]);

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
        {displayClients.map((client, i) => (
          <div 
            key={i}
            className="flex-shrink-0 w-32 h-16 flex items-center justify-center"
          >
            <img
              src={client.src}
              alt={`Client ${(i % Math.max(clients.length, 1)) + 1}`}
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
function ContactSection({ prefersReducedMotion, adminConfig }: { prefersReducedMotion: boolean; adminConfig?: any }) {
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

    const waNumber = (adminConfig?.contact?.phones?.[0] || "6366525253").replace(/[^\d]/g, '');
    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(lines)}`;
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
            {adminConfig?.settings?.helpText || "Ready to transform your brand visibility? Let's discuss your project."}
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
                    placeholder="you@example.com (optional)"
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
                    href={`https://wa.me/${(adminConfig?.contact?.phones?.[0] || "6366525253").replace(/[^\d]/g, '')}?text=${encodeURIComponent(adminConfig?.settings?.whatsappMessage || "Hello PrimeSign, I'd like to know more about your services.")}`}
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
                      <SiWhatsapp className="w-5 h-5 mr-2" />
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
                  {adminConfig?.contact?.address
                    ? adminConfig.contact.address.split('\n').map((line: string, i: number) => <span key={i}>{i > 0 && <br />}{line}</span>)
                    : <>PrimeSign Private Limited<br />Bangalore, Karnataka<br />India</>}
                </p>
              </div>
              <div className="bg-background/50 backdrop-blur-sm p-6 rounded-xl border border-white/5 hover:border-primary/30 transition-colors">
                <PhoneCall className="w-8 h-8 text-primary mb-4" />
                <h4 className="font-bold text-lg mb-2">Call Us</h4>
                <p className="text-muted-foreground text-sm">
                  <a href={`tel:+91${(adminConfig?.contact?.phones?.[0] || adminConfig?.settings?.whatsappNumber || "6366525253").replace(/[^\d]/g, '').slice(-10)}`} className="hover:text-primary transition-colors">
                    {adminConfig?.contact?.phones?.[0] || "6366525253"}
                  </a>
                </p>
              </div>
              <div className="bg-background/50 backdrop-blur-sm p-6 rounded-xl border border-white/5 hover:border-primary/30 transition-colors">
                <Mail className="w-8 h-8 text-primary mb-4" />
                <h4 className="font-bold text-lg mb-2">Email Us</h4>
                <p className="text-muted-foreground text-sm">
                  <a href={`mailto:${adminConfig?.contact?.emails?.[0] || "hello@primesign.in"}`} className="hover:text-primary transition-colors">
                    {adminConfig?.contact?.emails?.[0] || "hello@primesign.in"}
                  </a>
                </p>
              </div>
              <div className="bg-background/50 backdrop-blur-sm p-6 rounded-xl border border-white/5 hover:border-primary/30 transition-colors">
                <Clock className="w-8 h-8 text-primary mb-4" />
                <h4 className="font-bold text-lg mb-2">Working Hours</h4>
                <p className="text-muted-foreground text-sm" dangerouslySetInnerHTML={{ __html: adminConfig?.settings?.workingHours || "Mon - Sat: 9:00 AM - 7:00 PM<br>Sunday: Closed" }} />
              </div>
            </div>

            {/* Google Maps Embed */}
            <div className="rounded-2xl overflow-hidden border border-white/10 h-64">
              <iframe
                src={adminConfig?.settings?.mapsUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d248849.8865401047!2d77.46612999155236!3d12.953945337580189!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4a3e!2sBangalore%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1703123456789!5m2!1sen!2sin"}
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
  const { data: siteConfigData } = useSiteConfig();
  const [heroIndex, setHeroIndex] = useState(0);
  const [portfolioFilter] = useState<string | null>(null);
  const [activeServiceCategory, setActiveServiceCategory] = useState<string>(() => {
    const stored = sessionStorage.getItem("arsenal-category");
    if (stored) { sessionStorage.removeItem("arsenal-category"); return stored; }
    return "sign-boards";
  });
  // Single source of truth: use normalized config
  const siteConfig = siteConfigData ?? null;
  const adminConfig = siteConfig as ({ portfolio?: PortfolioConfig[]; hero?: any; testimonials?: Testimonial[]; services?: ServiceConfig[]; contact?: any; settings?: any; aboutImages?: any[]; advantageImages?: any[]; advantage?: any; colorScheme?: any; serviceCategories?: any[]; about?: any; footer?: any; navbar?: any } | null);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  // Listen for navbar dropdown category changes + specific service scroll
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setActiveServiceCategory(e.detail);
      sessionStorage.setItem("arsenal-category", e.detail);
      document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
    };
    const svcHandler = (e: CustomEvent) => {
      setActiveServiceCategory(e.detail.category);
      sessionStorage.setItem("arsenal-category", e.detail.category);
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

  const serviceCategories = useMemo<ServiceCategory[]>(() => {
    if (siteConfig?.serviceCategories?.length) {
      return getServicesByCategory(siteConfig)
        .map(({ category, services }) => ({
          id: category.id,
          label: category.label,
          title: category.label,
          description: category.description,
          icon: category.icon,
          items: services.map((service) => {
            const galleryImages = service.galleryImages.map((img) => imageUrl(img)).filter(Boolean);
            const hero = imageUrl(service.heroImage, galleryImages[0] || "/images/led/1.webp");
            const detailImages = [hero, ...galleryImages].filter((src, idx, arr) => src && arr.indexOf(src) === idx);

            return {
              id: service.id,
              name: service.name,
              desc: service.description,
              img: hero,
              images: detailImages.length > 0 ? detailImages : [hero],
              badge: service.badge === "popular"
                ? "Most Popular"
                : service.badge === "new"
                  ? "New"
                  : service.badge || undefined,
              categoryId: service.categoryId,
            };
          }),
        }));
    }

    return buildServiceCategoriesFromServices(services.map((service, index) => ({
      id: index + 1,
      name: service.title,
      desc: service.desc,
      badge: service.tag === "Most Popular" ? "popular" : "",
      galleryImages: service.images,
      categoryId: service.category,
    })));
  }, [siteConfig]);

  const displayServices = useMemo(() => {
    return serviceCategories.flatMap((category) => category.items.map((service) => ({
      ...service,
      title: service.name,
      category: service.categoryId || category.id,
    })));
  }, [serviceCategories]);

  useEffect(() => {
    if (serviceCategories.length > 0 && !serviceCategories.some((category) => category.id === activeServiceCategory)) {
      setActiveServiceCategory(serviceCategories[0].id);
    }
  }, [serviceCategories, activeServiceCategory]);

  const heroBgImage = imageUrl(siteConfig?.hero?.backgroundImage, adminConfig?.hero?.bgImage || "/images/portfolio/01.webp");
  const heroBadgeText = siteConfig?.hero?.badge || adminConfig?.hero?.badge || "Bangalore's Premier Signage Studio";
  const heroHeadline = siteConfig?.hero?.headline || adminConfig?.hero?.headline || "WE BUILD <br>UNFORGETTABLE<br>VISIBILITY.";
  const heroSubtitle = siteConfig?.hero?.subtitle || adminConfig?.hero?.subtitle || "From bold LED boards to precision 3D channel letters. We engineer high-impact signage that lights up Bangalore and makes your brand impossible to ignore.";

  // Get testimonials from config or fallback
  const dynamicTestimonials = getDynamicTestimonials();
  const siteTestimonials = Array.isArray((siteConfig as any)?.testimonials)
    ? (siteConfig as any).testimonials.map((t: Testimonial) => ({
        ...t,
        avatar: t.avatar || "",
        name: t.name || t.author || "Client",
      }))
    : null;
  const displayTestimonials = siteTestimonials || dynamicTestimonials || adminConfig?.testimonials || testimonials;

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % displayTestimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [displayTestimonials.length]);

  const allPortfolioItems = useMemo(() => {
    const allPortfolioItems: { img: string; label: string; cat: string; featured: boolean }[] = [];

    if (siteConfig?.portfolio?.length) {
      siteConfig.portfolio.forEach((item: any) => {
        const img = imageUrl(item.image || item.url);
        if (!img) return;
        allPortfolioItems.push({
          img,
          label: item.label || "Installation",
          cat: item.categoryId || item.category || "portfolio",
          featured: item.featured || false,
        });
      });
    }

    if (siteConfig?.services?.length) {
      siteConfig.services.forEach((service: any, serviceIdx: number) => {
        service.portfolioImages.forEach((img: any, imgIdx: number) => {
          const imgUrl = imageUrl(img);
          if (!imgUrl) return;
            allPortfolioItems.push({
              img: imgUrl,
              label: img.label || `${service.name || service.title} - Portfolio`,
              cat: service.categoryId || service.category || "portfolio",
              featured: serviceIdx === 0 && imgIdx === 0 && allPortfolioItems.length === 0,
            });
        });
      });
    }

    if (allPortfolioItems.length > 0) {
      return allPortfolioItems;
    }

    if (displayServices && displayServices.length > 0) {
      const serviceGalleryItems: { img: string; label: string; cat: string; featured: boolean }[] = [];
      
      displayServices.forEach((service: any, serviceIdx: number) => {
        const serviceImages = service.images || [];
        const category = service.categoryId || service.category || getCategoryFromServiceName(service.title);
        
        serviceImages.forEach((img: any, imgIdx: number) => {
          const imgUrl = extractImageUrl(img);
          if (imgUrl) {
            serviceGalleryItems.push({
              img: imgUrl,
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

    return [
      { img: "/images/portfolio/01.webp", label: "Storefront LED Branding", cat: "led", featured: true },
      { img: "/images/glow/4.webp", label: "Glow Sign", cat: "glow", featured: false },
      { img: "/images/square/brass.webp", label: "LED Channel", cat: "led", featured: false },
      { img: "/images/vehicle/3.webp", label: "Vehicle Wrap", cat: "vehicle", featured: false },
      { img: "/images/wall/4.webp", label: "Wall Branding", cat: "wall", featured: false },
      { img: "/images/portfolio/03.webp", label: "Retail Signage", cat: "led", featured: false },
      { img: "/images/acrylic/2.webp", label: "Acrylic Letters", cat: "acrylic", featured: false },
      { img: "/images/glow/5.webp", label: "Neon Glow", cat: "glow", featured: false },
      { img: "/images/portfolio/04.webp", label: "Corporate Lobby", cat: "acrylic", featured: false },
    ];
  }, [siteConfig, displayServices]);
  
  const featuredItem = useMemo(() => {
    return allPortfolioItems.find(item => item.featured) || null;
  }, [allPortfolioItems]);
  
  const nonFeaturedItems = useMemo(() => {
    return allPortfolioItems.filter(item => !item.featured);
  }, [allPortfolioItems]);

  const aboutImages = (siteConfig?.about?.images?.length
    ? siteConfig.about.images.map((img) => imageUrl(img))
    : (adminConfig?.aboutImages || ["/images/glow/3.webp", "/images/wall/3.webp", "/images/led/2.webp", "/images/square/brass.webp"]).map((img: any) => (typeof img === 'string' ? img : img?.url || ""))
  ).slice(0, 4).filter(Boolean);

  const advantageGridImages = (siteConfig?.advantage?.gridImages?.length
    ? siteConfig.advantage.gridImages
    : adminConfig?.advantage?.gridImages?.length
      ? adminConfig.advantage.gridImages
      : [
          { url: "/images/led/2.webp", label: "LED signage detail" },
          { url: "/images/glow/1.webp", label: "Glow sign detail" },
          { url: "/images/wall/3.webp", label: "Wall branding detail" },
          { url: "/images/square/brass.webp", label: "Brass sign detail" },
        ]
  ).slice(0, 4).map((img: any, i: number) => ({
    src: imageUrl(img, ["/images/led/2.webp", "/images/glow/1.webp", "/images/wall/3.webp", "/images/square/brass.webp"][i]),
    label: img?.label || `Primesign advantage photo ${i + 1}`,
  }));

  const portfolioCategories = useMemo(() => {
    const categories: string[] = [];
    const seen = new Set<string>();
    displayServices.forEach((service: any) => {
      const category = service.categoryId || service.category;
      if (category && !seen.has(category.toLowerCase())) {
        seen.add(category.toLowerCase());
        categories.push(category.toLowerCase());
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

  const openServiceDetail = useCallback((item: ServiceCategoryItem) => {
    const images = item.images?.filter(Boolean) || (item.img ? [item.img] : ["/images/led/1.webp"]);
    setSelectedService({ name: item.name, desc: item.desc, images });
    setSelectedServiceImageIndex(0);
  }, []);

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
  const currentCategory = serviceCategories.length > 0
    ? (serviceCategories.find((c: ServiceCategory) => c.id === activeServiceCategory) || serviceCategories[0])
    : null;
  const currentServiceCount = currentCategory?.items?.length || 0;

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
                __html: heroHeadline.replace(/<br\s*\/?>/gi, '<br />')
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
                href={`https://wa.me/${(adminConfig?.contact?.phones?.[0] || "6366525253").replace(/[^\d]/g, '')}?text=${encodeURIComponent(adminConfig?.settings?.whatsappMessage || "Hello PrimeSign, I'd like to get a quote for signage services.")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 sm:h-14 px-6 sm:px-8 rounded-full text-sm sm:text-lg font-bold uppercase tracking-wide bg-white/5 border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10 w-full sm:w-auto"
                >
                  <SiWhatsapp className="w-5 h-5 mr-2" />
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
            {(adminConfig?.hero?.stats || [{ value: "500+", label: "Projects" }, { value: "5+", label: "Years" }, { value: "100%", label: "Satisfaction" }, { value: "Bangalore", label: "Based" }]).map((stat: any) => (
              <div key={stat.label}>
                <span className="text-primary font-display font-bold text-xl mr-1">{stat.value}</span>
                <span className="text-muted-foreground text-sm uppercase tracking-wider">{stat.label}</span>
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
              <h2 className="text-sm text-primary font-bold tracking-widest uppercase mb-4">
                {adminConfig?.about?.title || "About Primesign"}
              </h2>
              <h3 className="text-4xl md:text-5xl font-display font-bold leading-tight mb-6">
                {adminConfig?.about?.subtitle || "BORN IN BANGALORE.\nBUILT FOR IMPACT."}
              </h3>
              <p className="text-lg text-muted-foreground font-light leading-relaxed mb-6">
                {adminConfig?.about?.description || adminConfig?.settings?.aboutDescription || "Founded in 2021, Primesign Private Limited has rapidly become Bangalore's go-to studio for premium signage and architectural branding. We don't just print signs — we engineer visibility."}
              </p>
              <p className="text-lg text-muted-foreground font-light leading-relaxed mb-8">
                {adminConfig?.about?.description2 || "We don't just print signs — we engineer visibility. Our obsession with quality materials, cutting-edge lighting technology, and flawless execution ensures every installation makes a statement. When your brand needs to own the street, you call Primesign."}
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
            {serviceCategories.map((category: ServiceCategory) => (
              <button
                key={category.id}
                onClick={() => {
                  sessionStorage.setItem("arsenal-category", category.id);
                  setActiveServiceCategory(category.id);
                }}
                className={`px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                  activeServiceCategory === category.id
                    ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(240,168,48,0.3)]"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >{category.label}</button>
            ))}
          </div>

          {/* Active Category Description */}
          <div className="text-center mb-10">
            <p className="text-muted-foreground text-lg">
              {currentCategory?.description || `${currentServiceCount} service${currentServiceCount !== 1 ? 's' : ''} available in this category.`}
            </p>
          </div>

          {/* Services Grid */}
          <motion.div
            key={activeServiceCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {(currentCategory?.items || []).map((service: any, index: number) => {
              // Handle both old ServiceCategoryItem format and new Service format
              const serviceName = service.name || 'Service';
              const serviceDesc = service.description || service.desc || '';
              const serviceImages = service.images?.filter(Boolean) || [];
              const serviceImg = service.img || serviceImages[0] || (service.heroImage?.url) || (service.galleryImages?.[0]?.url) || '/images/led/1.webp';
              const detailImages = [serviceImg, ...serviceImages].filter((src, idx, arr) => src && arr.indexOf(src) === idx);
              const serviceBadge = service.badge === 'popular' ? 'MOST POPULAR' : service.badge === 'new' ? 'NEW' : service.badge;

              return (
              <motion.div
                key={service.id || serviceName + '-' + index}
                id={`svc-${serviceName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: prefersReducedMotion ? 0.01 : 0.5, delay: index * 0.05 }}
                className="group relative bg-card rounded-xl overflow-hidden border border-white/10 hover:border-primary/50 hover:shadow-[0_0_32px_rgba(240,168,48,0.14)] transition-all duration-500 cursor-pointer flex flex-col"
                onClick={() => {
                  openServiceDetail({ name: serviceName, desc: serviceDesc, img: serviceImg, images: detailImages });
                }}
              >
                {serviceBadge && (
                  <div className="absolute top-3 right-3 z-20 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    {serviceBadge}
                  </div>
                )}
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={serviceImg}
                    alt={serviceName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
                <div className="p-5 flex min-h-[190px] flex-col bg-card">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-primary/90">
                      {service.images?.length || 1} photo{(service.images?.length || 1) !== 1 ? 's' : ''}
                    </span>
                    {currentCategory?.title && (
                      <span className="truncate text-[11px] uppercase tracking-wider text-muted-foreground">
                        {currentCategory.title}
                      </span>
                    )}
                  </div>
                  <h4 className="text-lg font-display font-bold mb-1 group-hover:text-primary transition-colors">
                    {serviceName}
                  </h4>
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                    {serviceDesc}
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); openServiceDetail({ name: serviceName, desc: serviceDesc, img: serviceImg, images: detailImages }); }}
                    className="mt-auto pt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:text-primary/80 transition-colors"
                  >
                    View Gallery →
                  </button>
                </div>
              </motion.div>
            );
            })}
            {currentServiceCount === 0 && (
              <div className="col-span-full rounded-xl border border-white/10 bg-card/70 p-10 text-center">
                <p className="text-lg font-display font-bold text-white">No services added here yet.</p>
                <p className="mt-2 text-muted-foreground">Add services to this category from the admin panel and they will appear here automatically.</p>
              </div>
            )}
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
            <a href={adminConfig?.contact?.youtube || "https://www.youtube.com/@PrimesignBangalore"} target="_blank" rel="noopener noreferrer">
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
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(240,168,48,0.18),transparent_42%,rgba(255,255,255,0.08))]" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <h2 className="text-sm font-bold tracking-widest uppercase mb-4 text-white/80">The Primesign Advantage</h2>
              <h3 className="text-4xl md:text-6xl font-display font-bold leading-tight mb-6">
                ENGINEERED FOR EXCELLENCE.
              </h3>
              <p className="text-lg md:text-xl font-light leading-relaxed text-white/90">
                In a crowded city like Bangalore, standing out requires more than a bright light. It takes structural integrity, disciplined fabrication, and reliable execution from start to finish.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {advantageGridImages.map((image: any, i: number) => (
              <motion.div
                key={image.src || i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-background/45 shadow-[0_18px_50px_rgba(0,0,0,0.18)]"
              >
                <img
                  src={image.src}
                  alt={image.label}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  loading="lazy"
                />
              </motion.div>
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
              href={`https://wa.me/${(adminConfig?.contact?.phones?.[0] || "6366525253").replace(/[^\d]/g, '')}?text=Hello%20PrimeSign%2C%20I%27d%20like%20to%20submit%20a%20review%20for%20your%20services.`}
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
            >
              <Star className="w-4 h-4" />
              Add Your Review
            </a>
          </div>

          {/* Carousel Container */}
          {Array.isArray(displayTestimonials) && displayTestimonials.length > 0 ? (
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
              className="testimonial-arrow absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-16 w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setTestimonialIndex((prev) => (prev + 1) % displayTestimonials.length)}
              className="testimonial-arrow absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-16 w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        ) : null}
        </div>
      </section>

      {/* ============ CONTACT SECTION ============ */}
      <ContactSection prefersReducedMotion={prefersReducedMotion} adminConfig={adminConfig} />

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
                  href={`https://wa.me/${(adminConfig?.contact?.phones?.[0] || "6366525253").replace(/[^\d]/g, '')}?text=${encodeURIComponent(adminConfig?.settings?.whatsappMessage || "Hello PrimeSign, I'd like to discuss a project with you.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 rounded-full text-lg font-bold uppercase tracking-wide border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10"
                  >
                    <SiWhatsapp className="mr-2 w-5 h-5" />
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
            key="service-detail-overlay"
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
