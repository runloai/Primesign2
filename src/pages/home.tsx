import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, PhoneCall, Star, Phone, Mail, Clock, MapPin, Send, Upload, CheckCircle, AlertCircle } from "lucide-react";
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
}

interface PortfolioConfig {
  id: number;
  url: string;
  label?: string;
  category: string;
  featured?: boolean;
}

// Helper function to read admin config from localStorage
function getAdminConfig(): { portfolio?: PortfolioConfig[]; hero?: any; services?: ServiceConfig[]; testimonials?: Testimonial[] } | null {
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
    // Silent fail - config not available
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
    images: IMAGES.led.slice(0, 5),
    tag: "Most Popular",
    category: "led",
  },
  {
    title: "Glow Signs",
    desc: "Illuminated channel-letter installations that blaze through the Bangalore night.",
    images: IMAGES.glow.slice(0, 5),
    tag: null,
    category: "glow",
  },
  {
    title: "Acrylic Signs",
    desc: "Precision-routed acrylic lettering — crisp, clean, and unmistakably premium.",
    images: IMAGES.acrylic.slice(0, 4),
    tag: null,
    category: "acrylic",
  },
  {
    title: "Wall Branding",
    desc: "Large-format wall murals and architectural graphics for offices and retail.",
    images: IMAGES.wall.slice(0, 5),
    tag: null,
    category: "wall",
  },
  {
    title: "Vehicle Wraps",
    desc: "Turn your entire fleet into high-impact moving billboards across the city.",
    images: IMAGES.vehicle.slice(0, 6),
    tag: null,
    category: "vehicle",
  },
  {
    title: "PVC & Flex",
    desc: "Durable outdoor flex printing for hoardings, banners, and retail displays.",
    images: [IMAGES.pvc, ...IMAGES.wall.slice(0, 4)],
    tag: null,
    category: "pvc",
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
    // Silent fail - testimonials not available
  }
  return null;
}

// Helper to extract image URL from service image (handles both string and object formats)
function extractImageUrl(img: ServiceImage | string): string {
  if (typeof img === 'string') return img;
  return img?.url || '';
}

