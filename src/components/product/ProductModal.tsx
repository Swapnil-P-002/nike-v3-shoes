import { useState } from "react";
import { X, Star, Minus, Plus, Check, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

const ProductModal = ({ product, onClose }: ProductModalProps) => {
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, setIsWishlistOpen } = useWishlist();
  const { toast } = useToast();

  if (!product) return null;

  const isLiked = isInWishlist(product.id);

  const handleToggleWishlist = () => {
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

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        title: "Please select a size",
        variant: "destructive",
      });
      return;
    }
    if (!selectedColor) {
      toast({
        title: "Please select a color",
        variant: "destructive",
      });
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addToCart(product, selectedSize, selectedColor);
    }

    toast({
      title: "Added to bag!",
      description: `${product.name} has been added to your bag.`,
    });
    onClose();
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const dummyReviews = [
    { name: "Alex M.", rating: 5, comment: "Incredible comfort and style. Best shoes I've ever owned!", date: "2 days ago" },
    { name: "Jordan T.", rating: 4, comment: "Great quality, runs slightly large. Love the design.", date: "1 week ago" },
    { name: "Casey R.", rating: 5, comment: "Perfect for my daily runs. Highly recommend!", date: "2 weeks ago" },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-10 lg:inset-20 bg-background z-50 rounded-lg overflow-hidden shadow-xl animate-scale-in">
        <div className="absolute top-4 right-4 z-10">
          <Button variant="ghost" size="icon" onClick={onClose} className="bg-background/80">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="h-full overflow-y-auto">
          <div className="grid lg:grid-cols-2 min-h-full">
            {/* Image Gallery */}
            <div className="relative bg-secondary">
              <div className="aspect-square lg:aspect-auto lg:h-full relative">
                <img
                  src={product.images[currentImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />

                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 rounded-full flex items-center justify-center hover:bg-background transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 rounded-full flex items-center justify-center hover:bg-background transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Image Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {product.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${index === currentImageIndex ? "bg-foreground" : "bg-foreground/30"
                        }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="p-6 lg:p-10 flex flex-col">
              <div className="flex-1">
                <p className="text-muted-foreground uppercase tracking-wide mb-2">
                  {product.category}
                </p>
                <h1 className="font-heading text-3xl lg:text-4xl font-bold mb-4">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(product.rating)
                          ? "text-accent fill-accent"
                          : "text-muted"
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-muted-foreground">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="font-bold text-3xl">${product.price}</span>
                  {product.originalPrice && (
                    <span className="text-muted-foreground line-through text-xl">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>

                <p className="text-muted-foreground mb-8">{product.description}</p>

                {/* Color Selection */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">
                    Color: {selectedColor || "Select a color"}
                  </h3>
                  <div className="flex gap-3">
                    {product.colors.map((color, index) => (
                      <button
                        key={color.name}
                        onClick={() => {
                          setSelectedColor(color.name);
                          // Sync image with color index if image exists
                          if (product.images[index]) {
                            setCurrentImageIndex(index);
                          }
                        }}
                        className={`w-10 h-10 rounded-full relative transition-all ${selectedColor === color.name
                          ? "ring-2 ring-offset-2 ring-foreground"
                          : ""
                          }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      >
                        {selectedColor === color.name && (
                          <Check
                            className={`absolute inset-0 m-auto w-5 h-5 ${color.hex === "#ffffff" || color.hex === "#f5f5f5" || color.hex === "#f8f8f8"
                              ? "text-foreground"
                              : "text-primary-foreground"
                              }`}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Selection */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">
                    Size: {selectedSize || "Select a size"}
                  </h3>
                  <div className="grid grid-cols-5 gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-3 rounded-md font-medium transition-all ${selectedSize === size
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary hover:bg-muted"
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div className="mb-8">
                  <h3 className="font-semibold mb-3">Quantity</h3>
                  <div className="flex items-center border border-border rounded-md w-fit">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-secondary transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-6 font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 hover:bg-secondary transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Add to Cart and Favorite */}
              <div className="flex gap-4">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg"
                >
                  ADD TO BAG — ${(product.price * quantity).toFixed(2)}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-14 w-14 flex-shrink-0 border-2 ${isLiked ? "bg-accent text-accent-foreground border-accent" : "hover:border-accent hover:text-accent"
                    }`}
                  onClick={handleToggleWishlist}
                  title={isLiked ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`} />
                </Button>
              </div>

              {/* Reviews Section */}
              <div className="mt-10 pt-8 border-t border-border">
                <h3 className="font-heading text-xl font-bold mb-6">Customer Reviews</h3>
                <div className="space-y-4">
                  {dummyReviews.map((review, index) => (
                    <div key={index} className="pb-4 border-b border-border last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{review.name}</span>
                        <span className="text-sm text-muted-foreground">{review.date}</span>
                      </div>
                      <div className="flex items-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? "text-accent fill-accent" : "text-muted"
                              }`}
                          />
                        ))}
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductModal;
