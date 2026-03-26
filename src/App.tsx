import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ReleaseMindExperience from "./components/ReleaseMindExperience";
import TrustStrip from "./components/TrustStrip";
import HowItWorks from "./components/HowItWorks";
import ImpactMetrics from "./components/ImpactMetrics";
import DashboardPreview from "./components/DashboardPreview";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import Dashboard from "./components/Dashboard";
import TechStack from "./components/TechStack";
import CustomCursor from "./components/CustomCursor";
import BlastRadiusSimulator from "./components/BlastRadiusSimulator";
import AgentThoughtStream from "./components/AgentThoughtStream";
import PredictiveTTR from "./components/PredictiveTTR";

function LandingPage() {
  return (
    <div className="bg-[#050505] min-h-screen selection:bg-purple-500/30 selection:text-white">
      <ReleaseMindExperience />
      <TrustStrip />
      <HowItWorks />
      <ImpactMetrics />
      <TechStack />
      <BlastRadiusSimulator />
      <AgentThoughtStream />
      <PredictiveTTR />
      <DashboardPreview />
      <CTA />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <div className="relative bg-[#050505] min-h-screen text-white font-sans overflow-hidden cursor-none">
        <CustomCursor />
        {/* Atmospheric Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="atmosphere absolute inset-0" />
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </Router>
  );
}
