import { MdStarRate } from "react-icons/md";

const TESTIMONIALS = [
  {
    id: 1,
    name: "Alex Johnson",
    role: "Software Engineer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    rating: 5,
    text: "Outstanding quality and fast shipping! The laptop I purchased exceeded my expectations.",
  },
  {
    id: 2,
    name: "Sarah Chen",
    role: "Content Creator",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    rating: 5,
    text: "Best prices for tech products. Their customer service is responsive and helpful.",
  },
  {
    id: 3,
    name: "Michael Brown",
    role: "Gamer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    rating: 5,
    text: "Amazing selection and competitive pricing. Will definitely shop here again!",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-stack-lg">
      <div className="max-w-container-max mx-auto px-margin-desktop">
        <div className="text-center mb-stack-lg">
          <h2 className="font-h2 text-h2 text-on-surface mb-2">
            What Our Customers Say
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust TechStore
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {TESTIMONIALS.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-surface border border-outline-variant rounded-lg p-stack-md shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-stack-md text-tertiary">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <MdStarRate key={i} className="fill-current" size={16} />
                ))}
              </div>

              {/* Text */}
              <p className="font-body-md text-body-md text-on-surface mb-stack-md italic">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-button text-button text-on-surface">
                    {testimonial.name}
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
