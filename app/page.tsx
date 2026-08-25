"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import {
  ArrowRight,
  Archive,
  Check,
  ChevronDown,
  Palette,
  Share2,
  Sparkles,
  Star,
  StickyNote,
  Users,
  Wand2,
  Zap,
} from "lucide-react";

function useTypewriter(text: string, speed = 45, startDelay = 600) {
  const [display, setDisplay] = useState("");
  useEffect(() => {
    let i = 0;
    let interval: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        i++;
        setDisplay(text.slice(0, i));
        if (i >= text.length) clearInterval(interval);
      }, speed);
    }, startDelay);
    return () => { clearTimeout(timeout); clearInterval(interval); };
  }, [text, speed, startDelay]);
  return display;
}

function CountUp({ target, suffix = "", duration = 1400 }: { target: number; suffix?: string; duration?: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          setValue(Math.floor(progress * target));
          if (progress < 1) requestAnimationFrame(tick); else setValue(target);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{value.toLocaleString()}{suffix}</span>;
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.15 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(20px)",
      transition: `opacity 0.6s ease-out ${delay}s, transform 0.6s ease-out ${delay}s`,
    }}>
      {children}
    </div>
  );
}

function MagneticButton({ children, className, href }: { children: React.ReactNode; className: string; href: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setOffset({ x: (e.clientX - rect.left - rect.width / 2) * 0.2, y: (e.clientY - rect.top - rect.height / 2) * 0.2 });
  };
  return (
    <Link ref={ref} href={href} onMouseMove={handleMouseMove} onMouseLeave={() => setOffset({ x: 0, y: 0 })}
      className={className} style={{ transform: `translate(${offset.x}px, ${offset.y}px)`, transition: "transform 0.15s ease-out" }}>
      {children}
    </Link>
  );
}

const USE_CASES = ["Product roadmaps", "System architecture", "User flows", "Brainstorms", "Sprint planning", "Wireframes", "Mind maps", "Retrospectives", "Org charts", "Customer journeys"];

const FAQS = [
  { q: "Is Muraly free to use?", a: "Yes — every account starts on a free plan with generous limits. No credit card required to get started." },
  { q: "Can I use AI without knowing how to prompt?", a: "Just describe what you want in plain English. Muraly's AI handles the layout, shapes, and connections for you." },
  { q: "Can I invite people who don't have an account?", a: "Yes — share a public view or edit link with anyone, or invite teammates by email for full collaboration." },
  { q: "What can I export?", a: "Boards export as PNG, SVG, or raw JSON — ready to share, print, or re-import into Muraly or any Excalidraw-compatible tool." },
];

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <Reveal delay={index * 0.06}>
      <button onClick={() => setOpen((p) => !p)} className="flex w-full items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white px-5 py-4 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:border-gray-200">
        <span className="text-sm font-medium text-gray-900">{q}</span>
        <ChevronDown size={16} className={`shrink-0 text-gray-400 transition-transform duration-300 ${open ? "rotate-180 text-[#4338CA]" : ""}`} />
      </button>
      <div className="overflow-hidden px-5 transition-all duration-300 ease-out" style={{ maxHeight: open ? "200px" : "0px", opacity: open ? 1 : 0 }}>
        <p className="pb-4 pt-2 text-sm text-gray-500">{a}</p>
      </div>
    </Reveal>
  );
}

const FEATURES = [
  { icon: Wand2, title: "AI-generated diagrams", desc: "Describe an idea in plain English — flowcharts, architecture, and mockups appear directly on your canvas.", accent: "#4338CA", preview: CanvasPreview },
  { icon: Palette, title: "Infinite canvas", desc: "Sketch, draw, and organize without limits, on a canvas that never runs out of room.", accent: "#FB7185", preview: CanvasPreview },
  { icon: StickyNote, title: "Notes, emoji & icons", desc: "Drop in sticky notes, emoji, and a full icon library to bring boards to life in seconds.", accent: "#F59E0B", preview: NotesPreview },
  { icon: Users, title: "Real collaboration", desc: "Invite teammates as editors or viewers, or share a public link. Everyone stays in sync.", accent: "#10B981", preview: CollabPreview },
  { icon: Share2, title: "Export anywhere", desc: "Download boards as PNG, SVG, or raw JSON, ready to share, print, or re-import.", accent: "#06B6D4", preview: ExportPreview },
  { icon: Archive, title: "Stay organized", desc: "Archive finished boards, search your workspace, and pick up right where you left off.", accent: "#818CF8", preview: ArchivePreview },
];

