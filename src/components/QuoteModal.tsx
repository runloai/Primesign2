import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuoteModal } from "@/context/QuoteModalContext";

const SERVICES = [
  "LED Signs",
  "Glow Signs",
  "3D Channel Letters",
  "Acrylic Signs",
  "Wall Branding",
  "Vehicle Wraps",
  "Outdoor Hoardings",
  "PVC / Flex Printing",
  "Digital Signage",
];

const BUSINESS_TYPES = [
  "Restaurant / Cafe / Bar",
  "Hotel / Resort / Spa",
  "Retail Store / Showroom",
  "Corporate / IT Office",
  "Hospital / Clinic",
  "Salon / Beauty Parlour",
  "Education / School / College",
  "Real Estate / Construction",
  "Other",
];

const TIMELINES = [
  "ASAP — within a week",
  "Within a month",
  "1–3 months",
  "Just exploring for now",
];

const BUDGET_RANGES = [
  "Under ₹25,000",
  "₹25,000 – ₹50,000",
  "₹50,000 – ₹1,00,000",
  "₹1,00,000 – ₹2,00,000",
  "Over ₹2,00,000",
  "Not sure / Need quote",
];

export default function QuoteModal() {
  const { isOpen, close } = useQuoteModal();
  const [waNumber, setWaNumber] = useState("916366525253");

  useEffect(() => {
    fetch("/config.json?t=" + Date.now()).then(r => r.json()).then(c => {
      if (c.contact?.phones?.[0]) setWaNumber(c.contact.phones[0].replace(/[^\d]/g, ''));
    }).catch(() => {});
  }, []);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    businessName: "",
    businessType: "",
    location: "",
    timeline: "",
    budget: "",
    details: "",
  });
  const [services, setServices] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const toggleService = (s: string) =>
    setServices((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = [
      `*New Quote Request — Primesign Website*`,
      ``,
      `*Name:* ${form.name}`,
      `*Phone:* ${form.phone}`,
      form.email ? `*Email:* ${form.email}` : null,
      `*Business Name:* ${form.businessName}`,
      form.businessType ? `*Business Type:* ${form.businessType}` : null,
      form.location ? `*Location / Area:* ${form.location}` : null,
      services.length ? `*Services Needed:* ${services.join(", ")}` : null,
      form.timeline ? `*Timeline:* ${form.timeline}` : null,
      form.details ? `*Additional Details:*\n${form.details}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(lines)}`;
    window.open(url, "_blank");
    setSubmitted(true);
  };

  const handleClose = () => {
    close();
    setTimeout(() => setSubmitted(false), 400);
  };

  const labelClass = "block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5";
  const inputClass = "h-11 bg-background/60 border-white/10 focus:border-primary/60 transition-colors";
  const selectClass = "flex h-11 w-full rounded-md border border-white/10 bg-background/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed inset-y-0 right-0 w-full max-w-xl bg-card border-l border-white/10 z-[101] overflow-y-auto shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
          >
            {/* Header */}
            <div className="sticky top-0 bg-card/95 backdrop-blur border-b border-white/10 px-6 py-5 flex items-start justify-between z-10">
              <div>
                <p className="text-xs text-primary font-bold uppercase tracking-widest mb-1">Free Quote</p>
                <h2 className="text-2xl font-display font-bold">Tell Us About Your Project</h2>
              </div>
              <button onClick={handleClose} className="mt-1 p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background" data-testid="button-close-modal" aria-label="Close quote modal">
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitted ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                  <Send className="w-9 h-9 text-primary" />
                </div>
                <h3 className="text-2xl font-display font-bold mb-3">Opening WhatsApp...</h3>
                <p className="text-muted-foreground mb-8">Your enquiry is pre-filled in WhatsApp. Just hit send and the Primesign team will get back to you shortly.</p>
                <Button onClick={handleClose} variant="outline" className="rounded-full px-8 border-white/20">
                  Close
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 py-8 space-y-6">

                {/* Contact info */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Your Contact Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className={labelClass}>Full Name *</label>
                      <Input required value={form.name} onChange={set("name")} placeholder="Rajesh Kumar" className={inputClass} data-testid="input-name" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className={labelClass}>Phone / WhatsApp *</label>
                      <Input required value={form.phone} onChange={set("phone")} placeholder="+91 98765 43210" className={inputClass} data-testid="input-phone" />
                    </div>
                    <div className="col-span-2">
                      <label className={labelClass}>Email Address</label>
                      <Input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" className={inputClass} data-testid="input-email" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10" />

                {/* Business info */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Your Business</h3>
                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>Business / Brand Name *</label>
                      <Input required value={form.businessName} onChange={set("businessName")} placeholder="e.g. Sunrise Cafe" className={inputClass} data-testid="input-business-name" />
                    </div>
                    <div>
                      <label className={labelClass}>Type of Business</label>
                      <select value={form.businessType} onChange={set("businessType")} className={selectClass} data-testid="select-business-type">
                        <option value="">Select your industry...</option>
                        {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Location / Area in Bangalore</label>
                      <Input value={form.location} onChange={set("location")} placeholder="e.g. Koramangala, Whitefield..." className={inputClass} data-testid="input-location" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10" />

                {/* Services */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Services You Need</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {SERVICES.map((s) => {
                      const active = services.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleService(s)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-left text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${
                            active
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-white/10 bg-background/40 text-muted-foreground hover:border-white/30"
                          }`}
                          data-testid={`checkbox-service-${s.replace(/\s+/g, "-")}}`}
                          aria-pressed={active}
                        >
                          {active ? <CheckSquare className="w-4 h-4 text-primary shrink-0" /> : <Square className="w-4 h-4 shrink-0" />}
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-white/10" />

                {/* Timeline + details */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Project Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>When do you need this done?</label>
                      <div className="grid grid-cols-2 gap-2">
                        {TIMELINES.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, timeline: t }))}
                            className={`px-3 py-2.5 rounded-lg border text-left text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${
                              form.timeline === t
                                ? "border-primary bg-primary/10 text-foreground"
                                : "border-white/10 bg-background/40 text-muted-foreground hover:border-white/30"
                            }`}
                            data-testid={`button-timeline-${t}`}
                            role="radio"
                            aria-checked={form.timeline === t}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Describe Your Requirements</label>
                      <Textarea
                        value={form.details}
                        onChange={set("details")}
                        placeholder="Size of the sign, number of locations, any specific design ideas, special requirements..."
                        className="min-h-[110px] bg-background/60 border-white/10 focus:border-primary/60 resize-none"
                        data-testid="textarea-details"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 rounded-full font-bold uppercase tracking-wide text-lg box-glow"
                  data-testid="button-submit-quote"
                >
                  Send via WhatsApp <Send className="ml-2 w-5 h-5" />
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Tapping the button opens WhatsApp with your details pre-filled. No spam — we'll only use this to prepare your quote.
                </p>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
