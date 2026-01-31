import { motion } from "framer-motion";
import { FileText, FileClock, Presentation, Briefcase, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const resources = [
  {
    icon: FileText,
    title: "Study Notes",
    description: "Comprehensive notes covering all subjects, handwritten and typed formats available.",
    count: "2,500+ Notes",
    gradient: "from-violet-500 via-purple-500 to-indigo-600",
    bgGlow: "bg-violet-500/20",
    available: true,
  },
  {
    icon: FileClock,
    title: "Previous Year Papers",
    description: "Solved and unsolved papers from multiple universities to practice and prepare.",
    count: "1,200+ Papers",
    gradient: "from-amber-400 via-orange-500 to-red-500",
    bgGlow: "bg-orange-500/20",
    available: true,
  },
  {
    icon: Presentation,
    title: "Presentations",
    description: "Ready-to-use PPTs for seminars and project presentations across all branches.",
    count: "800+ PPTs",
    gradient: "from-emerald-400 via-teal-500 to-cyan-500",
    bgGlow: "bg-teal-500/20",
    available: true,
  },
  {
    icon: Briefcase,
    title: "Interview Prep",
    description: "Technical interview questions, HR tips, and company-specific preparation guides.",
    count: "Coming Soon",
    gradient: "from-slate-400 via-gray-500 to-zinc-600",
    bgGlow: "bg-slate-500/20",
    available: false,
  },
];

export function ResourcesSection() {
  return (
    <section id="resources" className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
      
      <div className="container relative">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-semibold text-primary mb-6"
          >
            <Sparkles className="h-4 w-4" />
            RESOURCES
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-display font-bold text-foreground mb-5"
          >
            Everything You Need to <span className="text-gradient">Excel</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground"
          >
            Access a wide range of academic resources tailored for B.Tech students
          </motion.p>
        </div>

        {/* Resource Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {resources.map((resource, index) => (
            <motion.div
              key={resource.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className={`group relative rounded-2xl bg-card border border-border/50 p-6 transition-all duration-500 hover:shadow-card-hover cursor-pointer overflow-hidden ${
                !resource.available && "opacity-70"
              }`}
            >
              {/* Glow Effect */}
              <div className={`absolute -inset-px ${resource.bgGlow} opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500`} />
              
              {/* Content */}
              <div className="relative">
                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${resource.gradient} shadow-lg mb-5`}
                >
                  <resource.icon className="h-6 w-6 text-white" />
                </motion.div>

                {/* Title & Description */}
                <h3 className="text-xl font-display font-bold text-foreground mb-3 group-hover:text-gradient transition-all">
                  {resource.title}
                </h3>
                <p className="text-muted-foreground mb-5 text-sm leading-relaxed">
                  {resource.description}
                </p>

                {/* Count & Arrow */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-bold ${
                      resource.available ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {resource.count}
                  </span>
                  {resource.available && (
                    <div className="p-2 rounded-lg bg-primary/10 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                      <ArrowRight className="h-4 w-4 text-primary" />
                    </div>
                  )}
                </div>
              </div>

              {/* Coming Soon Badge */}
              {!resource.available && (
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full glass text-xs font-semibold text-muted-foreground">
                  Coming Soon
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-14"
        >
          <Button variant="hero" size="xl" className="group shadow-xl">
            Browse All Resources
            <ArrowRight className="h-5 w-5 ml-1 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
