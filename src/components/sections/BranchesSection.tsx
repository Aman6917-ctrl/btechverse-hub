import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const branches = [
  { name: "Computer Science", code: "CSE", materials: "1,200+", color: "bg-emerald-500" },
  { name: "AI & Machine Learning", code: "AI/ML", materials: "850+", color: "bg-violet-500" },
  { name: "Data Science", code: "DS", materials: "720+", color: "bg-blue-500" },
  { name: "Cyber Security", code: "CS", materials: "480+", color: "bg-red-500" },
  { name: "Electronics & Comm.", code: "ECE", materials: "950+", color: "bg-amber-500" },
  { name: "Electrical Engg.", code: "EE", materials: "680+", color: "bg-yellow-500" },
  { name: "Mechanical Engg.", code: "ME", materials: "890+", color: "bg-slate-500" },
  { name: "Civil Engineering", code: "CE", materials: "540+", color: "bg-teal-500" },
];

export function BranchesSection() {
  return (
    <section id="branches" className="section-padding bg-muted/30 relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid opacity-50" />
      
      <div className="container relative">
        {/* Header */}
        <div className="max-w-2xl mb-12">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-primary mb-3"
          >
            BRANCHES
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
          >
            Pick your branch.
            <br />
            <span className="text-muted-foreground">Get your stuff.</span>
          </motion.h2>
        </div>

        {/* Branch Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {branches.map((branch, index) => (
            <Link
              key={branch.code}
              to={`/branch/${encodeURIComponent(branch.code)}`}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group flex items-center gap-4 p-4 rounded-xl bg-background border border-border hover:border-foreground/20 transition-all card-hover"
              >
                <div className={`w-3 h-3 rounded-full ${branch.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {branch.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {branch.materials} materials
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
