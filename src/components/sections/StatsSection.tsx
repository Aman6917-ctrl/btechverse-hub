import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FileText, Users, BookOpen, GraduationCap } from "lucide-react";

const stats = [
  {
    icon: FileText,
    value: 5000,
    suffix: "+",
    label: "Study Materials",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: GraduationCap,
    value: 8,
    suffix: "",
    label: "Branches Covered",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: BookOpen,
    value: 1200,
    suffix: "+",
    label: "Previous Year Papers",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Users,
    value: 25000,
    suffix: "+",
    label: "Active Students",
    color: "text-accent",
    bg: "bg-accent/10",
  },
];

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export function StatsSection() {
  return (
    <section className="py-16 md:py-20 bg-card border-y border-border">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div
                className={`inline-flex p-3 rounded-xl ${stat.bg} mb-4`}
              >
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-sm md:text-base text-muted-foreground">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
