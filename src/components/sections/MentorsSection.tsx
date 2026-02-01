import { motion } from "framer-motion";
import { Calendar, Linkedin, Star, Clock, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const mentors = [
  {
    name: "Rahul Sharma",
    role: "SDE-3 @ Google",
    expertise: ["DSA", "System Design", "Interview Prep"],
    rating: 4.9,
    sessions: 120,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    available: true,
    price: "Free",
  },
  {
    name: "Priya Patel",
    role: "ML Engineer @ Microsoft",
    expertise: ["Machine Learning", "Python", "AI/ML Roadmap"],
    rating: 4.8,
    sessions: 85,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    available: true,
    price: "₹99",
  },
  {
    name: "Amit Kumar",
    role: "Founding Engineer @ Startup",
    expertise: ["Full Stack", "React", "Startup Tips"],
    rating: 5.0,
    sessions: 200,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    available: false,
    price: "₹149",
  },
  {
    name: "Sneha Reddy",
    role: "Product Manager @ Amazon",
    expertise: ["Product Sense", "Case Studies", "Resume Review"],
    rating: 4.9,
    sessions: 150,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    available: true,
    price: "₹199",
  },
];

export function MentorsSection() {
  return (
    <section id="mentors" className="section-padding bg-secondary/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-dots opacity-40" />
      
      <div className="container relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="sticker-green mb-4 inline-block">🎯 Real Guidance</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl mb-4">
            Industry Experts Se <span className="underline-sketch">Seedha Baat</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Google, Microsoft, Amazon ke engineers se 1:1 session book karo. 
            Career guidance, interview prep, ya sirf thoda motivation — sab milega!
          </p>
        </motion.div>

        {/* Mentors Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mentors.map((mentor, index) => (
            <motion.div
              key={mentor.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div 
                className="paper-card h-full flex flex-col transition-all duration-300"
                style={{ transform: `rotate(${index % 2 === 0 ? -0.5 : 0.5}deg)` }}
              >
                {/* Availability Badge */}
                <div className="flex justify-between items-start mb-4">
                  {mentor.available ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                      <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      Available
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-muted text-muted-foreground text-xs font-semibold rounded-full">
                      <Clock className="w-3 h-3" />
                      Busy
                    </span>
                  )}
                  <span className="text-lg font-bold text-primary">{mentor.price}</span>
                </div>

                {/* Profile */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative">
                    <img
                      src={mentor.image}
                      alt={mentor.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-foreground"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-background border-2 border-foreground rounded-full p-0.5">
                      <Linkedin className="w-3 h-3 text-[#0077B5]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-base leading-tight">{mentor.name}</h3>
                    <p className="text-xs text-muted-foreground">{mentor.role}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-accent fill-accent" />
                    <span className="font-semibold">{mentor.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{mentor.sessions} sessions</span>
                  </div>
                </div>

                {/* Expertise Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4 flex-grow">
                  {mentor.expertise.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 bg-muted text-xs font-medium rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Book Button */}
                <Button
                  variant={mentor.available ? "default" : "outline"}
                  className="w-full mt-auto"
                  disabled={!mentor.available}
                >
                  {mentor.available ? (
                    <>
                      <Calendar className="w-4 h-4" />
                      Book Session
                    </>
                  ) : (
                    "Join Waitlist"
                  )}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="paper-card inline-block" style={{ transform: "rotate(-1deg)" }}>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="text-left">
                <p className="font-bold text-lg">Khud mentor banna chahte ho? 🚀</p>
                <p className="text-sm text-muted-foreground">
                  Share your experience, help juniors, earn while you learn!
                </p>
              </div>
              <Button variant="accent" className="shrink-0">
                Apply as Mentor
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
