import { SiWhatsapp } from "react-icons/si";

export default function FloatingWhatsApp() {
  return (
    <a
      href="https://wa.me/916366525253"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-[0_0_20px_rgba(37,211,102,0.5)] hover:scale-110 hover:shadow-[0_0_30px_rgba(37,211,102,0.7)] transition-all duration-300"
      aria-label="Chat on WhatsApp"
    >
      <SiWhatsapp size={28} />
    </a>
  );
}
