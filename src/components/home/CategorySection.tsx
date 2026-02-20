import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    name: "Running",
    slug: "running",
    image: "/assets/images/photo-1595950653106-6c9ebd614d3a.jpg",
    description: "Engineered for speed",
  },
  {
    name: "Basketball",
    slug: "basketball",
    image: "/assets/images/photo-1579338559194-a162d19bf842.jpg",
    description: "Dominate the court",
  },
  {
    name: "Casual",
    slug: "casual",
    image: "/assets/images/photo-1549298916-b41d501d3772.jpg",
    description: "Everyday comfort",
  },
];

const CategorySection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-accent font-semibold tracking-widest mb-2">CATEGORIES</p>
          <h2 className="font-heading text-4xl md:text-5xl font-bold">
            FIND YOUR STYLE
          </h2>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.slug}
              to={`/shop?category=${category.slug}`}
              className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-secondary"
            >
              {/* Background Image */}
              <img
                src={category.image}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <p className="text-primary-foreground/70 text-sm mb-1">
                  {category.description}
                </p>
                <h3 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
                  {category.name}
                </h3>
                <div className="flex items-center gap-2 text-accent font-semibold group-hover:gap-4 transition-all duration-300">
                  <span>SHOP NOW</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
