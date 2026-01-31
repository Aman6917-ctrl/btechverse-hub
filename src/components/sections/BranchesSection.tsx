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
} from "lucide-react";

const branches = [
  {
    icon: Cpu,
    name: "Computer Science",
    code: "CSE",
    materials: "1,200+",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    icon: Brain,
    name: "AI & Machine Learning",
    code: "AI/ML",
    materials: "850+",
    gradient: "from-purple-500 to-pink-600",
  },
  {
    icon: Database,
    name: "Data Science",
    code: "DS",
    materials: "720+",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: Shield,
    name: "Cyber Security",
    code: "CS",
    materials: "480+",
    gradient: "from-red-500 to-orange-600",
  },
  {
    icon: Radio,
    name: "Electronics & Comm.",
    code: "ECE",
    materials: "950+",
    gradient: "from-green-500 to-emerald-600",
  },
  {
    icon: Zap,
    name: "Electrical Engineering",
    code: "EE",
    materials: "680+",
    gradient: "from-yellow-500 to-amber-600",
  },
  {
    icon: Cog,
    name: "Mechanical Engineering",
    code: "ME",
    materials: "890+",
    gradient: "from-slate-500 to-zinc-600",
  },
  {
    icon: Building2,
    name: "Civil Engineering",
    code: "CE",
    materials: "540+",
    gradient: "from-teal-500 to-cyan-600",
  },
];

export function BranchesSection() {
  return (
    <section id="branches" className="py-20 md:py-28 bg-muted/30">
      <div className="container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-semibold text-primary mb-4"
          >
            BRANCHES
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4"
          >
            Explore by Branch
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
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              className="group relative rounded-2xl bg-card border border-border p-5 md:p-6 transition-all duration-300 hover:shadow-card-hover hover:border-primary/30 cursor-pointer overflow-hidden"
            >
              {/* Gradient Background on Hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${branch.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
              />

              {/* Icon */}
              <div
                className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${branch.gradient} mb-4`}
              >
                <branch.icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>

              {/* Content */}
              <div className="relative">
                <h3 className="font-display font-bold text-foreground mb-1 text-sm md:text-base">
                  {branch.name}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {branch.materials} materials
                </p>
              </div>

              {/* Code Badge */}
              <div className="absolute top-4 right-4 px-2 py-1 rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
                {branch.code}
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
