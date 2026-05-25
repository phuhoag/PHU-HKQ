import { useState } from "react";
import { Link } from "react-router-dom";
import { MdChevronRight } from "react-icons/md";
import Header from "../components/layouts/Header";
import Footer from "../components/layouts/Footer";
import FilterSidebar from "../components/filters/FilterSidebar";
import ProductGrid from "../components/products/ProductGrid";
import Pagination from "../components/common/Pagination";

const CATEGORIES = [
  { id: 1, name: "Laptops", count: 42 },
  { id: 2, name: "Keyboards", count: 28 },
  { id: 3, name: "Monitors", count: 15 },
  { id: 4, name: "Mice", count: 31 },
];

const BRANDS = [
  { id: 1, name: "Apex Pro" },
  { id: 2, name: "LuminaTech" },
  { id: 3, name: "ZenCore" },
];

const PRODUCTS = [
  {
    id: 1,
    name: 'ZenBook Pro 16" OLED - M2 Max',
    brand: "ZENCORE",
    price: 2499,
    rating: 4.9,
    reviews: 128,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC8BndQVUwEM7lw2g_MB_TA-6D3M8ovFMhP0KyWwJhvh0he5O2klJ4eU0004usrQG5RHrWnUfvnKsjTtNid_WuTXKasA4o232Wnerz-2YLRS0CO1wSocaCLizphgA_GDGrrBLz5CKmLJyW586CGvGYCB7J99w6lI6ZrNaljgggbqF767ycfjw7iaaEOUWwe-oJfLT0qLa1eojQxSpvaH1RWWY_1Bi7wog36lN4XuZtfZe2fhSCP0waRBl88-juoNx6eN5vjhLxbKNLE",
    category: 1,
    brand_id: 3,
  },
  {
    id: 2,
    name: 'Vision Ultra 34" Curved Display',
    brand: "LUMINATECH",
    price: 899,
    rating: 4.7,
    reviews: 85,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA-9ib38Sp0WESzYmCXEjUyoKeZnAgF65rqUQHSeGyrG_KVgElgImP0VWAwViVbCqifKehBdgfpFXb74wUFntBIeSEUDkuOqbbQmAk5wUb2W_PbnV4XZ5vddj-tGvH-CsB5hpUqRUzQSENNrfNaAF3IBVjM2rFT8PG-t5pp33U6F9KjFrbyzwchl2aXmlMlWR8dDn19QdQh2q5dT05YowhoLLKVcumh4fLGH7QvtAMHXil3fkJLY4KsP1y6O3XgXoUOXwiPPSu_DMUF",
    category: 3,
    brand_id: 2,
  },
  {
    id: 3,
    name: "Tactile X Mechanical Keyboard",
    brand: "APEX PRO",
    price: 179,
    rating: 4.8,
    reviews: 210,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCzM3T_sa4tZLTnFW89ByEWTCgmbaqXHYLnF5NNJiPpTmy1hQWJa--rISKIELnKjju9ayW1XwFqlrJl_IOuRS1G6OqWUaWYC5pjRhFi3hd0wBph0xUkTJ8nx0Klxmrj6A2t131sZl9KBxcssDC0dFVIL6Y8HX1f3zC-C59OIM0uwKelNXveWjVzmON5R748vYI98j2qd2k7jmo1A17tmDaSTmSBYwQewcirgjGjtCx78GqtRoPuefpOCeiF359tSZAWuY7qiIqN47OP",
    category: 2,
    brand_id: 1,
  },
  {
    id: 4,
    name: "Velocity Pro Wireless Mouse",
    brand: "APEX PRO",
    price: 129,
    rating: 4.9,
    reviews: 56,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB4A0_SOhtznU4NNX-c_pgKgkENmQO8CW20eyUNASPZv76cE4CMFV3rg-9vfKYfBqrC0XBfIJFZzJP9v9EQ_BIlUHC9lUU_cKbhcLTTEg6JT0KMvHbs8JEtvnSPvLfYKtSKWryM6DZ4aOsdUd9a64ie-pJK2mNhF4svFNsyJ6oc5JsviVeYPIB6zt4FYsWzZHkHM0-tOH3ChFF46E1j_nneoINmVmfdKR2UsQi27ygLmA0-dPibggR-EhydOg5BTiaJ69bWHAA1bb8H",
    category: 4,
    brand_id: 1,
  },
  {
    id: 5,
    name: "Aura ANC Wireless Headphones",
    brand: "ZENCORE",
    price: 349,
    rating: 4.6,
    reviews: 342,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC8nbWfwfJyem1tbvK2l7rYTEh_Zz9lchqezppQH8SCZx7iEh7NYMxGvOqAWSfh6VR9hepPrnPBauQ6T0c6giPg26HEu8REGySvGUdm_JKUVxqDKF_dekG-1rXVh-BQwe7rQrWUOSX-wzT90T5nCALAVVlGDcT6fix45c04uyxLMaNSuiXD5qP4DBz8Sd7pt6TJLszBP6eAnxfc7M0UaF1PzLahZYzUhLjnfXkee31UJ_wFvRHMegwWoZZrPDU-F-vgHS-a-e3ARp23",
    category: 4,
    brand_id: 3,
  },
  {
    id: 6,
    name: "Turbo 2TB External NVMe SSD",
    brand: "ZENCORE",
    price: 199,
    rating: 4.9,
    reviews: 19,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBU45t1bEZEq7Xf2_OioqQODabxzdFdYB_ve5YeqEYh-xV_8N-MHGXLoYg3oUlsL_wWfB7rOubvcNzYETWI9Uy30mEEF03jiVYGVt5DnV5hnpOh-XluWwV8iLYul58x9NpaopKGZG3e45gGzwy8_Wv3yN6bI_yKfbMSqjjZyP0CoOAsnLYV4BpKseUM7A7sikV6DthnyOtQ--p7VlwWW1ln9v7IyLCCW78B4A7ryYfePe-tSznTBrqsQSClQvTac24wE8rmaYxgiAha",
    category: 1,
    brand_id: 3,
  },
];

