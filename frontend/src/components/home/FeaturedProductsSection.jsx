import { Link } from "react-router-dom";
import ProductCard from "../products/ProductCard";
import { MdArrowForward } from "react-icons/md";

const FEATURED_PRODUCTS = [
  {
    id: 1,
    name: 'ZenBook Pro 16" OLED - M2 Max',
    brand: "ZENCORE",
    price: 2499,
    rating: 4.9,
    reviews: 128,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC8BndQVUwEM7lw2g_MB_TA-6D3M8ovFMhP0KyWwJhvh0he5O2klJ4eU0004usrQG5RHrWnUfvnKsjTtNid_WuTXKasA4o232Wnerz-2YLRS0CO1wSocaCLizphgA_GDGrrBLz5CKmLJyW586CGvGYCB7J99w6lI6ZrNaljgggbqF767ycfjw7iaaEOUWwe-oJfLT0qLa1eojQxSpvaH1RWWY_1Bi7wog36lN4XuZtfZe2fhSCP0waRBl88-juoNx6eN5vjhLxbKNLE",
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
  },
];

export default function FeaturedProductsSection() {
  const badges = {
    0: {
      text: "NEW",
      position: "left-3",
      className: "bg-primary text-on-primary",
    },
    2: {
      text: "HOT",
      position: "right-3",
      className: "bg-tertiary text-on-tertiary",
    },
  };

  return (
    <section className="py-stack-lg bg-surface-container-low">
      <div className="max-w-container-max mx-auto px-margin-desktop">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-stack-lg">
          <div>
            <h2 className="font-h2 text-h2 text-on-surface mb-2">
              Featured Products
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Check out our best-selling items
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-container transition-colors font-button text-button"
          >
            View All
            <MdArrowForward size={20} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {FEATURED_PRODUCTS.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              badge={badges[index]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
