import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Clock, Send, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

export default function ContactPage() {
  const [config, setConfig] = useState<{ contact?: any; settings?: any } | null>(null);

  useEffect(() => {
    const readJson = async (url: string) => {
      const response = await fetch(url);
      const contentType = response.headers.get("content-type") || "";
      if (!response.ok || !contentType.includes("application/json")) return null;
      return response.json();
    };
    readJson("/api/config?t=" + Date.now())
      .then(c => c || readJson("/config.json?t=" + Date.now()))
      .then(c => setConfig(c))
      .catch(() => {});
  }, []);

  const contact = config?.contact || {};
  const settings = config?.settings || {};

  const phones = contact.phones || ["+91 6366525253", "+91 8861848284"];
  const emails = contact.emails || ["primesign2021@gmail.com"];
  const address = contact.address || "#35, Ramamurthy Nagar Signal, T C Palya Main Road, Bangalore 560016";
  const mapsUrl = contact.mapsUrl || "https://maps.google.com/?q=Primesign+Ramamurthy+Nagar+Bangalore";
  const whatsappNumber = contact.whatsapp || contact.phones?.[0] || "6366525253";
  const workingHours = settings.workingHours || "Monday - Saturday: 9:00 AM - 7:00 PM";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    service: "",
    message: "",
  });
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = [
      `*New Enquiry - PrimeSign*`,
      ``,
      `*Name:* ${formData.name}`,
      `*Email:* ${formData.email}`,
      `*Phone:* ${formData.phone}`,
      formData.address ? `*Address:* ${formData.address}` : null,
      formData.service ? `*Service Required:* ${formData.service}` : null,
      ``,
      `*Message:*`,
      formData.message,
      file ? `\n*Attachment:* ${file.name}` : null,
    ].filter(Boolean).join("\n");

    const waNumber = (whatsappNumber || "6366525253").replace(/[^\d]/g, '');
    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(lines)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 pt-10">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 tracking-tight">LET'S TALK.</h1>
          <p className="text-xl text-muted-foreground font-light">
            Have a project in mind? Reach out to Bangalore's premier signage experts. We're ready to bring your vision to light.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24">
          
          {/* Contact Info */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-10"
          >
            <div>
              <h2 className="text-2xl font-display font-bold uppercase tracking-wider mb-8">Contact Information</h2>
              <div className="space-y-8">
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm text-muted-foreground uppercase tracking-wider font-bold mb-1">Call / WhatsApp</h3>
                    {phones.map((phone: string, i: number) => (
                      <a key={i} href={`tel:${phone.replace(/\s/g, '')}`} className="block text-xl font-medium hover:text-primary transition-colors">{phone}</a>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm text-muted-foreground uppercase tracking-wider font-bold mb-1">Email Us</h3>
                    {emails.map((email: string, i: number) => (
                      <a key={i} href={`mailto:${email}`} className="block text-xl font-medium hover:text-primary transition-colors break-all">{email}</a>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm text-muted-foreground uppercase tracking-wider font-bold mb-1">Our Location</h3>
                    <p className="text-lg font-medium leading-relaxed">
                      Primesign Private Limited<br />
                      {address}<br />
                      <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-primary text-sm uppercase tracking-wider mt-2 inline-block hover:underline">Get Directions &rarr;</a>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm text-muted-foreground uppercase tracking-wider font-bold mb-1">Business Hours</h3>
                    <p className="text-lg font-medium" dangerouslySetInnerHTML={{ __html: workingHours }} />
                  </div>
                </div>

              </div>
            </div>
          </motion.div>

          {/* Form & Map */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-10"
          >
            <div className="bg-card border border-white/5 rounded-3xl p-8 md:p-10 shadow-xl">
              <h2 className="text-2xl font-display font-bold uppercase tracking-wider mb-8">Send an Enquiry</h2>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Name *</Label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="h-12 bg-background border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Phone Number *</Label>
                    <Input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 00000 00000"
                      className="h-12 bg-background border-white/10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Email Address *</Label>
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="h-12 bg-background border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Address / Location</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Your address or area in Bangalore"
                    className="h-12 bg-background border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Message *</Label>
                  <Textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your project requirements..."
                    className="min-h-[120px] bg-background border-white/10 resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Attachment (Optional)</Label>
                  <Input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFile(e.target.files[0]);
                      }
                    }}
                    accept="image/*,.pdf,.doc,.docx"
                    className="h-12 bg-background border-white/10 file:bg-primary/10 file:text-primary file:border-0 file:rounded-md"
                  />
                  {file && (
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                      <Upload className="w-3 h-3" />
                      {file.name}
                    </p>
                  )}
                </div>
                <Button type="submit" size="lg" className="w-full h-14 rounded-full font-bold uppercase tracking-wide text-lg box-glow">
                  Send via WhatsApp <Send className="ml-2 w-5 h-5" />
                </Button>
              </form>
            </div>
            
            {/* Embedded Map Visual Placeholder */}
            <div className="rounded-3xl overflow-hidden border border-white/10 aspect-[2/1] relative group bg-muted flex items-center justify-center">
               <div className="text-center p-6 z-10">
                 <MapPin className="w-10 h-10 text-primary mx-auto mb-4" />
                 <h3 className="font-display font-bold text-xl mb-2">View on Google Maps</h3>
                 <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-sm uppercase tracking-wider text-muted-foreground hover:text-white transition-colors underline">Click to open map</a>
               </div>
               <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors pointer-events-none"></div>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
