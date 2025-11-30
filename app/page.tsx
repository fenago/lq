import { Suspense } from 'react';
import Header from "@/components/Header";
import HeroLiquidBooks from "@/components/HeroLiquidBooks";
import ProblemLiquidBooks from "@/components/ProblemLiquidBooks";
import BenefitsSection from "@/components/BenefitsSection";
import FeaturesLiquidBooks from "@/components/FeaturesLiquidBooks";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import Testimonials3 from "@/components/Testimonials3";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { Metadata } from 'next';

// Add metadata for SEO
export const metadata: Metadata = {
  title: 'LiquidBooks - Create Beautiful Interactive eBooks with AI',
  description: 'Transform your ideas into professional, interactive eBooks in minutes. AI-powered content generation and instant deployment to GitHub Pages. Perfect for educators, authors, and technical writers.',
  keywords: 'ebook creator, AI book writer, LiquidBooks, interactive documentation, technical writing, course creation, GitHub Pages publishing',
};

export default function Home(): JSX.Element {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <Header />
      </Suspense>
      <main>
        {/* LiquidBooks - Create Beautiful Interactive eBooks with AI */}
        <HeroLiquidBooks />
        <ProblemLiquidBooks />
        <BenefitsSection />
        <FeaturesLiquidBooks />
        <HowItWorks />
        <Pricing />
        <Testimonials3 />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
