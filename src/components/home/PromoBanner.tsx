import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const PromoBanner = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-brand-gray to-primary min-h-[400px] md:min-h-[500px]">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src="/assets/images/photo-1556906781-9a412961c28c.jpg"
              alt="Promo background"
              className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 p-8 md:p-16 flex flex-col justify-center h-full min-h-[400px] md:min-h-[500px]">
            <div className="max-w-xl">
              <p className="text-accent font-black tracking-[0.3em] mb-4 uppercase text-xs">
                LIMITED EDITION
              </p>
              <h2 className="font-heading text-4xl md:text-5xl lg:text-7xl font-black text-white mb-6 leading-[0.9] tracking-tighter italic">
                GET 30% OFF
                <br />
                YOUR FIRST ORDER
              </h2>
              <p className="text-white/70 text-lg mb-8 max-w-sm font-medium">
                Use code <span className="font-bold text-accent">STORM30</span> at checkout.
                Elevate your game with elite performance.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold h-14 px-8"
              >
                <Link to="/shop">
                  CLAIM OFFER
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-1/2 right-10 -translate-y-1/2 hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/30 blur-3xl rounded-full transform scale-150" />
              <img
                src="/assets/images/photo-1606107557195-0e29a4b5b4aa.jpg"
                alt="Featured shoe"
                className="relative w-80 h-80 object-contain transform rotate-12 drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Countdown Timer Placeholder */}
          <div className="absolute bottom-8 right-8 hidden md:flex gap-4">
            {[
              { value: "02", label: "Days" },
              { value: "14", label: "Hours" },
              { value: "36", label: "Mins" },
              { value: "28", label: "Secs" },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-background/10 backdrop-blur-sm rounded-lg p-4 text-center min-w-[70px]"
              >
                <p className="font-heading text-2xl font-bold text-primary-foreground">
                  {item.value}
                </p>
                <p className="text-primary-foreground/60 text-xs uppercase tracking-wide">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
