import { Suspense } from "react";
import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookCreationWizard from "@/components/BookCreationWizard";

export const metadata: Metadata = {
  title: "Create Interactive eBook - LiquidBooks",
  description:
    "Build and deploy interactive eBooks with executable code, exercises, and rich content using LiquidBooks. Deploy directly to GitHub Pages.",
  keywords:
    "LiquidBooks, interactive eBook, executable code, online book, technical documentation, GitHub Pages",
};

export default function LandingPage2() {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <Header />
      </Suspense>
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10 py-16">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <div className="badge badge-secondary badge-lg mb-4">
              AI-Powered Book Creation
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              Create Interactive eBooks
              <br />
              <span className="text-primary">With Executable Code</span>
            </h1>
            <p className="text-xl text-base-content/70 max-w-2xl mx-auto mb-8">
              Build beautiful, interactive technical books with live code execution,
              exercises, diagrams, and more. Deploy to GitHub Pages in minutes.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="flex items-center gap-2 bg-base-200 px-4 py-2 rounded-full">
                <span className="text-2xl">⚡</span>
                <span>JupyterLite</span>
              </div>
              <div className="flex items-center gap-2 bg-base-200 px-4 py-2 rounded-full">
                <span className="text-2xl">🐍</span>
                <span>Python in Browser</span>
              </div>
              <div className="flex items-center gap-2 bg-base-200 px-4 py-2 rounded-full">
                <span className="text-2xl">📊</span>
                <span>Mermaid Diagrams</span>
              </div>
              <div className="flex items-center gap-2 bg-base-200 px-4 py-2 rounded-full">
                <span className="text-2xl">🎯</span>
                <span>Exercises</span>
              </div>
              <div className="flex items-center gap-2 bg-base-200 px-4 py-2 rounded-full">
                <span className="text-2xl">📖</span>
                <span>PDF Export</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Overview */}
        <section className="py-16 bg-base-200">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Everything You Need for Technical Books
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="text-4xl mb-4">🖥️</div>
                  <h3 className="card-title">Executable Code</h3>
                  <p className="text-base-content/70">
                    Run Python, R, Julia code directly in the browser with JupyterLite.
                    Readers can experiment without installing anything.
                  </p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="text-4xl mb-4">🧩</div>
                  <h3 className="card-title">Interactive Widgets</h3>
                  <p className="text-base-content/70">
                    Add sliders, dropdowns, and visualizations that respond to user
                    input. Make learning hands-on.
                  </p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="text-4xl mb-4">✏️</div>
                  <h3 className="card-title">Exercises & Solutions</h3>
                  <p className="text-base-content/70">
                    Built-in exercise blocks with collapsible solutions. Perfect for
                    textbooks and tutorials.
                  </p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="text-4xl mb-4">📐</div>
                  <h3 className="card-title">Math & Diagrams</h3>
                  <p className="text-base-content/70">
                    LaTeX equations, Mermaid diagrams, and syntax-highlighted code
                    blocks for technical content.
                  </p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="text-4xl mb-4">🔗</div>
                  <h3 className="card-title">Cross-References</h3>
                  <p className="text-base-content/70">
                    Link to figures, equations, and sections by label. Auto-numbered
                    references throughout.
                  </p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="text-4xl mb-4">🚀</div>
                  <h3 className="card-title">One-Click Deploy</h3>
                  <p className="text-base-content/70">
                    Deploy to GitHub Pages instantly. Your book gets a free URL and
                    automatic updates on push.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Book Creation Wizard */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">
              Start Creating Your Book
            </h2>
            <p className="text-center text-base-content/70 mb-12 max-w-2xl mx-auto">
              Follow the wizard to describe your book, select features, and deploy to
              GitHub Pages
            </p>
            <BookCreationWizard />
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-base-200">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="space-y-8">
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-content rounded-full flex items-center justify-center font-bold text-xl">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Describe Your Book</h3>
                  <p className="text-base-content/70">
                    Enter your book title, author name, and outline your chapters. You
                    can add as many chapters as you need and reorder them easily.
                  </p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-content rounded-full flex items-center justify-center font-bold text-xl">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Select Features</h3>
                  <p className="text-base-content/70">
                    Choose from features like executable code, exercises,
                    diagrams, math equations, and more. Enable JupyterLite for
                    browser-based Python execution.
                  </p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-content rounded-full flex items-center justify-center font-bold text-xl">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Deploy to GitHub Pages</h3>
                  <p className="text-base-content/70">
                    Connect your GitHub account and deploy with one click. We generate
                    the config, chapter files, and GitHub Actions workflow
                    automatically.
                  </p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-content rounded-full flex items-center justify-center font-bold text-xl">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Edit Chapter Content</h3>
                  <p className="text-base-content/70">
                    Go back anytime to describe what you want in each chapter. Our AI
                    can help generate content based on your descriptions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8">Built on Modern Standards</h2>
            <div className="flex flex-wrap justify-center gap-8">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-base-200 rounded-lg flex items-center justify-center text-3xl mb-2">
                  📘
                </div>
                <span className="font-semibold">AI Content</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-base-200 rounded-lg flex items-center justify-center text-3xl mb-2">
                  📝
                </div>
                <span className="font-semibold">Rich Content</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-base-200 rounded-lg flex items-center justify-center text-3xl mb-2">
                  🐙
                </div>
                <span className="font-semibold">GitHub Pages</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-base-200 rounded-lg flex items-center justify-center text-3xl mb-2">
                  🪐
                </div>
                <span className="font-semibold">JupyterLite</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
