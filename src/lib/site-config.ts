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
    gridImages: SiteImage[];
  };
  contact: {
    phones?: string[];
    emails?: string[];
    address?: string;
    mapsUrl?: string;
    whatsapp?: string;
    threadsUrl?: string;
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
    whatsappNumber?: string;
    whatsappMessage?: string;
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

export const SITE_CONFIG_STORAGE_KEY = 'primesign-config';

export function shouldUseLocalDraftPreview(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('draft') === '1' || params.get('previewDraft') === '1';
}

function mergeConfig(base: any, override: any): any {
  if (Array.isArray(override)) return override.slice();
  if (!override || typeof override !== 'object') return override;
  if (!base || typeof base !== 'object' || Array.isArray(base)) {
    return Array.isArray(override) ? override.slice() : { ...override };
  }

  const result: Record<string, any> = { ...base };
  Object.entries(override).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      result[key] = value.slice();
      return;
    }

    if (value && typeof value === 'object') {
      result[key] = mergeConfig(base[key], value);
      return;
    }

    result[key] = value;
  });

  return result;
}

function parseConfigTimestamp(config: any): number {
  const rawValue = config?._draftSavedAt || config?._publishedAt || config?.meta?.publishedAt || '';
  const parsed = Date.parse(rawValue);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function shouldUseLocalDraftConfig(publishedConfig: any, localDraft: any): boolean {
  if (!localDraft || typeof localDraft !== 'object') return false;
  if (!publishedConfig || Object.keys(publishedConfig).length === 0) return true;

  const publishedTime = parseConfigTimestamp(publishedConfig);
  const draftTime = parseConfigTimestamp(localDraft);

  if (!Number.isFinite(publishedTime)) return true;
  return Number.isFinite(draftTime) && draftTime > publishedTime;
}

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
    advantage: { gridImages: [] },
    contact: {},
    settings: {},
  };

  if (!raw) return config;

  // Normalize serviceCategories - remove nested items array and de-duplicate IDs.
  if (Array.isArray(raw.serviceCategories)) {
    const seen = new Set<string>();
    config.serviceCategories = raw.serviceCategories.reduce((categories: ServiceCategory[], cat: any) => {
      const id = normalizeCategoryId(cat.id || cat.label || cat.name || 'category') || 'category';
      if (seen.has(id)) return categories;
      seen.add(id);
      categories.push({
        id,
        label: cat.label || cat.name || id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        icon: cat.icon,
        description: cat.description,
        order: cat.order,
      });
      return categories;
    }, []);
  }

  // Normalize services
  if (Array.isArray(raw.services)) {
    config.services = raw.services.map((svc: any) => {
      const categoryId = normalizeCategoryId(svc.categoryId || svc.category || 'other') || 'other';
      const galleryImages = normalizeImages(svc.galleryImages || svc.images || []);
      const heroImage = normalizeImage(svc.heroImage || galleryImages[0]);
      return {
        id: String(svc.id || Math.random().toString(36).substr(2, 9)),
        categoryId,
        name: svc.name || 'Service',
        description: svc.description || svc.desc || '',
        badge: svc.badge,
        heroImage,
        galleryImages,
        portfolioImages: normalizeImages(svc.portfolioImages || []),
        // Legacy aliases keep partially migrated components working.
        category: categoryId,
        desc: svc.description || svc.desc || '',
        images: galleryImages,
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

  // Normalize advantage. The public section is a four-photo grid, not icon cards.
  const defaultAdvantageGrid = [
    { url: '/images/led/2.webp', label: 'LED signage detail' },
    { url: '/images/glow/1.webp', label: 'Glow sign detail' },
    { url: '/images/wall/3.webp', label: 'Wall branding detail' },
    { url: '/images/square/brass.webp', label: 'Brass sign detail' },
  ];
  config.advantage = {
    ...raw.advantage,
    title: raw.advantage?.title,
    subtitle: raw.advantage?.subtitle,
    gridImages: normalizeImages(raw.advantage?.gridImages || raw.advantageGridImages || raw.advantageImages || defaultAdvantageGrid).slice(0, 4),
  };

  while (config.advantage.gridImages.length < 4) {
    config.advantage.gridImages.push(defaultAdvantageGrid[config.advantage.gridImages.length]);
  }
  config.advantage.gridImages = config.advantage.gridImages.slice(0, 4);

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
  config.advantageImages = config.advantage.gridImages;

  return config;
}

/**
 * Normalize category ID to lowercase-dash format
 */
function normalizeCategoryId(id: string): string {
  return String(id || '')
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
  return imgs.map(normalizeImage).filter((img): img is SiteImage => !!img && !!img.url);
}

/**
 * Load site config from the publish API, falling back to static config.
 * Local drafts are only merged when explicitly requested for preview.
 */
export async function loadSiteConfig(options?: { 
  includeLocalDraft?: boolean;
  publishedConfigUrl?: string;
  PublishedConfigUrl?: string;
}): Promise<SiteConfig> {
  const {
    includeLocalDraft = false,
    publishedConfigUrl,
    PublishedConfigUrl,
  } = options || {};
  const configUrl = publishedConfigUrl || PublishedConfigUrl || '/api/config';

  let rawConfig: any = {};

  const fetchJson = async (url: string) => {
    const separator = url.includes('?') ? '&' : '?';
    const response = await fetch(`${url}${separator}t=${Date.now()}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    const contentType = response.headers.get('content-type') || '';
    if (!response.ok || !contentType.includes('application/json')) return null;
    return response.json();
  };

  // Try to load from the live config API first, then static config for local/dev fallback.
  try {
    rawConfig = await fetchJson(configUrl) || {};
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
      const stored = localStorage.getItem(SITE_CONFIG_STORAGE_KEY);
      if (stored) {
        const localConfig = JSON.parse(stored);
        if (shouldUseLocalDraftConfig(rawConfig, localConfig)) {
          rawConfig = mergeConfig(rawConfig, localConfig);
        }
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
