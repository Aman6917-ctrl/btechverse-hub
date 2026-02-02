import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImage from "@/assets/logo.png";

const navLinks = [
  { name: "Resources", href: "#resources" },
  { name: "Branches", href: "#branches" },
  { name: "Mentors", href: "#mentors" },
  { name: "AI Buddy", href: "#ai-assistant" },
  { name: "About", href: "#about" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4"
    >
      {/* Floating Pill Navbar */}
      <nav
        className={`relative flex items-center justify-between gap-2 px-2 py-2 md:px-3 md:py-2 rounded-full transition-all duration-300 ${
          scrolled
            ? "bg-background/95 backdrop-blur-md shadow-lg shadow-foreground/5"
            : "bg-background/90 backdrop-blur-sm shadow-md shadow-foreground/5"
        } border border-border/50 max-w-4xl w-full`}
      >
        {/* Logo - Left */}
        <a href="#" className="flex items-center gap-2 pl-2 flex-shrink-0">
          <img src={logoImage} alt="BTechVerse" className="h-8 w-auto" />
          <span className="text-base font-bold hidden sm:inline text-primary">
            btechverse
          </span>
        </a>

        {/* Desktop Navigation - Center */}
        <div className="hidden md:flex items-center gap-1 px-2">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-primary link-underline transition-all duration-200"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Desktop CTA - Right */}
        <div className="hidden md:flex items-center">
          <Button 
            size="sm" 
            className="rounded-full px-5 h-9 bg-foreground text-background hover:bg-foreground/90"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-full hover:bg-muted/50 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 left-4 right-4 md:hidden"
          >
            <div className="bg-background/95 backdrop-blur-md rounded-2xl shadow-lg shadow-foreground/5 border border-border/50 p-4 max-w-4xl mx-auto">
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </a>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border/50">
                <Button className="w-full rounded-full">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
