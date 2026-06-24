import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, ChevronRight, PhoneCall, Star, X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuoteModal } from "@/context/QuoteModalContext";
import { PortfolioImage } from "@/components/ui/image-with-skeleton";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { ImageLightbox } from "@/components/ImageLightbox";

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

// Helper function to read admin config from localStorage
function getAdminConfig(): { portfolio?: any[]; hero?: any; services?: any[]; testimonials?: Testimonial[] } | null {
  try {
    const stored = localStorage.getItem("primesign-config");
    if (stored) {
      const config = JSON.parse(stored);
      return {
        portfolio: config.portfolio,
        hero: config.hero,
        services: config.services,
        testimonials: config.testimonials,
      };
    }
  } catch (e) {
    console.error("Error reading primesign-config from localStorage:", e);
  }
  return null;
}

const BASE = "https://raw.githubusercontent.com/runloai/PrimeSign/main/data";

const HERO_SLIDES = [
  `${BASE}/portfolio/01.webp`,
  `${BASE}/portfolio/03.webp`,
  `${BASE}/portfolio/04.webp`,
  `${BASE}/portfolio/05.webp`,
  `${BASE}/portfolio/06.webp`,
];

const IMAGES = {
  hero: `${BASE}/portfolio/01.webp`,
  // Glow / illuminated signs
  glow: Array.from({ length: 10 }, (_, i) => `${BASE}/glow/${i + 1}.webp`),
  // LED signs
  led: Array.from({ length: 5 }, (_, i) => `${BASE}/led/${i + 1}.webp`),
  // Acrylic signs
  acrylic: Array.from({ length: 4 }, (_, i) => `${BASE}/acrylic/${i + 1}.webp`),
  // Vehicle wraps
  vehicle: Array.from({ length: 11 }, (_, i) => `${BASE}/vehicle/${i + 1}.webp`),
  // Wall signage
  wall: Array.from({ length: 11 }, (_, i) => `${BASE}/wall/${i + 1}.webp`),
  // Square format shots
  square: [
    `${BASE}/square/1.webp`,
    `${BASE}/square/2.webp`,
    `${BASE}/square/3.webp`,
    `${BASE}/square/4.webp`,
    `${BASE}/square/5.webp`,
    `${BASE}/square/6.webp`,
    `${BASE}/square/7.webp`,
    `${BASE}/square/8.webp`,
    `${BASE}/square/brass.webp`,
    `${BASE}/square/bus.webp`,
    `${BASE}/square/ledsign.webp`,
    `${BASE}/square/resort-square.webp`,
    `${BASE}/square/resto-square.webp`,
    `${BASE}/square/spa-square.webp`,
  ],
  // PVC
  pvc: `${BASE}/pvc/1.webp`,
  // Portfolio
  portfolio: [
    `${BASE}/portfolio/01.webp`,
    `${BASE}/portfolio/03.webp`,
    `${BASE}/portfolio/04.webp`,
    `${BASE}/portfolio/05.webp`,
    `${BASE}/portfolio/06.webp`,
    `${BASE}/portfolio/07.webp`,
    `${BASE}/portfolio/003.webp`,
    `${BASE}/portfolio/004.webp`,
    `${BASE}/portfolio/005.webp`,
    `${BASE}/portfolio/006.webp`,
    `${BASE}/portfolio/007.webp`,
    `${BASE}/portfolio/008.webp`,
    `${BASE}/portfolio/009.webp`,
    `${BASE}/portfolio/010.webp`,
    `${BASE}/portfolio/011.webp`,
    `${BASE}/portfolio/012.webp`,
    `${BASE}/portfolio/013.webp`,
    `${BASE}/portfolio/3.webp`,
    `${BASE}/portfolio/4.webp`,
    `${BASE}/portfolio/7.webp`,
  ],
  // Client logos
  clients: Array.from({ length: 10 }, (_, i) => `${BASE}/clients/${i + 1}.webp`),
};

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
      staggerChildren: prefersReducedMotion ? 0 : 0.2 
    }
  }),
};

