import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { FileText, Users, BookOpen, GraduationCap } from "lucide-react";

const stats = [
  {
    icon: FileText,
    value: 5000,
    suffix: "+",
    label: "Study Materials",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: GraduationCap,
    value: 8,
    suffix: "",
    label: "Branches Covered",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: BookOpen,
    value: 1200,
    suffix: "+",
    label: "Previous Year Papers",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: Users,
    value: 25000,
    suffix: "+",
    label: "Active Students",
    gradient: "from-pink-500 to-rose-600",
  },
];

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

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
  }, [value, isVisible]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export function StatsSection() {
  return (
    <section className="py-20 md:py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-card" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
      
      <div className="container relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              <div className="glass-card p-6 md:p-8 text-center transition-all duration-500 hover:shadow-card-hover">
                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg mb-5`}
                >
                  <stat.icon className="h-6 w-6 md:h-7 md:w-7 text-white" />
                </motion.div>
                
                {/* Number */}
                <div className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-2">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </div>
                
                {/* Label */}
                <p className="text-sm md:text-base text-muted-foreground font-medium">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
