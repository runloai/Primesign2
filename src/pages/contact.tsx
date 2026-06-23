import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
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
                    <a href="tel:+916366525253" className="block text-xl font-medium hover:text-primary transition-colors">+91 63665 25253</a>
                    <a href="tel:+918861848284" className="block text-xl font-medium hover:text-primary transition-colors">+91 88618 48284</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm text-muted-foreground uppercase tracking-wider font-bold mb-1">Email Us</h3>
                    <a href="mailto:primesign2021@gmail.com" className="block text-xl font-medium hover:text-primary transition-colors break-all">primesign2021@gmail.com</a>
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
                      Bangalore, Karnataka, India<br />
                      <a href="https://g.co/kgs/Usqtga" target="_blank" rel="noopener noreferrer" className="text-primary text-sm uppercase tracking-wider mt-2 inline-block hover:underline">Get Directions &rarr;</a>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm text-muted-foreground uppercase tracking-wider font-bold mb-1">Business Hours</h3>
                    <p className="text-lg font-medium">Monday - Saturday: 9:00 AM - 7:00 PM</p>
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
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Name</label>
                    <Input placeholder="John Doe" className="h-12 bg-background border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Phone Number</label>
                    <Input placeholder="+91 00000 00000" className="h-12 bg-background border-white/10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Service Required</label>
                  <select className="flex h-12 w-full items-center justify-between rounded-md border border-white/10 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="" disabled selected hidden>Select a service</option>
                    <option value="led">LED Signs</option>
                    <option value="3d">3D Channel Letters</option>
                    <option value="neon">Neon Signs</option>
                    <option value="acrylic">Acrylic Signs</option>
                    <option value="hoarding">Outdoor Hoardings</option>
                    <option value="corporate">Corporate Branding</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Project Details</label>
                  <Textarea placeholder="Tell us about your requirements..." className="min-h-[120px] bg-background border-white/10 resize-none" />
                </div>
                <Button type="submit" size="lg" className="w-full h-14 rounded-full font-bold uppercase tracking-wide text-lg box-glow">
                  Submit Enquiry <Send className="ml-2 w-5 h-5" />
                </Button>
              </form>
            </div>
            
            {/* Embedded Map Visual Placeholder */}
            <div className="rounded-3xl overflow-hidden border border-white/10 aspect-[2/1] relative group bg-muted flex items-center justify-center">
               <div className="text-center p-6 z-10">
                 <MapPin className="w-10 h-10 text-primary mx-auto mb-4" />
                 <h3 className="font-display font-bold text-xl mb-2">View on Google Maps</h3>
                 <a href="https://g.co/kgs/Usqtga" target="_blank" rel="noopener noreferrer" className="text-sm uppercase tracking-wider text-muted-foreground hover:text-white transition-colors underline">Click to open map</a>
               </div>
               <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors pointer-events-none"></div>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
