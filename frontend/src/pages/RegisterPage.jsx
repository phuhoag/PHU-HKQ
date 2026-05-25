import RegisterForm from "../components/auth/RegisterForm.jsx";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-grow flex items-center justify-center py-stack-lg px-margin-mobile">
        <div className="w-full max-w-[1100px] grid grid-cols-1 md:grid-cols-2 bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant">
          {/* Left Side - Image */}
          <div className="hidden md:block relative h-full min-h-[600px] overflow-hidden">
            <img
              alt="Tech Community"
              className="absolute inset-0 w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWsyI9zwyjq2b9BhpAOmqP3u1jImL8LxFOddCI7cpAcl-xZakmaqUmPRSK9YCDpQGrlyYajz20Sgv-M5gRv9heg86-8ymCqLbtgXpltQWeETCiSHDquZbdOkdz6GRu5v-LS2vaTQuSnFNk3VlqKiySKmq-F0mVa22axFkhZLc0v1vfpDNECTcpkWMzkkjqi8BAqtT-e8wgCgHkz4xx3gq3k0e1j5qOFyYlbyjHcveinV6GLvNNUQfZj7ZBScWPzBPv7oebyjdHYP1X"
            />
            <div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>
            <div className="absolute inset-0 flex flex-col justify-end p-margin-desktop bg-gradient-to-t from-primary/80 to-transparent">
              <h2 className="font-h2 text-h2 text-on-primary mb-stack-sm">
                Join TechStore Community
              </h2>
              <p className="font-body-md text-body-md text-on-primary/90">
                Create your account and unlock exclusive access to our vast
                collection of tech products.
              </p>
            </div>
          </div>

          {/* Right Side - Form */}
          <RegisterForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop py-stack-lg max-w-container-max mx-auto w-full">
          <div className="mb-4 md:mb-0">
            <span className="text-h2 font-h2 text-primary">TechStore</span>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              © 2024 TechStore E-commerce. All rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-stack-md">
            <a
              href="/privacy"
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="/help"
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors"
            >
              Help Center
            </a>
            <a
              href="/contact"
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
