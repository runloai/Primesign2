// PrimeSign Site Configuration Schema and Loader
// This is the single source of truth for config structure

export type SiteImage = {
  url: string;
  label?: string;
  alt?: string;
  width?: number;
  height?: number;
};

export type ServiceCategory = {
  id: string;
  label: string;
  icon?: string;
  description?: string;
  order?: number;
};

export type Service = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  badge?: string;
  heroImage?: SiteImage;
  galleryImages: SiteImage[];
  portfolioImages: SiteImage[];
  category?: string;
  desc?: string;
  images?: SiteImage[];
};

export type PortfolioItem = {
  id: string;
  image: SiteImage;
  categoryId?: string;
  featured?: boolean;
  order?: number;
  url?: string;
  category?: string;
  label?: string;
};

export type SiteConfig = {
  serviceCategories: ServiceCategory[];
  services: Service[];
  hero: {
    badge?: string;
    headline?: string;
    subtitle?: string;
    backgroundImage?: SiteImage;
    bgImage?: string;
    stats?: { value: string; label: string }[];
  };
  portfolio: PortfolioItem[];
  about: {
    title?: string;
    subtitle?: string;
    description?: string;
    description2?: string;
    images: SiteImage[];
  };
  advantage: {
    title?: string;
    subtitle?: string;
    benefits: { label: string; icon?: string; image?: SiteImage }[];
    gridImages: SiteImage[];
  };
  contact: {
    phones?: string[];
    emails?: string[];
    address?: string;
    mapsUrl?: string;
    social?: {
      facebook?: string;
      instagram?: string;
      linkedin?: string;
      whatsapp?: string;
      youtube?: string;
    };
    workingHours?: string;
    youtube?: string;
    facebook?: string;
    instagram?: string;
  };
  settings: {
    siteName?: string;
    siteDescription?: string;
    logo?: SiteImage;
    logoUrl?: string;
    logoType?: string;
    scheme?: string;
    workingHours?: string;
    metaTitle?: string;
    metaDescription?: string;
  };
  colorScheme?: {
    name?: string;
    primary?: string;
    accent?: string;
    bg?: string;
    text?: string;
  };
  meta?: {
    version?: string;
    publishedAt?: string;
  };
  // Legacy fields (to be migrated)
  [key: string]: any;
};

/**
 * Normalize legacy config to standard schema
 */
export function normalizeSiteConfig(raw: any): SiteConfig {
  const config: SiteConfig = {
    serviceCategories: [],
    services: [],
    hero: {},
    portfolio: [],
    about: { images: [] },
    advantage: { benefits: [], gridImages: [] },
    contact: {},
    settings: {},
  };

  if (!raw) return config;

  // Normalize serviceCategories - remove nested items array
  if (Array.isArray(raw.serviceCategories)) {
    config.serviceCategories = raw.serviceCategories.map((cat: any) => ({
      id: normalizeCategoryId(cat.id || 'category'),
      label: cat.label || cat.name || 'Category',
      icon: cat.icon,
      description: cat.description,
      order: cat.order,
    }));
  }

  // Normalize services
  if (Array.isArray(raw.services)) {
    config.services = raw.services.map((svc: any) => {
      const categoryId = svc.categoryId || svc.category || 'other';
      return {
        id: String(svc.id || Math.random().toString(36).substr(2, 9)),
        categoryId: normalizeCategoryId(categoryId),
        name: svc.name || 'Service',
        description: svc.description || svc.desc || '',
        badge: svc.badge,
        heroImage: normalizeImage(svc.heroImage),
        galleryImages: normalizeImages(svc.images || svc.galleryImages || []),
        portfolioImages: normalizeImages(svc.portfolioImages || []),
        // Legacy aliases keep partially migrated components working.
        category: normalizeCategoryId(categoryId),
        desc: svc.description || svc.desc || '',
        images: normalizeImages(svc.images || svc.galleryImages || []),
      };
    });
  }

  // Create category lookup
  const categoryIds = new Set(config.serviceCategories.map(c => c.id));
  
  // Add missing categories from services
  config.services.forEach(svc => {
    if (!categoryIds.has(svc.categoryId)) {
      config.serviceCategories.push({
        id: svc.categoryId,
        label: svc.categoryId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      });
      categoryIds.add(svc.categoryId);
    }
  });

  // Normalize hero
  config.hero = {
    ...raw.hero,
    badge: raw.hero?.badge,
    headline: raw.hero?.headline || raw.hero?.title,
    subtitle: raw.hero?.subtitle,
    backgroundImage: normalizeImage(raw.hero?.bgImage || raw.hero?.backgroundImage),
    bgImage: imageUrl(normalizeImage(raw.hero?.bgImage || raw.hero?.backgroundImage)),
    stats: raw.hero?.stats,
  };

  // Normalize portfolio
  if (Array.isArray(raw.portfolio)) {
    config.portfolio = raw.portfolio.map((item: any) => ({
      ...item,
      id: String(item.id || Math.random().toString(36).substr(2, 9)),
      image: normalizeImage(item.image || item.url),
      categoryId: item.categoryId || item.category,
      featured: item.featured,
      order: item.order,
      url: imageUrl(normalizeImage(item.image || item.url)),
      category: item.categoryId || item.category,
    }));
  }

  // Normalize about
  config.about = {
    ...raw.about,
    title: raw.about?.title,
    subtitle: raw.about?.subtitle,
    description: raw.about?.description,
    description2: raw.about?.description2,
    images: normalizeImages(raw.about?.images || raw.aboutImages || []),
  };

  // Normalize advantage
  const advantageImages = raw.advantage?.images || raw.advantageImages || [];
  config.advantage = {
    ...raw.advantage,
    title: raw.advantage?.title,
    subtitle: raw.advantage?.subtitle,
    benefits: Array.isArray(advantageImages) 
      ? advantageImages.slice(0, 6).map((img: any, idx: number) => ({
          label: img.label || getDefaultBenefitLabel(idx),
          icon: img.icon,
          image: normalizeImage(img),
        }))
      : [],
    gridImages: normalizeImages(raw.advantage?.gridImages || []),
  };

  // If no gridImages, use defaults for the 4-box grid
  if (config.advantage.gridImages.length === 0) {
    config.advantage.gridImages = [
      { url: '/images/led/2.webp' },
      { url: '/images/glow/1.webp' },
      { url: '/images/square/brass.webp' },
      { url: '/images/wall/3.webp' },
    ];
  }

  // Normalize contact
  config.contact = {
    ...(raw.contact || {}),
    phones: raw.contact?.phones || [],
    emails: raw.contact?.emails || [],
    address: raw.contact?.address,
    mapsUrl: raw.contact?.mapsUrl,
    social: raw.contact?.social,
    workingHours: raw.contact?.workingHours || raw.settings?.workingHours,
  };

  // Normalize settings
  config.settings = {
    ...(raw.settings || {}),
    siteName: raw.settings?.siteName,
    siteDescription: raw.settings?.siteDescription,
    logo: normalizeImage(raw.settings?.logo || raw.settings?.logoUrl),
    logoUrl: raw.settings?.logoUrl || imageUrl(normalizeImage(raw.settings?.logo)),
    metaTitle: raw.settings?.metaTitle,
    metaDescription: raw.settings?.metaDescription,
  };

  // Copy other fields
  config.colorScheme = raw.colorScheme;
  config.meta = raw.meta || {
    version: raw._version,
    publishedAt: raw._publishedAt,
  };
  config.testimonials = raw.testimonials || [];
  config.footer = raw.footer;
  config.navbar = raw.navbar;
  config.aboutImages = config.about.images;
  config.advantageImages = config.advantage.benefits.map((benefit) => ({
    label: benefit.label,
    icon: benefit.icon,
    url: benefit.image?.url || '',
    alt: benefit.image?.alt,
  }));

  return config;
}

