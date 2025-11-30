"use client";

import Link from "next/link";

const AdvancedFeaturesSection = () => {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-base-100 via-base-100 to-primary/5" id="advanced-features">
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full text-primary text-sm font-medium mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            What Makes Us Different
          </div>
          <h2 className="font-extrabold text-3xl md:text-5xl tracking-tight mb-6">
            AI That Writes{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Like You
            </span>
          </h2>
          <p className="max-w-3xl mx-auto text-lg text-base-content/70">
            Other AI tools generate generic content. LiquidBooks captures your unique voice, thinking patterns,
            and writing style to create books that sound authentically <em>you</em>.
          </p>
        </div>

        {/* Two main features */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Writing Styles Framework */}
          <div className="bg-base-100 rounded-3xl shadow-xl border border-base-200 overflow-hidden group hover:shadow-2xl transition-shadow">
            <div className="p-8 md:p-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center text-primary-content">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-2xl">Writing Styles Framework</h3>
                  <p className="text-base-content/60 text-sm">104+ Master Author Styles</p>
                </div>
              </div>

              <p className="text-base-content/70 mb-6">
                Write like Hemingway, teach like Feynman, or inspire like Sagan. Choose from our
                curated library of master author styles or create your own unique blend.
              </p>

              {/* Style Categories Preview */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-base-200/50 rounded-xl p-4">
                  <div className="font-semibold text-sm mb-2">Academic & Educational</div>
                  <div className="text-xs text-base-content/60">Feynman, Boas, Spivak, Zinsser...</div>
                </div>
                <div className="bg-base-200/50 rounded-xl p-4">
                  <div className="font-semibold text-sm mb-2">Fiction Masters</div>
                  <div className="text-xs text-base-content/60">Asimov, Tolkien, Christie, King...</div>
                </div>
                <div className="bg-base-200/50 rounded-xl p-4">
                  <div className="font-semibold text-sm mb-2">Children's Books</div>
                  <div className="text-xs text-base-content/60">Dr. Seuss, Dahl, Boynton...</div>
                </div>
                <div className="bg-base-200/50 rounded-xl p-4">
                  <div className="font-semibold text-sm mb-2">Non-Fiction</div>
                  <div className="text-xs text-base-content/60">Sagan, Bryson, Malcolm Gladwell...</div>
                </div>
              </div>

              {/* Key Features List */}
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">Customizable tone, structure & interactivity levels</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">8 copywriting frameworks (Schwartz, Cialdini, AIDA...)</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">Mix styles: "Feynman's clarity with Sagan's wonder"</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">Real-time style preview before generating</span>
                </li>
              </ul>

              <Link href="/dashboard/styles" className="btn btn-primary btn-block group-hover:btn-accent transition-colors">
                Explore Writing Styles
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Author Psychometrics */}
          <div className="bg-base-100 rounded-3xl shadow-xl border border-base-200 overflow-hidden group hover:shadow-2xl transition-shadow">
            <div className="p-8 md:p-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-secondary to-secondary/60 rounded-2xl flex items-center justify-center text-secondary-content">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-2xl">Author Psychometrics</h3>
                  <p className="text-base-content/60 text-sm">299 Data Points Captured</p>
                </div>
              </div>

              <p className="text-base-content/70 mb-6">
                Go beyond style templates. Our psychometric profiling captures your unique
                thinking patterns, emotional landscape, and voice characteristics for truly personal AI writing.
              </p>

              {/* Assessment Categories */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="bg-base-200/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-primary">30</div>
                  <div className="text-xs text-base-content/60">Big Five Traits</div>
                </div>
                <div className="bg-base-200/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-primary">24</div>
                  <div className="text-xs text-base-content/60">Character Strengths</div>
                </div>
                <div className="bg-base-200/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-primary">25</div>
                  <div className="text-xs text-base-content/60">Writing Preferences</div>
                </div>
              </div>

              {/* What Gets Captured */}
              <div className="bg-gradient-to-br from-base-200/80 to-base-200/40 rounded-xl p-4 mb-6">
                <div className="text-sm font-semibold mb-2">What We Capture:</div>
                <div className="flex flex-wrap gap-2">
                  {["Thinking Patterns", "Reasoning Style", "Emotional Depth", "Voice Markers", "Worldview", "Humor Style"].map((item) => (
                    <span key={item} className="px-2 py-1 bg-base-100 rounded-full text-xs">{item}</span>
                  ))}
                </div>
              </div>

              {/* Key Features List */}
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">15-minute scientifically-validated assessment</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">AI-guided voice interview (optional)</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">Writing sample analysis for authentic patterns</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">Reusable profile across all your books</span>
                </li>
              </ul>

              <Link href="/dashboard/psychometrics" className="btn btn-secondary btn-block group-hover:btn-accent transition-colors">
                Create Your Profile
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-primary mb-2">104+</div>
            <div className="text-sm text-base-content/60">Author Styles</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">20</div>
            <div className="text-sm text-base-content/60">Book Categories</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">299</div>
            <div className="text-sm text-base-content/60">Data Points</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">85%+</div>
            <div className="text-sm text-base-content/60">Voice Accuracy</div>
          </div>
        </div>

        {/* Comparison Note */}
        <div className="mt-12 text-center">
          <p className="text-base-content/50 text-sm max-w-2xl mx-auto">
            While other AI writing tools produce one-size-fits-all content, LiquidBooks creates content
            that thinks like you, reasons like you, and writes like you. It's the difference between
            a generic template and a personal ghostwriter who truly knows you.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AdvancedFeaturesSection;
