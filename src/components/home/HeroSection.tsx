import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const HeroSection = () => {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-12, 10]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 40, opacity: 0, filter: "blur(10px)" },
    visible: {
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        duration: 1,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center overflow-hidden bg-background"
    >
      {/* Cinematic Background Mesh */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ willChange: "transform" }}
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-accent/10 blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          style={{ willChange: "transform" }}
          className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[100px] dark:bg-accent/5"
        />
      </div>

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07]"
        style={{
          backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px),
                           linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ y: y2 }}
            className="lg:col-span-7 text-left"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/50 backdrop-blur-md border border-border mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live: New Storm Drop</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="font-heading text-6xl md:text-8xl lg:text-9xl font-black leading-[0.85] mb-8 tracking-tighter uppercase italic"
            >
              LIMITED
              <br />
              <span className="text-accent underline decoration-8 decoration-accent/20">EDITION</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10 font-medium leading-relaxed"
            >
              Experience the fusion of elite performance and street aesthetics.
              Our most advanced cushioning system ever engineered.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-5"
            >
              <Button
                asChild
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground font-black h-16 px-10 text-lg rounded-full shadow-2xl transition-all duration-500 hover:scale-105"
              >
                <Link to="/shop">
                  SHOP COLLECTION
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-border bg-background/50 backdrop-blur-md hover:bg-secondary h-16 px-10 text-lg rounded-full font-bold shadow-xl transition-all duration-500 border-2"
              >
                <Link to="/about" className="flex items-center gap-3">
                  <Play className="w-4 h-4 fill-current" />
                  VIEW STORY
                </Link>
              </Button>
            </motion.div>

            {/* Premium Stats */}
            <motion.div
              variants={itemVariants}
              className="flex gap-12 mt-16"
            >
              <div className="flex flex-col">
                <span className="text-3xl font-black italic tracking-tighter text-foreground">0.3s</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Reaction Time</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-black italic tracking-tighter text-foreground">180g</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ultra Light</span>
              </div>
              <div className="flex flex-col border-l border-white/10 pl-12 hidden md:flex">
                <span className="text-3xl font-black italic tracking-tighter text-foreground">∞</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Endurance</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Cinematic Image Hero */}
          <div className="lg:col-span-5 relative -mt-16 lg:mt-0">
            <motion.div
              style={{ y: y1, rotate }}
              className="relative z-20 max-w-[80%] mx-auto lg:max-w-none"
            >
              {/* Floating Mesh Background behind shoe */}
              <div className="absolute inset-0 bg-accent/20 blur-[100px] rounded-full scale-125 -z-10" />

              <motion.img
                initial={{ scale: 0.8, opacity: 0, rotate: -30 }}
                animate={{ scale: 1, opacity: 1, rotate: -12 }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{
                  scale: 1.1,
                  rotate: 0,
                  transition: { type: "spring", stiffness: 300, damping: 20 }
                }}
                src="/assets/images/photo-1542291026-7eec264c27ff.jpg"
                alt="Storm Runner X"
                decoding="async"
                // @ts-ignore
                fetchPriority="high"
                className="w-full h-auto drop-shadow-[0_50px_50px_rgba(0,0,0,0.5)] cursor-none"
              />

              {/* Dynamic Overlay Tags */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 md:-top-10 md:-right-10 bg-accent text-accent-foreground px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl font-black shadow-2xl rotate-12 text-[10px] md:text-base scale-75 md:scale-100"
              >
                STORM X-1
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-6 -left-6 md:bottom-10 md:-left-10 bg-background/80 backdrop-blur-xl border border-white/10 px-3 py-2 md:px-8 md:py-5 rounded-xl md:rounded-3xl shadow-3xl scale-75 md:scale-100"
              >
                <div className="flex items-center gap-2 md:gap-4">
                  <div className="w-6 h-6 md:w-12 md:h-12 rounded-full bg-accent/20 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 md:w-3 md:h-3 bg-accent rounded-full" />
                  </div>
                  <div>
                    <p className="text-[8px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest">Price Point</p>
                    <p className="text-base md:text-2xl font-black">$249.00</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Massive Background Headline */}
            <motion.h2
              style={{ opacity }}
              className="absolute -top-10 -right-20 md:-top-20 md:-right-40 text-[15vw] md:text-[20vw] font-black text-foreground/5 select-none -z-10 leading-none whitespace-nowrap"
            >
              RUNNING
            </motion.h2>
          </div>
        </div>
      </div>

      {/* Modern Scroll Progress */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
      >
        <div className="w-px h-24 bg-gradient-to-t from-accent to-transparent relative overflow-hidden">
          <motion.div
            animate={{ y: ["-100%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 w-full h-1/2 bg-black dark:bg-white"
          />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">SCROLL</span>
      </motion.div>
    </section>
  );
};

export default HeroSection;

