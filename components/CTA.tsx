import Link from "next/link";

const CTA = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-focus py-20 md:py-28">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl"></div>
        {/* Book pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="book-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M10 2v16M2 10h16" stroke="currentColor" strokeWidth="0.5" fill="none" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#book-pattern)" />
          </svg>
        </div>
      </div>

      <div className="relative max-w-4xl mx-auto px-8 text-center text-primary-content">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm font-medium mb-6">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Start in under 5 minutes
        </div>

        <h2 className="font-bold text-3xl md:text-5xl tracking-tight mb-6">
          Your Knowledge Deserves to Be Shared
        </h2>
        <p className="text-lg md:text-xl opacity-90 mb-10 max-w-2xl mx-auto">
          Every day you wait is another day your expertise stays locked in your head.
          Start creating your book today and reach readers tomorrow.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/sign-in" className="btn btn-lg bg-white text-primary hover:bg-white/90 border-0 gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Get Started Free
          </Link>
          <Link href="#pricing" className="btn btn-lg btn-outline border-white/30 text-white hover:bg-white/10 hover:border-white/50">
            View Pricing
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="flex flex-wrap justify-center gap-8 text-sm opacity-80">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Free tier available
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Cancel anytime
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
