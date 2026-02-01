import { motion } from "framer-motion";
import { ArrowRight, Star, Zap, Coffee, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

// Company logos
import oracleLogo from "@/assets/logos/oracle.png";
import zoomcarLogo from "@/assets/logos/zoomcar.png";
import fampayLogo from "@/assets/logos/fampay.png";
import juspayLogo from "@/assets/logos/juspay.png";
import fivetranLogo from "@/assets/logos/fivetran.png";
import innovapptiveLogo from "@/assets/logos/innovapptive.png";
import pharmeasyLogo from "@/assets/logos/pharmeasy.png";
import kickdrumLogo from "@/assets/logos/kickdrum.png";
import indiamartLogo from "@/assets/logos/indiamart.png";
import infosysLogo from "@/assets/logos/infosys.png";
import amadeusLogo from "@/assets/logos/amadeus.png";
import elitmusLogo from "@/assets/logos/elitmus.png";
import tcsLogo from "@/assets/logos/tcs.png";
import hcltechLogo from "@/assets/logos/hcltech.png";
import adobeLogo from "@/assets/logos/adobe.png";

const companyLogos = [
  { name: "Oracle", logo: oracleLogo },
  { name: "Zoomcar", logo: zoomcarLogo },
  { name: "Fampay", logo: fampayLogo },
  { name: "Juspay", logo: juspayLogo },
  { name: "Fivetran", logo: fivetranLogo },
  { name: "Innovapptive", logo: innovapptiveLogo },
  { name: "Pharmeasy", logo: pharmeasyLogo },
  { name: "Kickdrum", logo: kickdrumLogo },
  { name: "Indiamart", logo: indiamartLogo },
  { name: "Infosys", logo: infosysLogo },
  { name: "Amadeus", logo: amadeusLogo },
  { name: "eLitmus", logo: elitmusLogo },
  { name: "TCS", logo: tcsLogo },
  { name: "HCLTech", logo: hcltechLogo },
  { name: "Adobe", logo: adobeLogo },
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
            className="hidden lg:block relative"
          >
            {/* Main stacked cards visual */}
            <div className="relative w-full max-w-md mx-auto">
              {/* Background card 3 */}
              <motion.div
                initial={{ rotate: 8 }}
                animate={{ rotate: 6 }}
                transition={{ repeat: Infinity, repeatType: "reverse", duration: 3 }}
                className="absolute inset-0 bg-accent/10 border-2 border-accent/30 rounded-lg transform translate-x-6 translate-y-6"
              />
              
              {/* Background card 2 */}
              <motion.div
                initial={{ rotate: -4 }}
                animate={{ rotate: -2 }}
                transition={{ repeat: Infinity, repeatType: "reverse", duration: 2.5, delay: 0.5 }}
                className="absolute inset-0 bg-primary/10 border-2 border-primary/30 rounded-lg transform translate-x-3 translate-y-3"
              />
              
              {/* Main card */}
              <div className="relative bg-card border-2 border-foreground rounded-lg p-6 shadow-[6px_6px_0_0_hsl(var(--foreground))]">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-dashed border-border">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                    <span className="text-xl">📝</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm">Data Structures Notes</p>
                    <p className="text-xs text-muted-foreground">Computer Science • Sem 3</p>
                  </div>
                  <span className="ml-auto sticker text-[9px]">
                    <Star className="h-2.5 w-2.5 fill-current" /> TOP RATED
                  </span>
                </div>
                
                {/* Preview lines */}
                <div className="space-y-3 mb-6">
                  <div className="flex gap-2 items-center">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <div className="h-2.5 bg-muted rounded flex-1" />
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="w-2 h-2 bg-accent rounded-full" />
                    <div className="h-2.5 bg-muted rounded w-4/5" />
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <div className="h-2.5 bg-muted rounded w-3/5" />
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3 text-destructive fill-destructive" /> 2.4k saves
                  </span>
                  <span>45 pages</span>
                  <span className="text-primary font-medium">Free ↓</span>
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                className="absolute -top-4 -right-4 bg-card border-2 border-foreground p-3 rounded-lg shadow-[3px_3px_0_0_hsl(var(--foreground))]"
              >
                <span className="text-2xl">🎯</span>
              </motion.div>

              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 3, delay: 0.5 }}
                className="absolute -bottom-6 -left-6 bg-accent text-accent-foreground px-4 py-2 rounded-lg shadow-[3px_3px_0_0_hsl(var(--foreground))] font-bold text-sm"
                style={{ transform: 'rotate(-3deg)' }}
              >
                ✨ PDF Ready
              </motion.div>

              <motion.div
                animate={{ rotate: [0, 5, 0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="absolute top-1/2 -right-12 text-4xl"
              >
                📚
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
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4 px-6 md:px-0 flex items-center justify-center gap-2 text-center">
            <Sparkles className="h-3 w-3 text-accent" />
            Get guidance from top mentors working in leading companies
          </p>
          <div className="relative overflow-hidden">
            <div className="flex gap-16 items-center marquee">
              {[...companyLogos, ...companyLogos].map((company, i) => (
                <div key={i} className="flex-shrink-0 h-7 w-24 flex items-center justify-center">
                  <img 
                    src={company.logo} 
                    alt={company.name}
                    className="max-h-7 max-w-24 w-auto h-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