/**
 * Normalize category ID to lowercase-dash format
 */
function normalizeCategoryId(id: string): string {
  return id
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Normalize single image to SiteImage format
 */
function normalizeImage(img: any): SiteImage | undefined {
  if (!img) return undefined;
  
  if (typeof img === 'string') {
    return { url: img };
  }
  
  return {
    url: img.url || img.src || '',
    label: img.label || img.alt,
    alt: img.alt,
    width: img.width,
    height: img.height,
  };
}

/**
 * Normalize array of images
 */
function normalizeImages(imgs: any[]): SiteImage[] {
  if (!Array.isArray(imgs)) return [];
  return imgs.map(normalizeImage).filter((img): img is SiteImage => !!img);
}

/**
 * Get default benefit label by index
 */
function getDefaultBenefitLabel(idx: number): string {
  const defaults = [
    'Premium Quality Materials',
    'Rapid Turnaround Times',
    'Expert Installation Team',
    'End-to-End Service',
    'Competitive Pricing',
    'Bangalore-Based Manufacturing',
  ];
  return defaults[idx] || `Benefit ${idx + 1}`;
}

/**
 * Load site config from server or localStorage
 */
export async function loadSiteConfig(options?: { 
  includeLocalDraft?: boolean;
  PublishedConfigUrl?: string;
}): Promise<SiteConfig> {
  const { includeLocalDraft = false, PublishedConfigUrl = '/api/config' } = options || {};

  let rawConfig: any = {};

  const fetchJson = async (url: string) => {
    const response = await fetch(url);
    const contentType = response.headers.get('content-type') || '';
    if (!response.ok || !contentType.includes('application/json')) return null;
    return response.json();
  };

  // Try to load from the live config API first, then static config for local/dev fallback.
  try {
    rawConfig = await fetchJson(PublishedConfigUrl) || {};
  } catch (e) {
    console.warn('Failed to load config API:', e);
  }

  if (!rawConfig || Object.keys(rawConfig).length === 0) {
    try {
      rawConfig = await fetchJson('/config.json') || rawConfig;
    } catch (e) {
      console.warn('Failed to load static config:', e);
    }
  }

  // Merge with localStorage draft if requested
  if (includeLocalDraft) {
    try {
      const stored = localStorage.getItem('primesign-config');
      if (stored) {
        const localConfig = JSON.parse(stored);
        // Local draft takes precedence for admin preview
        rawConfig = { ...rawConfig, ...localConfig };
      }
    } catch (e) {
      console.warn('Failed to load local config:', e);
    }
  }

  return normalizeSiteConfig(rawConfig);
}

/**
 * Get services grouped by category
 */
export function getServicesByCategory(
  config: SiteConfig
): Array<{ category: ServiceCategory; services: Service[] }> {
  return config.serviceCategories.map(category => ({
    category,
    services: config.services.filter(
      service => service.categoryId === category.id
    ),
  }));
}

/**
 * Extract URL from SiteImage or string
 */
export function imageUrl(
  image?: SiteImage | string | null,
  fallback?: string
): string {
  if (!image) return fallback || '';
  
  if (typeof image === 'string') {
    return image || fallback || '';
  }
  
  return image.url || fallback || '';
}

/**
 * Add version parameter for cache busting
 */
export function withVersion(url: string, version?: string): string {
  if (!version || url.startsWith('data:')) return url;
  return `${url}${url.includes('?') ? '&' : '?'}v=${encodeURIComponent(version)}`;
}
