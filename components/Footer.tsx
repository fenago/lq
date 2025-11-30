import Link from "next/link";
import Image from "next/image";
import config from "@/config";
import logo from "@/app/icon.png";

// Add the Footer to the bottom of your landing page and more.
// The support link is connected to the config.js file. If there's no config.resend.supportEmail, the link won't be displayed.

const Footer = () => {
  return (
    <footer className="bg-base-200 border-t border-base-content/10">
      <div className="max-w-7xl mx-auto px-8 py-24">
        <div className="flex lg:items-start md:flex-row md:flex-nowrap flex-wrap flex-col">
          <div className="w-72 flex-shrink-0 md:mx-0 mx-auto text-center md:text-left">
            <Link
              href="/#"
              aria-current="page"
              className="flex gap-2 justify-center md:justify-start items-center"
            >
              <Image
                src={logo}
                alt={`${config.appName} logo`}
                priority={true}
                className="w-6 h-6"
                width={24}
                height={24}
              />
              <strong className="font-extrabold tracking-tight text-base md:text-lg">
                {config.appName}
              </strong>
            </Link>

            <p className="mt-3 text-sm text-base-content/80">
              Create beautiful, interactive books with AI. From idea to published book in minutes.
            </p>
            <p className="mt-3 text-sm text-base-content/60">
              Copyright © {new Date().getFullYear()} - All rights reserved
            </p>

            {/* Social links */}
            <div className="flex gap-4 mt-4 justify-center md:justify-start">
              <a href="https://twitter.com/liquidbooks" target="_blank" rel="noopener noreferrer" className="text-base-content/60 hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://github.com/liquidbooks" target="_blank" rel="noopener noreferrer" className="text-base-content/60 hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="flex-grow flex flex-wrap justify-center -mb-10 md:mt-0 mt-10 text-center">
            <div className="lg:w-1/3 md:w-1/2 w-full px-4">
              <div className="footer-title font-semibold text-base-content tracking-widest text-sm md:text-left mb-3">
                PRODUCT
              </div>

              <div className="flex flex-col justify-center items-center md:items-start gap-2 mb-10 text-sm">
                <Link href="/#features" className="link link-hover">
                  Features
                </Link>
                <Link href="/#how-it-works" className="link link-hover">
                  How It Works
                </Link>
                <Link href="/#pricing" className="link link-hover">
                  Pricing
                </Link>
                <Link href="/#faq" className="link link-hover">
                  FAQ
                </Link>
              </div>
            </div>

            <div className="lg:w-1/3 md:w-1/2 w-full px-4">
              <div className="footer-title font-semibold text-base-content tracking-widest text-sm md:text-left mb-3">
                RESOURCES
              </div>

              <div className="flex flex-col justify-center items-center md:items-start gap-2 mb-10 text-sm">
                <Link href="/blog" className="link link-hover">
                  Blog
                </Link>
                <a href="/docs" className="link link-hover">
                  Documentation
                </a>
                {config.resend.supportEmail && (
                  <a
                    href={`mailto:${config.resend.supportEmail}`}
                    target="_blank"
                    className="link link-hover"
                    aria-label="Contact Support"
                  >
                    Support
                  </a>
                )}
              </div>
            </div>

            <div className="lg:w-1/3 md:w-1/2 w-full px-4">
              <div className="footer-title font-semibold text-base-content tracking-widest text-sm md:text-left mb-3">
                LEGAL
              </div>

              <div className="flex flex-col justify-center items-center md:items-start gap-2 mb-10 text-sm">
                <Link href="/tos" className="link link-hover">
                  Terms of Service
                </Link>
                <Link href="/privacy-policy" className="link link-hover">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
