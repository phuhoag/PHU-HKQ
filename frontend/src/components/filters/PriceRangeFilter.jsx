export default function PriceRangeFilter({
  minPrice = 0,
  maxPrice = 5000,
  onChange,
}) {
  const handlePriceChange = (e) => {
    onChange(parseInt(e.target.value));
  };

  return (
    <section>
      <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-stack-sm">
        Price Range
      </h4>
      <div className="px-2">
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          defaultValue={maxPrice}
          onChange={handlePriceChange}
          className="w-full h-1.5 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between mt-2 text-body-sm text-on-surface-variant">
          <span>${minPrice}</span>
          <span>${maxPrice.toLocaleString()}+</span>
        </div>
      </div>
    </section>
  );
}
