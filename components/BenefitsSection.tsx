"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface BenefitCardProps {
  icon: React.ReactNode;
  role: string;
  title: string;
  benefits: string[];
  gradient: string;
  delay: number;
}

const BenefitCard = ({ icon, role, title, benefits, gradient, delay }: BenefitCardProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      whileHover={{ y: -10, transition: { duration: 0.3 } }}
      className="group relative"
    >
      {/* Card with gradient border */}
      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />

      <div className="relative bg-base-100 rounded-3xl p-8 border border-base-content/10 shadow-xl h-full">
        {/* Icon */}
        <motion.div
          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 text-white`}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          {icon}
        </motion.div>

        {/* Role badge */}
        <div className="inline-block px-3 py-1 rounded-full bg-base-200 text-sm font-medium text-base-content/70 mb-4">
          {role}
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-base-content mb-4">{title}</h3>

        {/* Benefits list */}
        <ul className="space-y-3">
          {benefits.map((benefit, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: delay + 0.1 * index }}
              className="flex items-start gap-3"
            >
              <motion.div
                className="mt-1 flex-shrink-0"
                whileHover={{ scale: 1.2 }}
              >
                <svg className={`w-5 h-5 text-success`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <span className="text-base-content/70">{benefit}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

const BenefitsSection = () => {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, amount: 0.5 });

  const benefitCards = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      role: "Authors & Writers",
      title: "Turn Your Knowledge Into Beautiful Books",
      benefits: [
        "Write in simple Markdown, no design skills needed",
        "AI helps generate and refine your content",
        "Automatic professional formatting and styling",
        "One-click publish to a live website",
        "Update content anytime without republishing",
      ],
      gradient: "from-indigo-500 to-purple-600",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      role: "Professors & Researchers",
      title: "Create Interactive Course Materials",
      benefits: [
        "Embed executable code that students can run",
        "Include live data visualizations and charts",
        "Built-in exercises with auto-grading support",
        "LaTeX math equations rendered beautifully",
        "Cross-reference figures, equations, and citations",
      ],
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      role: "Corporate Trainers",
      title: "Scale Your Training Programs",
      benefits: [
        "Create consistent training materials at scale",
        "Track learner progress and engagement",
        "Easily update content across all materials",
        "Integrate with your existing LMS",
        "Brand customization for enterprise needs",
      ],
      gradient: "from-amber-500 to-orange-600",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      role: "Teachers & Educators",
      title: "Engage Students Like Never Before",
      benefits: [
        "Interactive lessons that keep students engaged",
        "Embed videos, quizzes, and activities",
        "Students can practice code in the browser",
        "Works on any device - phones, tablets, laptops",
        "Free hosting on GitHub Pages",
      ],
      gradient: "from-pink-500 to-rose-600",
    },
  ];

  return (
    <section id="benefits" className="relative py-24 md:py-32 bg-base-200 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-8">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Why LiquidBooks?
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-extrabold text-3xl md:text-5xl tracking-tight mb-6"
          >
            Benefits for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Every Creator
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg text-base-content/70 leading-relaxed"
          >
            Whether you&apos;re writing a textbook, building training materials, or sharing your expertise,
            LiquidBooks empowers you to create professional interactive content effortlessly.
          </motion.p>
        </div>

        {/* Benefits grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {benefitCards.map((card, index) => (
            <BenefitCard
              key={index}
              icon={card.icon}
              role={card.role}
              title={card.title}
              benefits={card.benefits}
              gradient={card.gradient}
              delay={0.1 * (index + 1)}
            />
          ))}
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { value: "10x", label: "Faster to Create" },
            { value: "100%", label: "Browser-Based" },
            { value: "Free", label: "Hosting on GitHub" },
            { value: "24/7", label: "Always Available" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-2">
                {stat.value}
              </div>
              <div className="text-base-content/60 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default BenefitsSection;
