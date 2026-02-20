import { Target, Zap, Heart, Award } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartSidebar from "@/components/cart/CartSidebar";
import WishlistSidebar from "@/components/wishlist/WishlistSidebar";
import { useWishlist } from "@/context/WishlistContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const About = () => {
  const values = [
    {
      icon: Zap,
      title: "Innovation",
      description: "Pushing the boundaries of athletic performance with cutting-edge technology.",
    },
    {
      icon: Target,
      title: "Performance",
      description: "Every product is engineered to help athletes reach their full potential.",
    },
    {
      icon: Heart,
      description: "Born from a love for sports and a drive to excel in everything we do.",
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Committed to the highest standards of quality and craftsmanship.",
    },
  ];

  const { isWishlistOpen, setIsWishlistOpen } = useWishlist();
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CartSidebar />
      <WishlistSidebar isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-center hero-gradient overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="/assets/images/photo-1571902943202-507ec2618e8f.jpg"
              alt="Athletes training"
              className="w-full h-full object-cover opacity-20"
            />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl">
              <p className="text-accent font-semibold tracking-widest mb-4">OUR STORY</p>
              <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-foreground dark:text-white mb-6 italic">
                BORN TO
                <br />
                <span className="text-accent">MOVE</span>
              </h1>
              <p className="text-xl text-muted-foreground dark:text-white/70 max-w-xl">
                Since 2024, we've been on a mission to empower athletes worldwide.
                From the track to the court, every step counts.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-accent font-semibold tracking-widest mb-2">OUR MISSION</p>
                <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">
                  EMPOWERING EVERY ATHLETE
                </h2>
                <p className="text-muted-foreground text-lg mb-6">
                  We believe that if you have a body, you're an athlete. Our mission is to bring
                  inspiration and innovation to every athlete in the world. From elite professionals
                  to weekend warriors, we're here to help you push your limits.
                </p>
                <p className="text-muted-foreground text-lg mb-8">
                  Every shoe we create is the result of countless hours of research, testing,
                  and refinement. We work with top athletes and sports scientists to develop
                  technology that truly makes a difference in performance.
                </p>
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link to="/shop">EXPLORE COLLECTION</Link>
                </Button>
              </div>
              <div className="relative">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden">
                  <img
                    src="/assets/images/photo-1552674605-db6ffd4facb5.jpg"
                    alt="Athlete running"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-accent text-accent-foreground p-6 rounded-xl max-w-xs">
                  <p className="font-heading text-3xl font-bold mb-1">500K+</p>
                  <p className="text-accent-foreground/80">Athletes trust Storm worldwide</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <p className="text-accent font-semibold tracking-widest mb-2">OUR VALUES</p>
              <h2 className="font-heading text-4xl md:text-5xl font-bold">
                WHAT DRIVES US
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div
                  key={value.title}
                  className="bg-background p-8 rounded-xl text-center hover-lift"
                >
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <value.icon className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="font-heading text-xl font-bold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Athlete Banner */}
        <section className="relative py-32 overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="/assets/images/photo-1571902943202-507ec2618e8f.jpg"
              alt="Stadium"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-2xl">
              <blockquote className="mb-8">
                <p className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                  "THE ONLY LIMIT IS THE ONE YOU SET YOURSELF."
                </p>
              </blockquote>
              <p className="text-white/70 text-lg">
                — Every Storm Athlete
              </p>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <p className="text-accent font-semibold tracking-widest mb-2">OUR JOURNEY</p>
              <h2 className="font-heading text-4xl md:text-5xl font-bold">
                MILESTONES
              </h2>
            </div>
            <div className="max-w-3xl mx-auto">
              {[
                { year: "2024", title: "The Beginning", description: "Storm was founded with a vision to revolutionize athletic footwear." },
                { year: "2024", title: "First Collection", description: "Launched our debut collection featuring groundbreaking cushioning technology." },
                { year: "2024", title: "Global Expansion", description: "Expanded to over 50 countries, reaching athletes worldwide." },
                { year: "2025", title: "Innovation Lab", description: "Opened our state-of-the-art research and development facility." },
              ].map((milestone, index) => (
                <div key={index} className="flex gap-8 mb-12 last:mb-0">
                  <div className="flex-shrink-0 w-24">
                    <span className="font-heading text-2xl font-bold text-accent">
                      {milestone.year}
                    </span>
                  </div>
                  <div className="flex-1 pb-12 border-l-2 border-border pl-8 relative">
                    <div className="absolute -left-2 top-0 w-4 h-4 bg-accent rounded-full" />
                    <h3 className="font-heading text-xl font-bold mb-2">{milestone.title}</h3>
                    <p className="text-muted-foreground">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
