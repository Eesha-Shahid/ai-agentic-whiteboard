"use client";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { Sparkles, Wand2 } from "lucide-react";
import CreateNewBoardDialog from "./CreateNewBoardDialog";

function WelcomeBanner() {
  const { user } = useUser();

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white px-7 py-7 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      {/* Gradient mesh — layered soft blobs instead of a flat wash */}
      <div className="absolute inset-0">
        <div className="absolute -left-10 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#818CF8] to-[#4338CA] opacity-[0.12] blur-[70px]" style={{ animation: "floatSlow 8s ease-in-out infinite" }} />
        <div className="absolute -right-16 -top-10 h-64 w-64 rounded-full bg-gradient-to-br from-[#FDA4AF] to-[#FB7185] opacity-[0.14] blur-[70px]" style={{ animation: "floatSlow 10s ease-in-out infinite reverse" }} />
        <div className="absolute bottom-[-4rem] left-1/3 h-56 w-56 rounded-full bg-gradient-to-br from-[#A5B4FC] to-[#818CF8] opacity-[0.10] blur-[70px]" style={{ animation: "floatSlow 9s ease-in-out infinite" }} />
      </div>
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: 'radial-gradient(circle, #312E81 1px, transparent 1px)', backgroundSize: '22px 22px' }}
      />

      <div className="relative z-10 flex items-center justify-between gap-6">
        <div style={{ animation: "fadeInUp 0.5s ease-out both" }}>
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#EEF2FF] to-[#FFF1F2] px-3 py-1 text-xs font-medium text-[#4338CA]">
            <Sparkles size={13} strokeWidth={2.2} className="text-[#FB7185]" />
            Your creative workspace
          </div>
          <h2 className="text-[28px] font-bold leading-tight tracking-tight text-gray-900">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-[#4338CA] via-[#6366F1] to-[#FB7185] bg-clip-text text-transparent">
              {user?.firstName || "there"}
            </span>{" "}
            <span className="inline-block" style={{ animation: "floatSlow 2.4s ease-in-out infinite" }}>
              👋
            </span>
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Turn your ideas into diagrams, notes and visuals on an infinite canvas.
          </p>
          <div className="mt-5 flex items-center gap-2.5">
            <CreateNewBoardDialog fullWidth={false} />
            <Button
              size="lg"
              className="group cursor-pointer border-0 bg-gradient-to-r from-[#4338CA] to-[#6366F1] text-white shadow-[0_10px_24px_rgba(67,56,202,0.28)] transition-all hover:shadow-[0_12px_28px_rgba(67,56,202,0.4)] hover:brightness-110"
            >
              <Wand2 size={16} strokeWidth={2.2} className="transition-transform duration-300 group-hover:rotate-12" />
              Ask AI
            </Button>
          </div>
        </div>

        <div
          className="relative hidden h-[136px] w-[236px] shrink-0 rotate-2 rounded-2xl border border-white bg-white/90 p-3.5 shadow-[0_18px_40px_rgba(67,56,202,0.16)] backdrop-blur-xl transition-transform duration-500 ease-out hover:rotate-0 hover:scale-[1.02] md:block"
          style={{ animation: "fadeInUp 0.6s ease-out 0.15s both" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              <div className="h-2 w-2 rounded-full bg-[#FB7185]" />
              <div className="h-2 w-2 rounded-full bg-[#FBBF24]" />
              <div className="h-2 w-2 rounded-full bg-[#34D399]" />
            </div>
            <span className="text-[9px] font-medium text-gray-300">canvas.whiz</span>
          </div>

          <div className="absolute left-4 top-11 -rotate-3 rounded-lg bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] px-3 py-2 text-[10px] font-medium text-[#92400E] shadow-sm">
            New Idea ✨
          </div>
          <div className="absolute right-3 top-[54px] rotate-2 rounded-lg bg-gradient-to-br from-[#E0E7FF] to-[#C7D2FE] px-3 py-2 text-[10px] font-medium text-[#3730A3] shadow-sm">
            AI Brainstorm
          </div>
          <div className="absolute bottom-3 left-9 flex items-center gap-1 rounded-lg bg-gradient-to-br from-[#FFE4E6] to-[#FECDD3] px-3 py-1.5 text-[9px] font-medium text-[#9F1239] shadow-sm">
            Design <span className="text-[#FB7185]">→</span> Build <span className="text-[#FB7185]">→</span> Ship
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeBanner;