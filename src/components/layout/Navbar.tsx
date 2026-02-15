import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import logoImage from "@/assets/logo.png";

const navLinks = [
  { name: "Resources", href: "/#branches" },
  { name: "Interview Prep", href: "/interview-prep" },
  { name: "Mentors", href: "/mentors" },
  { name: "AI Assistant", href: "/#ai-assistant" },
  { name: "About", href: "/#about" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAuthClick = () => {
    navigate("/auth");
  };

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4"
    >
      {/* Floating Pill Navbar */}
      <nav
        className={`relative flex items-center justify-between gap-2 px-2 py-2 md:px-3 md:py-2 rounded-full transition-all duration-300 overflow-hidden ${
          scrolled
            ? "bg-background/95 backdrop-blur-md shadow-lg shadow-foreground/5"
            : "bg-background/90 backdrop-blur-sm shadow-md shadow-foreground/5"
        } border border-border/50 max-w-4xl w-full`}
      >
        {/* Logo - Left */}
        <Link to="/" className="flex items-center gap-2 pl-2 flex-shrink-0 min-w-0">
          <img src={logoImage} alt="Btechverse" className="h-8 w-auto" />
          <span className="text-[1rem] font-bold hidden sm:inline leading-8">
            Btech<span className="text-primary">verse</span>
          </span>
          <span className="hidden lg:inline text-xs handwritten text-muted-foreground/80 ml-0.5">for students</span>
        </Link>

        {/* Desktop Navigation - Center */}
        <div className="hidden md:flex items-center gap-1 px-2 min-w-0 flex-1 justify-center">
          {[...navLinks, ...(isAdmin ? [{ name: "Upload", href: "/upload" }] : [])].map((link) => {
            const isPageLink = link.href === "/mentors" || link.href === "/interview-prep" || link.href === "/upload";
            const isHashLink = link.href.startsWith("/#");
            const linkClass = "px-3 py-1.5 text-sm text-muted-foreground hover:text-primary link-underline transition-all duration-200 whitespace-nowrap";
            if (isPageLink) {
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={linkClass}
                  onClick={(e) => {
                    e.preventDefault();
                    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
                    document.documentElement.scrollTop = 0;
                    document.body.scrollTop = 0;
                    requestAnimationFrame(() => {
                      requestAnimationFrame(() => navigate(link.href));
                    });
                  }}
                >
                  {link.name}
                </Link>
              );
            }
            if (isHashLink) {
              return (
                <Link key={link.name} to={link.href} className={linkClass}>
                  {link.name}
                </Link>
              );
            }
            return (
              <a key={link.name} href={link.href} className={linkClass}>
                {link.name}
              </a>
            );
          })}
        </div>

        {/* Desktop CTA - Right */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0 min-w-0">
          {!loading && user ? (
            <>
              <span className="text-sm text-muted-foreground flex items-center gap-1 min-w-0 max-w-[120px] truncate" title={user.email ?? undefined}>
                <User className="h-4 w-4 shrink-0" />
                <span className="truncate">{user.email?.split("@")[0]}</span>
              </span>
              <Button 
                size="sm" 
                variant="outline"
                className="rounded-full px-3 h-9 shrink-0"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <Button 
              size="sm" 
              className="rounded-full px-5 h-9 bg-foreground text-background hover:bg-foreground/90 btn-punch hover:scale-105 active:scale-95 transition-transform"
              onClick={handleAuthClick}
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
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
                {[...navLinks, ...(isAdmin ? [{ name: "Upload", href: "/upload" }] : [])].map((link) => {
                  const isPageLink = link.href === "/mentors" || link.href === "/interview-prep" || link.href === "/upload";
                  const isHashLink = link.href.startsWith("/#");
                  const linkClass = "px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors whitespace-nowrap";
                  if (isPageLink) {
                    return (
                      <Link
                        key={link.name}
                        to={link.href}
                        className={linkClass}
                        onClick={(e) => {
                          e.preventDefault();
                          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
                          document.documentElement.scrollTop = 0;
                          document.body.scrollTop = 0;
                          setIsOpen(false);
                          requestAnimationFrame(() => {
                            requestAnimationFrame(() => navigate(link.href));
                          });
                        }}
                      >
                        {link.name}
                      </Link>
                    );
                  }
                  if (isHashLink) {
                    return (
                      <Link key={link.name} to={link.href} className={linkClass} onClick={() => setIsOpen(false)}>
                        {link.name}
                      </Link>
                    );
                  }
                  return (
                    <a key={link.name} href={link.href} className={linkClass} onClick={() => setIsOpen(false)}>
                      {link.name}
                    </a>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-border/50">
                {!loading && user ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground flex items-center gap-2 px-4">
                      <User className="h-4 w-4" />
                      {user.email}
                    </p>
                    <Button 
                      className="w-full rounded-full" 
                      variant="outline"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full rounded-full btn-punch hover:scale-[1.02] active:scale-[0.98]"
                    onClick={() => {
                      setIsOpen(false);
                      handleAuthClick();
                    }}
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
