import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Describe Your Book",
    description: "Enter your book title, description, and chapter outline. Our AI helps you structure your content for maximum impact.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Generate Content with AI",
    description: "Select your AI provider and watch as professional content is generated for each chapter. Review, edit, and make it yours.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Customize & Preview",
    description: "Add interactive elements, choose your theme, and preview exactly how your book will look to readers.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Publish Instantly",
    description: "One click deploys your book to GitHub Pages. Share your URL and start reaching readers immediately.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 md:py-28 bg-base-200" id="how-it-works">
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Simple Process
          </div>
          <h2 className="font-extrabold text-3xl md:text-5xl tracking-tight mb-6">
            From Idea to Published Book{" "}
            <span className="text-primary">in 4 Steps</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-base-content/70">
            No technical skills required. If you can write an email, you can create
            a professional book with LiquidBooks.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line (hidden on last item and mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-primary/20 -translate-y-1/2 z-0">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary/20 rounded-full"></div>
                </div>
              )}

              <div className="relative bg-base-100 rounded-2xl p-6 shadow-sm border border-base-300 h-full z-10">
                {/* Step number */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {step.number}
                  </div>
                  <div className="text-primary">{step.icon}</div>
                </div>

                <h3 className="font-bold text-xl mb-3">{step.title}</h3>
                <p className="text-base-content/70">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8 md:p-12">
            <h3 className="font-bold text-2xl md:text-3xl mb-4">
              Ready to Create Your First Book?
            </h3>
            <p className="text-base-content/70 mb-6 max-w-xl mx-auto">
              Join educators, authors, and technical writers who are creating
              beautiful, interactive books in minutes instead of months.
            </p>
            <Link href="/sign-in" className="btn btn-primary btn-lg gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Get Started Free
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