// Helper to get dynamic services from localStorage with FULL IMAGE ARRAY support
function getDynamicServices(): any[] | null {
  try {
    const stored = localStorage.getItem("primesign-config");
    if (stored) {
      const config = JSON.parse(stored);
      if (config.services && config.services.length > 0) {
        // Map admin service format to main site format with full image arrays
        return config.services
          .filter((s: ServiceConfig) => s.name) // Only include services with names
          .map((s: ServiceConfig) => {
            // Extract all images from the service gallery
            const serviceImages = s.images && s.images.length > 0
              ? s.images.map((img: ServiceImage | string) => extractImageUrl(img)).filter(Boolean)
              : [getServiceImage(s.name)]; // Fallback to category-based image
            
            return {
              title: s.name,
              desc: s.desc || "",
              // Store ALL images for the gallery carousel
              images: serviceImages,
              // First image as thumbnail
              thumbnail: serviceImages[0] || getServiceImage(s.name),
              tag: s.badge === "popular" ? "Most Popular" : s.badge === "new" ? "New" : null,
              category: getCategoryFromServiceName(s.name),
            };
          });
      }
    }
  } catch (e) {
    // Silent fail - services not available
  }
  return null;
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
  // Use the first word of the service name as category
  const firstWord = name.split(/\s+/)[0];
  return firstWord || "led";
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

  // Ensure we have at least one image
  const displayImages = images.length > 0 ? images : [IMAGES.led[0]];
  const totalImages = displayImages.length;

  // Auto-scroll every 3-4 seconds
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

  // Scroll to current index
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

  // Only show navigation if we have multiple images
  const showNavigation = totalImages > 1;

  return (
    <div 
      className="relative w-full h-full"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Horizontal scroll container */}
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

      {/* Arrow buttons - visible on hover or always for touch devices */}
      {showNavigation && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity duration-200 hover:bg-black/80 z-10 group-hover:opacity-100"
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

      {/* Dot indicators */}
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

      {/* Image counter */}
      {showNavigation && (
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full z-10">
          {currentIndex + 1} / {totalImages}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { open: openQuote } = useQuoteModal();
  const [heroIndex, setHeroIndex] = useState(0);
  const [portfolioFilter, setPortfolioFilter] = useState<string | null>(null);
  const [adminConfig, setAdminConfig] = useState<{ portfolio?: PortfolioConfig[]; hero?: any; testimonials?: Testimonial[]; services?: ServiceConfig[]; aboutImages?: any[]; advantageImages?: any[] } | null>(null);
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
  const rawDisplayServices = dynamicServices || adminConfig?.services || services;
  
  // Normalize services to have consistent image arrays
  const displayServices = useMemo(() => {
    return rawDisplayServices.map((s: any) => ({
      ...s,
      images: s.images || (s.img ? [s.img] : [IMAGES.led[0]]),
      thumbnail: s.thumbnail || s.img || (s.images?.[0]) || IMAGES.led[0],
    }));
  }, [rawDisplayServices]);

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

  // Get portfolio items - PRIORITIZE service galleries for portfolio source
  const getPortfolioItems = () => {
    // First, try to build portfolio from service galleries (sync with services)
    if (displayServices && displayServices.length > 0) {
      const serviceGalleryItems: { img: string; label: string; cat: string; featured: boolean }[] = [];
      
      displayServices.forEach((service: any, serviceIdx: number) => {
        const serviceImages = service.images || [];
        const category = service.category || getCategoryFromServiceName(service.title);
        
        // Add each image from the service gallery as a portfolio item
        serviceImages.forEach((img: string, imgIdx: number) => {
          if (img) {
            serviceGalleryItems.push({
              img,
              label: imgIdx === 0 ? `${service.title} - Featured` : `${service.title} - Sample`,
              cat: category,
              featured: serviceIdx === 0 && imgIdx === 0, // First service's first image is featured
            });
          }
        });
      });
      
      if (serviceGalleryItems.length > 0) {
        return serviceGalleryItems;
      }
    }
    
    // Fallback: use admin portfolio config
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
    
    // Final fallback: hardcoded portfolio
    return [
      { img: IMAGES.portfolio[0], label: "Storefront LED Branding", cat: "led", featured: true },
      { img: IMAGES.glow[3], label: "Glow Sign", cat: "glow", featured: false },
      { img: IMAGES.square[10], label: "LED Channel", cat: "led", featured: false },
      { img: IMAGES.vehicle[2], label: "Vehicle Wrap", cat: "vehicle", featured: false },
      { img: IMAGES.wall[3], label: "Wall Branding", cat: "wall", featured: false },
      { img: IMAGES.portfolio[2], label: "Retail Signage", cat: "led", featured: false },
      { img: IMAGES.acrylic[1], label: "Acrylic Letters", cat: "acrylic", featured: false },
      { img: IMAGES.glow[4], label: "Neon Glow", cat: "glow", featured: false },
      { img: IMAGES.portfolio[5], label: "Corporate Lobby", cat: "acrylic", featured: false },
    ];
  };

  const allPortfolioItems = getPortfolioItems();
  
  // Separate featured and non-featured items
  const featuredItem = useMemo(() => {
    return allPortfolioItems.find(item => item.featured) || null;
  }, [allPortfolioItems]);
  
  const nonFeaturedItems = useMemo(() => {
    return allPortfolioItems.filter(item => !item.featured);
  }, [allPortfolioItems]);

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

  // Extract unique categories from services for portfolio filter buttons
  // PRESERVE ADMIN ORDER - no sorting, maintain exact service order
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

  // Build lightbox images array from all portfolio sources
  const getLightboxImages = useCallback(() => {
    const images: { src: string; alt: string; label: string }[] = [];
    
    // Add all portfolio items (featured first, then others)
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

  // Filter items based on selected category
  const filteredFeaturedItem = useMemo(() => {
    if (!portfolioFilter) return featuredItem;
    return featuredItem && featuredItem.cat === portfolioFilter ? featuredItem : null;
  }, [featuredItem, portfolioFilter]);

  const filteredNonFeaturedItems = useMemo(() => {
    if (!portfolioFilter) return nonFeaturedItems;
    return nonFeaturedItems.filter(item => item.cat === portfolioFilter);
  }, [nonFeaturedItems, portfolioFilter]);

  // Calculate lightbox index for featured item
  const getFeaturedLightboxIndex = useCallback(() => {
    if (!featuredItem) return 0;
    return 0; // Featured item is always first in lightbox
  }, [featuredItem]);

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
            {displayServices.map((service: any, index: number) => (
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
                {/* Image Gallery Carousel */}
                <div className="aspect-[4/3] overflow-hidden">
                  <ServiceImageGallery
                    images={service.images || [service.thumbnail || service.img]}
                    serviceTitle={service.title}
                    prefersReducedMotion={prefersReducedMotion}
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

          {/* Portfolio filter buttons - dynamically from services categories + All */}
          <div 
            className="flex flex-wrap gap-2 md:gap-3 mb-8 md:mb-10 justify-center md:justify-start"
            role="tablist"
            aria-label="Portfolio categories"
          >
            <button 
              onClick={() => setPortfolioFilter(null)}
              role="tab"
              aria-selected={!portfolioFilter}
              aria-controls="portfolio-grid"
              tabIndex={0}
              className={`px-4 md:px-5 py-2 rounded-full text-xs md:text-sm font-bold uppercase tracking-wider transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${
                !portfolioFilter
                  ? "bg-primary text-primary-foreground" : "bg-white/5 text-white/60 hover:bg-white/10"}`}
            >
              All
            </button>
            {portfolioCategories.map(cat => (
              <button 
                key={cat}
                onClick={() => setPortfolioFilter(cat)}
                role="tab"
                aria-selected={portfolioFilter === cat}
                aria-controls="portfolio-grid"
                tabIndex={0}
                className={`px-4 md:px-5 py-2 rounded-full text-xs md:text-sm font-bold uppercase tracking-wider transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${
                  portfolioFilter === cat
                    ? "bg-primary text-primary-foreground" : "bg-white/5 text-white/60 hover:bg-white/10"}`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {/* Main masonry-style grid with featured hero support */}
          <div id="portfolio-grid" role="tabpanel" aria-label="Portfolio gallery">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              {/* Featured item - appears first and spans 2x2 */}
              {filteredFeaturedItem && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="col-span-2 row-span-2 aspect-square rounded-2xl overflow-hidden relative group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                  data-testid="img-portfolio-featured"
                  data-pf-cat={filteredFeaturedItem.cat}
                  tabIndex={0}
                  onClick={() => openLightbox(0)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openLightbox(0);
                    }
                  }}
                >
                  <PortfolioImage src={filteredFeaturedItem.img} alt={filteredFeaturedItem.label} />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <span className="text-white font-display font-bold uppercase tracking-widest text-lg">{filteredFeaturedItem.label}</span>
                  </div>
                </motion.div>
              )}

              {/* Non-featured items - fill remaining slots */}
              {filteredNonFeaturedItems.slice(0, filteredFeaturedItem ? 4 : 5).map((item: any, i: number) => (
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
                  onClick={() => openLightbox(filteredFeaturedItem ? i + 1 : i)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openLightbox(filteredFeaturedItem ? i + 1 : i);
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

            {/* Second row - all aspect-square, consistent sizing */}
            {filteredNonFeaturedItems.length > (filteredFeaturedItem ? 4 : 5) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                {filteredNonFeaturedItems.slice(filteredFeaturedItem ? 4 : 5, filteredFeaturedItem ? 12 : 13).map((item: any, i: number) => (
                  <motion.div
                    key={i + 100}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="aspect-square rounded-2xl overflow-hidden relative group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                    data-testid={`img-portfolio-row2-${i}`}
                    data-pf-cat={item.cat}
                    tabIndex={0}
                    onClick={() => openLightbox((filteredFeaturedItem ? 5 : 5) + i)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openLightbox((filteredFeaturedItem ? 5 : 5) + i);
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
            )}

            {/* Third row - remaining items */}
            {filteredNonFeaturedItems.length > (filteredFeaturedItem ? 12 : 13) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {filteredNonFeaturedItems.slice(filteredFeaturedItem ? 12 : 13).map((item: any, i: number) => (
                  <motion.div
                    key={i + 200}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="aspect-square rounded-2xl overflow-hidden relative group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                    data-testid={`img-portfolio-row3-${i}`}
                    data-pf-cat={item.cat}
                    tabIndex={0}
                    onClick={() => openLightbox((filteredFeaturedItem ? 13 : 13) + i)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openLightbox((filteredFeaturedItem ? 13 : 13) + i);
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
            )}
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

      {/* CONTACT FORM SECTION */}
      <section id="contact" className="py-24 bg-card relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm text-primary font-bold tracking-widest uppercase mb-4">Get In Touch</h2>
            <h3 className="text-4xl md:text-5xl font-display font-bold leading-tight mb-6">
              READY TO START YOUR PROJECT?
            </h3>
            <p className="text-lg text-muted-foreground">
              Fill out the form below and we'll get back to you within 24 hours with a free quote.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-12 max-w-6xl mx-auto">
            {/* Contact Info Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: prefersReducedMotion ? 0.01 : 0.6 }}
              className="lg:col-span-2 space-y-8"
            >
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Phone</h4>
                    <a href="tel:+916366525253" className="text-muted-foreground hover:text-primary transition-colors">
                      +91 6366 525 253
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Email</h4>
                    <a href="mailto:info@primesign.in" className="text-muted-foreground hover:text-primary transition-colors">
                      info@primesign.in
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Working Hours</h4>
                    <p className="text-muted-foreground">Mon - Sat: 9:00 AM - 9:00 PM</p>
                    <p className="text-muted-foreground">Sunday: Closed</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Location</h4>
                    <p className="text-muted-foreground">Bangalore, Karnataka, India</p>
                  </div>
                </div>
              </div>

              {/* Quick WhatsApp Button */}
              <div className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-2xl">
                <h4 className="font-semibold text-foreground mb-2">Prefer WhatsApp?</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Chat with us directly for quick responses
                </p>
                <a
                  href="https://wa.me/916366525253?text=Hello%20PrimeSign%2C%20I%20would%20like%20to%20know%20more%20about%20your%20services"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full font-semibold transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.6 6.32A7.85 7.85 0 0 0 12 4a7.94 7.94 0 0 0-6.88 12.23l-1.02 3.72 3.81-1a7.93 7.93 0 0 0 3.76.94 7.85 7.85 0 0 0 7.8-7.8 7.7 7.7 0 0 0-1.07-4.04l.02-.03Zm-2.28 7.3c-.09.25-.6.48-.83.51-.23.04-.45.1-.81-.1a10.6 10.6 0 0 1-2.59-1.39c-.72-.5-1.55-1.35-1.83-1.85-.27-.5-.06-.77.2-1.02.21-.2.46-.53.7-.8l.08-.1c.23-.28.28-.46.42-.77.14-.3.07-.57-.03-.8a4.82 4.82 0 0 0-.68-1.17c-.18-.24-.38-.5-.54-.62-.3-.22-.63-.31-.99-.33l-.05.02c-.3 0-.65.1-.99.3-.33.19-.63.52-.83.82-.36.53-.5 1.12-.48 1.72v.03c.03.55.21 1.09.56 1.55 1.04 1.75 2.22 2.9 3.7 3.6.59.3 1.14.47 1.65.6.5.12.95.1 1.33.04.4-.07.75-.26 1.04-.47.29-.22.53-.5.7-.82l.04-.08c.11-.23.11-.44.07-.59-.05-.15-.16-.27-.31-.38Z"/>
                  </svg>
                  Chat on WhatsApp
                </a>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: prefersReducedMotion ? 0.01 : 0.6, delay: 0.1 }}
              className="lg:col-span-3"
            >
              <ContactForm />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden" id="cta">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        {/* Decorative elements */}
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
                  data-testid="button-cta-quote"
                >
                  Get Your Free Quote
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <a href="tel:+916****5253">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 rounded-full text-lg font-bold uppercase tracking-wide bg-white/5 border-white/20 hover:bg-white/10"
                  >
                    <PhoneCall className="mr-2 w-5 h-5" />
                    Call Us Now
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
    </div>
  );
}
