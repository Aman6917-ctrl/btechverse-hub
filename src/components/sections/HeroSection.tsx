import { motion } from "framer-motion";
import { ArrowRight, Star, Users, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const trustedBy = [
  "IIT Delhi", "NIT Trichy", "VIT", "BITS Pilani", "DTU", "NSUT"
];

export function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col justify-center pt-20 pb-12 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-dots opacity-40" />
      
      {/* Decorative elements */}
      <div className="absolute top-32 right-[10%] w-20 h-20 border-2 border-primary/20 rounded-full" />
      <div className="absolute bottom-40 left-[5%] w-32 h-32 border-2 border-accent/20 rounded-full" />
      <div className="absolute top-1/2 right-[20%] w-3 h-3 bg-primary rounded-full" />
      <div className="absolute top-1/3 left-[15%] w-2 h-2 bg-accent rounded-full" />
      
      <div className="container relative">
        <div className="max-w-4xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 mb-8"
          >
            <span className="badge badge-primary">
              <Star className="h-3 w-3 fill-current" />
              Free & Open Source
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 text-balance"
          >
            Stop hunting for notes.
            <br />
            <span className="text-muted-foreground">Start acing exams.</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10"
          >
            5000+ curated study materials, previous year papers, and an AI buddy 
            that actually understands engineering. Made by students, for students.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4 mb-16"
          >
            <Button size="lg" variant="default">
              Browse Resources
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              Try AI Buddy
            </Button>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row sm:items-center gap-6"
          >
            {/* Stats */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-foreground">25,000+</p>
                  <p className="text-xs text-muted-foreground">Students</p>
                </div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="flex items-center gap-2">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <FileText className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="font-bold text-foreground">5,000+</p>
                  <p className="text-xs text-muted-foreground">Resources</p>
                </div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Download className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-foreground">1M+</p>
                  <p className="text-xs text-muted-foreground">Downloads</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Marquee - Trusted By */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-20 -mx-6 md:mx-0"
        >
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4 px-6 md:px-0">
            Trusted by students from
          </p>
          <div className="relative overflow-hidden">
            <div className="flex gap-12 marquee">
              {[...trustedBy, ...trustedBy].map((college, i) => (
                <span key={i} className="text-lg font-semibold text-muted-foreground/60 whitespace-nowrap">
                  {college}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
