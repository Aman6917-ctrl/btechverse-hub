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
      
      {/* 100% FREE sticker - top right */}
      <div className="absolute top-28 right-[8%] hidden lg:block z-10">
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
      
      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="max-w-xl">
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

          {/* Right Side - Visual Stack */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="hidden lg:flex relative items-center justify-center min-h-[450px]"
          >
            {/* Main stacked cards visual */}
            <div className="relative w-full max-w-sm">
              {/* Scattered decorative elements */}
              <motion.div
                animate={{ rotate: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 5 }}
                className="absolute -top-8 left-0 text-5xl"
              >
                📖
              </motion.div>
              
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute -top-4 right-8 text-4xl"
              >
                ✏️
              </motion.div>

              {/* Background card 3 - yellow */}
              <div 
                className="absolute inset-0 bg-yellow-100 border-2 border-yellow-300 rounded-xl"
                style={{ transform: 'rotate(8deg) translateX(20px) translateY(20px)' }}
              />
              
              {/* Background card 2 - green */}
              <div 
                className="absolute inset-0 bg-primary/10 border-2 border-primary/30 rounded-xl"
                style={{ transform: 'rotate(-4deg) translateX(10px) translateY(10px)' }}
              />
              
              {/* Main card */}
              <div className="relative bg-card border-2 border-foreground rounded-xl p-5 shadow-[8px_8px_0_0_hsl(var(--foreground))]">
                {/* Notebook style lines */}
                <div className="absolute left-8 top-0 bottom-0 w-px bg-red-300/50" />
                
                {/* Header */}
                <div className="flex items-start gap-3 mb-5 pb-4 border-b-2 border-dashed border-border pl-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border-2 border-primary/20">
                    <span className="text-2xl">📝</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">Data Structures Notes</p>
                    <p className="text-xs text-muted-foreground">Computer Science • Sem 3</p>
                    <div className="flex gap-1 mt-1">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Preview content */}
                <div className="space-y-3 mb-5 pl-4">
                  <div className="flex gap-2 items-center">
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">Arrays & Linked Lists</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">Stacks & Queues</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">Trees & Graphs</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">Sorting Algorithms</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs pl-4 pt-3 border-t border-dashed border-border">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Heart className="h-3 w-3 text-destructive fill-destructive" /> 2.4k
                  </span>
                  <span className="text-muted-foreground">45 pages</span>
                  <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-[10px] font-bold">FREE</span>
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                className="absolute -top-6 -right-6 bg-accent text-accent-foreground px-3 py-2 rounded-lg shadow-[4px_4px_0_0_hsl(var(--foreground))] border-2 border-foreground font-bold text-sm"
                style={{ transform: 'rotate(5deg)' }}
              >
                🎯 Top Pick!
              </motion.div>

              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 3, delay: 0.5 }}
                className="absolute -bottom-4 -left-4 bg-card border-2 border-foreground px-3 py-2 rounded-lg shadow-[3px_3px_0_0_hsl(var(--foreground))]"
                style={{ transform: 'rotate(-3deg)' }}
              >
                <span className="text-sm font-bold flex items-center gap-1">
                  <Coffee className="h-3 w-3" /> Made at 3AM
                </span>
              </motion.div>

              {/* More floating decorations */}
              <motion.div
                animate={{ rotate: [0, 5, 0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="absolute bottom-1/4 -right-16 text-4xl"
              >
                📚
              </motion.div>
              
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute top-1/3 -left-14 text-3xl"
              >
                💡
              </motion.div>
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
