"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

// Animated dot component
const AnimatedDot = ({
  index,
  color
}: {
  index: number;
  color: string;
}) => {
  const randomDelay = Math.random() * 2;
  const randomDuration = 3 + Math.random() * 2;
  const randomX = Math.random() * 100;
  const randomSize = 4 + Math.random() * 8;

  return (
    <motion.div
      className="absolute rounded-full opacity-60"
      style={{
        backgroundColor: color,
        width: randomSize,
        height: randomSize,
        left: `${randomX}%`,
        top: -20,
      }}
      initial={{ y: -20, opacity: 0 }}
      animate={{
        y: ["0%", "100%"],
        opacity: [0, 0.6, 0.6, 0],
      }}
      transition={{
        duration: randomDuration,
        delay: randomDelay,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
};

// Floating dots background
const FloatingDotsBackground = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const colors = [
    "#6366f1", // indigo
    "#8b5cf6", // violet
    "#a855f7", // purple
    "#ec4899", // pink
    "#14b8a6", // teal
    "#06b6d4", // cyan
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 30 }).map((_, i) => (
        <AnimatedDot
          key={i}
          index={i}
          color={colors[i % colors.length]}
        />
      ))}
    </div>
  );
};

// Pain point card with animation
const PainPointCard = ({
  icon,
  title,
  description,
  delay
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      whileHover={{
        y: -8,
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className="group relative bg-base-100/80 backdrop-blur-sm rounded-2xl p-8 border border-base-content/10 shadow-lg hover:shadow-xl transition-shadow"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-error/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative">
        {/* Icon with pulse animation */}
        <motion.div
          className="mb-4"
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-14 h-14 rounded-xl bg-error/10 flex items-center justify-center">
            {icon}
          </div>
        </motion.div>

        <h3 className="font-bold text-xl mb-3 text-base-content group-hover:text-error transition-colors">
          {title}
        </h3>
        <p className="text-base-content/70 leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

const ProblemLiquidBooks = () => {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, amount: 0.5 });

  const painPoints = [
    {
      icon: (
        <svg className="w-7 h-7 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Hours of Formatting",
      description: "You spend more time fighting with Word, Google Docs, or LaTeX than actually writing content. Every update means reformatting everything again.",
    },
    {
      icon: (
        <svg className="w-7 h-7 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Static, Boring Output",
      description: "Traditional PDFs can't include interactive code, videos, or dynamic content. Your readers deserve a modern learning experience.",
    },
    {
      icon: (
        <svg className="w-7 h-7 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
      title: "Complex Publishing",
      description: "Getting your book online requires hosting, deployment pipelines, and technical know-how. Most authors give up before they publish.",
    },
  ];

  return (
    <section className="relative bg-gradient-to-b from-base-200 to-base-100 overflow-hidden">
      {/* Animated dots background - only visible in light theme */}
      <div className="dark:opacity-0 transition-opacity">
        <FloatingDotsBackground />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-30" />

      <div className="relative max-w-7xl mx-auto px-8 py-20 md:py-28">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-error/10 text-error text-sm font-medium mb-6"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            The Problem
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-extrabold text-3xl md:text-5xl tracking-tight mb-6 text-base-content"
          >
            Creating Professional Documentation
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-error to-error/60">
              Is Painful
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg text-base-content/70 leading-relaxed"
          >
            You have valuable knowledge to share, but the tools make it harder than it needs to be.
          </motion.p>
        </div>

        {/* Pain points grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {painPoints.map((point, index) => (
            <PainPointCard
              key={index}
              icon={point.icon}
              title={point.title}
              description={point.description}
              delay={0.1 * (index + 1)}
            />
          ))}
        </div>

        {/* The turning point */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-base-100 shadow-lg border border-base-content/10">
            <motion.span
              className="text-2xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </motion.span>
            <span className="text-base-content/80 text-lg">
              You shouldn&apos;t need a technical degree to share your expertise
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProblemLiquidBooks;
