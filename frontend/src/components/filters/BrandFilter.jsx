export default function BrandFilter({ brands, selectedBrands, onChange }) {
  const handleChange = (brandId) => {
    if (selectedBrands.includes(brandId)) {
      onChange(selectedBrands.filter((id) => id !== brandId));
    } else {
      onChange([...selectedBrands, brandId]);
    }
  };

  return (
    <section>
      <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-stack-sm">
        Brand
      </h4>
      <div className="space-y-2">
        {brands.map((brand) => (
          <label
            key={brand.id}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedBrands.includes(brand.id)}
              onChange={() => handleChange(brand.id)}
              className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary"
            />
            <span className="font-body-sm text-body-sm text-on-surface group-hover:text-primary">
              {brand.name}
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}
