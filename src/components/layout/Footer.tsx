import { BookOpen, Github, Twitter, Linkedin, Mail, Heart, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const footerLinks = {
  resources: [
    { name: "Study Notes", href: "#" },
    { name: "Previous Papers", href: "#" },
    { name: "Presentations", href: "#" },
    { name: "Interview Prep", href: "#" },
  ],
  branches: [
    { name: "Computer Science", href: "#" },
    { name: "AI & ML", href: "#" },
    { name: "Data Science", href: "#" },
    { name: "Electronics", href: "#" },
  ],
  company: [
    { name: "About Us", href: "#about" },
    { name: "Contact", href: "#" },
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
  ],
};

const socialLinks = [
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Mail, href: "#", label: "Email" },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border/50">
      {/* Background */}
      <div className="absolute inset-0 bg-card" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[100px]" />
      
      <div className="container relative py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <a href="#" className="flex items-center gap-3 mb-6 group">
              <motion.div 
                whileHover={{ rotate: 5, scale: 1.05 }}
                className="p-2.5 rounded-xl bg-gradient-primary shadow-lg"
              >
                <BookOpen className="h-5 w-5 text-white" />
              </motion.div>
              <span className="text-xl font-display font-bold text-foreground">
                BTech<span className="text-gradient">Verse</span>
              </span>
            </a>
            <p className="text-muted-foreground text-sm mb-8 max-w-xs leading-relaxed">
              Your one-stop destination for B.Tech study materials, notes, and
              exam preparation. Free for every engineering student.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 rounded-xl glass hover:border-primary/30 hover:text-primary transition-all"
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold text-foreground mb-5">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="group flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Branches */}
          <div>
            <h4 className="font-bold text-foreground mb-5">Branches</h4>
            <ul className="space-y-3">
              {footerLinks.branches.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="group flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-foreground mb-5">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="group flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} BTechVerse. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            Made with 
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Heart className="h-4 w-4 text-destructive fill-destructive" />
            </motion.span>
            for students
          </p>
        </div>
      </div>
    </footer>
  );
}
