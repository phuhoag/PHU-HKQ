export default function CategoryFilter({
  categories,
  selectedCategories,
  onChange,
}) {
  const handleChange = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      onChange(selectedCategories.filter((id) => id !== categoryId));
    } else {
      onChange([...selectedCategories, categoryId]);
    }
  };

  return (
    <section>
      <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-stack-sm">
        Category
      </h4>
      <div className="space-y-2">
        {categories.map((category) => (
          <label
            key={category.id}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedCategories.includes(category.id)}
              onChange={() => handleChange(category.id)}
              className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary"
            />
            <span className="font-body-sm text-body-sm text-on-surface group-hover:text-primary">
              {category.name} ({category.count})
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}
