import { useState, useMemo, memo, useEffect } from "react";
import { Star, Heart, Eye, ShoppingCart, Trash2, CheckCircle, Pencil } from "lucide-react";
import { Product } from "@/data/products";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  isAdmin?: boolean;
  isOwner?: boolean;
  onDelete?: (id: number) => void;
  onVerify?: (id: number) => void;
  onEdit?: (product: Product) => void;
  activeMobileId?: number | null;
  onMobileClick?: (id: number) => void;
  selectedColors?: string[];
}

const ProductCard = memo(({
  product,
  onViewDetails,
  isAdmin,
  isOwner,
  onDelete,
  onVerify,
  onEdit,
  activeMobileId,
  onMobileClick,
  selectedColors
}: ProductCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { addToWishlist, removeFromWishlist, isInWishlist, setIsWishlistOpen } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const getBaseColor = (name: string) => {
    const standardColors = ["Navy", "Black", "White", "Red", "Blue", "Green", "Gray", "Grey", "Purple", "Orange", "Yellow", "Pink", "Gold", "Silver", "Brown"];
    const lower = name.toLowerCase();
    return standardColors.find(sc => lower.includes(sc.toLowerCase())) || name;
  };

  // Auto-select image based on filtered colors only when they change
  // This allows manual hover to override the filter selection until filters change again
  useEffect(() => {
    if (selectedColors && selectedColors.length > 0 && product.colors) {
      const matchIndex = product.colors.findIndex(c =>
        selectedColors.some(sc => getBaseColor(c.name).toLowerCase() === sc.toLowerCase())
      );
      if (matchIndex !== -1) {
        setActiveImageIndex(matchIndex);
      }
    } else {
      setActiveImageIndex(0);
    }
  }, [selectedColors, product.colors]);

  const isNewBadgeVisible = useMemo(() => {
    if (!product.isNew) return false;
    if (!product.createdAt) return true;

    const created = new Date(product.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    return diffDays <= 5;
  }, [product.isNew, product.createdAt]);

  const isLiked = isInWishlist(product.id);

  const showOverlay = isMobile
    ? (activeMobileId !== undefined ? activeMobileId === product.id : isHovered)
    : isHovered;

  const handleCardClick = () => {
    if (isMobile) {
      if (onMobileClick) {
        onMobileClick(product.id);
      } else {
        setIsHovered(!isHovered);
      }
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isLiked) {
      removeFromWishlist(product.id);
      toast({
        title: "Removed from favorites",
        description: `${product.name} has been removed from your favorites.`,
      });
    } else {
      addToWishlist(product);
      setIsWishlistOpen(true);
      toast({
        title: "Added to favorites",
        description: `${product.name} has been added to your favorites.`,
      });
    }
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultSize = product.sizes?.[0] || 0;
    const defaultColor = product.colors?.[activeImageIndex]?.name || product.colors?.[0]?.name || "Default";

    addToCart(product, defaultSize, defaultColor);

    toast({
      title: "Added to bag!",
      description: `${product.name} (Size: ${defaultSize}) added to your bag.`,
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(product.id);
  };

  const handleVerify = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onVerify) onVerify(product.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit(product);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "50px" }}
      whileHover={!isMobile ? { y: -10 } : {}}
      onHoverStart={() => !isMobile && setIsHovered(true)}
      onHoverEnd={() => !isMobile && setIsHovered(false)}
      onClick={handleCardClick}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="group bg-card rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-border/50 hover:border-accent/20 relative cursor-pointer"
    >
      <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/[0.03] transition-colors duration-500 pointer-events-none" />

      <div className="relative aspect-[4/5] bg-secondary/30 overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-secondary/50 animate-pulse" />
        )}

        <motion.img
          key={`${product.id}-${activeImageIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, scale: showOverlay ? 1.05 : 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          src={(product.images && product.images.length > 0) ? (product.images[activeImageIndex] || product.images[0]) : ""}
          alt={product.name}
          loading="lazy"
          className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setImageLoaded(true)}
        />

        <div className="absolute top-2 left-2 md:top-4 md:left-4 flex flex-col gap-2 md:gap-3 z-10">
          <AnimatePresence>
            {isNewBadgeVisible && (
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
                <Badge className="bg-accent text-accent-foreground font-black px-2 md:px-4 py-1 md:py-1.5 rounded-full text-[8px] md:text-[10px] tracking-widest shadow-lg uppercase border-none">
                  New Gen
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isOwner && !product.isVerified && (
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
                <Badge className="bg-orange-500 text-white font-black px-2 md:px-4 py-1 md:py-1.5 rounded-full text-[8px] md:text-[10px] tracking-widest shadow-lg uppercase border-none">
                  {product.lastAction === "delete" ? "Pending Delete" : "Pending Approval"}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isOwner && (
              <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} onClick={handleDelete} className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-background/80 backdrop-blur-md border border-border flex items-center justify-center text-red-500 shadow-xl z-30">
                <Trash2 className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isAdmin && (
              <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} onClick={handleEdit} className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-background/80 backdrop-blur-md border border-border flex items-center justify-center text-amber-500 shadow-xl z-30">
                <Pencil className="w-3 h-3" />
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isOwner && !product.isVerified && (
              <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} onClick={handleVerify} className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-background/80 backdrop-blur-md border border-border flex items-center justify-center text-green-500 shadow-xl z-30">
                <CheckCircle className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleWishlist}
            className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all shadow-xl backdrop-blur-md border border-white/10 ${isLiked ? "bg-accent text-accent-foreground" : "bg-background/80"}`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
          </motion.button>
        </div>

        <AnimatePresence>
          {showOverlay && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3">
              <Button onClick={(e) => { e.stopPropagation(); onViewDetails(product); }} className="bg-white text-black hover:bg-accent hover:text-white font-black px-6 h-10 rounded-full shadow-2xl transition-all border-none text-[10px] md:text-sm">
                <Eye className="w-4 h-4 mr-2" /> PREVIEW
              </Button>
              <Button onClick={handleQuickAdd} variant="outline" className="bg-black/50 text-white backdrop-blur-md border-white/20 hover:bg-white hover:text-black font-black px-6 h-10 rounded-full shadow-2xl transition-all text-[10px] md:text-sm">
                <ShoppingCart className="w-4 h-4 mr-2" /> + CART
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-3 md:p-6">
        <div className="flex justify-between items-start mb-2">
          <p className="text-[10px] text-accent font-black uppercase tracking-[0.2em]">{product.category}</p>
          <div className="flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded-full border border-border/50">
            <Star className="w-3 h-3 fill-accent text-accent" />
            <span className="text-[10px] font-bold">{product.rating}</span>
          </div>
        </div>

        <h3 className="font-heading font-black text-sm md:text-xl mb-3 group-hover:text-accent transition-colors leading-tight tracking-tight line-clamp-2 min-h-[2.5rem] md:min-h-0">
          {product.name}
        </h3>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/30">
          <div className="flex flex-col">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Price</p>
            <div className="flex items-baseline gap-2">
              <span className="font-black text-base md:text-2xl tracking-tighter">${product.price}</span>
              {product.originalPrice && <span className="text-muted-foreground line-through text-xs font-medium">${product.originalPrice}</span>}
            </div>
          </div>

          <div className="flex -space-x-1.5 isolate">
            {product.colors?.slice(0, 3).map((color, index) => (
              <motion.button
                key={`${product.id}-${color.name}`}
                whileHover={{ scale: 1.3, zIndex: 10 }}
                whileTap={{ scale: 0.9 }}
                onMouseEnter={() => !isMobile && product.images?.[index] && setActiveImageIndex(index)}
                onClick={(e) => { e.stopPropagation(); product.images?.[index] && setActiveImageIndex(index); }}
                className={`w-6 h-6 rounded-full border-2 border-background shadow-lg transition-all duration-300 relative ${activeImageIndex === index ? "ring-2 ring-accent ring-offset-2 z-10" : "z-0 hover:z-10"}`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
            {(product.colors?.length || 0) > 3 && (
              <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center border-2 border-background shadow-md z-0">
                <span className="text-[10px] font-black text-muted-foreground">+{(product.colors?.length || 0) - 3}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

ProductCard.displayName = "ProductCard";
export default ProductCard;
