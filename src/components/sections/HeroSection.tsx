import { motion } from "framer-motion";
import { ArrowRight, Star, Zap, Coffee, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const trustedBy = [
  "IIT Delhi", "NIT Trichy", "VIT", "BITS Pilani", "DTU", "NSUT", "IIIT Hyderabad"
];

export function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col justify-center pt-20 pb-12 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-dots opacity-30" />
      
      {/* Hand-drawn style decorative elements */}
      <div className="absolute top-28 right-[8%] hidden lg:block">
        <motion.div
          initial={{ opacity: 0, rotate: -10 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ delay: 0.8, type: "spring" }}
          className="sticker"
        >
          <Zap className="h-3 w-3" />
          100% FREE
        </motion.div>
      </div>
      
      <div className="absolute top-1/3 right-[12%] hidden lg:block">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
          className="w-16 h-16 border-2 border-dashed border-primary/40 rounded-full flex items-center justify-center"
        >
          <span className="text-2xl">📚</span>
        </motion.div>
      </div>

      <div className="absolute bottom-1/3 left-[5%] hidden lg:block">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="sticker-outline text-[10px]"
          style={{ transform: 'rotate(3deg)' }}
        >
          <Coffee className="h-3 w-3" />
          MADE AT 3AM
        </motion.div>
      </div>

      {/* Squiggly arrow pointing to CTA - hand drawn feel */}
      <svg className="absolute bottom-[30%] right-[25%] w-24 h-24 text-accent hidden xl:block" viewBox="0 0 100 100" fill="none">
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          d="M10 80 Q 30 20, 50 50 T 90 20"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="5 5"
        />
      </svg>
      
      <div className="container relative">
        <div className="max-w-4xl">
          {/* Handwritten style badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            className="inline-block mb-8"
          >
            <span className="sticker-green">
              <Star className="h-3 w-3 fill-current" />
              BY STUDENTS, FOR STUDENTS
            </span>
          </motion.div>

          {/* Main Headline with sketch underline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 text-balance"
          >
            Notes nahi milte?
            <br />
            <span className="underline-sketch">Tension mat le.</span>
          </motion.h1>

          {/* Subheading with personality */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10"
          >
            5000+ notes, PYQs, and presentations. Plus an AI buddy jo actually 
            samjhata hai — ratta nahi marwata. 
            <span className="inline-flex items-center gap-1 text-accent font-medium ml-1">
              <Sparkles className="h-4 w-4" />
              Ekdum free!
            </span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4 mb-16"
          >
            <Button size="lg" variant="default" className="shadow-[4px_4px_0_0_hsl(var(--foreground))] hover:shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
              Browse Resources
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-2">
              Try AI Buddy
            </Button>
          </motion.div>

          {/* Stats in handcrafted cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-4"
          >
            <div className="px-5 py-3 bg-primary/5 border-2 border-primary/20 rounded-lg" style={{ transform: 'rotate(-1deg)' }}>
              <p className="text-2xl font-bold text-primary">25K+</p>
              <p className="text-xs text-muted-foreground">Happy Students</p>
            </div>
            <div className="px-5 py-3 bg-accent/5 border-2 border-accent/20 rounded-lg" style={{ transform: 'rotate(1deg)' }}>
              <p className="text-2xl font-bold text-accent">5000+</p>
              <p className="text-xs text-muted-foreground">Free Resources</p>
            </div>
            <div className="px-5 py-3 bg-muted border-2 border-border rounded-lg" style={{ transform: 'rotate(-0.5deg)' }}>
              <p className="text-2xl font-bold">1M+</p>
              <p className="text-xs text-muted-foreground">Downloads</p>
            </div>
          </motion.div>
        </div>

        {/* Marquee - Colleges with more casual styling */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-20 -mx-6 md:mx-0"
        >
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4 px-6 md:px-0 flex items-center gap-2">
            <Heart className="h-3 w-3 text-destructive fill-destructive" />
            Used by students from these colleges
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
