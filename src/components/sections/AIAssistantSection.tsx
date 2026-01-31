import { motion } from "framer-motion";
import { Send, Bot, User, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const sampleQuestions = [
  "Explain binary search",
  "What's a linked list?",
  "OSI model layers",
  "SQL joins types",
];

const chatMessages = [
  {
    type: "bot",
    message: "Hey! 👋 I'm your study buddy. Ask me anything about engineering - I'll explain it like a friend, not a textbook."
  },
  {
    type: "user", 
    message: "What's the difference between stack and queue?"
  },
  {
    type: "bot",
    message: "Think of it this way:\n\n**Stack** = Stack of plates 🍽️\nLast plate you put goes out first (LIFO)\n\n**Queue** = Movie ticket line 🎬\nFirst person in line gets ticket first (FIFO)\n\nWant me to show code examples?"
  }
];

export function AIAssistantSection() {
  const [question, setQuestion] = useState("");

  return (
    <section id="ai-assistant" className="section-padding relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-64 h-64 border border-primary/10 rounded-full" />
      <div className="absolute bottom-20 left-10 w-40 h-40 border border-accent/10 rounded-full" />
      
      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div>
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="badge badge-accent mb-6"
            >
              <Sparkles className="h-3 w-3" />
              AI Powered
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
            >
              Stuck on a concept?
              <br />
              <span className="text-muted-foreground">Just ask.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground mb-8 max-w-md"
            >
              No more googling for hours. Our AI explains complex topics in simple words, 
              with examples that actually make sense.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-2 mb-8"
            >
              {sampleQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => setQuestion(q)}
                  className="px-4 py-2 text-sm bg-muted rounded-full hover:bg-muted/80 transition-colors"
                >
                  {q}
                </button>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Button size="lg" variant="primary">
                Try AI Buddy
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>

          {/* Right - Chat UI */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg">
              {/* Chat Header */}
              <div className="flex items-center gap-3 p-4 border-b border-border">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">AI Study Buddy</p>
                  <p className="text-xs text-muted-foreground">Always online • Replies instantly</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs text-primary font-medium">Active</span>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="p-4 space-y-4 min-h-[300px] bg-muted/30">
                {chatMessages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 }}
                    className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : ''}`}
                  >
                    {msg.type === 'bot' && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      msg.type === 'user' 
                        ? 'bg-foreground text-background rounded-br-md' 
                        : 'bg-background border border-border rounded-bl-md'
                    }`}>
                      <p className="whitespace-pre-line">{msg.message}</p>
                    </div>
                    {msg.type === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask anything..."
                    className="flex-1 px-4 py-3 rounded-full bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button className="p-3 rounded-full bg-foreground text-background hover:opacity-90 transition-opacity">
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
