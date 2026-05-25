import ProductCard from "./ProductCard";

export default function ProductGrid({ products }) {
  const badges = {
    0: {
      text: "NEW",
      position: "left-3",
      className: "bg-primary text-on-primary",
    },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-gutter">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} badge={badges[index]} />
      ))}
    </div>
  );
}
