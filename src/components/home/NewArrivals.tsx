import { useState, useRef, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { Product } from "@/data/products";
import ProductCard from "@/components/product/ProductCard";
import ProductModal from "@/components/product/ProductModal";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/context/AdminContext";
import { productService } from "@/services/productService";

const NewArrivals = () => {
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [activeMobileId, setActiveMobileId] = useState<number | null>(null);

  const handleMobileClick = (id: number) => {
    setActiveMobileId(prev => prev === id ? null : id);
  };
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Dynamic State with Firebase
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const data = await productService.getProducts();
      setAllProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const { isAdmin, isOwner } = useAdmin();

  const newArrivals = useMemo(() => {
    let result = allProducts.filter(p => p.isNew);
    if (!isAdmin && !isOwner) {
      result = result.filter(p => p.isVerified);
    }
    return result;
  }, [allProducts, isAdmin, isOwner]);

  const handleDeleteProduct = async (productId: number) => {
    try {
      await productService.deleteProduct(productId, isAdmin, isOwner);
      const data = await productService.getProducts();
      setAllProducts(data);
      toast({
        title: isOwner ? "Product Deleted" : "Deletion Requested",
        description: isOwner ? "Removed from new arrivals." : "Pending owner confirmation."
      });
    } catch (error) {
      toast({ title: "Error", description: "Operation failed.", variant: "destructive" });
    }
  };

  const handleVerifyProduct = async (productId: number) => {
    try {
      if (!isOwner) return;

      // Optimistic update
      setAllProducts(prev => prev.map(p =>
        p.id === productId ? { ...p, isVerified: true, lastAction: undefined, isPendingDelete: false } : p
      ).filter(p => !(p.id === productId && p.lastAction === "delete")));

      await productService.verifyProductAction(productId, isOwner);

      // Secondary fetch with merge strategy
      setTimeout(async () => {
        const data = await productService.getProducts();
        setAllProducts(currentProducts => {
          return data.map(serverProd => {
            const localProd = currentProducts.find(lp => lp.id === serverProd.id);
            if (localProd && localProd.isVerified && !serverProd.isVerified) {
              return localProd;
            }
            return serverProd;
          });
        });
      }, 1000);

      toast({ title: "Action Verified", description: "This drop is now live." });
    } catch (error) {
      console.error("Verification failed:", error);
      const data = await productService.getProducts();
      setAllProducts(data);
      toast({ title: "Error", description: "Failed to verify.", variant: "destructive" });
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      // Precise scroll amount: card width (420) + gap (32)
      const scrollAmount = window.innerWidth < 768 ? 332 : 452;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { x: 100, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 20
      },
    },
  };

  return (
    <section className="py-32 bg-secondary/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-16"
        >
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-3 py-1 rounded-full mb-4"
            >
              <Zap className="w-3 h-3 fill-current" />
              <span className="text-[10px] font-black uppercase tracking-widest">Just Dropped</span>
            </motion.div>
            <h2 className="font-heading text-5xl md:text-7xl font-black leading-tight tracking-tighter uppercase italic">
              FRESH <span className="text-muted-foreground/20">EDITIONS</span>
            </h2>
          </div>
          <div className="flex gap-4 mt-8 md:mt-0">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("left")}
                className="h-16 w-16 rounded-3xl border-border bg-background shadow-xl hover:bg-accent hover:text-accent-foreground transition-all duration-300"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("right")}
                className="h-16 w-16 rounded-3xl border-border bg-background shadow-xl hover:bg-accent hover:text-accent-foreground transition-all duration-300"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          ref={scrollContainerRef}
          className="flex gap-8 overflow-x-auto pb-12 -mx-4 px-4 scrollbar-hide snap-x"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {newArrivals.map((product) => (


            <motion.div
              key={product.id}
              variants={itemVariants}
              className="flex-shrink-0 w-[300px] md:w-[420px] snap-start"
            >
              <ProductCard
                product={product}
                onViewDetails={setSelectedProduct}
                isAdmin={isAdmin}
                isOwner={isOwner}
                onDelete={handleDeleteProduct}
                onVerify={handleVerifyProduct}
                activeMobileId={activeMobileId}
                onMobileClick={handleMobileClick}
              />
            </motion.div>
          ))}
        </motion.div>

        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      </div>
    </section>
  );
};

export default NewArrivals;

