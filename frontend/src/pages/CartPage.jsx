import { MdShoppingCart, MdArrowBack } from "react-icons/md";
import Header from "../components/layouts/Header.jsx";
import Footer from "../components/layouts/Footer.jsx";
import CartItem from "../components/cart/CartItem.jsx";
import CartSummary from "../components/cart/CartSummary.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function CartPage() {
  const { cart, getTotalItems } = useCart();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-grow py-8 px-margin-mobile">
        <div className="w-full max-w-container-max mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <a
              href="/shop"
              className="flex items-center gap-2 text-primary hover:gap-3 transition mb-4"
            >
              <MdArrowBack size={20} />
              <span className="text-body-md font-body-md">
                Back to Shopping
              </span>
            </a>
            <h1 className="text-h1 font-h1 text-on-background flex items-center gap-3">
              <MdShoppingCart size={32} className="text-primary" />
              Shopping Cart
            </h1>
          </div>

          {/* Cart Content */}
          {cart.length === 0 ? (
            // Empty Cart
            <div className="flex flex-col items-center justify-center py-16 bg-surface-container-lowest rounded-xl border border-outline-variant">
              <MdShoppingCart
                size={64}
                className="text-on-surface-variant/50 mb-4"
              />
              <h2 className="text-h2 font-h2 text-on-background mb-2">
                Your cart is empty
              </h2>
              <p className="text-body-md text-on-surface-variant mb-6">
                Add some products to get started
              </p>
              <a
                href="/shop"
                className="px-6 py-3 bg-primary text-surface rounded-lg font-body-md hover:bg-primary/90 transition"
              >
                Start Shopping
              </a>
            </div>
          ) : (
            // Cart with Items
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <div className="mb-4">
                  <p className="text-body-md text-on-surface-variant">
                    You have {getTotalItems()} item
                    {getTotalItems() !== 1 ? "s" : ""} in your cart
                  </p>
                </div>

                {cart.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>

              {/* Cart Summary Sidebar */}
              <div>
                <CartSummary />
              </div>
            </div>
          )}

          {/* Recommended Products Section */}
          {cart.length > 0 && (
            <div className="mt-16">
              <h2 className="text-h2 font-h2 text-on-background mb-6">
                You might also like
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-surface-container-lowest rounded-xl p-6 border border-outline-variant">
                <div className="text-center py-8">
                  <p className="text-body-md text-on-surface-variant">
                    Recommended products will appear here
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
