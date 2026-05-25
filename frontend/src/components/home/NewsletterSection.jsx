import { useState } from "react";
import { MdEmail } from "react-icons/md";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <section className="bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-xl overflow-hidden">
      <div className="px-margin-desktop py-stack-lg flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left Content */}
        <div className="flex-1">
          <h2 className="font-h2 text-h2 text-on-primary mb-stack-sm">
            Subscribe to Our Newsletter
          </h2>
          <p className="font-body-md text-body-md text-on-primary opacity-90">
            Get exclusive deals, new product launches, and tech tips delivered
            to your inbox.
          </p>
        </div>

        {/* Right Form */}
        <form onSubmit={handleSubscribe} className="flex-1 flex gap-2 max-w-md">
          <div className="flex-1 relative">
            <MdEmail
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary"
              size={20}
            />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3 rounded-lg text-on-primary placeholder-on-primary placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-on-primary"
            />
          </div>
          <button
            type="submit"
            className="px-8 py-3 bg-on-primary text-primary rounded-lg font-button text-button hover:bg-surface-container-low transition-colors whitespace-nowrap"
          >
            {subscribed ? "Subscribed!" : "Subscribe"}
          </button>
        </form>
      </div>
    </section>
  );
}
