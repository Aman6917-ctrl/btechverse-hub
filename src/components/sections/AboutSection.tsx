import { motion } from "framer-motion";
import { Quote, Github, Twitter, Linkedin, Heart, Coffee, Moon, Code2 } from "lucide-react";

const team = [
  { name: "Rahul", role: "The Coder", emoji: "💻", college: "NIT Trichy", funFact: "Lives on Monster Energy" },
  { name: "Priya", role: "The Designer", emoji: "🎨", college: "IIT Delhi", funFact: "Figma > Sleep" },
  { name: "Amit", role: "The Fixer", emoji: "🔧", college: "VIT Vellore", funFact: "Stack Overflow addict" },
];

const testimonials = [
  {
    quote: "Bhai ye site pehle mili hoti toh 3rd sem mein backlog nahi aata 😭",
    author: "Random CSE Student",
    college: "DTU",
    rating: 5
  },
  {
    quote: "Finally someone made notes that don't look like ancient scriptures. Actually readable!",
    author: "ECE Topper",
    college: "NIT Karnataka", 
    rating: 5
  },
  {
    quote: "AI buddy ne ek raat mein DBMS samjha diya jo 3 months se pending tha",
    author: "Backlog Survivor",
    college: "IIIT Hyderabad",
    rating: 5
  }
];

const funStats = [
  { icon: Coffee, value: "∞", label: "Chai consumed", color: "text-amber-600" },
  { icon: Moon, value: "0", label: "Sleep during exams", color: "text-indigo-500" },
  { icon: Code2, value: "999+", label: "Bugs fixed", color: "text-primary" },
  { icon: Heart, value: "25K+", label: "Students helped", color: "text-destructive" },
];

export function AboutSection() {
  return (
    <section id="about" className="section-padding relative overflow-hidden">
      {/* Hand-drawn style background elements */}
      <div className="absolute top-20 right-10 w-32 h-32 border-4 border-dashed border-primary/10 rounded-full" />
      <div className="absolute bottom-40 left-20 w-20 h-20 border-4 border-dashed border-accent/10 rotate-45" />
      
      <div className="container relative">
        {/* Section header with sticker */}
        <div className="flex items-start gap-4 mb-12">
          <div>
            <motion.div
              initial={{ opacity: 0, rotate: 5 }}
              whileInView={{ opacity: 1, rotate: 0 }}
              viewport={{ once: true }}
              className="sticker mb-4 inline-block"
            >
              THE STORY
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
            >
              3 students.
              <br />
              <span className="text-muted-foreground">1 frustrating exam season.</span>
              <br />
              <span className="underline-sketch">This website.</span>
            </motion.h2>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left - Story with personality */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="space-y-6 text-lg text-muted-foreground mb-10"
            >
              <p className="paper-card" style={{ transform: 'rotate(-0.5deg)' }}>
                <span className="text-foreground font-semibold">December 2023, 3 AM.</span>
                <br />
                Exam in 8 hours. Notes kahi nahi mil rahe. 15 WhatsApp groups scroll kar chuke. 
                Ek ne bola "Google Drive mein hai" — link expired. 💀
              </p>
              
              <p>
                That night we decided — <span className="font-semibold text-foreground">isse fix karna hai.</span>
                <br />
                No fancy office. No investors. Just 3 laptops, unlimited chai, and a mission.
              </p>
              
              <div className="flex items-center gap-3 p-4 bg-primary/5 border-l-4 border-primary">
                <span className="text-2xl">💡</span>
                <p className="text-foreground font-medium">
                  "Agar hum struggle kar rahe hain, toh lakhon students bhi kar rahe honge."
                </p>
              </div>
            </motion.div>

            {/* Team Cards - Handcrafted style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                The Team (Yes, just 3 of us)
              </p>
              <div className="space-y-3">
                {team.map((member, index) => (
                  <motion.div 
                    key={member.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-4 p-4 bg-card border-2 border-border hover:border-foreground/30 transition-colors"
                    style={{ transform: `rotate(${index % 2 === 0 ? '-0.5' : '0.5'}deg)` }}
                  >
                    <div className="text-3xl">{member.emoji}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold">{member.name}</p>
                        <span className="text-xs px-2 py-0.5 bg-muted rounded-full">{member.role}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{member.college}</p>
                    </div>
                    <p className="text-xs text-muted-foreground italic hidden sm:block">"{member.funFact}"</p>
                  </motion.div>
                ))}
              </div>

              {/* Social Links */}
              <div className="flex gap-2 mt-6">
                {[Github, Twitter, Linkedin].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="p-3 border-2 border-border hover:border-foreground hover:bg-foreground hover:text-background transition-all"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
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
                  <p className="text-2xl font-bold">{stat.value}</p>
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
                P.S. — If this site helps you pass even one exam, 
                share it with your batchmates. That's all we ask! 🙏
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
