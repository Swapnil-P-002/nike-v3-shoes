import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, Menu, X, Heart, Sun, Moon, Sparkles } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserAvatar from "@/components/profile/UserAvatar";
import ProfileDropdown from "@/components/profile/ProfileDropdown";
import { useTheme } from "next-themes";
import { ChatBot } from "@/components/chat/ChatBot";

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { totalItems, setIsCartOpen } = useCart();
  const { totalItems: wishlistCount, setIsWishlistOpen } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const profileRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
      setSearchQuery("");
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-10 h-10 bg-primary rounded-sm flex items-center justify-center group-hover:bg-accent transition-colors duration-300">
              <span className="text-primary-foreground font-heading font-bold text-xl">S</span>
            </div>
            <span className="font-heading text-2xl font-bold tracking-tight hidden sm:block">
              STORM
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-medium text-sm uppercase tracking-wide transition-colors duration-200 relative group ${isActive(link.path)
                  ? "text-accent"
                  : "text-foreground hover:text-accent"
                  }`}
              >
                {link.name}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-accent transition-all duration-300 ${isActive(link.path) ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                />
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Search */}
            <div className="hidden sm:flex items-center">
              {isSearchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center gap-2 animate-fade-in">
                  <Input
                    type="text"
                    placeholder="Search..."
                    className="w-40 lg:w-64 h-9 bg-secondary border-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="h-9 w-9"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </form>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(true)}
                  className="h-9 w-9"
                >
                  <Search className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Favorites */}
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9"
              onClick={() => setIsWishlistOpen(true)}
              title="Favorites"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center animate-scale-in">
                  {wishlistCount}
                </span>
              )}
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center animate-scale-in">
                  {totalItems}
                </span>
              )}
            </Button>

            {/* AI Assistant */}
            <Button
              variant="outline"
              size="icon"
              className="relative h-9 w-9 rounded-full border-accent/20 hover:bg-accent/10 hover:border-accent/40 bg-background/50 shadow-sm transition-all duration-300 group"
              onClick={() => setIsChatOpen(true)}
            >
              <Sparkles className="h-4 w-4 text-accent animate-pulse group-hover:scale-110 transition-transform" />
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="icon"
              className="relative h-9 w-9 rounded-full border-accent/20 hover:bg-accent/10 hover:border-accent/40 bg-background/50 shadow-sm transition-all duration-300"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-accent" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-accent" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9"
                onClick={() => {
                  if (isAuthenticated) {
                    setIsProfileDropdownOpen(!isProfileDropdownOpen);
                  } else {
                    navigate("/login");
                  }
                }}
              >
                <UserAvatar size="sm" />
              </Button>

              {isProfileDropdownOpen && isAuthenticated && (
                <ProfileDropdown onClose={() => setIsProfileDropdownOpen(false)} />
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-slide-down">
            <div className="flex flex-col gap-2">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="flex items-center gap-2 mb-4">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search..."
                  className="flex-1 h-10 bg-secondary border-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>

              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`py-3 px-4 font-medium uppercase tracking-wide transition-colors duration-200 rounded-md ${isActive(link.path)
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground hover:bg-secondary"
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <ChatBot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </header>
  );
};

export default Header;
