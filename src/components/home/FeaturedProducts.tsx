import { useState, useMemo, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Product } from "@/data/products";
import ProductCard from "@/components/product/ProductCard";
import ProductModal from "@/components/product/ProductModal";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/context/AdminContext";
import { productService } from "@/services/productService";

const FeaturedProducts = () => {
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [activeMobileId, setActiveMobileId] = useState<number | null>(null);

  const handleMobileClick = (id: number) => {
    setActiveMobileId(prev => prev === id ? null : id);
  };

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

  const featuredProducts = useMemo(() => {
    let result = allProducts.filter(p => p.rating > 4.5);
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
        description: isOwner ? "Removed from elite lineup." : "Pending owner confirmation."
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

      toast({ title: "Action Verified", description: " Elite drop is now official." });
    } catch (error) {
      console.error("Verification failed:", error);
      const data = await productService.getProducts();
      setAllProducts(data);
      toast({ title: "Error", description: "Failed to verify.", variant: "destructive" });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 60, opacity: 0, scale: 0.9 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        type: "spring" as const,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <section className="py-32 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none select-none">
        <h2 className="text-[30vw] font-black tracking-tighter text-foreground/5">NIKE</h2>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-20"
        >
          <div className="max-w-xl">
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-accent font-black tracking-[0.4em] mb-4 uppercase text-xs"
            >
              Curated Selection
            </motion.p>
            <h2 className="font-heading text-5xl md:text-7xl font-black leading-tight tracking-tighter uppercase">
              THE <span className="text-muted-foreground/30">ELITE</span> LINEUP
            </h2>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Button asChild variant="ghost" className="mt-8 md:mt-0 group hover:bg-transparent px-0">
              <Link to="/shop" className="flex items-center gap-4 font-black tracking-tighter text-lg group">
                EXPLORE FULL DROP
                <motion.div
                  whileHover={{ x: 10 }}
                  className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-all group-hover:bg-accent"
                >
                  <ArrowRight className="w-6 h-6" />
                </motion.div>
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex gap-8 overflow-x-auto pb-12 -mx-4 px-4 scrollbar-hide snap-x"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[300px] md:w-[420px] aspect-[4/5] bg-secondary/30 rounded-3xl animate-pulse" />
            ))
          ) : featuredProducts.map((product) => (


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

export default FeaturedProducts;
