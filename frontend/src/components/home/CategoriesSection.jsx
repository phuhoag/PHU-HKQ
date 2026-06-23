import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MdArrowForward } from "react-icons/md";
import productService from "../../services/productService.js";

const STATIC_CATEGORIES = {
  Laptops: {
    description: "High-performance laptops",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300&h=300&fit=crop",
    color: "from-blue-500 to-blue-600",
  },
  Keyboards: {
    description: "Mechanical & wireless",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=865&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    color: "from-purple-500 to-purple-600",
  },
  Monitors: {
    description: "4K & ultrawide displays",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop",
    color: "from-cyan-500 to-cyan-600",
  },
  Mice: {
    description: "Ergonomic & gaming",
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=300&h=300&fit=crop",
    color: "from-pink-500 to-pink-600",
  },
};

export default function CategoriesSection() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    productService
      .getCategories()
      .then((res) => {
        if (res.success) {
          // Map database IDs to our static layout configurations
          const matched = res.data
            .filter((cat) => STATIC_CATEGORIES[cat.name])
            .map((cat) => ({
              ...cat,
              ...STATIC_CATEGORIES[cat.name],
            }));
          setCategories(matched);
        }
      })
      .catch((err) => console.error("Error fetching categories for home:", err));
  }, []);

  const displayCategories =
    categories.length > 0
      ? categories
      : Object.entries(STATIC_CATEGORIES).map(([name, val], idx) => ({
          _id: "",
          name,
          ...val,
        }));

  return (
    <section className="py-stack-lg">
      <div className="max-w-container-max mx-auto px-margin-desktop">
        <div className="mb-stack-lg">
          <h2 className="font-h2 text-h2 text-on-surface mb-2">
            Shop by Category
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Browse our wide range of tech products
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {displayCategories.map((category, idx) => (
            <Link
              key={category._id || idx}
              to={category._id ? `/shop?category=${category._id}` : "/shop"}
              className="group relative overflow-hidden rounded-xl h-64 flex items-end shadow-md hover:shadow-lg transition-shadow"
            >
              {/* Background Image */}
              <img
                src={category.image}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-on-surface via-transparent to-transparent opacity-70" />

              {/* Content */}
              <div className="relative z-10 w-full p-stack-md">
                <h3 className="font-h3 text-h3 text-on-primary mb-1">
                  {category.name}
                </h3>
                <p className="font-body-sm text-body-sm text-on-primary opacity-90 mb-3">
                  {category.description}
                </p>
                <div className="inline-flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg font-button text-button group-hover:bg-primary-container transition-colors">
                  Explore
                  <MdArrowForward size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
