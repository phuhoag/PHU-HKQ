import { MdStarRate } from "react-icons/md";

export default function RatingFilter({ selectedRating, onChange }) {
  const ratings = [4, 3, 2, 1];

  return (
    <section>
      <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-stack-sm">
        Rating
      </h4>
      <div className="space-y-2">
        {ratings.map((rating) => (
          <label
            key={rating}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <input
              type="radio"
              name="rating"
              checked={selectedRating === rating}
              onChange={() => onChange(rating)}
              className="w-5 h-5 border-outline-variant text-primary focus:ring-primary"
            />
            <div className="flex text-tertiary">
              {[...Array(5)].map((_, i) => (
                <MdStarRate
                  key={i}
                  className={i < rating ? "fill-current" : ""}
                  size={18}
                />
              ))}
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              &amp; Up
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}
