import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { ResourcesSection } from "@/components/sections/ResourcesSection";
import { BranchesSection } from "@/components/sections/BranchesSection";
import { AIAssistantSection } from "@/components/sections/AIAssistantSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { Footer } from "@/components/layout/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <ResourcesSection />
        <BranchesSection />
        <AIAssistantSection />
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
