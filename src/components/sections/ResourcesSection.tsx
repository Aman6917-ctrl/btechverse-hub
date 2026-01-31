import { motion } from "framer-motion";
import { FileText, FileClock, Presentation, Briefcase, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const resources = [
  {
    icon: FileText,
    title: "Study Notes",
    description: "Comprehensive notes covering all subjects, handwritten and typed formats available.",
    count: "2,500+ Notes",
    color: "from-primary to-primary/80",
    available: true,
  },
  {
    icon: FileClock,
    title: "Previous Year Papers",
    description: "Solved and unsolved papers from multiple universities to practice and prepare.",
    count: "1,200+ Papers",
    color: "from-accent to-accent/80",
    available: true,
  },
  {
    icon: Presentation,
    title: "Presentations",
    description: "Ready-to-use PPTs for seminars and project presentations across all branches.",
    count: "800+ PPTs",
    color: "from-primary to-accent",
    available: true,
  },
  {
    icon: Briefcase,
    title: "Interview Prep",
    description: "Technical interview questions, HR tips, and company-specific preparation guides.",
    count: "Coming Soon",
    color: "from-muted-foreground to-muted-foreground/80",
    available: false,
  },
];

export function ResourcesSection() {
  return (
    <section id="resources" className="py-20 md:py-28 bg-background">
      <div className="container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-semibold text-primary mb-4"
          >
            RESOURCES
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4"
          >
            Everything You Need to Excel
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
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`group relative rounded-2xl bg-card border border-border p-6 transition-all duration-300 hover:shadow-card-hover hover:border-primary/30 ${
                !resource.available && "opacity-70"
              }`}
            >
              {/* Icon */}
              <div
                className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${resource.color} mb-4`}
              >
                <resource.icon className="h-6 w-6 text-primary-foreground" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-display font-bold text-foreground mb-2">
                {resource.title}
              </h3>
              <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                {resource.description}
              </p>

              {/* Count Badge */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-semibold ${
                    resource.available ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {resource.count}
                </span>
                {resource.available && (
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                )}
              </div>

              {/* Coming Soon Badge */}
              {!resource.available && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground">
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
          className="text-center mt-12"
        >
          <Button variant="hero" size="lg">
            Browse All Resources
            <ArrowRight className="h-5 w-5 ml-1" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