const services = [
  {
    title: "LED Signs",
    desc: "Ultra-bright, energy-efficient LED boards engineered for maximum daylight visibility.",
    img: IMAGES.led[0],
    tag: "Most Popular",
    category: "led",
  },
  {
    title: "Glow Signs",
    desc: "Illuminated channel-letter installations that blaze through the Bangalore night.",
    img: IMAGES.glow[0],
    tag: null,
    category: "glow",
  },
  {
    title: "Acrylic Signs",
    desc: "Precision-routed acrylic lettering — crisp, clean, and unmistakably premium.",
    img: IMAGES.acrylic[0],
    tag: null,
    category: "acrylic",
  },
  {
    title: "Wall Branding",
    desc: "Large-format wall murals and architectural graphics for offices and retail.",
    img: IMAGES.wall[0],
    tag: null,
    category: "wall",
  },
  {
    title: "Vehicle Wraps",
    desc: "Turn your entire fleet into high-impact moving billboards across the city.",
    img: IMAGES.vehicle[0],
    tag: null,
    category: "vehicle",
  },
  {
    title: "PVC & Flex",
    desc: "Durable outdoor flex printing for hoardings, banners, and retail displays.",
    img: IMAGES.pvc,
    tag: null,
    category: "pvc",
  },
];

const portfolioGrid = [
  { img: IMAGES.portfolio[0], label: "LED Storefront", span: "col-span-2 row-span-2" },
  { img: IMAGES.glow[1], label: "Glow Channel Letters", span: "" },
  { img: IMAGES.square[0], label: "Corporate Lobby Sign", span: "" },
  { img: IMAGES.vehicle[1], label: "Fleet Wrap", span: "" },
  { img: IMAGES.portfolio[2], label: "Retail Branding", span: "" },
  { img: IMAGES.wall[1], label: "Office Wall Mural", span: "" },
  { img: IMAGES.acrylic[1], label: "Acrylic Letters", span: "" },
  { img: IMAGES.portfolio[6], label: "Restaurant Signage", span: "" },
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

// Helper to get dynamic testimonials from localStorage
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
    console.error("Error loading testimonials:", e);
  }
  return null;
}

// Helper to get dynamic services from localStorage
function getDynamicServices(): any[] | null {
  try {
    const stored = localStorage.getItem("primesign-config");
    if (stored) {
      const config = JSON.parse(stored);
      if (config.services && config.services.length > 0) {
        // Map admin service format to main site format
        return config.services
          .filter((s: any) => s.name) // Only include services with names
          .map((s: any) => ({
            title: s.name,
            desc: s.desc || "",
            // Get first image from images array, or fallback to category-based image
            img: s.images && s.images.length > 0 
              ? (typeof s.images[0] === 'string' ? s.images[0] : s.images[0]?.url || IMAGES.led[0])
              : getServiceImage(s.name),
            tag: s.badge === "popular" ? "Most Popular" : s.badge === "new" ? "New" : null,
            category: s.name.toLowerCase().includes("led") ? "led" 
                    : s.name.toLowerCase().includes("glow") ? "glow"
                    : s.name.toLowerCase().includes("acrylic") ? "acrylic"
                    : s.name.toLowerCase().includes("wall") ? "wall"
                    : s.name.toLowerCase().includes("vehicle") ? "vehicle"
                    : s.name.toLowerCase().includes("pvc") || s.name.toLowerCase().includes("flex") ? "pvc"
                    : "led",
          }));
      }
    }
  } catch (e) {
    console.error("Error loading services:", e);
  }
  return null;
}

// Helper to get fallback image for service category
function getServiceImage(serviceName: string): string {
  const name = serviceName.toLowerCase();
  if (name.includes("led")) return IMAGES.led[0];
  if (name.includes("glow")) return IMAGES.glow[0];
  if (name.includes("acrylic")) return IMAGES.acrylic[0];
  if (name.includes("wall")) return IMAGES.wall[0];
  if (name.includes("vehicle")) return IMAGES.vehicle[0];
  if (name.includes("pvc") || name.includes("flex")) return IMAGES.pvc;
  return IMAGES.led[0];
}

