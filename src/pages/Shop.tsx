import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X, ShieldCheck, Plus, Clock, CheckCircle2, Trash2, History, RotateCcw } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartSidebar from "@/components/cart/CartSidebar";
import WishlistSidebar from "@/components/wishlist/WishlistSidebar";
import { useWishlist } from "@/context/WishlistContext";
import ProductCard from "@/components/product/ProductCard";
import ProductModal from "@/components/product/ProductModal";
import { products, Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useAdmin } from "@/context/AdminContext";
import { productService } from "@/services/productService";
import ReviewChangesModal from "@/components/admin/ReviewChangesModal";

const Shop = () => {
  const [reviewingProduct, setReviewingProduct] = useState<Product | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [activeMobileId, setActiveMobileId] = useState<number | null>(null);

  const handleMobileClick = (id: number) => {
    setActiveMobileId(prev => prev === id ? null : id);
  };

  // Global Admin State
  const { isAdmin, isOwner, verifyAdmin, logoutAdmin } = useAdmin();

  // Dynamic Product State with Firebase
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

  const [adminPass, setAdminPass] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    originalPrice: "",
    category: "Casual",
    description: "",
    imageUrls: {} as Record<string, string>,
    colors: "Black:#000000, White:#ffffff",
    rating: "5.0",
    reviews: "0"
  });

  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [isPendingSheetOpen, setIsPendingSheetOpen] = useState(false);
  const [isBackupSheetOpen, setIsBackupSheetOpen] = useState(false);
  const [backupProducts, setBackupProducts] = useState<Product[]>([]);
  const [showPendingOnly, setShowPendingOnly] = useState(false);

  const [priceRange, setPriceRange] = useState([0, 300]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("category") ? [searchParams.get("category")!] : []
  );
  const [selectedSizes, setSelectedSizes] = useState<number[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>(
    searchParams.get("color") ? searchParams.get("color")!.split(",") : []
  );
  const [sortBy, setSortBy] = useState("newest");

  // Sync Filters with URL Params (from ChatBot or Search)
  useEffect(() => {
    const category = searchParams.get("category");
    const maxPrice = searchParams.get("maxPrice");
    const color = searchParams.get("color");

    // Strictly sync states with URL. If missing in URL, clear from state.
    setSelectedCategories(category ? [category.toLowerCase()] : []);
    setPriceRange([0, maxPrice ? parseInt(maxPrice) : 300]);
    setSelectedColors(color ? color.toLowerCase().split(",") : []);
  }, [searchParams]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const { isWishlistOpen, setIsWishlistOpen } = useWishlist();

  const getBaseColor = (name: string) => {
    const standardColors = ["Navy", "Black", "White", "Red", "Blue", "Green", "Gray", "Grey", "Purple", "Orange", "Yellow", "Pink", "Gold", "Silver", "Brown"];
    const lower = name.toLowerCase();
    return standardColors.find(sc => lower.includes(sc.toLowerCase())) || name;
  };

  // Helper to parse colors string
  const currentColorVariants = useMemo(() => {
    return newProduct.colors.split(",").filter(c => c.trim()).map(c => {
      const [name] = c.trim().split(":");
      return name || "Default";
    });
  }, [newProduct.colors]);

  // DERIVED: Dynamically get unique categories from products
  const categories = useMemo(() => {
    const uniqueTags = Array.from(new Set(allProducts.map(p => p.category)));
    return uniqueTags.map(tag => ({
      id: tag.toLowerCase(),
      label: tag.charAt(0).toUpperCase() + tag.slice(1)
    }));
  }, [allProducts]);

  // DERIVED: Get unique colors from products, grouped by base color
  const availableColors = useMemo(() => {
    const colorMap = new Map<string, string>();

    allProducts.forEach(p => {
      p.colors.forEach(c => {
        const groupName = getBaseColor(c.name);

        // Only add the first instance of a group (e.g. first "White" variation)
        if (!colorMap.has(groupName)) {
          colorMap.set(groupName, c.hex);
        }
      });
    });
    return Array.from(colorMap.entries()).map(([name, hex]) => ({ name, hex }));
  }, [allProducts]);

  const sizes = [6, 7, 8, 9, 10, 11, 12, 13];

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const toggleSize = (size: number) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (colorName: string) => {
    const lowerName = colorName.toLowerCase();
    setSelectedColors((prev) => {
      const isSelected = prev.includes(lowerName);
      const next = isSelected
        ? prev.filter((c) => c !== lowerName)
        : [...prev, lowerName];

      // Update URL
      const params = new URLSearchParams(searchParams);
      if (next.length > 0) {
        params.set("color", next.join(","));
      } else {
        params.delete("color");
      }
      setSearchParams(params);
      return next;
    });
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange([0, 300]);
    setSearchParams({});
  };

  const handleAdminVerify = () => {
    verifyAdmin(adminPass);
    setAdminPass("");
  };

  const handleEditOpen = useCallback((product: Product) => {
    setEditingProductId(product.id);
    const colorsString = product.colors.map(c => `${c.name}:${c.hex}`).join(", ");
    const imageUrls: Record<string, string> = {};
    product.colors.forEach((c, i) => {
      imageUrls[c.name] = product.images[i] || product.images[0];
    });

    setNewProduct({
      name: product.name,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || "",
      category: product.category,
      description: product.description,
      colors: colorsString,
      rating: product.rating.toString(),
      reviews: product.reviews.toString(),
      imageUrls: imageUrls
    });
    setIsAddModalOpen(true);
  }, []);

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      toast({ title: "Missing Fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    try {
      const colorsArray = newProduct.colors.split(",").map(c => {
        const [name, hex] = c.split(":");
        return { name: (name || "Default").trim(), hex: (hex || "#000000").trim() };
      });

      const imagesArray = colorsArray.map(c => newProduct.imageUrls[c.name] || "/assets/images/photo-1542291026-7eec264c27ff.jpg");

      if (editingProductId) {
        // UPDATE Existing
        await productService.updateProduct({
          id: editingProductId,
          name: newProduct.name,
          price: Number(newProduct.price),
          originalPrice: newProduct.originalPrice ? Number(newProduct.originalPrice) : undefined,
          category: newProduct.category.toLowerCase(),
          rating: Number(newProduct.rating) || 4.5,
          reviews: Number(newProduct.reviews) || 0,
          sizes: [7, 8, 9, 10, 11],
          colors: colorsArray,
          images: imagesArray,
          description: newProduct.description,
          isNew: true
        }, isAdmin, isOwner);

        toast({
          title: isOwner ? "Changes Published" : "Edit Submitted",
          description: isOwner ? "Listing updated successfully." : "Your changes are pending owner verification."
        });
      } else {
        // CREATE New
        await productService.addProduct({
          name: newProduct.name,
          price: Number(newProduct.price),
          originalPrice: newProduct.originalPrice ? Number(newProduct.originalPrice) : undefined,
          category: newProduct.category.toLowerCase(),
          rating: Number(newProduct.rating) || 4.5,
          reviews: Number(newProduct.reviews) || 0,
          sizes: [7, 8, 9, 10, 11],
          colors: colorsArray,
          images: imagesArray,
          description: newProduct.description,
          isNew: true
        }, isAdmin, isOwner);

        toast({
          title: isOwner ? "Product Published" : "Verification Requested",
          description: isOwner ? "The listing is now live." : "Your listing is pending owner approval."
        });
      }

      setIsAddModalOpen(false);
      setEditingProductId(null);
      setNewProduct({ name: "", price: "", originalPrice: "", category: "Casual", rating: "4.5", reviews: "0", colors: "Black:#000000, White:#ffffff", description: "", imageUrls: {} });

      const data = await productService.getProducts();
      setAllProducts(data);
    } catch (error: any) {
      console.error("Add Product Error:", error);
      toast({
        title: "Error",
        description: error.message || "Operation failed.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProduct = useCallback(async (productId: number) => {
    try {
      await productService.deleteProduct(productId, isAdmin, isOwner);
      const data = await productService.getProducts();
      setAllProducts(data);
      toast({
        title: isOwner ? "Moved to Backup" : "Deletion Requested",
        description: isOwner ? "Item will be kept for 3 days." : "Pending owner confirmation."
      });
    } catch (error: any) {
      console.error("Delete Error:", error);
      toast({ title: "Delete Failed", description: error.message || "Operation failed.", variant: "destructive" });
    }
  }, [isAdmin, isOwner]);

  const handleVerifyProduct = useCallback(async (productId: number) => {
    try {
      if (!isOwner) {
        toast({ title: "Access Denied", description: "Only owners can verify actions.", variant: "destructive" });
        return;
      }

      console.log("Verifying product ID:", productId);

      // 1. Optimistic update (Immediate UI fix)
      setAllProducts(prev => prev.map(p =>
        p.id === productId ? { ...p, isVerified: true, lastAction: undefined, isPendingDelete: false } : p
      ).filter(p => !(p.id === productId && p.lastAction === "delete")));

      // 2. Perform the actual verification
      await productService.verifyProductAction(productId, isOwner);

      // 3. Briefly wait before re-fetching to ensure Firestore consistency
      setTimeout(async () => {
        const data = await productService.getProducts();
        // Merge strategy: Keep local verified status if the server still says it's unverified (eventual consistency)
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

      toast({ title: "Action Verified", description: "Changes are now live." });
    } catch (error: any) {
      console.error("Verification failed:", error);
      const data = await productService.getProducts();
      setAllProducts(data);
      toast({
        title: "Verification Error",
        description: error.message || "Failed to verify.",
        variant: "destructive"
      });
    }
  }, [isOwner]);

  const handleRejectProduct = async (productId: number) => {
    try {
      if (!isOwner) return;
      console.log("Rejecting product ID:", productId);
      await productService.rejectProductAction(productId);

      // Refresh list
      const data = await productService.getProducts();
      setAllProducts(data);

      toast({ title: "Request Rejected", description: "Changes have been reverted." });
    } catch (error) {
      console.error("Rejection failed", error);
      toast({ title: "Error", description: "Failed to reject.", variant: "destructive" });
    }
  };

  const fetchBackup = async () => {
    try {
      const data = await productService.getBackupProducts();
      setBackupProducts(data);
    } catch (error) {
      console.error("Backup fetch failed", error);
    }
  };

  const handleRestoreProduct = async (productId: number) => {
    try {
      await productService.restoreProduct(productId);
      await fetchBackup();
      const updated = await productService.getProducts();
      setAllProducts(updated);
      toast({ title: "Product Restored", description: "Listing is back in the store." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to restore.", variant: "destructive" });
    }
  };

  const handlePermanentDelete = async (productId: number) => {
    try {
      if (!confirm("Are you sure? This cannot be undone.")) return;
      await productService.permanentDeleteProduct(productId);
      await fetchBackup();
      toast({ title: "Permanently Deleted", description: "Product removed forever." });
    } catch (error) {
      console.error("Permanent delete failed", error);
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  const handleDeleteAllBackup = async () => {
    if (!backupProducts.length) return;
    if (!confirm(`Are you sure you want to PERMANENTLY DELETE ALL ${backupProducts.length} backed up products? This cannot be undone.`)) return;

    try {
      await productService.deleteAllBackupProducts();
      await fetchBackup();
      toast({ title: "Backup Cleared", description: "All products removed from recycle bin." });
    } catch (error) {
      console.error("Clear backup failed", error);
      toast({ title: "Error", description: "Failed to clear backup.", variant: "destructive" });
    }
  };

  const pendingCount = allProducts.filter(p => !p.isVerified).length;

  const handleApproveAll = async () => {
    if (!confirm(`Are you sure you want to APPROVED ALL ${pendingCount} pending changes?`)) return;

    // Optimistic Update
    setAllProducts(prev => prev.map(p =>
      !p.isVerified ? { ...p, isVerified: true, lastAction: undefined, isPendingDelete: false } : p
    ).filter(p => !(p.lastAction === "delete" && !p.isVerified))); // Remove delete requests from view

    const pending = allProducts.filter(p => !p.isVerified);
    for (const p of pending) {
      await productService.verifyProductAction(p.id, true);
    }

    // Refresh
    const data = await productService.getProducts();
    setAllProducts(data);
    toast({ title: "All Approved", description: "All pending changes have been verified." });
  };

  const handleRejectAll = async () => {
    if (!confirm(`Are you sure you want to REJECT ALL ${pendingCount} pending changes? This cannot be undone.`)) return;

    // Optimistic Update: Remove "Add" items, Revert "Edit" items (best effort)
    setAllProducts(prev => {
      const next = [...prev];
      // 1. Remove pending added items
      const filtered = next.filter(p => !(p.lastAction === "add" && !p.isVerified));

      // 2. Revert pending edits (If we have prev state, use it. Else just mark verified to clear pending flag)
      // Ideally we should revert, but if we don't have previousState loaded in list...
      // The list item MIGHT have previousState if we fetched it.
      return filtered.map(p => {
        if (p.isVerified) return p;
        if (p.lastAction === "edit" || p.lastAction === "delete") {
          // If we have history, revert. If not, just clear flags (keep current as verified)
          // The list item MIGHT have previousState if we fetched it.
          if (p.previousState) {
            return { ...p.previousState, isVerified: true, lastAction: undefined };
          }
          return { ...p, isVerified: true, lastAction: undefined, isPendingDelete: false };
        }
        return p;
      });
    });

    try {
      const pending = allProducts.filter(p => !p.isVerified);
      // Execute in parallel for speed
      await Promise.all(pending.map(p => productService.rejectProductAction(p.id)));

      // Small delay for Firestore consistency
      await new Promise(r => setTimeout(r, 500));

      const data = await productService.getProducts();
      setAllProducts(data);
      toast({ title: "All Rejected", description: "All pending changes have been reverted." });
    } catch (error) {
      console.error("Batch rejection failed", error);
      toast({ title: "Error", description: "Some items failed to reject.", variant: "destructive" });
      // Re-fetch to ensure sync
      const data = await productService.getProducts();
      setAllProducts(data);
    }
  };

  useEffect(() => {
    if (isBackupSheetOpen) {
      fetchBackup();
    }
  }, [isBackupSheetOpen]);

  const filteredProducts = useMemo(() => {
    let result = allProducts;
    const searchQuery = searchParams.get("q")?.toLowerCase() || "";

    // Security Filter: Hide unverified products from regular customers
    if (!isAdmin && !isOwner) {
      result = result.filter(p => p.isVerified);
    }

    if (showPendingOnly) {
      result = result.filter(p => !p.isVerified);
    }

    if (searchQuery) {
      // Common product type terms that should match all footwear products
      const footwearTerms = ["shoe", "shoes", "sneaker", "sneakers", "footwear"];
      const isFootwearSearch = footwearTerms.some(term => searchQuery.includes(term));

      result = result.filter(p => {
        // If searching for a generic footwear term, match all products (since all are shoes)
        if (isFootwearSearch) return true;

        // Otherwise, search in name, category, and description
        return (
          p.name.toLowerCase().includes(searchQuery) ||
          p.category.toLowerCase().includes(searchQuery) ||
          p.description?.toLowerCase().includes(searchQuery)
        );
      });
    }

    if (selectedCategories.length > 0) {
      // Match case-insensitive
      result = result.filter(p => selectedCategories.some(c => c.toLowerCase() === p.category.toLowerCase()));
    }

    result = result.filter(p => p.price >= priceRange[0] && (priceRange[1] >= 300 ? true : p.price <= priceRange[1]));

    if (selectedSizes.length > 0) {
      result = result.filter(p => p.sizes.some(s => selectedSizes.includes(s)));
    }

    if (selectedColors.length > 0) {
      result = result.filter(p =>
        p.colors.some(c =>
          selectedColors.some(sc => getBaseColor(c.name).toLowerCase() === sc.toLowerCase())
        )
      );
    }

    switch (sortBy) {
      case "price-low": result = [...result].sort((a, b) => a.price - b.price); break;
      case "price-high": result = [...result].sort((a, b) => b.price - a.price); break;
      case "newest": result = [...result].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
      default: result = [...result].sort((a, b) => b.reviews - a.reviews);
    }
    return result;
  }, [allProducts, selectedCategories, priceRange, selectedSizes, sortBy, searchParams, isAdmin, isOwner, showPendingOnly]);

  const activeFiltersCount = selectedCategories.length + selectedSizes.length + selectedColors.length +
    (priceRange[0] > 0 || priceRange[1] < 300 ? 1 : 0) + (searchParams.get("q") ? 1 : 0);

  const filterContent = (
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          Category
          {selectedCategories.length > 0 && (
            <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
              {selectedCategories.length}
            </span>
          )}
        </h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center gap-3">
              <Checkbox
                id={category.id}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => toggleCategory(category.id)}
              />
              <label htmlFor={category.id} className="text-sm cursor-pointer hover:text-accent transition-colors">
                {category.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2">
        <h3 className="font-bold mb-4">Price Range</h3>
        <Slider
          value={priceRange}
          max={300}
          step={1}
          onValueChange={setPriceRange}
          className="mb-6"
        />
        <div className="flex items-center gap-4">
          <div className="grid gap-1">
            <span className="text-xs text-muted-foreground">Min ($)</span>
            <Input
              type="number"
              value={priceRange[0]}
              onChange={(e) => {
                const val = Math.min(Number(e.target.value), priceRange[1]);
                setPriceRange([val, priceRange[1]]);
              }}
              className="h-8"
            />
          </div>
          <div className="grid gap-1">
            <span className="text-xs text-muted-foreground">Max ($)</span>
            <Input
              type="number"
              value={priceRange[1]}
              onChange={(e) => {
                const val = Math.max(Number(e.target.value), priceRange[0]);
                setPriceRange([priceRange[0], val]);
              }}
              className="h-8"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          Size
          {selectedSizes.length > 0 && (
            <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
              {selectedSizes.length}
            </span>
          )}
        </h3>
        <div className="grid grid-cols-4 gap-2 text-white">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`py-2 text-sm font-medium rounded-md transition-all ${selectedSizes.includes(size)
                ? "bg-primary text-primary-foreground"
                : "bg-secondary hover:bg-muted"
                }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          Color
          {selectedColors.length > 0 && (
            <Badge variant="secondary" className="text-[10px] bg-accent/10 text-accent border-accent/20">
              {selectedColors.length}
            </Badge>
          )}
        </h3>
        <div className="flex flex-wrap gap-3">
          {availableColors.map((color) => {
            const isSelected = selectedColors.includes(color.name.toLowerCase());
            return (
              <button
                key={color.name}
                onClick={() => toggleColor(color.name)}
                className={`group relative p-1 rounded-full border-2 transition-all hover:scale-110 ${isSelected ? "border-accent scale-110" : "border-transparent"
                  }`}
                title={color.name.charAt(0).toUpperCase() + color.name.slice(1)}
              >
                <div
                  className="w-6 h-6 rounded-full shadow-inner border border-white/10"
                  style={{ backgroundColor: color.hex }}
                />
                {isSelected && (
                  <div className="absolute -top-1 -right-1">
                    <Badge className="w-3 h-3 p-0 flex items-center justify-center bg-accent text-accent-foreground border-none">
                      <CheckCircle2 className="w-2 h-2" />
                    </Badge>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          Clear All Filters ({activeFiltersCount})
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CartSidebar />
      <WishlistSidebar isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-2">ALL SHOES</h1>
            <p className="text-muted-foreground">{filteredProducts.length} Products</p>
          </div>

          <div className="flex gap-8">
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24">
                <h2 className="font-heading text-xl font-bold mb-6">FILTERS</h2>
                {filterContent}
              </div>
            </aside>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-6 border-b border-border gap-4">
                <div className="flex items-center gap-3">
                  {!isAdmin ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground/30 hover:text-accent transition-colors">
                          <ShieldCheck className="w-5 h-5" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Admin Access</DialogTitle>
                        </DialogHeader>
                        <div className="flex items-center space-x-2">
                          <div className="grid flex-1 gap-2">
                            <Input
                              type="password"
                              placeholder="Enter Admin Passkey"
                              value={adminPass}
                              onChange={(e) => setAdminPass(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAdminVerify()}
                            />
                          </div>
                          <Button size="sm" className="px-3 bg-accent" onClick={handleAdminVerify}>Verify</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-start gap-1 w-full md:w-auto">
                        <Badge variant="outline" className="text-[10px] border-accent/20 text-accent font-black uppercase tracking-tighter">
                          {isOwner ? "MASTER OWNER" : "STAFF ADMIN"}
                        </Badge>
                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                          <Dialog open={isAddModalOpen} onOpenChange={(open) => {
                            setIsAddModalOpen(open);
                            if (!open) {
                              setEditingProductId(null);
                              setNewProduct({ name: "", price: "", originalPrice: "", category: "Casual", rating: "4.5", reviews: "0", colors: "Black:#000000, White:#ffffff", description: "", imageUrls: {} });
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground font-black h-8 md:h-9 px-2 md:px-4 text-[10px] md:text-sm">
                                <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                                ADD PRODUCT
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="font-heading italic uppercase text-2xl">
                                  {editingProductId ? "Update Listing" : "Create New Listing"}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="grid gap-6 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="name">Shoe Name</Label>
                                  <Input id="name" placeholder="e.g. Air Max Fusion" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="price">Price ($)</Label>
                                    <Input id="price" type="number" placeholder="199" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="originalPrice">Original Price ($) <span className="text-muted-foreground text-xs font-normal">(Optional)</span></Label>
                                    <Input id="originalPrice" type="number" placeholder="250" value={newProduct.originalPrice} onChange={e => setNewProduct({ ...newProduct, originalPrice: e.target.value })} />
                                  </div>
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="category">Category</Label>
                                  <Input id="category" placeholder="Running, Lifestyle, etc." value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="rating">Initial Rating</Label>
                                    <Input id="rating" type="number" step="0.1" max="5" value={newProduct.rating} onChange={e => setNewProduct({ ...newProduct, rating: e.target.value })} />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="reviews">Review Count</Label>
                                    <Input id="reviews" type="number" value={newProduct.reviews} onChange={e => setNewProduct({ ...newProduct, reviews: e.target.value })} />
                                  </div>
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="colors">Colors (Format: Name:#Hex, Name2:#Hex)</Label>
                                  <Input id="colors" placeholder="Red:#ff0000, Black:#000000" value={newProduct.colors} onChange={e => setNewProduct({ ...newProduct, colors: e.target.value })} />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="desc">Description</Label>
                                  <Textarea id="desc" placeholder="Details about performance and style..." value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />
                                </div>

                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-accent font-black tracking-widest uppercase text-xs">Color Variant Gallery</Label>
                                    <Badge variant="outline" className="text-[10px] uppercase border-accent/30 text-accent/70">1 Image Per Color</Badge>
                                  </div>

                                  <div className="grid gap-4 bg-secondary/20 p-5 rounded-2xl border border-border/50 transition-all">
                                    {currentColorVariants.length > 0 ? (
                                      currentColorVariants.map((colorName) => (
                                        <div key={colorName} className="grid gap-2 animate-fade-in">
                                          <div className="flex items-center justify-between">
                                            <Label htmlFor={`img-${colorName}`} className="text-[10px] font-bold uppercase text-muted-foreground">
                                              📸 {colorName} Shoe Image
                                            </Label>
                                          </div>
                                          <Input
                                            id={`img-${colorName}`}
                                            placeholder="Paste Image URL here..."
                                            className="bg-background/50 border-border/50 focus:border-accent transition-colors"
                                            value={newProduct.imageUrls[colorName] || ""}
                                            onChange={e => setNewProduct({
                                              ...newProduct,
                                              imageUrls: { ...newProduct.imageUrls, [colorName]: e.target.value }
                                            })}
                                          />
                                        </div>
                                      ))
                                    ) : (
                                      <p className="text-xs text-muted-foreground text-center py-4 italic">
                                        Add colors above to unlock image slots...
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button className="w-full h-12 font-black text-lg bg-accent hover:shadow-glow" onClick={handleAddProduct}>
                                  {editingProductId ? "SAVE CHANGES" : "PUBLISH LISTING"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          {isOwner && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsBackupSheetOpen(true)}
                                className="border-muted-foreground/30 text-muted-foreground hover:text-accent font-black h-8 md:h-9 px-2 md:px-4 text-[10px] md:text-sm"
                              >
                                <History className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                                BACKUP
                              </Button>

                              <Sheet open={isPendingSheetOpen} onOpenChange={setIsPendingSheetOpen}>
                                <SheetTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="border-orange-500/50 text-orange-500 hover:bg-orange-500/10 font-black h-8 md:h-9 px-2 md:px-4 text-[10px] md:text-sm transition-all hover:shadow-glow-orange"
                                  >
                                    <Clock className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 animate-pulse" />
                                    REQUESTS ({allProducts.filter(p => !p.isVerified).length})
                                  </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-full sm:max-w-md bg-background/95 backdrop-blur-xl border-l border-orange-500/20">
                                  <SheetHeader className="pb-6 border-b border-border/50">
                                    <SheetTitle className="font-heading text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                                      <ShieldCheck className="w-8 h-8 text-orange-500" />
                                      Review <span className="text-orange-500">Board</span>
                                    </SheetTitle>
                                    <div className="flex flex-col gap-2">
                                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                                        {pendingCount} Pending Verifications
                                      </p>
                                      {pendingCount > 0 && (
                                        <div className="flex gap-2 mt-1">
                                          <Button size="sm" variant="ghost" className="h-7 text-xs text-red-500 hover:bg-red-500/10 flex-1 border border-red-500/20" onClick={handleRejectAll}>
                                            REJECT ALL
                                          </Button>
                                          <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-500 text-white flex-1 font-bold" onClick={handleApproveAll}>
                                            APPROVE ALL
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </SheetHeader>
                                  <div className="mt-8 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
                                    {allProducts.filter(p => !p.isVerified).length > 0 ? (
                                      allProducts.filter(p => !p.isVerified).map((product) => (
                                        <div key={product.id} className="group relative bg-secondary/20 rounded-2xl p-4 border border-border/50 hover:border-orange-500/30 transition-all">
                                          <div className="flex gap-4">
                                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-background border border-border/50 flex-shrink-0">
                                              <img src={product.images?.[0] || ""} alt={product.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-start justify-between gap-2">
                                                <h4 className="font-bold text-sm truncate uppercase tracking-tight">{product.name}</h4>
                                                <Badge className={`text-[10px] px-2 py-0 border-none uppercase font-black ${product.lastAction === "delete" ? "bg-red-500" :
                                                  product.lastAction === "edit" ? "bg-amber-500" : "bg-green-500"
                                                  }`}>
                                                  {product.lastAction || "Add"}
                                                </Badge>
                                              </div>
                                              <p className="text-xs text-muted-foreground font-black mt-1">${product.price}</p>
                                              <div className="flex items-center gap-2 mt-3">
                                                <Button
                                                  size="sm"
                                                  className="h-8 bg-orange-500 hover:bg-orange-600 text-white font-black text-[10px] tracking-widest flex-1 shadow-lg shadow-orange-500/20"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    console.log("Review button clicked", product.id);
                                                    setReviewingProduct(product);
                                                    setIsReviewModalOpen(true);
                                                  }}
                                                >
                                                  <ShieldCheck className="w-3 h-3 mr-2" />
                                                  REVIEW CHANGES
                                                </Button>
                                                <Button
                                                  size="sm"
                                                  variant="ghost"
                                                  className="h-8 w-10 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (confirm("Reject this change? This will revert edits or delete the pending product.")) {
                                                      handleRejectProduct(product.id);
                                                    }
                                                  }}
                                                >
                                                  <Trash2 className="w-4 h-4" />
                                                </Button>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="text-center py-20 opacity-30">
                                        <CheckCircle2 className="w-16 h-16 mx-auto mb-4" />
                                        <p className="font-heading italic uppercase text-lg">All caught up</p>
                                      </div>
                                    )}
                                  </div>
                                  {allProducts.filter(p => !p.isVerified).length > 0 && (
                                    <div className="absolute bottom-10 left-6 right-6 p-4 bg-orange-500/5 rounded-2xl border border-orange-500/10">
                                      <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest leading-relaxed">
                                        ⚠️ Verification is final. Verified products will be visible to all users immediately.
                                      </p>
                                    </div>
                                  )}
                                </SheetContent>
                              </Sheet>

                              <Sheet open={isBackupSheetOpen} onOpenChange={setIsBackupSheetOpen}>
                                <SheetContent side="right" className="w-full sm:max-w-md bg-zinc-950/95 backdrop-blur-xl border-l border-white/10 text-white">
                                  <SheetHeader className="pb-6 border-b border-white/5">
                                    <SheetTitle className="font-heading text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3 text-white">
                                      <History className="w-8 h-8 text-accent" />
                                      Product <span className="text-accent">Backup</span>
                                    </SheetTitle>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black">
                                      Recycle Bin • Auto-clears after 3 Days
                                    </p>
                                    {backupProducts.length > 0 && (
                                      <div className="flex justify-end mt-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={handleDeleteAllBackup}
                                          className="h-7 text-[10px] text-red-500 hover:bg-red-500/10 border border-red-500/20 font-black uppercase tracking-tighter transition-all"
                                        >
                                          <Trash2 className="w-3 h-3 mr-1" />
                                          DELETE ALL
                                        </Button>
                                      </div>
                                    )}
                                  </SheetHeader>

                                  <div className="mt-8 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
                                    {backupProducts.length > 0 ? (
                                      backupProducts.map((product) => {
                                        const deletedDate = new Date(product.deletedAt || 0);
                                        const expiresAt = new Date(deletedDate.getTime() + 3 * 24 * 60 * 60 * 1000);
                                        const remainingDays = Math.ceil((expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000));

                                        return (
                                          <div key={product.id} className="group bg-white/5 rounded-2xl p-4 border border-white/5 hover:border-accent/30 transition-all">
                                            <div className="flex gap-4">
                                              <div className="w-20 h-20 rounded-xl overflow-hidden bg-black border border-white/10 flex-shrink-0">
                                                <img src={product.images?.[0] || ""} alt={product.name} className="w-full h-full object-cover" />
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                  <h4 className="font-bold text-sm truncate uppercase tracking-tight">{product.name}</h4>
                                                  <Badge variant="outline" className="text-[9px] border-red-500/50 text-red-400 font-black">
                                                    {remainingDays}D LEFT
                                                  </Badge>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground mt-1">Deleted: {deletedDate.toLocaleDateString()}</p>
                                                <div className="flex gap-2 mt-4">
                                                  <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 flex-1 bg-white/5 hover:bg-accent hover:text-white font-black text-[10px] tracking-widest text-white transition-all"
                                                    onClick={() => handleRestoreProduct(product.id)}
                                                  >
                                                    <RotateCcw className="w-3 h-3 mr-2" />
                                                    RESTORE
                                                  </Button>
                                                  <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-10 bg-red-500/10 hover:bg-red-500 text-white font-black transition-all"
                                                    onClick={() => handlePermanentDelete(product.id)}
                                                  >
                                                    <Trash2 className="w-4 h-4" />
                                                  </Button>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })
                                    ) : (
                                      <div className="text-center py-24 opacity-20">
                                        <History className="w-16 h-16 mx-auto mb-4" />
                                        <p className="font-heading italic uppercase text-lg">Backup is empty</p>
                                      </div>
                                    )}
                                  </div>
                                </SheetContent>
                              </Sheet>
                            </>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={logoutAdmin}
                        className="text-muted-foreground/40 hover:text-red-500 hover:bg-red-500/5 font-black text-[10px] tracking-widest mt-2 md:mt-5"
                      >
                        LOGOUT
                      </Button>
                    </div>
                  )}

                  <ReviewChangesModal
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    product={reviewingProduct}
                    onVerify={handleVerifyProduct}
                    onReject={handleRejectProduct}
                    onEdit={handleEditOpen}
                  />

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
                      <SheetTrigger asChild>
                        <Button variant="outline" className="lg:hidden gap-2 flex-1 md:flex-none h-9 text-xs">
                          <SlidersHorizontal className="w-4 h-4" />
                          Filters
                          {activeFiltersCount > 0 && (
                            <span className="bg-accent text-accent-foreground text-xs px-1.5 py-0.5 rounded-full">
                              {activeFiltersCount}
                            </span>
                          )}
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="left" className="w-[300px]">
                        <SheetHeader><SheetTitle className="font-heading">FILTERS</SheetTitle></SheetHeader>
                        <div className="mt-6">{filterContent}</div>
                      </SheetContent>
                    </Sheet>

                    <div className="md:hidden flex-1">
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-full h-9 text-xs"><SelectValue placeholder="Sort" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="popular">Popular</SelectItem>
                          <SelectItem value="newest">Newest</SelectItem>
                          <SelectItem value="price-low">Price: Low</SelectItem>
                          <SelectItem value="price-high">Price: High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:flex items-center gap-2 flex-wrap">
                  {selectedCategories.map((cat) => (
                    <span key={cat} className="inline-flex items-center gap-1 bg-secondary px-3 py-1 rounded-full text-sm">
                      {cat}
                      <button onClick={() => toggleCategory(cat)}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>

                <div className="hidden md:block">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6 animate-pulse">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-[4/5] bg-secondary/30 rounded-3xl" />
                  ))}
                </div>

              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onViewDetails={setSelectedProduct}
                      isAdmin={isAdmin}
                      isOwner={isOwner}
                      onDelete={handleDeleteProduct}
                      onVerify={handleVerifyProduct}
                      onEdit={handleEditOpen}
                      activeMobileId={activeMobileId}
                      onMobileClick={handleMobileClick}
                      selectedColors={selectedColors}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-xl font-medium mb-2">No products found</p>
                  <p className="text-muted-foreground mb-6">Try adjusting your filters.</p>
                  <Button onClick={clearFilters}>Clear Filters</Button>
                </div>
              )}
            </div>
          </div >
        </div >
      </main >

      <Footer />
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div >
  );
};

export default Shop;
