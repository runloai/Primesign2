import { SiWhatsapp } from "react-icons/si";
import { useState, useEffect } from "react";

export default function FloatingWhatsApp() {
  const [waNumber, setWaNumber] = useState("6366525253");
  const [waMessage, setWaMessage] = useState("Hello PrimeSign, I'd like to know more about your signage services.");

  useEffect(() => {
    const readJson = async (url: string) => {
      const response = await fetch(url);
      const contentType = response.headers.get("content-type") || "";
      if (!response.ok || !contentType.includes("application/json")) return null;
      return response.json();
    };
    readJson("/api/config?t=" + Date.now())
      .then(c => c || readJson("/config.json?t=" + Date.now()))
      .then(c => {
        if (!c) return;
        // Try settings.whatsappNumber first, then fall back to contact.phones[0], then contact.whatsapp
        const phoneNumber = c.settings?.whatsappNumber || c.contact?.phones?.[0] || c.contact?.whatsapp || "6366525253";
        setWaNumber(phoneNumber.replace(/[^\d]/g, ''));
        if (c.settings?.whatsappMessage) setWaMessage(c.settings.whatsappMessage);
      }).catch(() => {});
  }, []);

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
