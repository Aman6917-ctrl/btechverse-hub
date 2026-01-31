import { motion } from "framer-motion";
import { MessageSquare, Send, Sparkles, Bot, Lightbulb, Clock } from "lucide-react";
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
    <section id="ai-assistant" className="py-20 md:py-28 bg-background relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6"
            >
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold text-accent">
                AI-Powered
              </span>
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4"
            >
              Got Doubts? <br />
              <span className="text-gradient">Ask Our AI Assistant</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground mb-8"
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
              className="grid grid-cols-2 gap-4 mb-8"
            >
              {[
                { icon: Bot, text: "Trained on Engineering" },
                { icon: Clock, text: "24/7 Available" },
                { icon: Lightbulb, text: "Step-by-Step Solutions" },
                { icon: MessageSquare, text: "Conversational UI" },
              ].map((feature) => (
                <div
                  key={feature.text}
                  className="flex items-center gap-3 text-sm text-muted-foreground"
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <feature.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span>{feature.text}</span>
                </div>
              ))}
            </motion.div>

            {/* Sample Questions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-2"
            >
              <span className="text-sm text-muted-foreground">Try asking:</span>
              {sampleQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => setQuestion(q)}
                  className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {q}
                </button>
              ))}
            </motion.div>
          </div>

          {/* Right - Chat UI Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <div className="rounded-2xl bg-card border border-border shadow-xl overflow-hidden">
              {/* Chat Header */}
              <div className="flex items-center gap-3 p-4 border-b border-border bg-muted/50">
                <div className="p-2 rounded-full bg-gradient-primary">
                  <Bot className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">BTechVerse AI</h4>
                  <p className="text-xs text-muted-foreground">Always online</p>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs text-primary">Online</span>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="p-4 space-y-4 min-h-[280px] bg-gradient-card">
                {/* Bot Message */}
                <div className="flex gap-3">
                  <div className="p-1.5 rounded-full bg-primary/10 h-fit">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%]">
                    <p className="text-sm text-foreground">
                      Hi! 👋 I'm your AI study assistant. Ask me anything about your B.Tech subjects,
                      and I'll help you understand complex concepts easily.
                    </p>
                  </div>
                </div>

                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-gradient-primary rounded-2xl rounded-tr-none px-4 py-3 max-w-[80%]">
                    <p className="text-sm text-primary-foreground">
                      Can you explain what is a Binary Search Tree?
                    </p>
                  </div>
                </div>

                {/* Bot Response */}
                <div className="flex gap-3">
                  <div className="p-1.5 rounded-full bg-primary/10 h-fit">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%]">
                    <p className="text-sm text-foreground">
                      A Binary Search Tree (BST) is a data structure where each node has at most
                      two children. The left child contains values less than the parent, and the
                      right child contains values greater. This enables efficient O(log n) search...
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-border bg-card">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask your doubt..."
                    className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary transition-colors text-foreground placeholder:text-muted-foreground"
                  />
                  <Button variant="hero" size="lg" className="px-4">
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute -bottom-4 -right-4 p-4 rounded-xl bg-card border border-border shadow-lg">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm font-semibold text-foreground">100K+</p>
                  <p className="text-xs text-muted-foreground">Questions answered</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
