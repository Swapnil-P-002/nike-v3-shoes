import { X, Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WishlistSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const WishlistSidebar = ({ isOpen, onClose }: WishlistSidebarProps) => {
    const { items, removeFromWishlist, totalItems } = useWishlist();
    const { addToCart } = useCart();
    const [selectedSizes, setSelectedSizes] = useState<Record<number, number>>({});

    const handleAddToBag = (productId: number) => {
        const product = items.find((p) => p.id === productId);
        if (!product) return;

        const size = selectedSizes[productId] || product.sizes[0];
        const color = product.colors[0].name;

        addToCart(product, size, color);
        removeFromWishlist(productId);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-foreground/50 z-50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-background z-50 shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <div className="flex items-center gap-3">
                                <Heart className="w-6 h-6 text-accent" />
                                <h2 className="font-heading text-xl font-bold uppercase tracking-tighter">FAVORITES ({totalItems})</h2>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="h-10 w-10 rounded-full hover:bg-secondary"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Wishlist Items */}
                        {items.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <Heart className="w-20 h-20 text-muted-foreground/20 mb-6" />
                                </motion.div>
                                <p className="text-xl font-black italic uppercase tracking-tighter mb-2">Build Your List</p>
                                <p className="text-muted-foreground mb-8 max-w-[240px]">
                                    Save the gear you love. Track your next elite drop here.
                                </p>
                                <Button onClick={onClose} className="bg-primary hover:bg-accent font-black h-12 px-8 rounded-full transition-all">
                                    BROWSE COLLECTION
                                </Button>
                            </div>
                        ) : (
                            <>
                                <ScrollArea className="flex-1 px-6">
                                    <div className="py-6 space-y-8">
                                        {items.map((product, index) => (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                key={product.id}
                                                className="flex gap-5 group"
                                            >
                                                {/* Product Image */}
                                                <div className="w-24 h-28 bg-secondary/50 rounded-2xl overflow-hidden flex-shrink-0 border border-border/50">
                                                    <img
                                                        src={product.images?.[0] || ""}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                    />
                                                </div>

                                                {/* Product Info */}
                                                <div className="flex-1 min-w-0 py-1">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h3 className="font-bold text-sm leading-tight group-hover:text-accent transition-colors">
                                                            {product.name}
                                                        </h3>
                                                        <button
                                                            onClick={() => removeFromWishlist(product.id)}
                                                            className="text-muted-foreground hover:text-destructive transition-colors ml-2"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
                                                        {product.category}
                                                    </p>

                                                    <div className="flex items-center gap-2 mb-4">
                                                        <span className="font-black text-lg tracking-tighter">${product.price}</span>
                                                        {product.originalPrice && (
                                                            <span className="text-xs text-muted-foreground line-through">${product.originalPrice}</span>
                                                        )}
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <select
                                                            value={selectedSizes[product.id] || product.sizes[0]}
                                                            onChange={(e) =>
                                                                setSelectedSizes({
                                                                    ...selectedSizes,
                                                                    [product.id]: Number(e.target.value),
                                                                })
                                                            }
                                                            className="text-[10px] font-bold border border-border/50 rounded-lg px-3 py-1 bg-secondary/30 focus:outline-none focus:ring-1 focus:ring-accent"
                                                        >
                                                            {product.sizes.map((size) => (
                                                                <option key={size} value={size}>
                                                                    SIZE {size}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleAddToBag(product.id)}
                                                            className="flex-1 h-8 text-[10px] font-black uppercase tracking-widest gap-2 rounded-lg bg-primary hover:bg-accent"
                                                        >
                                                            <ShoppingBag className="w-3 h-3" />
                                                            + BAG
                                                        </Button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </ScrollArea>

                                <div className="p-8 border-t border-border bg-secondary/20">
                                    <p className="text-xs font-bold text-muted-foreground mb-4 text-center uppercase tracking-[0.2em]">
                                        {totalItems} ELITE {totalItems === 1 ? "ITEM" : "ITEMS"} SAVED
                                    </p>
                                    <Button
                                        variant="outline"
                                        className="w-full h-12 rounded-xl font-bold border-border/50 hover:bg-secondary"
                                        onClick={onClose}
                                    >
                                        BACK TO SHOP
                                    </Button>
                                </div>
                            </>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default WishlistSidebar;
