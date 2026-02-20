import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube, Mail, Loader2, ArrowUpRight, Github, Linkedin, Globe, Lock, Unlock, Save, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useAdmin } from "@/context/AdminContext";
import { settingsService, SocialLink } from "@/services/settingsService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAdmin, isOwner, verifyAdmin, logoutAdmin } = useAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dynamicSocialLinks, setDynamicSocialLinks] = useState<SocialLink[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSocials = async () => {
      const links = await settingsService.getSocialLinks();
      if (links) {
        setDynamicSocialLinks(links);
      } else {
        // Fallback to defaults
        setDynamicSocialLinks([
          { iconName: "Facebook", href: "https://facebook.com/storm", label: "Facebook" },
          { iconName: "Twitter", href: "https://twitter.com/storm", label: "Twitter" },
          { iconName: "Instagram", href: "https://instagram.com/storm", label: "Instagram" },
          { iconName: "Youtube", href: "https://youtube.com/storm", label: "YouTube" },
        ]);
      }
    };
    fetchSocials();
  }, []);

  const iconMap: Record<string, any> = {
    Facebook,
    Twitter,
    Instagram,
    Youtube,
    Github,
    Linkedin,
    Globe,
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "subscribers"), {
        email: email.toLowerCase(),
        subscribedAt: serverTimestamp(),
        source: "Footer"
      });

      toast({
        title: "Subscribed!",
        description: "Thanks for joining the movement.",
      });
      setEmail("");
    } catch (error) {
      console.error("Error subscribing:", error);
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const footerLinks = {
    shop: [
      { name: "Running", path: "/shop?category=running" },
      { name: "Basketball", path: "/shop?category=basketball" },
      { name: "Casual", path: "/shop?category=casual" },
      { name: "New Arrivals", path: "/shop?new=true" },
    ],
    support: [
      { name: "Contact Us", path: "/contact" },
      { name: "FAQ", path: "#" },
      { name: "Shipping", path: "#" },
      { name: "Returns", path: "#" },
    ],
    company: [
      { name: "About Us", path: "/about" },
      { name: "Careers", path: "#" },
      { name: "Press", path: "#" },
      { name: "Sustainability", path: "#" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com/storm", label: "Facebook" },
    { icon: Twitter, href: "https://twitter.com/storm", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com/storm", label: "Instagram" },
    { icon: Youtube, href: "https://youtube.com/storm", label: "YouTube" },
  ];

  const handleComingSoon = (e: React.MouseEvent, name: string) => {
    e.preventDefault();
    toast({
      title: "Coming Soon!",
      description: `${name} section is under development and will be available soon.`,
    });
  };

  const handleLockClick = () => {
    if (!isAdmin) {
      const pass = prompt("Enter owner password:");
      if (pass) {
        const success = verifyAdmin(pass);
        if (success) {
          setIsEditing(true);
        }
      }
    } else {
      setIsEditing(!isEditing);
    }
  };

  const handleAddPlatform = () => {
    setDynamicSocialLinks([
      ...dynamicSocialLinks,
      { iconName: "Globe", href: "https://", label: "New Platform" }
    ]);
  };

  const handleDeletePlatform = (index: number) => {
    setDynamicSocialLinks(dynamicSocialLinks.filter((_, i) => i !== index));
  };

  const handleLinkUpdate = (index: number, field: keyof SocialLink, value: string) => {
    const newLinks = [...dynamicSocialLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setDynamicSocialLinks(newLinks);
  };

  const handleSaveSocials = async () => {
    setIsSaving(true);
    const success = await settingsService.updateSocialLinks(dynamicSocialLinks);
    if (success) {
      toast({ title: "Updated!", description: "Social links have been saved." });
      setIsDialogOpen(false);
    } else {
      toast({ title: "Error", description: "Failed to save links.", variant: "destructive" });
    }
    setIsSaving(false);
  };

  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...dynamicSocialLinks];
    newLinks[index].href = value;
    setDynamicSocialLinks(newLinks);
  };

  return (
    <footer className="bg-[#050505] text-white relative overflow-hidden border-t border-white/5">
      {/* Background Accent */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-accent" />

      {/* Newsletter Section */}
      <div className="border-b border-white/5 bg-white/[0.02] backdrop-blur-3xl">
        <div className="container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <h3 className="font-heading text-4xl md:text-5xl font-black mb-4 tracking-tighter text-white">
                JOIN THE <span className="text-accent underline decoration-4 decoration-accent/20">MOVEMENT</span>
              </h3>
              <p className="text-xl text-white/60 max-w-lg font-medium leading-relaxed">
                Be the first to secure exclusive drops, athlete stories, and performance insights.
              </p>
            </div>
            <div className="lg:col-span-5">
              <form onSubmit={handleSubscribe} className="relative">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-16 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-2xl pl-6 pr-40 text-lg focus:ring-accent"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="absolute right-2 top-2 h-12 bg-accent text-accent-foreground font-black px-8 rounded-xl shadow-lg transition-all"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "SUBSCRIBE"
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-8 group">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center shadow-xl transition-all"
              >
                <span className="text-accent-foreground font-heading font-black text-2xl">S</span>
              </motion.div>
              <span className="font-heading text-3xl font-black tracking-tighter uppercase italic text-white">
                STORM
              </span>
            </Link>
            <p className="text-white/50 mb-10 max-w-sm text-lg leading-relaxed font-medium">
              We engineer the future of movement. Elevating athletic potential through relentless innovation and elite design.
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                {dynamicSocialLinks.map((social) => {
                  const Icon = iconMap[social.iconName] || Globe;
                  return (
                    <motion.a
                      key={social.label + social.href}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ y: -5, backgroundColor: "hsl(var(--accent))", color: "white" }}
                      className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center transition-all duration-300 border border-white/10 text-white hover:bg-accent"
                      aria-label={social.label}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.a>
                  );
                })}
              </div>

              {/* Admin/Owner Role Info */}
              {isAdmin && (
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black tracking-[0.2em] text-accent uppercase mb-1">
                      {isOwner ? "MASTER OWNER" : "STAFF ADMIN"}
                    </span>
                    <div className="flex gap-2">
                      {isOwner && isEditing && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsDialogOpen(true)}
                          className="h-6 px-3 border-white/10 hover:bg-white/5 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all rounded-md"
                        >
                          Edit Socials
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={logoutAdmin}
                        className="h-6 px-3 text-[9px] font-black uppercase tracking-widest text-red-500/50 hover:text-red-500 hover:bg-red-500/5 transition-all rounded-md"
                      >
                        Logout
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Links Column */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-heading font-black text-xs uppercase tracking-[0.3em] text-accent mb-8">{title}</h4>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-white/50 hover:text-accent transition-all duration-300 flex items-center gap-2 group font-bold text-sm"
                      onClick={(e) => link.path === "#" && handleComingSoon(e, link.name)}
                    >
                      <span className="relative">
                        {link.name}
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
                      </span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -translate-y-1" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5 py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-xs font-black uppercase tracking-widest text-white/20">
            <p>© 2026 STORM LABS. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-10 items-center">
              <a href="#" className="hover:text-accent transition-colors text-xs">Privacy</a>
              <a href="#" className="hover:text-accent transition-colors text-xs">Terms</a>
              <a href="#" className="hover:text-accent transition-colors text-xs">Cookies</a>

              {/* Admin Lock/Unlock Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLockClick}
                className={`h-8 w-8 rounded-lg ml-4 transition-all duration-500 opacity-0 ${isEditing ? "bg-accent/20 text-accent" : "text-white"
                  }`}
                title={isEditing ? "Lock Editor" : "Unlock Social Editor"}
              >
                {isAdmin && isEditing ? (
                  <Unlock className="w-4 h-4" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Social Media Editor Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-zinc-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic tracking-tighter">SOCIAL PLATFORMS</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Manage your social media presence here.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4 max-h-[300px] overflow-y-auto pr-2">
            {dynamicSocialLinks.map((social, index) => (
              <div key={index} className="flex gap-2 items-center bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Label (e.g. Instagram)"
                      value={social.label}
                      onChange={(e) => handleLinkUpdate(index, "label", e.target.value)}
                      className="h-9 bg-zinc-950 border-white/10 text-xs"
                    />
                    <Input
                      placeholder="Icon (Facebook, Youtube, etc.)"
                      value={social.iconName}
                      onChange={(e) => handleLinkUpdate(index, "iconName", e.target.value)}
                      className="h-9 bg-zinc-950 border-white/10 text-xs w-32"
                    />
                  </div>
                  <Input
                    placeholder="URL (https://...)"
                    value={social.href}
                    onChange={(e) => handleLinkUpdate(index, "href", e.target.value)}
                    className="h-9 bg-zinc-950 border-white/10 text-xs"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeletePlatform(index)}
                  className="text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <DialogFooter className="flex flex-row justify-between sm:justify-between items-center bg-zinc-950 -mx-6 -mb-6 p-6 rounded-b-lg border-t border-white/10">
            <Button
              variant="outline"
              onClick={handleAddPlatform}
              className="border-white/10 hover:bg-white/5 text-xs h-9"
            >
              <Plus className="w-4 h-4 mr-2" />
              ADD PLATFORM
            </Button>
            <Button
              onClick={handleSaveSocials}
              disabled={isSaving}
              className="bg-accent text-accent-foreground font-black px-6 hover:scale-105 transition-all text-xs h-9"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              SAVE CHANGES
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </footer>
  );
};

export default Footer;

