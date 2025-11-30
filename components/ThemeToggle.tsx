"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    const initialTheme = savedTheme || systemTheme;
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full bg-base-300 flex items-center px-1 cursor-pointer border border-base-content/10"
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {/* Sun icon */}
      <motion.div
        className="absolute left-1.5"
        initial={false}
        animate={{ opacity: theme === "light" ? 1 : 0.3 }}
      >
        <svg
          className="w-4 h-4 text-yellow-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>
      </motion.div>

      {/* Moon icon */}
      <motion.div
        className="absolute right-1.5"
        initial={false}
        animate={{ opacity: theme === "dark" ? 1 : 0.3 }}
      >
        <svg
          className="w-4 h-4 text-indigo-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      </motion.div>

      {/* Toggle ball */}
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          className="w-5 h-5 rounded-full bg-primary shadow-md"
          initial={{ x: theme === "light" ? 0 : 24 }}
          animate={{ x: theme === "light" ? 0 : 24 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        />
      </AnimatePresence>
    </motion.button>
  );
}
