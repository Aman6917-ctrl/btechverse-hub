import { motion } from "framer-motion";
import { TrendingUp, Zap, Clock, Heart } from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "Updated Weekly",
    description: "Fresh notes added every week from top scorers across India.",
  },
  {
    icon: Zap,
    title: "Quick Downloads",
    description: "No signup walls. No waiting. Just click and download.",
  },
  {
    icon: Clock,
    title: "24/7 AI Help",
    description: "Stuck at 2 AM? Our AI buddy never sleeps.",
  },
  {
    icon: Heart,
    title: "By Students",
    description: "Built by final years who've been through the grind.",
  },
];

export function StatsSection() {
  return (
    <section className="py-16 border-y border-border bg-muted/30">
      <div className="container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="p-3 w-fit rounded-xl bg-background border border-border mb-4 group-hover:border-primary/50 transition-colors">
                <feature.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="font-bold text-foreground mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
