import { motion } from "framer-motion";
import { FileText, FileClock, Presentation, Briefcase, ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const resources = [
  {
    icon: FileText,
    title: "Study Notes",
    description: "Handwritten + typed notes. Semester-wise. All subjects covered.",
    count: "2,500+",
    tag: "Most Popular",
    available: true,
  },
  {
    icon: FileClock,
    title: "Previous Year Papers",
    description: "Solved papers with marking schemes. University-wise collection.",
    count: "1,200+",
    tag: "Exam Ready",
    available: true,
  },
  {
    icon: Presentation,
    title: "Presentations",
    description: "Ready PPTs for seminars. Editable formats. All branches.",
    count: "800+",
    tag: "Quick Submit",
    available: true,
  },
  {
    icon: Briefcase,
    title: "Interview Prep",
    description: "Technical + HR questions. Company-wise guides. Resume templates.",
    count: "Soon",
    tag: "Coming Soon",
    available: false,
  },
];

export function ResourcesSection() {
  return (
    <section id="resources" className="section-padding relative">
      <div className="container">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-primary mb-3"
          >
            RESOURCES
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
          >
            Everything you need.
            <br />
            <span className="text-muted-foreground">Nothing you don't.</span>
          </motion.h2>
        </div>

        {/* Resource Cards - Bento Style */}
        <div className="grid md:grid-cols-2 gap-4">
          {resources.map((resource, index) => (
            <motion.a
              key={resource.title}
              href="#"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`group relative p-6 md:p-8 rounded-2xl border border-border bg-card card-hover ${
                !resource.available && "opacity-60 pointer-events-none"
              }`}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 rounded-xl bg-muted">
                  <resource.icon className="h-6 w-6 text-foreground" />
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                  resource.available 
                    ? "bg-primary/10 text-primary" 
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
                <span className="text-2xl font-bold text-foreground">
                  {resource.count}
                </span>
                {resource.available && (
                  <div className="p-2 rounded-full bg-foreground text-background opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                )}
              </div>
            </motion.a>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Button size="lg" variant="default">
            Explore All Resources
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