export default function Home() {
  const { open: openQuote } = useQuoteModal();
  const [heroIndex, setHeroIndex] = useState(0);
  const [portfolioFilter, setPortfolioFilter] = useState<string | null>(null);
  const [adminConfig, setAdminConfig] = useState<{ portfolio?: any[]; hero?: any; testimonials?: Testimonial[]; services?: any[]; aboutImages?: any[]; advantageImages?: any[] } | null>(null);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  // Load admin config from localStorage on mount
  useEffect(() => {
    const config = getAdminConfig();
    if (config) {
      setAdminConfig(config);
    }
  }, []);

  // Get services from config or fallback to hardcoded
  const dynamicServices = getDynamicServices();
  const displayServices = dynamicServices || adminConfig?.services || services;

  // Get hero data from config or fallback to hardcoded
  const heroBgImage = adminConfig?.hero?.bgImage || IMAGES.portfolio[0];
  const heroBadgeText = adminConfig?.hero?.badge || "Bangalore's Premier Signage Studio";
  const heroHeadline = adminConfig?.hero?.headline;
  const heroSubtitle = adminConfig?.hero?.subtitle || "From bold LED boards to precision 3D channel letters. We engineer high-impact signage that lights up Bangalore and makes your brand impossible to ignore.";

  // Get testimonials from config or fallback to hardcoded
  const dynamicTestimonials = getDynamicTestimonials();
  const displayTestimonials = dynamicTestimonials || adminConfig?.testimonials || testimonials;

  // Auto-rotate testimonials every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % displayTestimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [displayTestimonials.length]);
  const getPortfolioItems = () => {
    if (adminConfig?.portfolio && adminConfig.portfolio.length > 0) {
      // Convert config portfolio items to the format expected by the grid
      return adminConfig.portfolio
        .filter((item: any) => item.url)
        .map((item: any) => ({
          img: item.url,
          label: item.label || "Installation",
          cat: item.category || "led",
        }));
    }
    return null;
  };

  const dynamicPortfolioItems = getPortfolioItems();

  // Get about images from config or fallback to hardcoded
  const aboutImages = adminConfig?.aboutImages && adminConfig.aboutImages.length >= 4
    ? adminConfig.aboutImages.slice(0, 4).map((img: any) => img.url || img)
    : [IMAGES.glow[2], IMAGES.wall[2], IMAGES.led[1], IMAGES.square[10]];

  // Get advantage/reasons from config or fallback to hardcoded
  const displayReasons = adminConfig?.advantageImages && adminConfig.advantageImages.length >= 6
    ? adminConfig.advantageImages.slice(0, 6).map((img: any) => img.label || img.toString())
    : reasons;

  // Get advantage images (optional icons) from config
  const advantageImages = adminConfig?.advantageImages && adminConfig.advantageImages.length >= 6
    ? adminConfig.advantageImages.slice(0, 6).map((img: any) => img.url).filter(Boolean)
    : [];

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Build lightbox images array from all portfolio sources
  const getLightboxImages = useCallback(() => {
    const images: { src: string; alt: string; label: string }[] = [];
    
    // Add dynamic portfolio items if available
    if (dynamicPortfolioItems && dynamicPortfolioItems.length > 0) {
      dynamicPortfolioItems.forEach((item: any) => {
        images.push({ src: item.img, alt: item.label, label: item.label });
      });
    } else {
      // Add default portfolio grid images
      portfolioGrid.forEach((item) => {
        images.push({ src: item.img, alt: item.label, label: item.label });
      });
      // Add additional hardcoded portfolio images
      [
        { img: IMAGES.glow[3], label: "Glow Sign" },
        { img: IMAGES.square[10], label: "LED Channel" },
        { img: IMAGES.vehicle[2], label: "Vehicle Wrap" },
        { img: IMAGES.wall[3], label: "Wall Branding" },
        { img: IMAGES.portfolio[2], label: "Retail Signage" },
        { img: IMAGES.acrylic[1], label: "Acrylic Letters" },
        { img: IMAGES.glow[4], label: "Neon Glow" },
        { img: IMAGES.portfolio[5], label: "Corporate Lobby" },
      ].forEach((item) => {
        images.push({ src: item.img, alt: item.label, label: item.label });
      });
      // Add vehicle wraps
      IMAGES.vehicle.slice(3, 7).forEach((img, i) => {
        images.push({ src: img, alt: `Vehicle wrap ${i + 1}`, label: "Vehicle Wrap" });
      });
    }
    
    return images;
  }, [dynamicPortfolioItems]);

  const lightboxImages = getLightboxImages();

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  useEffect(() => {
    const items = document.querySelectorAll("[data-pf-cat]");
    items.forEach((item) => {
      const el = item as HTMLElement;
      if (portfolioFilter === null) {
        el.style.display = "";
      } else {
        const cat = el.getAttribute("data-pf-cat");
        el.style.display = cat === portfolioFilter ? "" : "none";
      }
    });
  }, [portfolioFilter]);

  return (
    <div className="w-full">
      {/* HERO */}
      <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden pt-20">
        {/* Full-bleed static background */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroBgImage}
            alt="Primesign signage"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Layered overlay — light enough to show the image, dark enough to read text */}
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto px-4 md:px-6 py-16 pb-28 md:py-32">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer(prefersReducedMotion)}
            className="max-w-4xl"
          >
            <motion.div
              variants={fadeInUp(prefersReducedMotion)}
              className="inline-block border border-primary/30 bg-primary/10 px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm"
            >
              <span className="text-primary font-bold text-sm tracking-wider uppercase">
                {heroBadgeText}
              </span>
            </motion.div>
            <motion.h1
              variants={fadeInUp(prefersReducedMotion)}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-bold leading-[1.1] mb-6 tracking-tight"
              dangerouslySetInnerHTML={{
                __html: heroHeadline
                  ? heroHeadline.replace(/<br\s*\/?>/gi, '<br />')
                  : "WE BUILD <br />UNFORGETTABLE<br />VISIBILITY."
              }}
            />
            <motion.p
              variants={fadeInUp(prefersReducedMotion)}
              className="text-base sm:text-xl md:text-2xl text-muted-foreground font-light max-w-2xl mb-10 leading-relaxed"
            >
              {heroSubtitle}
            </motion.p>
            <motion.div variants={fadeInUp(prefersReducedMotion)} className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={openQuote}
                className="h-12 sm:h-14 px-6 sm:px-8 rounded-full text-sm sm:text-lg font-bold uppercase tracking-wide box-glow w-full sm:w-auto group"
                data-testid="button-hero-whatsapp"
              >
                Get a Free Quote
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
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

        {/* Slide dots */}
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

      {/* ABOUT */}
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

      {/* SERVICES */}
      <section id="services" className="py-24 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-sm text-primary font-bold tracking-widest uppercase mb-4">Our Expertise</h2>
            <h3 className="text-4xl md:text-6xl font-display font-bold leading-tight">THE ARSENAL</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8" role="list" aria-label="Services">
            {displayServices.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: prefersReducedMotion ? 0.01 : 0.5, delay: index * 0.1 }}
                className="group relative bg-card rounded-2xl overflow-hidden border border-white/5 hover:border-primary/50 hover:shadow-[0_0_40px_rgba(240,168,48,0.15)] transition-all duration-500 ease-out focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background"
                data-testid={`card-service-${index}`}
                role="listitem"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setPortfolioFilter(service.category);
                    document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                {service.tag && (
                  <div className="absolute top-4 right-4 z-20 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full" aria-label={`Tag: ${service.tag}`}>
                    {service.tag}
                  </div>
                )}
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={service.img}
                    alt={`${service.title} service example`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent flex flex-col justify-end p-8 transition-all duration-300 group-hover:backdrop-blur-sm">
                  <h4 className="text-2xl font-display font-bold mb-2 group-hover:text-primary transition-colors">
                    {service.title}
                  </h4>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    {service.desc}
                  </p>
                  <button
                    onClick={() => {
                      setPortfolioFilter(service.category);
                      document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    aria-label={`Explore ${service.title} catalogue`}
                    className="inline-flex items-center text-sm font-bold uppercase tracking-wider text-white hover:text-primary transition-colors cursor-pointer bg-transparent border-none p-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-sm"
                  >
                    Explore Catalogue <ChevronRight className="ml-1 w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PORTFOLIO */}
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

          {/* Portfolio filter buttons with keyboard navigation */}
          <div 
            className="flex flex-wrap gap-2 md:gap-3 mb-8 md:mb-10 justify-center md:justify-start"
            role="tablist"
            aria-label="Portfolio categories"
          >
            {["All","LED","Glow","Acrylic","Wall","Vehicle","PVC","Flex"].map(cat => (
              <button 
                key={cat} 
                onClick={() => setPortfolioFilter(cat === "All" ? null : cat.toLowerCase())}
                role="tab"
                aria-selected={(cat === "All" && !portfolioFilter) || portfolioFilter === cat.toLowerCase()}
                aria-controls="portfolio-grid"
                tabIndex={0}
                className={`px-4 md:px-5 py-2 rounded-full text-xs md:text-sm font-bold uppercase tracking-wider transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${
                  (cat === "All" && !portfolioFilter) || portfolioFilter === cat.toLowerCase()
                    ? "bg-primary text-primary-foreground" : "bg-white/5 text-white/60 hover:bg-white/10"}`}
              >{cat}</button>
            ))}
          </div>

          {/* Main masonry-style grid — use dynamic data if available, fallback to hardcoded */}
          <div id="portfolio-grid" role="tabpanel" aria-label="Portfolio gallery">
          {dynamicPortfolioItems && dynamicPortfolioItems.length >= 9 ? (
            // Dynamic portfolio grid using admin config
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                {/* Big featured item */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="col-span-2 row-span-2 aspect-square rounded-2xl overflow-hidden relative group"
                  data-testid="img-portfolio-featured"
                  data-pf-cat={dynamicPortfolioItems[0]?.cat || "led"}
                >
                  <PortfolioImage src={dynamicPortfolioItems[0]?.img} alt={dynamicPortfolioItems[0]?.label || "Featured installation"} />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <span className="text-white font-display font-bold uppercase tracking-widest text-lg">{dynamicPortfolioItems[0]?.label || "Storefront LED Branding"}</span>
                  </div>
                </motion.div>

                {dynamicPortfolioItems.slice(1, 5).map((item: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: (i + 1) * 0.08 }}
                    className="aspect-square rounded-2xl overflow-hidden relative group"
                    data-testid={`img-portfolio-${i}`}
                    data-pf-cat={item.cat}
                  >
                    <PortfolioImage src={item.img} alt={item.label} />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <span className="text-white font-bold uppercase tracking-widest text-sm">{item.label}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Second row - consistent aspect-square */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                {dynamicPortfolioItems.slice(5, 9).map((item: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="aspect-square rounded-2xl overflow-hidden relative group"
                    data-testid={`img-portfolio-row2-${i}`}
                    data-pf-cat={item.cat}
                  >
                    <PortfolioImage src={item.img} alt={item.label} />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <span className="text-white font-bold uppercase tracking-widest text-sm">{item.label}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            // Fallback to original hardcoded grid
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                {/* Big featured item */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="col-span-2 row-span-2 aspect-square rounded-2xl overflow-hidden relative group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                  data-testid="img-portfolio-featured"
                  data-pf-cat="led"
                  tabIndex={0}
                  onClick={() => openLightbox(0)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openLightbox(0);
                    }
                  }}
                >
                  <PortfolioImage src={IMAGES.portfolio[0]} alt="Featured installation" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <span className="text-white font-display font-bold uppercase tracking-widest text-lg">Storefront LED Branding</span>
                  </div>
                </motion.div>

                {[
                  { img: IMAGES.glow[3], label: "Glow Sign", cat: "glow" },
                  { img: IMAGES.square[10], label: "LED Channel", cat: "led" },
                  { img: IMAGES.vehicle[2], label: "Vehicle Wrap", cat: "vehicle" },
                  { img: IMAGES.wall[3], label: "Wall Branding", cat: "wall" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: (i + 1) * 0.08 }}
                    className="aspect-square rounded-2xl overflow-hidden relative group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                    data-testid={`img-portfolio-${i}`}
                    data-pf-cat={item.cat}
                    tabIndex={0}
                    onClick={() => openLightbox(i + 1)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openLightbox(i + 1);
                      }
                    }}
                  >
                    <PortfolioImage src={item.img} alt={item.label} />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <span className="text-white font-bold uppercase tracking-widest text-sm">{item.label}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Second row — exactly 4 items to fill the 4-col grid cleanly */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                {[
                  { img: IMAGES.portfolio[2], label: "Retail Signage", cat: "led" },
                  { img: IMAGES.acrylic[1], label: "Acrylic Letters", cat: "acrylic" },
                  { img: IMAGES.glow[4], label: "Neon Glow", cat: "glow" },
                  { img: IMAGES.portfolio[5], label: "Corporate Lobby", cat: "acrylic" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="aspect-square rounded-2xl overflow-hidden relative group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                    data-testid={`img-portfolio-row2-${i}`}
                    data-pf-cat={item.cat}
                    tabIndex={0}
                    onClick={() => openLightbox(i + 5)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openLightbox(i + 5);
                      }
                    }}
                  >
                    <PortfolioImage src={item.img} alt={item.label} />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <span className="text-white font-bold uppercase tracking-widest text-sm">{item.label}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {/* Third row — vehicle wrap showcase - consistent aspect-square */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {IMAGES.vehicle.slice(3, 7).map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="aspect-square rounded-2xl overflow-hidden relative group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                data-testid={`img-portfolio-vehicle-${i}`}
                data-pf-cat="vehicle"
                tabIndex={0}
                onClick={() => openLightbox(i + 9)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(i + 9);
                  }
                }}
              >
                <PortfolioImage src={img} alt={`Vehicle wrap ${i + 1}`} />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-white font-bold uppercase tracking-widest text-sm">Vehicle Wrap</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        </div>
      </section>

      {/* CLIENTS STRIP */}
      <section className="py-16 bg-card border-t border-white/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-sm text-primary font-bold tracking-widest uppercase mb-2">Trusted By</h2>
            <h3 className="text-2xl md:text-3xl font-display font-bold">OUR CLIENTS</h3>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-6 items-center">
            {IMAGES.clients.map((src, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-center p-3 rounded-xl bg-background/50 hover:bg-background transition-colors"
                data-testid={`img-client-${i}`}
              >
                <img
                  src={src}
                  alt={`Client logo ${i + 1}`}
                  loading="lazy"
                  className="h-12 w-full object-contain opacity-70 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
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
                    data-testid={`item-reason-${i}`}
                  >
                    <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5" />
                    <span className="font-bold text-lg">{reason}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[IMAGES.glow[5], IMAGES.wall[4], IMAGES.led[2], IMAGES.square[12]].map((src, i) => (
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

      {/* TESTIMONIALS CAROUSEL */}
      <section id="testimonials" className="py-24 bg-card overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm text-primary font-bold tracking-widest uppercase mb-4">Client Feedback</h2>
            <h3 className="text-4xl md:text-5xl font-display font-bold leading-tight">
              TRUSTED BY BANGALORE BUSINESSES
            </h3>
          </div>

          {/* Carousel Container */}
          <div className="relative max-w-4xl mx-auto">
            {/* Carousel Slides */}
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
                  
                  {/* Avatar */}
                  {displayTestimonials[testimonialIndex]?.avatar && (
                    <img 
                      src={displayTestimonials[testimonialIndex].avatar} 
                      alt={displayTestimonials[testimonialIndex]?.name || displayTestimonials[testimonialIndex]?.author || "Client"}
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-6 border-4 border-primary/20"
                    />
                  )}
                  
                  {/* Rating */}
                  <div className="flex justify-center gap-1 mb-6">
                    {Array.from({ length: displayTestimonials[testimonialIndex]?.rating || 5 }).map((_, s) => (
                      <Star key={s} className="w-5 h-5 fill-primary text-primary" />
                    ))}
                  </div>
                  
                  {/* Quote */}
                  <p className="text-xl md:text-2xl text-foreground/90 font-light leading-relaxed mb-8 max-w-2xl mx-auto relative z-10">
                    {displayTestimonials[testimonialIndex]?.text}
                  </p>
                  
                  {/* Author */}
                  <div>
                    <div className="font-bold text-foreground font-display uppercase tracking-wider text-lg">
                      {displayTestimonials[testimonialIndex]?.name || displayTestimonials[testimonialIndex]?.author}
                    </div>
                    <div className="text-primary/80">{displayTestimonials[testimonialIndex]?.role}</div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Arrows - Mobile optimized with larger touch targets */}
            <button
              onClick={() => setTestimonialIndex((prev) => (prev - 1 + displayTestimonials.length) % displayTestimonials.length)}
              className="absolute left-2 md:left-0 top-1/2 -translate-y-1/2 md:-translate-x-12 w-10 h-10 md:w-12 md:h-12 rounded-full bg-card border border-white/10 hover:border-primary/50 hover:bg-primary/10 transition-all flex items-center justify-center text-foreground/60 hover:text-primary touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
              aria-label="Previous testimonial"
            >
              ←
            </button>
            <button
              onClick={() => setTestimonialIndex((prev) => (prev + 1) % displayTestimonials.length)}
              className="absolute right-2 md:right-0 top-1/2 -translate-y-1/2 md:translate-x-12 w-10 h-10 md:w-12 md:h-12 rounded-full bg-card border border-white/10 hover:border-primary/50 hover:bg-primary/10 transition-all flex items-center justify-center text-foreground/60 hover:text-primary touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
              aria-label="Next testimonial"
            >
              →
            </button>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-8">
              {displayTestimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTestimonialIndex(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${
                    i === testimonialIndex 
                      ? "bg-primary w-8" 
                      : "bg-white/20 hover:bg-white/40"
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="bg-gradient-to-br from-card to-background border border-white/10 rounded-3xl p-8 md:p-16 lg:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 blur-[100px]" />

            <h2 className="text-4xl md:text-6xl font-display font-bold leading-tight mb-6 relative z-10">
              READY TO BE SEEN?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 relative z-10">
              Contact our team today for a free consultation and quote. Let's build something that
              demands attention.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <Link href="/contact">
                <Button
                  size="lg"
                  className="h-14 px-8 rounded-full text-lg font-bold uppercase tracking-wide bg-white text-black hover:bg-white/90 w-full sm:w-auto"
                  data-testid="button-cta-contact"
                >
                  Contact Us Now
                </Button>
              </Link>
              <a href="tel:+916366525253">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 rounded-full text-lg font-bold uppercase tracking-wide border-white/20 hover:bg-white/10 w-full sm:w-auto group"
                  data-testid="button-cta-call"
                >
                  <PhoneCall className="mr-2 w-5 h-5 text-primary group-hover:animate-bounce" />
                  +91 63665 25253
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Image Lightbox */}
      <ImageLightbox
        images={lightboxImages}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
}
