import { useState, useLayoutEffect, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Calendar, Briefcase, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookSessionModal } from "@/components/BookSessionModal";
import { mentors } from "@/data/mentors";
import type { Mentor } from "@/data/mentors";

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function MentorCard({ mentor, index }: { mentor: Mentor; index: number }) {
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`paper-card h-full flex flex-col transition-all duration-300 ${index === 0 ? "tape" : ""}`}
      style={{ transform: `rotate(${index % 2 === 0 ? -0.5 : 0.5}deg)` }}
    >
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

      <div className="flex items-center gap-3 mb-4">
        {imgError ? (
          <div
            className="w-20 h-20 rounded-full border-2 border-foreground shrink-0 bg-primary/20 flex items-center justify-center text-lg font-bold text-primary"
            aria-label={mentor.name}
          >
            {getInitials(mentor.name)}
          </div>
        ) : (
          <img
            src={mentor.image}
            alt={mentor.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-foreground shrink-0"
            onError={() => setImgError(true)}
          />
        )}
        <div>
          <h3 className="font-bold text-base leading-tight">{mentor.name}</h3>
          <p className="text-xs text-muted-foreground">{mentor.role}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Briefcase className="w-4 h-4" />
          <span className="font-medium">{mentor.experience} exp.</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4 flex-grow min-h-[4.25rem]">
        {mentor.expertise.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center justify-center px-2 py-0.5 bg-muted text-xs font-medium rounded-full whitespace-nowrap"
          >
            {skill}
          </span>
        ))}
      </div>

      <Button
        variant={mentor.available ? "default" : "outline"}
        className="w-full mt-auto"
        disabled={!mentor.available}
        onClick={() => mentor.available && setBookModalOpen(true)}
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
      <BookSessionModal
        open={bookModalOpen}
        onOpenChange={setBookModalOpen}
        mentorName={mentor.name}
        mentorEmail={mentor.email}
        mentorWhatsapp={mentor.whatsapp}
      />
    </div>
  );
}

function scrollToTop() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

export default function Mentors() {
  useLayoutEffect(() => {
    scrollToTop();
    const t1 = setTimeout(scrollToTop, 0);
    const t2 = setTimeout(scrollToTop, 50);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(scrollToTop, 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-16 md:pt-24 md:pb-20 bg-secondary/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-40" />

        <div className="container relative">
          <div className="text-center mb-12">
            <span className="sticker-green-soft mb-4 inline-block">Mentors from Top Product Companies</span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Expert mentors from leading <span className="underline-sketch">product companies.</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Book 1:1 sessions with engineers from Google, Microsoft, Amazon and more.
              Career guidance, interview prep, and placement advice—direct and actionable.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mentors.map((mentor, index) => (
              <MentorCard key={`${mentor.name}-${index}`} mentor={mentor} index={index} />
            ))}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
