import { useState } from "react";
import { Mail, Phone, MapPin, Send, Clock, Facebook, Twitter, Instagram } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartSidebar from "@/components/cart/CartSidebar";
import WishlistSidebar from "@/components/wishlist/WishlistSidebar";
import { useWishlist } from "@/context/WishlistContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const Contact = () => {
  const { isWishlistOpen, setIsWishlistOpen } = useWishlist();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "messages"), {
        ...formData,
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Message sent!",
        description: "We'll get back to you as soon as possible. Thanks for visiting from Swapnil ;) ",
      });

      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error sending message",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      content: "support@storm.com",
      subtext: "We respond within 24 hours",
    },
    {
      icon: Phone,
      title: "Call Us",
      content: "+91 (555) 123-4567",
      subtext: "Mon-Sat, 9am-6pm IST",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      content: "JSPM Wagholi College",
      subtext: "Pune, Maharashtra, India",
    },
    {
      icon: Clock,
      title: "Store Hours",
      content: "Mon-Sat: 10am-9pm",
      subtext: "Sunday: Closed",
    },
  ];

  // Social media handles - Add your links here when ready
  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com/storm", label: "Facebook" },
    { icon: Twitter, href: "https://twitter.com/storm", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com/storm", label: "Instagram" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CartSidebar />
      <WishlistSidebar isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 hero-gradient">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-accent font-black tracking-[0.3em] mb-4 uppercase text-xs">GET IN TOUCH</p>
              <h1 className="font-heading text-5xl md:text-6xl lg:text-8xl font-black text-foreground dark:text-white mb-6 italic tracking-tighter">
                CONTACT US
              </h1>
              <p className="text-xl text-muted-foreground dark:text-white/70 max-w-xl mx-auto font-medium">
                Have questions? We'd love to hear from you. Send us a message
                and we'll respond as soon as possible.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-16 bg-background -mt-10 relative z-10">
          <div className="container mx-auto px-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 -mt-20">
              {contactInfo.map((info) => (
                <div
                  key={info.title}
                  className="bg-card p-6 rounded-xl shadow-card hover-lift text-center"
                >
                  <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <info.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-semibold mb-2">{info.title}</h3>
                  <p className="font-medium">{info.content}</p>
                  <p className="text-sm text-muted-foreground">{info.subtext}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & Map */}
        <section className="py-20 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="bg-background p-8 md:p-12 rounded-2xl shadow-card">
                <h2 className="font-heading text-3xl font-bold mb-2">
                  SEND US A MESSAGE
                </h2>
                <p className="text-muted-foreground mb-8">
                  Fill out the form below and we'll get back to you shortly.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">
                        Your Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                        className="h-12"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        required
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help?"
                      required
                      className="h-12"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Your message..."
                      required
                      rows={6}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "SENDING..."
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        SEND MESSAGE
                      </>
                    )}
                  </Button>
                </form>
              </div>

              {/* Map & Info */}
              <div className="space-y-8">
                {/* Map Placeholder */}
                <div className="bg-muted rounded-2xl overflow-hidden aspect-video relative">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-secondary">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-accent mx-auto mb-4" />
                      <p className="font-heading text-xl font-bold">Storm Flagship Store</p>
                      <p className="text-muted-foreground">JSPM Wagholi College, Pune, India</p>
                    </div>
                  </div>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3782.1648483849!2d73.9781198!3d18.5756087!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c395a14fbaef%3A0x6e9f1a0e1c2a3b4e!2sJSPM&#39;s%20Imperial%20College%20of%20Engineering%20and%20Research!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0 opacity-50"
                  />
                </div>

                {/* Social Links */}
                <div className="bg-background p-8 rounded-2xl">
                  <h3 className="font-heading text-xl font-bold mb-4">
                    FOLLOW US
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Stay connected and get the latest updates on new releases
                    and exclusive offers.
                  </p>
                  <div className="flex gap-4">
                    {socialLinks.map((social) => (
                      <a
                        key={social.label}
                        href={social.href}
                        className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors duration-300"
                        aria-label={social.label}
                      >
                        <social.icon className="w-5 h-5" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* FAQ Link */}
                <div className="bg-primary text-primary-foreground p-8 rounded-2xl">
                  <h3 className="font-heading text-xl font-bold mb-2">
                    NEED QUICK ANSWERS?
                  </h3>
                  <p className="text-primary-foreground/70 mb-4">
                    Check out our FAQ section for answers to common questions
                    about orders, shipping, and returns.
                  </p>
                  <Button variant="secondary" className="font-semibold">
                    VIEW FAQ
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
