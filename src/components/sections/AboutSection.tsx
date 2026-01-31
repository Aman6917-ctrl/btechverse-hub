import { motion } from "framer-motion";
import { Quote, Github, Twitter, Linkedin } from "lucide-react";

const team = [
  { name: "Rahul", role: "CSE Final Year", college: "NIT Trichy" },
  { name: "Priya", role: "AI/ML Student", college: "IIT Delhi" },
  { name: "Amit", role: "Developer", college: "VIT Vellore" },
];

const testimonials = [
  {
    quote: "Bhai ye site pehle mili hoti toh 3rd sem mein backlog nahi aata 😭",
    author: "Random CSE Student",
    college: "DTU"
  },
  {
    quote: "Finally someone made notes that don't look like ancient scriptures",
    author: "ECE Topper",
    college: "NIT Karnataka"
  }
];

export function AboutSection() {
  return (
    <section id="about" className="section-padding relative">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left - Story */}
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-sm font-semibold text-primary mb-3"
            >
              ABOUT
            </motion.p>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
            >
              Built by students
              <br />
              <span className="text-muted-foreground">who've been there.</span>
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="space-y-4 text-muted-foreground mb-10"
            >
              <p>
                We started BTechVerse because we were tired of hunting for notes 
                across 15 different WhatsApp groups at 3 AM before exams.
              </p>
              <p>
                No fancy corporate team here. Just a bunch of engineering students 
                who wanted to make exam prep suck less.
              </p>
              <p className="font-medium text-foreground">
                100% free. No hidden paywalls. Ever.
              </p>
            </motion.div>

            {/* Team */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-sm font-semibold mb-4">The Team</p>
              <div className="flex flex-wrap gap-4">
                {team.map((member) => (
                  <div key={member.name} className="flex items-center gap-3 px-4 py-2 rounded-full bg-muted">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                      {member.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.college}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div className="flex gap-2 mt-6">
                {[Github, Twitter, Linkedin].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="p-2 rounded-lg border border-border hover:border-foreground/20 transition-colors"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right - Testimonials */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <p className="text-sm font-semibold text-muted-foreground">What students say</p>
            
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl border border-border bg-card"
              >
                <Quote className="h-8 w-8 text-primary/20 mb-4" />
                <p className="text-lg font-medium mb-4">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold">
                    {testimonial.author[0]}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{testimonial.author}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.college}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Fun Stats */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-3xl font-bold text-primary">∞</p>
                <p className="text-sm text-muted-foreground">Chai consumed</p>
              </div>
              <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
                <p className="text-3xl font-bold text-accent">0</p>
                <p className="text-sm text-muted-foreground">Sleep during exams</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
