"use client";

import { useState } from "react";

interface Feature {
  id: string;
  icon: JSX.Element;
  title: string;
  headline: string;
  description: string;
  benefits: string[];
}

const features: Feature[] = [
  {
    id: "ai-generation",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: "AI Content Generation",
    headline: "Let AI Do the Heavy Lifting",
    description: "Describe your chapter and watch as AI generates professional, well-structured content in seconds. Edit and refine to make it yours.",
    benefits: [
      "Generate entire chapters from a brief description",
      "Choose from Claude, GPT-4, or Gemini",
      "Smart formatting with code blocks, callouts & more",
      "Maintain your voice while saving hours of writing"
    ]
  },
  {
    id: "interactive",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: "Interactive Content",
    headline: "Books That Come Alive",
    description: "Go beyond static PDFs. Create books with executable code, embedded videos, collapsible sections, and interactive diagrams.",
    benefits: [
      "Executable code blocks readers can run",
      "Embedded YouTube and video content",
      "Collapsible sections and tabbed content",
      "Mermaid diagrams and mathematical equations"
    ]
  },
  {
    id: "one-click-publish",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
    title: "One-Click Publishing",
    headline: "From Draft to Live in Seconds",
    description: "No servers to configure, no deployment pipelines to manage. Click publish and your book is live on GitHub Pages instantly.",
    benefits: [
      "Free hosting on GitHub Pages",
      "Custom domain support",
      "Automatic builds on every update",
      "Real-time deployment status tracking"
    ]
  },
  {
    id: "collaboration",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: "Team Collaboration",
    headline: "Write Together, Publish as One",
    description: "Invite authors, editors, and reviewers. Assign chapters, track progress, and maintain version history across your team.",
    benefits: [
      "Role-based access (Author, Editor, Publisher)",
      "Chapter assignments and progress tracking",
      "Comment and review workflows",
      "Complete version history"
    ]
  },
  {
    id: "rich-content",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    title: "Rich Content",
    headline: "Write Simply, Publish Beautifully",
    description: "Use familiar Markdown with powerful extensions. Add callouts, figures with captions, cross-references, and citations effortlessly.",
    benefits: [
      "Familiar Markdown syntax",
      "70+ directives and roles",
      "Automatic table of contents",
      "Cross-references and citations"
    ]
  },
  {
    id: "export",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: "Multiple Export Formats",
    headline: "One Source, Many Outputs",
    description: "Write once, export anywhere. Generate PDF, Word, LaTeX, or keep it as a beautiful web book—all from the same source.",
    benefits: [
      "Professional PDF generation",
      "Word document export",
      "LaTeX for academic publishing",
      "JATS XML for journals"
    ]
  }
];

const FeaturesLiquidBooks = () => {
  const [activeFeature, setActiveFeature] = useState(features[0]);

  return (
    <section className="py-20 md:py-28 bg-base-100" id="features">
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Powerful Features
          </div>
          <h2 className="font-extrabold text-3xl md:text-5xl tracking-tight mb-6">
            Everything You Need to Create{" "}
            <span className="text-primary">World-Class Books</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-base-content/70">
            From AI-powered writing to one-click publishing, LiquidBooks gives you
            professional tools without the professional learning curve.
          </p>
        </div>

        {/* Features grid - Mobile: cards, Desktop: interactive */}
        <div className="lg:hidden grid gap-6">
          {features.map((feature) => (
            <div key={feature.id} className="bg-base-200 rounded-2xl p-6">
              <div className="text-primary mb-4">{feature.icon}</div>
              <h3 className="font-bold text-xl mb-2">{feature.headline}</h3>
              <p className="text-base-content/70 mb-4">{feature.description}</p>
              <ul className="space-y-2">
                {feature.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <svg className="w-5 h-5 text-success shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Desktop: Interactive tabs */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-8">
          {/* Feature tabs */}
          <div className="lg:col-span-2 space-y-2">
            {features.map((feature) => (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(feature)}
                className={`w-full text-left p-4 rounded-xl transition-all ${
                  activeFeature.id === feature.id
                    ? "bg-primary text-primary-content shadow-lg"
                    : "bg-base-200 hover:bg-base-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={activeFeature.id === feature.id ? "text-primary-content" : "text-primary"}>
                    {feature.icon}
                  </div>
                  <div>
                    <div className="font-semibold">{feature.title}</div>
                    <div className={`text-sm ${activeFeature.id === feature.id ? "text-primary-content/80" : "text-base-content/60"}`}>
                      {feature.headline}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Feature detail */}
          <div className="lg:col-span-3">
            <div className="bg-base-200 rounded-2xl p-8 h-full">
              <div className="text-primary mb-4">{activeFeature.icon}</div>
              <h3 className="font-bold text-2xl mb-3">{activeFeature.headline}</h3>
              <p className="text-base-content/70 text-lg mb-6">{activeFeature.description}</p>
              <ul className="grid gap-3">
                {activeFeature.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-base-content/80">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesLiquidBooks;
