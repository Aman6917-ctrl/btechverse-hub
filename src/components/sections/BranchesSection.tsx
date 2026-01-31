import { motion } from "framer-motion";
import {
  Cpu,
  Brain,
  Database,
  Shield,
  Radio,
  Cog,
  Zap,
  Building2,
  ArrowUpRight,
} from "lucide-react";

const branches = [
  {
    icon: Cpu,
    name: "Computer Science",
    code: "CSE",
    materials: "1,200+",
    gradient: "from-violet-500 via-purple-500 to-indigo-600",
    bgGlow: "bg-violet-500/20",
  },
  {
    icon: Brain,
    name: "AI & Machine Learning",
    code: "AI/ML",
    materials: "850+",
    gradient: "from-pink-500 via-rose-500 to-red-500",
    bgGlow: "bg-pink-500/20",
  },
  {
    icon: Database,
    name: "Data Science",
    code: "DS",
    materials: "720+",
    gradient: "from-cyan-400 via-sky-500 to-blue-600",
    bgGlow: "bg-cyan-500/20",
  },
  {
    icon: Shield,
    name: "Cyber Security",
    code: "CS",
    materials: "480+",
    gradient: "from-orange-400 via-red-500 to-rose-600",
    bgGlow: "bg-orange-500/20",
  },
  {
    icon: Radio,
    name: "Electronics & Comm.",
    code: "ECE",
    materials: "950+",
    gradient: "from-emerald-400 via-green-500 to-teal-600",
    bgGlow: "bg-emerald-500/20",
  },
  {
    icon: Zap,
    name: "Electrical Engineering",
    code: "EE",
    materials: "680+",
    gradient: "from-yellow-400 via-amber-500 to-orange-500",
    bgGlow: "bg-yellow-500/20",
  },
  {
    icon: Cog,
    name: "Mechanical Engineering",
    code: "ME",
    materials: "890+",
    gradient: "from-slate-400 via-gray-500 to-zinc-600",
    bgGlow: "bg-slate-500/20",
  },
  {
    icon: Building2,
    name: "Civil Engineering",
    code: "CE",
    materials: "540+",
    gradient: "from-teal-400 via-cyan-500 to-sky-600",
    bgGlow: "bg-teal-500/20",
  },
];

export function BranchesSection() {
  return (
    <section id="branches" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-muted/30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
      
      <div className="container relative">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-semibold text-primary mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            BRANCHES
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-display font-bold text-foreground mb-5"
          >
            Explore by <span className="text-gradient">Branch</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground"
          >
            Find resources tailored specifically for your engineering discipline
          </motion.p>
        </div>

        {/* Branch Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {branches.map((branch, index) => (
            <motion.a
              key={branch.code}
              href="#"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative rounded-2xl bg-card border border-border/50 p-6 transition-all duration-500 hover:shadow-card-hover cursor-pointer overflow-hidden"
            >
              {/* Glow Effect on Hover */}
              <div className={`absolute -inset-px ${branch.bgGlow} opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500`} />
              
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${branch.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />

              {/* Content */}
              <div className="relative">
                {/* Icon */}
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${branch.gradient} shadow-lg mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                  <branch.icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>

                {/* Text */}
                <h3 className="font-display font-bold text-foreground mb-1 text-sm md:text-base group-hover:text-gradient transition-all">
                  {branch.name}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {branch.materials} materials
                </p>

                {/* Arrow */}
                <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                  <ArrowUpRight className="h-5 w-5 text-primary" />
                </div>
              </div>

              {/* Code Badge */}
              <div className="absolute top-4 right-4 px-2.5 py-1 rounded-lg bg-muted/80 backdrop-blur-sm text-xs font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                {branch.code}
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
