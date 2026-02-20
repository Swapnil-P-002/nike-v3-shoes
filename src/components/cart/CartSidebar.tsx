import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { useOrders } from "@/context/OrderContext";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const CartSidebar = () => {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const { addOrder } = useOrders();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (items.length === 0) return;

    addOrder(items, totalPrice);
    clearCart();
    setIsCartOpen(false);

    toast({
      title: "Order placed successfully!",
      description: "You can view your orders in the My Orders section.",
    });

    navigate("/orders");
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/50 z-50 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
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
                <ShoppingBag className="w-6 h-6" />
                <h2 className="font-heading text-xl font-bold uppercase tracking-tighter">YOUR BAG ({totalItems})</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCartOpen(false)}
                className="h-10 w-10 rounded-full hover:bg-secondary"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Cart Items */}
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <ShoppingBag className="w-20 h-20 text-muted-foreground/20 mb-6" />
                </motion.div>
                <p className="text-xl font-black italic uppercase tracking-tighter mb-2">Empty Bag</p>
                <p className="text-muted-foreground mb-8 max-w-[240px]">
                  Fuel your journey. Add elite gear to get started.
                </p>
                <Button onClick={() => setIsCartOpen(false)} className="bg-primary hover:bg-accent font-black h-12 px-8 rounded-full transition-all">
                  START SHOPPING
                </Button>
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1 px-6">
                  <div className="py-6 space-y-8">
                    {items.map((item, index) => (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                        className="flex gap-5 group"
                      >
                        {/* Product Image */}
                        <div className="w-24 h-28 bg-secondary/50 rounded-2xl overflow-hidden flex-shrink-0 border border-border/50">
                          <img
                            src={item.product.images?.[0] || ""}
                            alt={item.product.name}
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0 py-1">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-bold text-sm leading-tight group-hover:text-accent transition-colors">
                              {item.product.name}
                            </h3>
                            <button
                              onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor)}
                              className="text-muted-foreground hover:text-destructive transition-colors ml-2"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
                            Size {item.selectedSize} / {item.selectedColor}
                          </p>

                          {/* Quantity & Price */}
                          <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-center bg-secondary/50 rounded-lg border border-border/50 p-1">
                              <button
                                onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center hover:bg-background rounded-md transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center text-xs font-black">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center hover:bg-background rounded-md transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="font-black text-lg tracking-tighter">${(item.product.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Footer */}
                <div className="p-8 border-t border-border bg-secondary/20 backdrop-blur-xl">
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center justify-between text-sm text-muted-foreground font-medium">
                      <span>Subtotal</span>
                      <span className="text-foreground">${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground font-medium">
                      <span>Shipping</span>
                      <span className="text-green-500 font-bold uppercase tracking-widest text-[10px]">Calculated at next step</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <span className="text-lg font-black italic uppercase tracking-tighter">Total</span>
                      <span className="text-2xl font-black tracking-tighter text-accent">${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={handleCheckout}
                      className="w-full h-14 bg-primary hover:bg-accent text-primary-foreground font-black text-lg rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      SECURE CHECKOUT
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full font-bold text-muted-foreground hover:text-foreground"
                      onClick={() => setIsCartOpen(false)}
                    >
                      Continue Shopping
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;
