import { Link } from "react-router-dom";
import { Github, Linkedin, Twitter } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Product: [
      { label: "Features", path: "/" },
      { label: "Pricing", path: "/" },
      { label: "Security", path: "/" },
      { label: "Changelog", path: "/" },
    ],
    Company: [
      { label: "About", path: "/" },
      { label: "Blog", path: "/" },
      { label: "Careers", path: "/" },
      { label: "Contact", path: "/" },
    ],
    Resources: [
      { label: "Documentation", path: "/" },
      { label: "API Reference", path: "/" },
      { label: "Community", path: "/" },
      { label: "Support", path: "/" },
    ],
    Legal: [
      { label: "Privacy Policy", path: "/" },
      { label: "Terms of Service", path: "/" },
      { label: "Security Policy", path: "/" },
      { label: "Compliance", path: "/" },
    ],
  };

  return (
    <footer className="relative mt-20 pt-20 pb-10 border-t border-muted/50 bg-gradient-to-b from-transparent via-muted/10 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 group mb-4">
              <div className="relative w-10 h-10">
                <img
                  src="/reshot-icon-videos-YRS9MXEN8T.svg"
                  alt="VideoHub"
                  className="w-10 h-10 transform group-hover:scale-110 transition-transform"
                />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                VideoHub
              </span>
            </Link>
            <p className="text-foreground/60 text-sm leading-relaxed">
              Enterprise-grade video processing and streaming platform.
            </p>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wide">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-foreground/60 hover:text-primary transition-colors text-sm duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-muted/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Copyright */}
          <p className="text-foreground/60 text-sm">
            © {currentYear} VideoHub. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg glass hover:glass-accent hover:text-primary transition-colors duration-200"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg glass hover:glass-accent hover:text-primary transition-colors duration-200"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg glass hover:glass-accent hover:text-primary transition-colors duration-200"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
