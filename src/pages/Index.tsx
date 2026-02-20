import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartSidebar from "@/components/cart/CartSidebar";
import WishlistSidebar from "@/components/wishlist/WishlistSidebar";
import { useWishlist } from "@/context/WishlistContext";
import HeroSection from "@/components/home/HeroSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import NewArrivals from "@/components/home/NewArrivals";
import PromoBanner from "@/components/home/PromoBanner";
import CategorySection from "@/components/home/CategorySection";
import NewsletterSection from "@/components/home/NewsletterSection";

const Index = () => {
  const { isWishlistOpen, setIsWishlistOpen } = useWishlist();
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CartSidebar />
      <WishlistSidebar isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
      <main className="flex-1">
        <HeroSection />
        <FeaturedProducts />
        <NewArrivals />
        <PromoBanner />
        <CategorySection />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
