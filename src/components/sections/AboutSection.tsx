import { motion } from "framer-motion";
import { Quote, Github, Youtube, Linkedin, Heart, Coffee, Moon, Code2 } from "lucide-react";
import { useStudentCount } from "@/lib/student-count";

const AMAN_PHOTO_URL = "https://media.licdn.com/dms/image/v2/D4E03AQHfPFrETpbONw/profile-displayphoto-crop_800_800/B4EZnObRwLIUAQ-/0/1760104882727?e=1772064000&v=beta&t=blqj0fVixvJKsxDkUyTBiSMUvSWC8mLkV8lZ2o4n51w";

const team = [
  { name: "Aman Verma", role: "Founder and Developer", emoji: "💻", image: AMAN_PHOTO_URL, college: "RCOEM", funFact: "Built this so you get notes without the struggle and real mentors to guide your future" },
];

const testimonials = [
  {
    quote: "Pehle mili hoti toh 3rd sem mein backlog nahi aata. Ab juniors ko bata raha hoon.",
    author: "Rahul Sharma",
    college: "YCCE",
    rating: 5
  },
  {
    quote: "Notes that don’t look like ancient scriptures. Finally something I could actually read before exams.",
    author: "Kalash Khobragade",
    college: "IIT BHU",
    rating: 5
  },
  {
    quote: "DBMS 3 months se pending tha. Study Buddy ne ek raat mein samjha diya. No cap.",
    author: "Ram Singh",
    college: "VJTI",
    rating: 5
  }
];

const funStats = [
  { icon: Coffee, value: "∞", label: "Cups of chai", color: "text-amber-600" },
  { icon: Moon, value: "0", label: "Hours of sleep during exams", color: "text-indigo-500" },
  { icon: Code2, value: "∞", label: "Bugs fixed (still counting)", color: "text-primary" },
  { icon: Heart, value: "25K+", label: "Students helped", color: "text-destructive" },
];

export function AboutSection() {
  const studentCount = useStudentCount();
  return (
    <section id="about" className="section-padding pt-12 md:pt-16 lg:pt-20 relative overflow-hidden">
      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
          {/* Left - Why this exists */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl md:text-3xl font-bold mb-4 text-foreground"
            >
              Why Btechverse exists
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="space-y-4 text-muted-foreground"
            >
              <p>
                I did my diploma in Mechanical, then joined RCOEM and switched to AIML. New branch, no circle, notes kahin nahi—confusion and backlogs. I didn’t want the next batch to run into the same wall.
              </p>
              <p>
                So this: one place for notes, PYQs, and a study buddy that actually explains. Plus real mentors (people from Google, Amazon, etc.) for 1:1 sessions. What I didn’t have then, I’m putting here.
              </p>
              <p className="text-foreground font-medium not-italic">
                No funding, no big team. Just built it with care because it was needed.
              </p>
            </motion.div>

            {/* Team Cards - Handcrafted style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                The Team
              </p>
              <div className="space-y-3">
                {team.map((member, index) => (
                  <motion.div
                    key={member.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-card border-2 border-border rounded-lg hover:border-foreground/30 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="shrink-0 w-20 h-20 rounded-full overflow-hidden border-2 border-border bg-muted">
                        {"image" in member && member.image ? (
                          <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="flex items-center justify-center w-full h-full text-2xl">{member.emoji}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-lg text-foreground">{member.name}</p>
                        <span className="inline-block text-xs font-medium px-2.5 py-1 bg-muted text-muted-foreground rounded-md mt-1.5">
                          {member.role}
                        </span>
                        <p className="text-sm text-muted-foreground mt-1">{member.college}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground italic border-l-2 border-border pl-4 sm:max-w-[260px] sm:flex-shrink-0">
                      &ldquo;{member.funFact}&rdquo;
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Social Links */}
              <div className="flex gap-2 mt-6">
                <a href="https://github.com/Aman6917-ctrl" target="_blank" rel="noopener noreferrer" className="p-3 border-2 border-border hover:border-foreground hover:bg-foreground hover:text-background transition-all" aria-label="GitHub">
                  <Github className="h-4 w-4" />
                </a>
                <a href="https://www.youtube.com/@aman_verma6917" target="_blank" rel="noopener noreferrer" className="p-3 border-2 border-border hover:border-foreground hover:bg-foreground hover:text-background transition-all" aria-label="YouTube">
                  <Youtube className="h-4 w-4" />
                </a>
                <a href="https://www.linkedin.com/in/aman-verma-cse" target="_blank" rel="noopener noreferrer" className="p-3 border-2 border-border hover:border-foreground hover:bg-foreground hover:text-background transition-all" aria-label="LinkedIn">
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </motion.div>
          </div>

          {/* Right - Testimonials & Fun Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <span className="text-lg">💬</span>
              What students are saying
            </p>
            
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-card border-2 border-border relative"
                style={{ transform: `rotate(${index % 2 === 0 ? '0.5' : '-0.5'}deg)` }}
              >
                {/* Quote mark */}
                <div className="absolute -top-3 -left-2 text-4xl text-primary/20 font-serif">"</div>
                
                {/* Stars */}
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-amber-400">★</span>
                  ))}
                </div>
                
                <p className="text-lg font-medium mb-4">{testimonial.quote}</p>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold text-sm">
                    {testimonial.author[0]}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{testimonial.author}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.college}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Fun Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mt-8">
              {funStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="p-4 border-2 border-border bg-card text-center"
                  style={{ transform: `rotate(${index % 2 === 0 ? '-1' : '1'}deg)` }}
                >
                  <stat.icon className={`h-5 w-5 mx-auto mb-2 ${stat.color}`} />
                  <p className="text-2xl font-bold">{stat.label === "Students helped" ? studentCount.toLocaleString() : stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Handwritten note style */}
            <motion.div
              initial={{ opacity: 0, rotate: 2 }}
              whileInView={{ opacity: 1, rotate: 1 }}
              viewport={{ once: true }}
              className="p-4 bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-800 mt-6"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              <p className="text-sm italic text-amber-800 dark:text-amber-200">
                P.S. If this helps you clear even one paper, pass it on to your batch. That’s it. 🙏
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
