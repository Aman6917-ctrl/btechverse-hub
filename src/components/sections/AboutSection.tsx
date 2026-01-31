import { motion } from "framer-motion";
import { Target, Heart, Users, Code, Github, Twitter, Linkedin } from "lucide-react";

export function AboutSection() {
  return (
    <section id="about" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-muted/30" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
      
      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Mission */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-semibold text-primary mb-6"
            >
              <Heart className="h-4 w-4" />
              ABOUT US
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6"
            >
              Empowering Engineering <br />
              <span className="text-gradient">Students Everywhere</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground mb-10 leading-relaxed"
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
                  gradient: "from-violet-500 to-purple-600",
                },
                {
                  icon: Heart,
                  title: "Our Values",
                  desc: "Quality, accessibility, and community-first approach",
                  gradient: "from-pink-500 to-rose-600",
                },
                {
                  icon: Users,
                  title: "Our Community",
                  desc: "25,000+ students across 100+ engineering colleges",
                  gradient: "from-amber-500 to-orange-600",
                },
                {
                  icon: Code,
                  title: "By Students",
                  desc: "Built by engineering students for engineering students",
                  gradient: "from-emerald-500 to-teal-600",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="p-5 rounded-2xl glass-card transition-all hover:shadow-card-hover"
                >
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${item.gradient} shadow-lg mb-4`}>
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-bold text-foreground mb-2">
                    {item.title}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right - Developer Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex justify-center"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 rounded-3xl blur-2xl opacity-50" />
              
              {/* Main Card */}
              <div className="relative rounded-3xl glass-card p-8 shadow-2xl max-w-sm">
                {/* Avatar */}
                <div className="flex justify-center mb-8">
                  <div className="relative">
                    <motion.div 
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      className="w-28 h-28 rounded-2xl bg-gradient-primary flex items-center justify-center text-4xl font-display font-bold text-white shadow-xl"
                    >
                      BV
                    </motion.div>
                    <div className="absolute -bottom-2 -right-2 p-2.5 rounded-xl bg-card border border-border shadow-lg">
                      <Code className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                    BTechVerse Team
                  </h3>
                  <p className="text-muted-foreground">
                    Engineering Students & Developers
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 p-5 rounded-2xl bg-muted/50 mb-8">
                  <div className="text-center">
                    <p className="text-xl font-bold text-foreground">5K+</p>
                    <p className="text-xs text-muted-foreground">Resources</p>
                  </div>
                  <div className="text-center border-x border-border">
                    <p className="text-xl font-bold text-foreground">8</p>
                    <p className="text-xs text-muted-foreground">Branches</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-foreground">25K+</p>
                    <p className="text-xs text-muted-foreground">Students</p>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex justify-center gap-3 mb-8">
                  {[Github, Twitter, Linkedin].map((Icon, index) => (
                    <motion.a
                      key={index}
                      href="#"
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 rounded-xl glass hover:border-primary/30 transition-all"
                    >
                      <Icon className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                    </motion.a>
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-center text-sm text-muted-foreground italic leading-relaxed">
                  "Education is the most powerful weapon which you can use to change
                  the world."
                  <footer className="mt-3 text-xs not-italic font-semibold text-primary">
                    — Nelson Mandela
                  </footer>
                </blockquote>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
