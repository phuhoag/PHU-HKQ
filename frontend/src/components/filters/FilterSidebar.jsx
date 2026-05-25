import CategoryFilter from "./CategoryFilter";
import PriceRangeFilter from "./PriceRangeFilter";
import BrandFilter from "./BrandFilter";
import RatingFilter from "./RatingFilter";

export default function FilterSidebar({
  categories = [],
  brands = [],
  selectedCategories = [],
  selectedBrands = [],
  selectedRating = 0,
  maxPrice = 5000,
  onCategoryChange,
  onBrandChange,
  onRatingChange,
  onPriceChange,
}) {
  return (
    <aside className="w-full lg:w-64 flex-shrink-0 space-y-stack-lg">
      <CategoryFilter
        categories={categories}
        selectedCategories={selectedCategories}
        onChange={onCategoryChange}
      />
      <PriceRangeFilter maxPrice={maxPrice} onChange={onPriceChange} />
      <BrandFilter
        brands={brands}
        selectedBrands={selectedBrands}
        onChange={onBrandChange}
      />
      <RatingFilter selectedRating={selectedRating} onChange={onRatingChange} />
    </aside>
  );
}
