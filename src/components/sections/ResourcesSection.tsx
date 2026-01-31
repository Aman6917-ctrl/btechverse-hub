import { motion } from "framer-motion";
import { FileText, FileClock, Presentation, Briefcase, ArrowRight, ArrowUpRight, Sparkles, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const resources = [
  {
    icon: FileText,
    title: "Study Notes",
    description: "Handwritten + typed notes. Toppers ke notes bhi hain 👀",
    count: "2,500+",
    tag: "🔥 Most Popular",
    emoji: "📝",
    available: true,
  },
  {
    icon: FileClock,
    title: "Previous Year Papers",
    description: "PYQs with solutions. Ratta maaro, pass ho jao.",
    count: "1,200+", 
    tag: "📚 Exam Ready",
    emoji: "📄",
    available: true,
  },
  {
    icon: Presentation,
    title: "Presentations",
    description: "Ready PPTs for seminars. Copy-paste, edit, submit!",
    count: "800+",
    tag: "⚡ Quick Submit",
    emoji: "🎤",
    available: true,
  },
  {
    icon: Briefcase,
    title: "Interview Prep",
    description: "Technical + HR questions. Placement season ready.",
    count: "Soon™",
    tag: "🚧 Coming Soon",
    emoji: "💼",
    available: false,
  },
];

export function ResourcesSection() {
  return (
    <section id="resources" className="section-padding relative overflow-hidden">
      {/* Background doodles */}
      <div className="absolute top-10 right-20 text-4xl opacity-20 rotate-12">📚</div>
      <div className="absolute bottom-20 left-10 text-3xl opacity-20 -rotate-12">✏️</div>
      
      <div className="container relative">
        {/* Header with sticker */}
        <div className="max-w-2xl mb-16">
          <motion.div
            initial={{ opacity: 0, rotate: -3 }}
            whileInView={{ opacity: 1, rotate: 0 }}
            viewport={{ once: true }}
            className="sticker-green mb-6 inline-block"
          >
            <Download className="h-3 w-3" />
            FREE DOWNLOADS
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
          >
            Jo chahiye, <span className="underline-sketch">mil jayega.</span>
            <br />
            <span className="text-muted-foreground text-2xl md:text-3xl lg:text-4xl">No signup. No waiting. No bakwaas.</span>
          </motion.h2>
        </div>

        {/* Resource Cards - Bento Style with handcrafted feel */}
        <div className="grid md:grid-cols-2 gap-4">
          {resources.map((resource, index) => (
            <motion.a
              key={resource.title}
              href="#"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`group relative p-6 md:p-8 border-2 border-border bg-card transition-all ${
                resource.available 
                  ? "hover:border-foreground cursor-pointer" 
                  : "opacity-60 cursor-not-allowed"
              }`}
              style={{ transform: `rotate(${index % 2 === 0 ? '-0.3' : '0.3'}deg)` }}
            >
              {/* Emoji decoration */}
              <div className="absolute -top-4 -right-2 text-3xl transform rotate-12 opacity-80">
                {resource.emoji}
              </div>

              <div className="flex items-start justify-between mb-6">
                <div className="p-3 bg-muted border-2 border-border">
                  <resource.icon className="h-6 w-6 text-foreground" />
                </div>
                <span className={`text-xs font-bold px-3 py-1.5 ${
                  resource.available 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  {resource.tag}
                </span>
              </div>

              <h3 className="text-xl md:text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                {resource.title}
              </h3>
              <p className="text-muted-foreground mb-6">
                {resource.description}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-foreground">
                  {resource.count}
                </span>
                {resource.available && (
                  <div className="p-2 bg-foreground text-background opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                )}
              </div>

              {/* Corner fold effect for available cards */}
              {resource.available && (
                <div className="absolute bottom-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-b-[20px] border-b-primary/20" />
              )}
            </motion.a>
          ))}
        </div>

        {/* CTA with personality */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Button 
            size="lg" 
            variant="default"
            className="shadow-[4px_4px_0_0_hsl(var(--foreground))] hover:shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            <Sparkles className="h-4 w-4" />
            Explore All Resources
            <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            No login required. Seriously. Just click and download.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
