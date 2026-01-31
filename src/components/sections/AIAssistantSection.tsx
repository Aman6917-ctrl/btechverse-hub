import { motion } from "framer-motion";
import { MessageSquare, Send, Sparkles, Bot, Lightbulb, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const sampleQuestions = [
  "Explain Dijkstra's algorithm",
  "What is OSI model?",
  "SQL vs NoSQL differences",
  "How does TCP/IP work?",
];

export function AIAssistantSection() {
  const [question, setQuestion] = useState("");

  return (
    <section id="ai-assistant" className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px]" />
      </div>

      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6"
            >
              <Zap className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold text-accent">
                AI-Powered Learning
              </span>
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-display font-bold text-foreground mb-5"
            >
              Got Doubts? <br />
              <span className="text-gradient">Ask Our AI Assistant</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground mb-10 leading-relaxed"
            >
              Get instant answers to your academic questions 24/7. Our AI is trained on
              engineering concepts to provide accurate, easy-to-understand explanations.
            </motion.p>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 gap-4 mb-10"
            >
              {[
                { icon: Bot, text: "Trained on Engineering", gradient: "from-violet-500 to-purple-600" },
                { icon: Clock, text: "24/7 Available", gradient: "from-emerald-500 to-teal-600" },
                { icon: Lightbulb, text: "Step-by-Step Solutions", gradient: "from-amber-500 to-orange-600" },
                { icon: MessageSquare, text: "Conversational UI", gradient: "from-pink-500 to-rose-600" },
              ].map((feature) => (
                <motion.div
                  key={feature.text}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-4 p-3 rounded-xl bg-card border border-border/50 transition-all hover:shadow-md"
                >
                  <div className={`p-2.5 rounded-lg bg-gradient-to-br ${feature.gradient}`}>
                    <feature.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Sample Questions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              <span className="text-sm font-medium text-muted-foreground">Try asking:</span>
              <div className="flex flex-wrap gap-2">
                {sampleQuestions.map((q) => (
                  <motion.button
                    key={q}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setQuestion(q)}
                    className="px-4 py-2 rounded-full glass text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-all"
                  >
                    {q}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right - Chat UI Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            {/* Glow behind card */}
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 rounded-3xl blur-2xl opacity-50" />
            
            <div className="relative rounded-3xl bg-card border border-border/50 shadow-2xl overflow-hidden">
              {/* Chat Header */}
              <div className="flex items-center gap-4 p-5 border-b border-border/50 bg-gradient-to-r from-primary/5 to-accent/5">
                <div className="p-3 rounded-xl bg-gradient-primary shadow-lg">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-foreground">BTechVerse AI</h4>
                  <p className="text-xs text-muted-foreground">Your study companion</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  <span className="text-xs font-semibold text-primary">Online</span>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="p-5 space-y-5 min-h-[320px] bg-gradient-to-b from-card to-muted/20">
                {/* Bot Message */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="flex gap-3"
                >
                  <div className="p-2 rounded-xl bg-primary/10 h-fit">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted/80 backdrop-blur-sm rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                    <p className="text-sm text-foreground leading-relaxed">
                      Hi! 👋 I'm your AI study assistant. Ask me anything about your B.Tech subjects,
                      and I'll help you understand complex concepts easily.
                    </p>
                  </div>
                </motion.div>

                {/* User Message */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="flex justify-end"
                >
                  <div className="bg-gradient-primary rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] shadow-lg">
                    <p className="text-sm text-white">
                      Can you explain what is a Binary Search Tree?
                    </p>
                  </div>
                </motion.div>

                {/* Bot Response */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="flex gap-3"
                >
                  <div className="p-2 rounded-xl bg-primary/10 h-fit">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted/80 backdrop-blur-sm rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                    <p className="text-sm text-foreground leading-relaxed">
                      A Binary Search Tree (BST) is a data structure where each node has at most
                      two children. The left child contains values less than the parent, and the
                      right child contains values greater. This enables efficient O(log n) search...
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Chat Input */}
              <div className="p-5 border-t border-border/50 bg-card">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask your doubt..."
                    className="flex-1 px-5 py-4 rounded-xl glass text-sm focus:outline-none focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground"
                  />
                  <Button variant="hero" size="lg" className="px-5">
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Floating Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="absolute -bottom-6 -right-6 p-5 rounded-2xl glass shadow-xl"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-accent">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">100K+</p>
                  <p className="text-xs text-muted-foreground">Questions answered</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
