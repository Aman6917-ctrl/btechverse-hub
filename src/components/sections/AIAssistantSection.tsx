import { motion } from "framer-motion";
import { Send, Bot, User, Sparkles, ArrowRight, MessageCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const sampleQuestions = [
  "Binary search samjhao",
  "Linked list kya hai?",
  "OSI model",
  "SQL joins",
  "Pointers in C",
];

const chatMessages = [
  {
    type: "bot",
    message: "Yo! 👋 Main hoon tera study buddy. Koi bhi topic bolo — seedha simple language mein samjha dunga. Textbook wali boring language nahi!"
  },
  {
    type: "user", 
    message: "Stack aur Queue mein difference?"
  },
  {
    type: "bot",
    message: "Bahut easy hai bhai:\n\n📚 **Stack** = Plates ki stack soch\nJo plate sabse upar hai, woh pehle nikalegi (LIFO)\n\n🎬 **Queue** = Cinema ki line soch\nJo pehle aaya, usko pehle ticket milega (FIFO)\n\nCode example dekhna hai?"
  }
];

export function AIAssistantSection() {
  const [question, setQuestion] = useState("");

  return (
    <section id="ai-assistant" className="section-padding relative overflow-hidden bg-muted/30">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 text-4xl opacity-20">🤖</div>
      <div className="absolute bottom-20 right-20 text-3xl opacity-20">💬</div>
      
      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, rotate: 3 }}
              whileInView={{ opacity: 1, rotate: 0 }}
              viewport={{ once: true }}
              className="sticker mb-6 inline-block"
            >
              <Sparkles className="h-3 w-3" />
              AI POWERED
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
            >
              Kuch samajh nahi aa raha?
              <br />
              <span className="underline-sketch">Puch le.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground mb-8 max-w-md"
            >
              No more ghanto ka Google search. Yeh AI literally tera dost hai — 
              explain karega jaise hostel mein friend karta hai. Simple. Quick.
            </motion.p>

            {/* Sample questions as handwritten tags */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-2 mb-8"
            >
              <span className="text-sm text-muted-foreground mr-2">Try:</span>
              {sampleQuestions.map((q, i) => (
                <button
                  key={q}
                  onClick={() => setQuestion(q)}
                  className="px-3 py-1.5 text-sm bg-card border-2 border-border hover:border-foreground transition-colors"
                  style={{ transform: `rotate(${i % 2 === 0 ? '-1' : '1'}deg)` }}
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
              className="flex flex-wrap gap-4"
            >
              <Button 
                size="lg" 
                variant="primary"
                className="shadow-[4px_4px_0_0_hsl(var(--primary)/0.3)]"
              >
                <MessageCircle className="h-4 w-4" />
                Start Chatting
              </Button>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4 text-accent" />
                100K+ doubts solved
              </div>
            </motion.div>
          </div>

          {/* Right - Chat UI with handcrafted style */}
          <motion.div
            initial={{ opacity: 0, x: 20, rotate: 1 }}
            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="border-2 border-foreground bg-card overflow-hidden shadow-[6px_6px_0_0_hsl(var(--foreground))]">
              {/* Chat Header */}
              <div className="flex items-center gap-3 p-4 border-b-2 border-foreground bg-primary/5">
                <div className="w-10 h-10 bg-primary flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-foreground">AI Study Buddy</p>
                  <p className="text-xs text-muted-foreground">24/7 available • Kabhi bore nahi hota</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs text-primary font-medium">Online</span>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="p-4 space-y-4 min-h-[320px] bg-muted/20">
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
                      <div className="w-8 h-8 bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div 
                      className={`max-w-[85%] p-3 text-sm ${
                        msg.type === 'user' 
                          ? 'bg-foreground text-background' 
                          : 'bg-card border-2 border-border'
                      }`}
                      style={{ transform: `rotate(${msg.type === 'user' ? '0.5' : '-0.3'}deg)` }}
                    >
                      <p className="whitespace-pre-line">{msg.message}</p>
                    </div>
                    {msg.type === 'user' && (
                      <div className="w-8 h-8 bg-muted flex items-center justify-center flex-shrink-0 border border-border">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}
                
                {/* Typing indicator */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="px-4 py-3 bg-card border-2 border-border">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t-2 border-foreground bg-card">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Kuch bhi puch lo..."
                    className="flex-1 px-4 py-3 bg-muted text-sm border-2 border-border focus:outline-none focus:border-foreground transition-colors"
                  />
                  <button className="p-3 bg-foreground text-background hover:opacity-90 transition-opacity">
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Handwritten note */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="text-sm text-muted-foreground mt-4 italic text-center"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              ^ Real conversation. Aise hi samjhata hai! ✨
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
