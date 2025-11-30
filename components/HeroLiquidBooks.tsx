"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const HeroLiquidBooks = () => {
  return (
    <section className="relative bg-gradient-to-br from-base-100 via-base-100 to-primary/5 overflow-hidden">
      {/* Animated background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-8 py-16 lg:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left side - Copy */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6"
            >
              <motion.svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </motion.svg>
              AI-Powered Book Creation
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-extrabold text-4xl lg:text-6xl tracking-tight mb-6"
            >
              Turn Your Expertise Into{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Beautiful Books
              </span>{" "}
              in Minutes
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg lg:text-xl text-base-content/70 leading-relaxed mb-8 max-w-2xl"
            >
              Stop wrestling with formatting and focus on what you do best—sharing knowledge.
              LiquidBooks uses AI to generate professional, interactive books that deploy
              instantly to the web.
            </motion.p>

            {/* Value props */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8"
            >
              {["No coding required", "AI writes your content", "Publish in one click"].map((item, index) => (
                <motion.div
                  key={item}
                  className="flex items-center gap-2 text-sm"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.svg
                    className="w-5 h-5 text-success"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, delay: 0.5 + index * 0.1 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </motion.svg>
                  <span>{item}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/sign-in" className="btn btn-primary btn-lg gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Get Started Free
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="#how-it-works" className="btn btn-outline btn-lg gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  See How It Works
                </Link>
              </motion.div>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="mt-10 pt-8 border-t border-base-300"
            >
              <p className="text-sm text-base-content/60 mb-4">Trusted by educators and authors worldwide</p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 items-center opacity-60">
                {["Universities", "Course Creators", "Tech Companies", "Authors"].map((item, index) => (
                  <motion.span
                    key={item}
                    className="font-semibold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                    whileHover={{ opacity: 1, scale: 1.1 }}
                  >
                    {item}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right side - Visual */}
          <motion.div
            className="flex-1 w-full max-w-xl"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <div className="relative">
              {/* Book preview mockup */}
              <motion.div
                className="bg-base-200 rounded-2xl shadow-2xl overflow-hidden border border-base-300"
                whileHover={{ y: -10, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                transition={{ duration: 0.3 }}
              >
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-base-300 border-b border-base-content/10">
                  <div className="flex gap-1.5">
                    <motion.div
                      className="w-3 h-3 rounded-full bg-error/60"
                      whileHover={{ scale: 1.2 }}
                    />
                    <motion.div
                      className="w-3 h-3 rounded-full bg-warning/60"
                      whileHover={{ scale: 1.2 }}
                    />
                    <motion.div
                      className="w-3 h-3 rounded-full bg-success/60"
                      whileHover={{ scale: 1.2 }}
                    />
                  </div>
                  <div className="flex-1 mx-4">
                    <motion.div
                      className="bg-base-100 rounded-md px-3 py-1 text-xs text-base-content/50 font-mono"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      yourname.github.io/my-book
                    </motion.div>
                  </div>
                </div>

                {/* Book content preview */}
                <div className="p-6 bg-base-100">
                  <div className="flex gap-6">
                    {/* Sidebar */}
                    <div className="hidden sm:block w-48 space-y-2">
                      <div className="text-xs font-semibold text-primary mb-3">Table of Contents</div>
                      {["1. Introduction", "2. Getting Started", "3. Core Concepts", "4. Advanced Topics", "5. Best Practices"].map((item, index) => (
                        <motion.div
                          key={item}
                          className={`text-sm py-1 px-2 rounded ${index === 0 ? "bg-primary/10 text-primary" : "text-base-content/60"}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.9 + index * 0.1 }}
                          whileHover={{ x: 5, transition: { duration: 0.2 } }}
                        >
                          {item}
                        </motion.div>
                      ))}
                    </div>

                    {/* Main content */}
                    <div className="flex-1 space-y-4">
                      <motion.h2
                        className="text-xl font-bold"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                      >
                        Introduction
                      </motion.h2>
                      <motion.p
                        className="text-sm text-base-content/70 leading-relaxed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.1 }}
                      >
                        Welcome to this comprehensive guide. In this book, you&apos;ll learn everything you need to know...
                      </motion.p>

                      {/* Admonition */}
                      <motion.div
                        className="bg-info/10 border-l-4 border-info p-3 rounded-r"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2 }}
                      >
                        <div className="flex items-center gap-2 text-info font-semibold text-sm mb-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Note
                        </div>
                        <p className="text-xs text-base-content/70">This is an interactive callout box created automatically!</p>
                      </motion.div>

                      {/* Code block */}
                      <motion.div
                        className="bg-base-300 rounded-lg p-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.3 }}
                      >
                        <div className="text-xs font-mono text-base-content/70">
                          <span className="text-primary">const</span> book = <span className="text-secondary">createBook</span>();
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating badges */}
              <motion.div
                className="absolute -top-4 -right-4 bg-success text-success-content px-3 py-1 rounded-full text-sm font-medium shadow-lg"
                initial={{ opacity: 0, scale: 0, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 1.4, type: "spring", stiffness: 500 }}
                whileHover={{ scale: 1.1 }}
              >
                Live Preview
              </motion.div>
              <motion.div
                className="absolute -bottom-4 -left-4 bg-primary text-primary-content px-3 py-1 rounded-full text-sm font-medium shadow-lg flex items-center gap-1"
                initial={{ opacity: 0, scale: 0, rotate: 10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 1.5, type: "spring", stiffness: 500 }}
                whileHover={{ scale: 1.1 }}
              >
                <motion.svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </motion.svg>
                AI Generated
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroLiquidBooks;
