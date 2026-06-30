# Primesign 2.0

Bangalore's Premier Signage & Branding Studio Website

A modern, responsive, and accessible web application built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

### Core Functionality
- **Dynamic Content Management**: Admin-configurable portfolio, services, testimonials, and contact info via localStorage
- **Interactive Quote System**: Multi-step quote modal with WhatsApp integration
- **Image Gallery**: Built-in lightbox with keyboard navigation and thumbnail support
- **Responsive Design**: Optimized for all screen sizes (mobile, tablet, desktop)

### Accessibility (A11y)
- **Full Keyboard Navigation**: All interactive elements accessible via keyboard
- **ARIA Labels**: Comprehensive ARIA attributes for screen readers
- **Reduced Motion Support**: Respects `prefers-reduced-motion` preference
- **Focus Management**: Visible focus states and proper focus trapping

### UI/UX Enhancements
- **15 Color Themes**: Customizable color schemes with instant preview
- **Smooth Animations**: Framer Motion powered transitions
- **Loading States**: Skeleton loaders and image placeholders
- **Mobile-First**: Touch-optimized interfaces

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript
- **Routing**: Wouter (lightweight routing)
- **Styling**: Tailwind CSS + CSS custom properties
- **Components**: Radix UI primitives
- **Animation**: Framer Motion
- **State**: React Context API
- **Build Tool**: Vite

## 📦 Installation

```bash
# Clone the repository
git clone <repo-url>

# Navigate to project
cd primesign2

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/         # Navbar, Footer
│   ├── ui/            # Shadcn/UI components
│   ├── QuoteModal.tsx
│   ├── FloatingWhatsApp.tsx
│   └── ImageLightbox.tsx
├── pages/
│   ├── home.tsx       # Landing page
│   ├── contact.tsx    # Contact page
│   └── not-found.tsx  # 404 page
├── hooks/
│   ├── use-mobile.tsx
│   ├── use-toast.ts
│   └── use-reduced-motion.ts
├── context/
│   └── QuoteModalContext.tsx
├── lib/
│   └── utils.ts       # Utility functions
├── assets/            # Static assets
└── index.css         # Global styles
```

## 🎨 Color Schemes

The application supports 15 built-in color themes:

- Obsidian Gold (Default)
- Plasma Purple
- Electric Blue
- Crimson Noir
- Emerald Glow
- Neon Nights
- Arctic White
- Sandstone
- Royal Velvet
- Thunderbolt
- Midnight Copper
- Sky Light
- Warm Cream
- Mint Fresh
- Lavender Dream

## 🔧 Admin Configuration

Content is edited through `/admin.html`. Draft edits are stored in the browser first, then published through the Netlify function at `/api/publish`. In production, configure Supabase environment variables in Netlify so edits publish to the database and the public site reads them from `/api/config`.

Supabase table:

```sql
create table if not exists public.site_config (
  id text primary key,
  config jsonb not null,
  updated_at timestamptz not null default now()
);
```

Required Netlify environment variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PUBLISH_TOKEN`

The browser never stores Supabase or GitHub secrets. Local development still falls back to `public/config.json`.

The core config shape is:

```json
{
  "hero": {
    "bgImage": "url",
    "badge": "text",
    "headline": "html",
    "subtitle": "text"
  },
  "portfolio": [...],
  "services": [...],
  "testimonials": [...],
  "aboutImages": [...],
  "advantageImages": [...],
  "contact": {
    "phones": [...],
    "emails": [...],
    "address": "...",
    "social": {...}
  }
}
```

## ♿ Accessibility Features

- 85+ ARIA attributes throughout the application
- Semantic HTML5 structure
- Keyboard navigation support
- Screen reader optimizations
- Focus indicators
- Reduced motion preferences
- Color contrast compliance (WCAG AA)

## 🌐 Deployment

The site is configured for deployment on Netlify with the included `netlify.toml` configuration.

## 📄 License

Copyright © 2024 Primesign Private Limited. All rights reserved.

## 🙋 Support

For support or inquiries:
- WhatsApp: +91 63665 25253
- Email: primesign2021@gmail.com
- Location: Bangalore, Karnataka, India
