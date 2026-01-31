import { motion } from "framer-motion";
import { Target, Heart, Users, Code } from "lucide-react";

export function AboutSection() {
  return (
    <section id="about" className="py-20 md:py-28 bg-muted/30">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Mission */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block text-sm font-semibold text-primary mb-4"
            >
              ABOUT US
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6"
            >
              Empowering Engineering <br />
              <span className="text-gradient">Students Everywhere</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground mb-8"
            >
              BTechVerse was created with a simple mission: to make quality study
              materials accessible to every engineering student, regardless of their
              college or background. We believe education should be free and accessible.
            </motion.p>

            {/* Values */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="grid sm:grid-cols-2 gap-4"
            >
              {[
                {
                  icon: Target,
                  title: "Our Mission",
                  desc: "Democratize engineering education with free resources",
                },
                {
                  icon: Heart,
                  title: "Our Values",
                  desc: "Quality, accessibility, and community-first approach",
                },
                {
                  icon: Users,
                  title: "Our Community",
                  desc: "25,000+ students across 100+ engineering colleges",
                },
                {
                  icon: Code,
                  title: "By Students",
                  desc: "Built by engineering students for engineering students",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="p-4 rounded-xl bg-card border border-border"
                >
                  <div className="inline-flex p-2 rounded-lg bg-primary/10 mb-3">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">
                    {item.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right - Developer Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex justify-center"
          >
            <div className="relative">
              {/* Main Card */}
              <div className="rounded-2xl bg-card border border-border p-8 shadow-card max-w-sm">
                {/* Avatar */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center text-3xl font-display font-bold text-primary-foreground">
                      BV
                    </div>
                    <div className="absolute -bottom-1 -right-1 p-2 rounded-full bg-card border border-border shadow-sm">
                      <Code className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-display font-bold text-foreground mb-1">
                    BTechVerse Team
                  </h3>
                  <p className="text-muted-foreground">
                    Engineering Students & Developers
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-muted/50 mb-6">
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">5K+</p>
                    <p className="text-xs text-muted-foreground">Resources</p>
                  </div>
                  <div className="text-center border-x border-border">
                    <p className="text-lg font-bold text-foreground">8</p>
                    <p className="text-xs text-muted-foreground">Branches</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">25K+</p>
                    <p className="text-xs text-muted-foreground">Students</p>
                  </div>
                </div>

                {/* Quote */}
                <blockquote className="text-center text-sm text-muted-foreground italic">
                  "Education is the most powerful weapon which you can use to change
                  the world."
                  <footer className="mt-2 text-xs not-italic text-primary">
                    — Nelson Mandela
                  </footer>
                </blockquote>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -z-10 -top-4 -left-4 w-full h-full rounded-2xl bg-gradient-primary opacity-10" />
              <div className="absolute -z-20 -top-8 -left-8 w-full h-full rounded-2xl bg-accent opacity-5" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