export default function ProductCatalog() {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProducts = PRODUCTS.filter((product) => {
    const categoryMatch =
      selectedCategories.length === 0 ||
      selectedCategories.includes(product.category);
    const brandMatch =
      selectedBrands.length === 0 || selectedBrands.includes(product.brand_id);
    const priceMatch = product.price <= maxPrice;
    const ratingMatch =
      selectedRating === 0 || product.rating >= selectedRating;

    return categoryMatch && brandMatch && priceMatch && ratingMatch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="max-w-container-max mx-auto px-margin-desktop py-stack-lg min-h-screen flex-1 w-full">
        {/* Breadcrumbs & Header */}
        <div className="mb-stack-lg">
          <nav className="flex items-center gap-2 text-body-sm text-on-surface-variant mb-stack-sm">
            <Link to="/" className="hover:text-primary">
              Home
            </Link>
            <MdChevronRight className="text-[16px]" />
            <Link to="/computing" className="hover:text-primary">
              Computing
            </Link>
            <MdChevronRight className="text-[16px]" />
            <span className="text-on-surface font-medium">
              Laptops &amp; Accessories
            </span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-h1 text-h1 text-on-surface">
                Laptops &amp; Accessories
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Showing {sortedProducts.length} of {PRODUCTS.length} products
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Sort by:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-surface border border-outline-variant rounded-lg px-4 py-2 text-body-sm focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-gutter">
          {/* Sidebar Filters */}
          <FilterSidebar
            categories={CATEGORIES}
            brands={BRANDS}
            selectedCategories={selectedCategories}
            selectedBrands={selectedBrands}
            selectedRating={selectedRating}
            maxPrice={maxPrice}
            onCategoryChange={setSelectedCategories}
            onBrandChange={setSelectedBrands}
            onRatingChange={setSelectedRating}
            onPriceChange={setMaxPrice}
          />

          {/* Product Grid */}
          <div className="flex-1">
            <ProductGrid products={sortedProducts} />
            <Pagination
              currentPage={currentPage}
              totalPages={12}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
