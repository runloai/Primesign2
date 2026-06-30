import { SiWhatsapp } from "react-icons/si";
import { useMemo } from "react";
import { useSiteConfig } from "@/hooks/use-site-config";

export default function FloatingWhatsApp() {
  const { data: siteConfig } = useSiteConfig();
  const waNumber = useMemo(() => {
    const phoneNumber = siteConfig?.settings?.whatsappNumber || siteConfig?.contact?.phones?.[0] || siteConfig?.contact?.whatsapp || "6366525253";
    return phoneNumber.replace(/[^\d]/g, '');
  }, [siteConfig]);
  const waMessage = siteConfig?.settings?.whatsappMessage || "Hello PrimeSign, I'd like to know more about your signage services.";

  const presetMessage = encodeURIComponent(waMessage);
  const whatsappUrl = `https://wa.me/${waNumber}?text=${presetMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-[0_0_20px_rgba(37,211,102,0.5)] hover:scale-110 hover:shadow-[0_0_30px_rgba(37,211,102,0.7)] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#25D366]/50 focus:ring-offset-2 focus:ring-offset-background group"
      aria-label="Chat on WhatsApp"
    >
      <SiWhatsapp size={28} />
      {/* Tooltip */}
      <span className="absolute right-full mr-4 bg-foreground text-background px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        Chat on WhatsApp
        <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 bg-foreground rotate-45"></span>
      </span>
    </a>
  );
}