// --- Hero card demo: prompt types out, then diagram nodes assemble ---
function FeatureAIDemo() {
  const [phase, setPhase] = useState<"typing" | "building" | "done">("typing");
  const prompt = useTypewriter("Sign up flow with email verification...", 35, 400);

  useEffect(() => {
    if (prompt.length === "Sign up flow with email verification...".length) {
      const t1 = setTimeout(() => setPhase("building"), 400);
      const t2 = setTimeout(() => setPhase("done"), 1600);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [prompt]);

  const nodes = [
    { label: "Sign up", x: "8%", y: "20%", color: "#4338CA" },
    { label: "Verify email", x: "38%", y: "55%", color: "#6366F1" },
    { label: "Welcome", x: "68%", y: "15%", color: "#FB7185" },
  ];

  return (
    <div className="relative h-64 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-inner">
      <div className="absolute left-3 right-3 top-3 flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
        <Sparkles size={13} className="shrink-0 text-[#4338CA]" />
        <span className="truncate text-xs text-gray-500">
          {prompt}
          {phase === "typing" && <span className="inline-block h-3 w-[1.5px] translate-y-0.5 animate-pulse bg-[#4338CA]" />}
        </span>
      </div>

      {phase !== "typing" &&
        nodes.map((n, i) => (
          <div
            key={n.label}
            className="absolute rounded-lg px-3 py-2 text-[11px] font-medium text-white shadow-md"
            style={{
              left: n.x,
              top: n.y,
              backgroundColor: n.color,
              animation: `fadeInUp 0.4s ease-out ${i * 0.25}s both`,
            }}
          >
            {n.label}
          </div>
        ))}

      {phase === "done" && (
        <svg className="absolute inset-0 h-full w-full" style={{ animation: "fadeInUp 0.3s ease-out 0.9s both" }}>
          <line x1="22%" y1="32%" x2="42%" y2="60%" stroke="#C7D2FE" strokeWidth="1.5" strokeDasharray="4 3" />
          <line x1="52%" y1="62%" x2="70%" y2="28%" stroke="#C7D2FE" strokeWidth="1.5" strokeDasharray="4 3" />
        </svg>
      )}
    </div>
  );
}

// --- Individual feature card with hover-triggered interactive preview ---
function FeatureCard({ feature }: { feature: typeof FEATURES[number] }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(67,56,202,0.12)]"
      style={{ borderTopWidth: "3px", borderTopColor: feature.accent }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md transition-transform duration-300"
          style={{ backgroundColor: feature.accent, transform: hovered ? "scale(1.1) rotate(6deg)" : "scale(1) rotate(0deg)" }}
        >
          <feature.icon size={18} />
        </div>
        <h3 className="text-base font-semibold text-gray-900">{feature.title}</h3>
      </div>
      <p className="mt-2.5 text-sm text-gray-500">{feature.desc}</p>

      {/* Hover-revealed interactive preview, unique per feature */}
      <div className="mt-4 flex-1">
        <feature.preview hovered={hovered} accent={feature.accent} />
      </div>
    </div>
  );
}

// --- Per-feature mini previews ---
function CanvasPreview({ hovered, accent }: { hovered: boolean; accent: string }) {
  return (
    <div className="relative h-16 overflow-hidden rounded-lg bg-gray-50">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute h-6 w-6 rounded-md border-2"
          style={{
            borderColor: accent,
            left: `${20 + i * 25}%`,
            top: "30%",
            transform: hovered ? `translateY(${i % 2 === 0 ? -4 : 4}px)` : "translateY(0)",
            transition: `transform 0.3s ease-out ${i * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
}
function NotesPreview({ hovered, accent }: { hovered: boolean; accent: string }) {
  return (
    <div className="relative h-16 overflow-hidden rounded-lg bg-gray-50">
      {["#FBBF24", "#34D399", "#FB7185"].map((c, i) => (
        <div
          key={i}
          className="absolute h-9 w-8 rounded-sm shadow-sm"
          style={{
            backgroundColor: c,
            left: `${18 + i * 22}%`,
            top: "22%",
            transform: hovered ? `rotate(${(i - 1) * 10}deg) translateY(-2px)` : "rotate(0deg)",
            transition: `transform 0.35s ease-out ${i * 0.06}s`,
          }}
        />
      ))}
    </div>
  );
}
function CollabPreview({ hovered, accent }: { hovered: boolean; accent: string }) {
  const colors = ["#4338CA", "#FB7185", "#34D399"];
  return (
    <div className="flex h-16 items-center rounded-lg bg-gray-50 px-4">
      <div className="flex">
        {colors.map((c, i) => (
          <div
            key={i}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white shadow-md"
            style={{
              backgroundColor: c,
              marginLeft: i === 0 ? 0 : -10,
              transform: hovered ? `translateX(${i * 2}px)` : "translateX(0)",
              transition: `transform 0.3s ease-out ${i * 0.05}s`,
              zIndex: colors.length - i,
            }}
          >
            {String.fromCharCode(65 + i)}
          </div>
        ))}
      </div>
      <span className="ml-3 text-[11px] text-gray-400">{hovered ? "3 people editing" : "Invite your team"}</span>
    </div>
  );
}
function ExportPreview({ hovered, accent }: { hovered: boolean; accent: string }) {
  const formats = ["PNG", "SVG", "JSON"];
  return (
    <div className="flex h-16 items-center justify-center gap-2 rounded-lg bg-gray-50">
      {formats.map((f, i) => (
        <div
          key={f}
          className="rounded-md border px-2.5 py-1.5 text-[10px] font-semibold transition-all duration-300"
          style={{
            borderColor: hovered ? accent : "#e5e7eb",
            color: hovered ? accent : "#9ca3af",
            transform: hovered ? "translateY(-2px)" : "translateY(0)",
            transitionDelay: `${i * 0.06}s`,
          }}
        >
          {f}
        </div>
      ))}
    </div>
  );
}

function ArchivePreview({ hovered, accent }: { hovered: boolean; accent: string }) {
  return (
    <div className="relative h-16 overflow-hidden rounded-lg bg-gray-50">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute left-1/2 h-9 w-14 -translate-x-1/2 rounded-md border bg-white shadow-sm"
          style={{
            top: `${16 + i * 4}px`,
            borderColor: i === 0 ? accent : "#e5e7eb",
            transform: `translateX(-50%) rotate(${hovered ? (i - 1) * 6 : (i - 1) * 2}deg)`,
            transition: `transform 0.3s ease-out ${i * 0.05}s`,
            zIndex: 3 - i,
          }}
        />
      ))}
    </div>
  );
}

const STEPS = [
  { title: "Create a board", desc: "Start from a blank canvas or let AI generate a starting point." },
  { title: "Bring it to life", desc: "Draw, drop in notes and icons, or ask AI to expand your idea." },
  { title: "Share & export", desc: "Invite your team, share a link, or export the finished board." },
];

export default function LandingPage() {
  const { isSignedIn } = useUser();
  const heroRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const typedPrompt = useTypewriter("Turn this into a launch checklist...", 40, 900);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      setMouse({ x: (e.clientX - rect.left - rect.width / 2) / rect.width, y: (e.clientY - rect.top - rect.height / 2) / rect.height });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#FAFAFC]">
      {/* --- Nav --- */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#4338CA] to-[#6366F1] shadow-[0_4px_10px_rgba(67,56,202,0.3)] transition-transform duration-300 hover:rotate-6">
              <Image src="/logo.svg" alt="Muraly" width={16} height={16} className="brightness-0 invert" />
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900">Muraly</span>
          </div>
          <div className="hidden items-center gap-8 text-sm font-medium text-gray-500 md:flex">
            <a href="#features" className="transition hover:text-gray-900">Features</a>
            <a href="#how-it-works" className="transition hover:text-gray-900">How it works</a>
            <a href="#faq" className="transition hover:text-gray-900">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <>
                <Link href="/dashboard" className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#4338CA] to-[#6366F1] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(67,56,202,0.3)] transition hover:brightness-105">
                  Go to dashboard
                </Link>
                <UserButton />
              </>
            ) : (
              <>
                <Link href="/sign-in" className="text-sm font-medium text-gray-600 transition hover:text-gray-900">Sign in</Link>
                <Link href="/sign-up" className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#4338CA] to-[#6366F1] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(67,56,202,0.3)] transition hover:brightness-105">
                  Get started free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* --- HERO: light, soft gradient wash --- */}
      <section ref={heroRef} className="relative overflow-hidden px-6 pb-24 pt-20 sm:pt-28">
        <div className="pointer-events-none absolute -left-24 top-0 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-[#818CF8] to-[#4338CA] opacity-[0.10] blur-[110px]"
          style={{ transform: `translate(${mouse.x * -30}px, ${mouse.y * -20}px)`, transition: "transform 0.4s ease-out" }} />
        <div className="pointer-events-none absolute -right-24 top-32 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-[#FDA4AF] to-[#FB7185] opacity-[0.10] blur-[110px]"
          style={{ transform: `translate(${mouse.x * 30}px, ${mouse.y * 20}px)`, transition: "transform 0.4s ease-out" }} />
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #312E81 1px, transparent 1px)", backgroundSize: "26px 26px" }} />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-1.5 rounded-full border border-[#EEF2FF] bg-white px-3.5 py-1.5 text-xs font-medium text-[#4338CA] shadow-[0_1px_2px_rgba(15,23,42,0.04)]" style={{ animation: "fadeInUp 0.5s ease-out both" }}>
            <Sparkles size={13} className="text-[#FB7185]" />
            Now with AI-powered diagram generation
          </div>

          <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-gray-900 sm:text-6xl" style={{ animation: "fadeInUp 0.55s ease-out 0.05s both" }}>
            Where ideas turn into{" "}
            <span className="relative inline-block bg-gradient-to-r from-[#4338CA] via-[#6366F1] to-[#FB7185] bg-clip-text text-transparent">
              something real
              <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" preserveAspectRatio="none">
                <path d="M0,5 Q50,0 100,5 T200,5" fill="none" stroke="url(#underline-gradient)" strokeWidth="3" strokeLinecap="round"
                  strokeDasharray="220" strokeDashoffset="220" style={{ animation: "drawLine 1s ease-out 0.8s forwards" }} />
                <defs><linearGradient id="underline-gradient" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#4338CA" /><stop offset="100%" stopColor="#FB7185" /></linearGradient></defs>
              </svg>
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-gray-500" style={{ animation: "fadeInUp 0.55s ease-out 0.1s both" }}>
            Sketch, diagram, and collaborate on an infinite canvas — or just describe your idea and let AI build it for you.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row" style={{ animation: "fadeInUp 0.55s ease-out 0.15s both" }}>
            <MagneticButton href={isSignedIn ? "/dashboard" : "/sign-up"}
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4338CA] to-[#6366F1] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(67,56,202,0.3)] transition-shadow hover:shadow-[0_14px_36px_rgba(67,56,202,0.42)]">
              {isSignedIn ? "Go to your boards" : "Start creating for free"}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </MagneticButton>
            <a href="#features" className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50">
              See how it works
            </a>
          </div>
          <p className="mt-4 text-xs text-gray-400" style={{ animation: "fadeInUp 0.55s ease-out 0.2s both" }}>No credit card required · Free forever plan</p>
        </div>

        {/* Mockup */}
        <div className="relative z-10 mx-auto mt-16 max-w-4xl" style={{ animation: "fadeInUp 0.6s ease-out 0.25s both" }}>
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_30px_80px_rgba(67,56,202,0.14)]"
            style={{ transform: `perspective(1200px) rotateX(${mouse.y * -1.5}deg) rotateY(${mouse.x * 1.5}deg)`, transition: "transform 0.3s ease-out" }}>
            <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/80 px-4 py-2.5">
              <div className="flex gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-[#FB7185]" /><div className="h-2.5 w-2.5 rounded-full bg-[#FBBF24]" /><div className="h-2.5 w-2.5 rounded-full bg-[#34D399]" /></div>
              <span className="ml-2 text-xs text-gray-400">muraly.app/workspace/product-roadmap</span>
            </div>
            <div className="relative h-[340px] bg-gradient-to-br from-[#EEF2FF] via-white to-[#FFF1F2] sm:h-[420px]">
              <div className="absolute left-[8%] top-[15%] w-40 -rotate-3 rounded-xl border bg-[#FFF7D6] p-3 shadow-md" style={{ transform: `translate(${mouse.x * 8}px, ${mouse.y * 6}px) rotate(-3deg)`, animation: "floatSlow 5s ease-in-out infinite" }}>
                <p className="text-xs font-semibold text-[#7C4A03]">User research</p>
                <p className="mt-1 text-[10px] text-[#92601a]">Interview 5 users this week</p>
              </div>
              <div className="absolute left-[35%] top-[8%] w-44 rotate-2 rounded-xl border bg-[#EEF2FF] p-3 shadow-md" style={{ transform: `translate(${mouse.x * -6}px, ${mouse.y * 4}px) rotate(2deg)`, animation: "floatSlow 6s ease-in-out infinite reverse" }}>
                <p className="text-xs font-semibold text-[#1D4ED8]">Design sprint</p>
                <p className="mt-1 text-[10px] text-[#3B4ED8]">Wireframes due Friday</p>
              </div>
              <div className="absolute right-[10%] top-[22%] w-40 -rotate-1 rounded-xl border bg-[#ECFDF5] p-3 shadow-md" style={{ transform: `translate(${mouse.x * 10}px, ${mouse.y * -4}px) rotate(-1deg)`, animation: "floatSlow 5.5s ease-in-out infinite" }}>
                <p className="text-xs font-semibold text-[#047857]">☐ Ship v2</p>
                <p className="mt-1 text-[10px] text-[#059669]">On track</p>
              </div>
              <div className="absolute bottom-[18%] left-1/2 flex min-w-[260px] -translate-x-1/2 items-center gap-2 rounded-full border border-gray-100 bg-white/95 px-4 py-2 shadow-lg backdrop-blur-sm">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#4338CA] to-[#6366F1] text-white"><Sparkles size={13} /></div>
                <span className="text-xs font-medium text-gray-600">"{typedPrompt}<span className="inline-block h-3 w-[1.5px] translate-y-0.5 animate-pulse bg-[#4338CA]" />"</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Use case marquee --- */}
      <div className="overflow-hidden border-y border-gray-100 bg-white py-4">
        <div className="flex w-max gap-3" style={{ animation: "marquee 28s linear infinite" }}>
          {[...USE_CASES, ...USE_CASES].map((item, i) => (
            <span key={i} className="shrink-0 rounded-full border border-gray-100 bg-[#FAFAFC] px-4 py-1.5 text-xs font-medium text-gray-500">{item}</span>
          ))}
        </div>
      </div>

      {/* --- Stats --- */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { value: 12000, suffix: "+", label: "Boards created" },
            { value: 4800, suffix: "+", label: "Active teams" },
            { value: 99, suffix: "%", label: "Uptime" },
            { value: 40, suffix: "k+", label: "AI diagrams generated" },
          ].map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.08}>
              <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <p className="text-3xl font-bold tracking-tight text-gray-900"><CountUp target={stat.value} suffix={stat.suffix} /></p>
                <p className="mt-1 text-xs text-gray-400">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* --- FEATURES: asymmetric bento, hero card + interactive previews --- */}
<section id="features" className="mx-auto max-w-6xl px-6 py-24">
  <Reveal className="mx-auto max-w-2xl text-center">
    <span className="text-xs font-semibold uppercase tracking-widest text-[#4338CA]">Why Muraly</span>
    <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
      Built for how ideas actually happen
    </h2>
    <p className="mt-3 text-gray-500">
      Not another blank canvas. A whiteboard that helps you think, draw, and ship faster.
    </p>
  </Reveal>

  <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-3">
    {/* --- Hero card: AI, spans full width on desktop, live-typing demo --- */}
    <Reveal className="lg:col-span-3">
      <div className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-gradient-to-br from-[#EEF2FF] via-white to-[#FFF1F2] p-8 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-500 hover:shadow-[0_24px_60px_rgba(67,56,202,0.14)] sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#818CF8]/15 blur-[70px] transition-transform duration-700 group-hover:scale-125" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#4338CA] shadow-sm">
              <Sparkles size={12} className="text-[#FB7185]" />
              Flagship feature
            </div>
            <h3 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">AI-generated diagrams</h3>
            <p className="mt-2.5 max-w-md text-sm leading-relaxed text-gray-500">
              Describe an idea in plain English — flowcharts, architecture diagrams, and mockups
              appear directly on your canvas, fully editable the moment they land.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["Flowcharts", "Architecture", "Wireframes", "Mind maps"].map((tag) => (
                <span key={tag} className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-500">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Live mini demo: prompt typing → nodes assembling */}
          <FeatureAIDemo />
        </div>
      </div>
    </Reveal>

    {/* --- Remaining features: interactive hover-preview cards --- */}
    {FEATURES.slice(1).map((f, i) => (
      <Reveal key={f.title} delay={i * 0.08}>
        <FeatureCard feature={f} />
      </Reveal>
    ))}
  </div>
</section>

      {/* --- How it works --- */}
      <section id="how-it-works" className="relative overflow-hidden bg-white px-6 py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#4338CA]">The process</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">From idea to board in seconds</h2>
          <p className="mt-3 text-gray-500">Three steps, zero learning curve.</p>
        </Reveal>

        <div className="relative mx-auto mt-16 max-w-5xl">
          <svg className="pointer-events-none absolute left-0 top-6 hidden w-full sm:block" height="4" viewBox="0 0 800 4" preserveAspectRatio="none">
            <line x1="60" y1="2" x2="740" y2="2" stroke="url(#step-line)" strokeWidth="2" strokeDasharray="6 6" />
            <defs><linearGradient id="step-line" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#4338CA" /><stop offset="100%" stopColor="#FB7185" /></linearGradient></defs>
          </svg>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.12} className="relative text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4338CA] to-[#6366F1] text-lg font-bold text-white shadow-[0_8px_20px_rgba(67,56,202,0.3)] transition-transform duration-300 hover:scale-110">
                  {i + 1}
                </div>
                <h3 className="mt-4 text-base font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-1.5 text-sm text-gray-500">{step.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* --- Social proof --- */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <Reveal>
          <div className="flex items-center justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={18} className="fill-[#FBBF24] text-[#FBBF24]" style={{ animation: `fadeInUp 0.3s ease-out ${i * 0.08}s both` }} />
            ))}
          </div>
          <p className="mx-auto mt-5 max-w-xl text-2xl font-medium leading-snug text-gray-800">
            "Muraly replaced three separate tools for our team, sketching, diagramming, and quick mockups all live in one place now."
          </p>
          <div className="mt-5 flex items-center justify-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#4338CA] to-[#818CF8] text-xs font-bold text-white">JP</div>
            <p className="text-sm text-gray-500">Product team, early user</p>
          </div>
        </Reveal>
      </section>

      {/* --- FAQ --- */}
      <section id="faq" className="mx-auto max-w-2xl px-6 py-20">
        <Reveal className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Frequently asked questions</h2>
        </Reveal>
        <div className="mt-10 space-y-3">
          {FAQS.map((f, i) => <FaqItem key={f.q} q={f.q} a={f.a} index={i} />)}
        </div>
      </section>

      {/* --- Final CTA --- */}
      <section className="px-6 pb-20">
        <Reveal className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-[#4338CA] via-[#4F46C7] to-[#6366F1] px-8 py-14 text-center shadow-[0_30px_70px_rgba(67,56,202,0.28)]">
          <div className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full bg-white/10 blur-[80px]" style={{ animation: "floatSlow 8s ease-in-out infinite" }} />
          <div className="pointer-events-none absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-white/10 blur-[70px]" style={{ animation: "floatSlow 10s ease-in-out infinite reverse" }} />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to build your next idea?</h2>
            <p className="mx-auto mt-3 max-w-md text-white/75">Join for free and create your first board in under a minute.</p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <MagneticButton href={isSignedIn ? "/dashboard" : "/sign-up"} className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#4338CA] shadow-lg">
                <Zap size={16} />
                {isSignedIn ? "Go to your boards" : "Get started free"}
              </MagneticButton>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/70">
              <span className="flex items-center gap-1.5"><Check size={13} /> Free forever plan</span>
              <span className="flex items-center gap-1.5"><Check size={13} /> No credit card</span>
              <span className="flex items-center gap-1.5"><Check size={13} /> Unlimited collaborators</span>
            </div>
          </div>
        </Reveal>
      </section>

      {/* --- Footer --- */}
      <footer className="border-t border-gray-100 bg-white px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#4338CA] to-[#6366F1]">
              <Image src="/logo.svg" alt="Muraly" width={14} height={14} className="brightness-0 invert" />
            </div>
            <span className="text-sm font-semibold text-gray-700">Muraly</span>
          </div>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Muraly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}