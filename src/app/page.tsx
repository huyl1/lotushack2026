"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { GradualBlur } from "@/components/ui/gradual-blur";
import { Marquee } from "@/components/ui/marquee";
import { Brain, BarChart3, Mic, Layers, ShieldCheck, Database, RefreshCw, AlertTriangle, Crosshair, GraduationCap, Wallet, Users } from "lucide-react";

// Heavy components loaded lazily — matter-js (500KB), scroll animations
const FallingTools = dynamic(
  () => import("@/components/landing/falling-tools").then((m) => ({ default: m.FallingTools })),
  { ssr: false }
);
const PipelineCarousel = dynamic(
  () => import("@/components/landing/pipeline-carousel").then((m) => ({ default: m.PipelineCarousel })),
  { ssr: false }
);
const ShapeGrid = dynamic(
  () => import("@/components/ui/shape-grid").then((m) => ({ default: m.ShapeGrid })),
  { ssr: false }
);
const NumberTicker = dynamic(
  () => import("@/components/ui/number-ticker").then((m) => ({ default: m.NumberTicker })),
  { ssr: false }
);

const LOGO_TOKEN = "pk_WeSKd22IT7qcdmEF7aoY0w";
function logoUrl(domain: string) {
  return `https://img.logo.dev/${domain}?token=${LOGO_TOKEN}&size=64&format=png&greyscale`;
}

const TOOLS = [
  { name: "Exa", role: "Data scraping", url: "https://exa.ai", logo: logoUrl("exa.ai") },
  { name: "Qwen", role: "Cleaning & embeddings", url: "https://www.alibabacloud.com/en/campaign/qwen-ai-landing-page", logo: logoUrl("alibabacloud.com") },
  { name: "OpenRouter", role: "Model routing", url: "https://openrouter.ai", logo: logoUrl("openrouter.ai") },
  { name: "Valsea", role: "Conversation analysis", url: "https://valsea.app", logo: logoUrl("valsea.app") },
  { name: "Trae", role: "Agentic IDE", url: "https://www.trae.ai", logo: "https://p16-arcosite-sg.ibyteimg.com/tos-alisg-i-k9wyc2ijk0-sg/c096921a6fd64464a1534b4231015f81~tplv-k9wyc2ijk0-image.image" },
  { name: "Codex", role: "Agent orchestration", url: "https://openai.com/codex", logo: logoUrl("openai.com") },
];

const PIPELINE = [
  { n: "01", title: "Scrape", desc: "University data gathered via Exa, including info not available through standard sources.", tool: "Exa", image: "/pipeline/pipeline_image_1.png" },
  { n: "02", title: "Clean & Validate", desc: "Qwen preprocesses: filling missing values, correcting inconsistencies, verifying outputs.", tool: "Qwen", image: "/pipeline/pipeline_image_2.png" },
  { n: "03", title: "Embed", desc: "University and student data converted into semantic embeddings for deep comparison.", tool: "Qwen", image: "/pipeline/pipeline_image_3.png" },
  { n: "04", title: "Score", desc: "Embeddings scored via Grok (OpenRouter) across five weighted criteria.", tool: "OpenRouter", image: "/pipeline/pipeline_image_4.png" },
  { n: "05", title: "Classify", desc: "Schools classified into Reach, Match, and Safety tiers.", tool: "OpenRouter", image: "/pipeline/pipeline_image_5.png" },
  { n: "06", title: "Explain", desc: "Detailed rationale generated for each recommendation.", tool: "OpenRouter", image: "/pipeline/pipeline_imagine_6.png" },
];

/* ── Shared ── */
const mono = { fontSize: 12, fontFamily: "var(--font-geist-mono)", letterSpacing: "0.08em", textTransform: "uppercase" as const, fontWeight: 600 };
const borderLine = "1px solid var(--color-border)";

/* ── Full-width section bar ── */
function SectionBar({ number, label, count }: { number: string; label: string; count?: string }) {
  return (
    <div style={{ borderTop: borderLine, borderBottom: borderLine }}>
      <div className="flex items-center justify-between" style={{ maxWidth: 960, margin: "0 auto", padding: "14px 24px" }}>
        <span style={{ ...mono, color: "var(--color-text-muted)" }}>[{number}] {label}</span>
        {count && <span style={{ ...mono, color: "var(--color-text-muted)", fontSize: 11 }}>{count}</span>}
      </div>
    </div>
  );
}

/* ── Animation variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};
const slideInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0 },
};
const slideInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0 },
};
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const staggerSlow = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

/* ── Content wrapper ── */
function ContentMax({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return <div className={className} style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px", ...style }}>{children}</div>;
}

/* ── Full-width grid row with center divider ── */
function GridRow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ borderTop: borderLine }}>
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", maxWidth: 960, margin: "0 auto" }}>
        {children}
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="landing-grid-bg">
      <GradualBlur target="page" position="bottom" height="7rem" strength={2} divCount={5} curve="bezier" exponential opacity={1} />

      {/* Nav */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8"
        style={{ height: 64, background: "rgba(248,247,244,0.85)", backdropFilter: "blur(12px)", borderBottom: borderLine }}
      >
        <div className="flex items-center gap-2.5">
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-tier-match)" }} />
          <span style={{ fontSize: 18, fontWeight: 700, fontFamily: "var(--font-poppins)", letterSpacing: "-0.02em", color: "var(--color-text-primary)" }}>Edify</span>
        </div>
        <nav className="flex items-center" style={{ gap: 28 }}>
          {["Problem", "Solution", "Pipeline", "Impact"].map((s) => (
            <Link key={s} href={`#${s.toLowerCase()}`} style={{ fontSize: 13, fontFamily: "var(--font-geist-sans)", fontWeight: 500, color: "var(--color-text-muted)", textDecoration: "none" }}>{s}</Link>
          ))}
          <Link href="/login" className="inline-flex items-center px-5 h-9" style={{ fontSize: 13, fontWeight: 600, background: "var(--color-accent)", color: "var(--color-text-inverse)", borderRadius: 6, textDecoration: "none" }}>
            Sign in
          </Link>
        </nav>
      </header>

      {/* ─── HERO ─── */}
      <section className="relative flex flex-col items-center justify-center text-center" style={{ minHeight: "100vh", padding: "120px 24px 80px" }}>
        <div className="absolute inset-0 z-0">
          <ShapeGrid speed={0.3} squareSize={48} direction="diagonal" borderColor="rgba(226,224,217,0.5)" hoverFillColor="rgba(26,26,26,0.08)" hoverTrailAmount={5} />
        </div>
        <motion.div
          className="relative z-10 flex flex-col items-center"
          style={{ gap: 24, maxWidth: 900 }}
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2" style={{ ...mono, fontSize: 12, color: "var(--color-success)", background: "var(--color-success-dim)", padding: "6px 16px", borderRadius: 100, border: "1px solid rgba(16,185,129,0.15)", letterSpacing: "0.06em" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-success)" }} />
            AI-Powered University Matching
          </motion.div>

          <motion.h1 variants={fadeUp} transition={{ duration: 0.6 }} style={{ fontSize: 56, fontWeight: 700, fontFamily: "var(--font-poppins)", letterSpacing: "-0.03em", lineHeight: 1.1, margin: 0, color: "var(--color-text-primary)" }}>
            Matching students to where they&apos;ll actually thrive.
          </motion.h1>

          <motion.p variants={fadeUp} transition={{ duration: 0.5 }} style={{ fontSize: 17, fontFamily: "var(--font-geist-sans)", color: "var(--color-text-secondary)", lineHeight: 1.65, maxWidth: 500, margin: 0 }}>
            Edify helps education consultants discover the best university opportunities, powered by semantic analysis, transparent scoring, and conversation intelligence.
          </motion.p>

          <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="flex items-center" style={{ gap: 12, paddingTop: 8 }}>
            <Link href="/login" className="inline-flex items-center gap-2" style={{ fontSize: 15, fontWeight: 600, fontFamily: "var(--font-geist-sans)", background: "var(--color-accent)", color: "var(--color-text-inverse)", padding: "14px 32px", borderRadius: 8, textDecoration: "none" }}>
              Get Started
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 7h12M8 2l5 5-5 5" /></svg>
            </Link>
            <Link href="#problem" className="inline-flex items-center" style={{ fontSize: 15, fontWeight: 600, fontFamily: "var(--font-geist-sans)", color: "var(--color-text-primary)", padding: "14px 32px", borderRadius: 8, border: "1px solid var(--color-border)", textDecoration: "none" }}>
              Learn More
            </Link>
          </motion.div>
        </motion.div>

        {/* Marquee */}
        <motion.div
          className="relative z-10 w-full"
          style={{ marginTop: 72, maxWidth: 640, maskImage: "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)", WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="flex items-center justify-center" style={{ marginBottom: 16 }}>
            <span style={{ ...mono, fontSize: 11, color: "var(--color-text-muted)" }}>Built with</span>
          </div>
          <Marquee pauseOnHover className="[--duration:25s]">
            {TOOLS.map((t) => (
              <div key={t.name} className="flex items-center" style={{ gap: 10, padding: "8px 16px", background: "var(--color-bg-card)", border: "1px solid var(--color-border-subtle)", borderRadius: 100 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t.logo} alt={t.name} width={20} height={20} style={{ borderRadius: "50%", objectFit: "cover" }} />
                <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--font-poppins)", color: "var(--color-text-primary)", whiteSpace: "nowrap" }}>{t.name}</span>
                <span style={{ fontSize: 11, color: "var(--color-text-muted)", fontFamily: "var(--font-geist-sans)", whiteSpace: "nowrap" }}>{t.role}</span>
              </div>
            ))}
          </Marquee>
        </motion.div>
      </section>

      {/* ─── PROBLEM ─── */}
      <motion.div id="problem" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} style={{ background: "var(--color-bg-card)" }}>
        <SectionBar number="01" label="THE PROBLEM" count="/ 2 PERSPECTIVES" />

        <ContentMax style={{ padding: "48px 24px" }}>
          <motion.h2 variants={fadeUp} transition={{ duration: 0.5 }} style={{ fontSize: 36, fontFamily: "var(--font-poppins)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15, margin: 0, color: "var(--color-text-primary)" }}>
            The guidance system is broken.<br />
            <span style={{ color: "var(--color-text-muted)" }}>Students pay the price.</span>
          </motion.h2>
        </ContentMax>

        <GridRow>
          <motion.div variants={slideInLeft} transition={{ duration: 0.5 }} className="flex flex-col" style={{ padding: "28px 24px", borderRight: borderLine }}>
            <span style={{ ...mono, color: "var(--color-warning)", fontSize: 11 }}>CONSULTANT SIDE</span>
            <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--color-text-secondary)", margin: "12px 0 0 0", fontFamily: "var(--font-geist-sans)", flex: 1 }}>
              Counselors average less than one hour of college guidance per student across all four years of high school. With a 372:1 student ratio and 32,000+ universities to consider, the task doesn&apos;t just feel overwhelming. It&apos;s mathematically impossible to do well manually.
            </p>
            <p style={{ fontSize: 11, lineHeight: 1.4, color: "var(--color-text-muted)", margin: "16px 0 0 0", fontFamily: "var(--font-geist-mono)" }}>
              Sources: NACAC, ASCA 2024-25
            </p>
          </motion.div>
          <motion.div variants={slideInRight} transition={{ duration: 0.5 }} className="flex flex-col" style={{ padding: "28px 24px" }}>
            <span style={{ ...mono, color: "var(--color-stage-presented)", fontSize: 11 }}>STUDENT SIDE</span>
            <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--color-text-secondary)", margin: "12px 0 0 0", fontFamily: "var(--font-geist-sans)", flex: 1 }}>
              The wrong university choice can cost up to $900K in lifetime earnings. 51% of graduates say they&apos;d choose differently. 33% transfer and lose nearly half their credits. For students, the stakes have never been higher.
            </p>
            <p style={{ fontSize: 11, lineHeight: 1.4, color: "var(--color-text-muted)", margin: "16px 0 0 0", fontFamily: "var(--font-geist-mono)" }}>
              Sources: Gallup-Strada, GAO, Brookings
            </p>
          </motion.div>
        </GridRow>

        {/* Stats row */}
        <div style={{ borderTop: borderLine }}>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", maxWidth: 960, margin: "0 auto" }}>
            {[
              { value: 50, suffix: "%", label: "Would choose differently", sub: "Gallup-Strada, 90K interviews" },
              { value: 33, suffix: "%", label: "Transfer institutions", sub: "GAO / EdWorkingPaper 2025" },
              { value: 10.7, suffix: "B", label: "Lost to attrition annually", sub: "Genio 2025", prefix: "$", decimalPlaces: 1 },
            ].map((s, i) => (
              <motion.div key={s.label} variants={fadeUp} transition={{ duration: 0.4 }} className="flex flex-col items-center text-center" style={{ padding: "28px 20px", borderRight: i < 2 ? borderLine : undefined }}>
                <div className="flex items-baseline" style={{ gap: 2 }}>
                  {s.prefix && <span style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--font-poppins)", color: "var(--color-text-primary)" }}>{s.prefix}</span>}
                  <NumberTicker value={s.value} suffix={s.suffix} decimalPlaces={s.decimalPlaces || 0} className="text-2xl" style={{ fontWeight: 700, fontFamily: "var(--font-poppins)", color: "var(--color-text-primary)" }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)", fontFamily: "var(--font-geist-sans)", marginTop: 4 }}>{s.label}</span>
                <span style={{ fontSize: 10, color: "var(--color-text-muted)", fontFamily: "var(--font-geist-mono)", marginTop: 2 }}>{s.sub}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="section-gap" />

      {/* ─── SOLUTION ─── */}
      <motion.div id="solution" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerSlow} style={{ background: "var(--color-bg-card)" }}>
        <SectionBar number="02" label="THE SOLUTION" count="/ 4 FEATURES" />

        <ContentMax style={{ padding: "48px 24px" }}>
          <motion.h2 variants={fadeUp} transition={{ duration: 0.5 }} style={{ fontSize: 36, fontFamily: "var(--font-poppins)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15, margin: 0, color: "var(--color-text-primary)" }}>
            AI that understands students<br />
            <span style={{ color: "var(--color-text-muted)" }}>and the universities that fit.</span>
          </motion.h2>
        </ContentMax>

        {/* Feature row 1: plain left, fine grid right */}
        <GridRow>
          <motion.div variants={slideInLeft} transition={{ duration: 0.5 }} style={{ padding: "28px 24px", borderRight: borderLine }}>
            <div className="flex items-center" style={{ gap: 10, marginBottom: 10 }}>
              <div style={{ color: "var(--color-stage-new)", flexShrink: 0 }}><Brain size={18} /></div>
              <h3 style={{ fontSize: 16, fontWeight: 600, fontFamily: "var(--font-poppins)", margin: 0, color: "var(--color-text-primary)" }}>Semantic Matching</h3>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--color-text-secondary)", margin: 0, fontFamily: "var(--font-geist-sans)" }}>Student profiles and university data converted into embeddings for deep semantic comparison, going beyond keyword matching.</p>
          </motion.div>
          <motion.div variants={slideInRight} transition={{ duration: 0.5 }} style={{ padding: "28px 24px" }}>
            <div className="flex items-center" style={{ gap: 10, marginBottom: 10 }}>
              <div style={{ color: "var(--color-tier-match)", flexShrink: 0 }}><BarChart3 size={18} /></div>
              <h3 style={{ fontSize: 16, fontWeight: 600, fontFamily: "var(--font-poppins)", margin: 0, color: "var(--color-text-primary)" }}>Transparent Scoring</h3>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--color-text-secondary)", margin: 0, fontFamily: "var(--font-geist-sans)" }}>Five weighted dimensions with full rationale. Consultants see exactly why each school is Reach, Match, or Safety.</p>
          </motion.div>
        </GridRow>

        {/* Feature row 2: dashed left, plain right */}
        <GridRow>
          <motion.div variants={slideInLeft} transition={{ duration: 0.5 }} style={{ padding: "28px 24px", borderRight: borderLine }}>
            <div className="flex items-center" style={{ gap: 10, marginBottom: 10 }}>
              <div style={{ color: "var(--color-stage-presented)", flexShrink: 0 }}><Mic size={18} /></div>
              <h3 style={{ fontSize: 16, fontWeight: 600, fontFamily: "var(--font-poppins)", margin: 0, color: "var(--color-text-primary)" }}>Conversation Intelligence</h3>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--color-text-secondary)", margin: 0, fontFamily: "var(--font-geist-sans)" }}>Valsea captures meeting context via live transcription and semantic analysis, so consultants never miss what students really mean.</p>
          </motion.div>
          <motion.div variants={slideInRight} transition={{ duration: 0.5 }} style={{ padding: "28px 24px" }}>
            <div className="flex items-center" style={{ gap: 10, marginBottom: 10 }}>
              <div style={{ color: "var(--color-warning)", flexShrink: 0 }}><Layers size={18} /></div>
              <h3 style={{ fontSize: 16, fontWeight: 600, fontFamily: "var(--font-poppins)", margin: 0, color: "var(--color-text-primary)" }}>Smart Tiering</h3>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--color-text-secondary)", margin: 0, fontFamily: "var(--font-geist-sans)" }}>Universities automatically classified into Reach, Match, and Safety tiers based on each student&apos;s unique profile and scores.</p>
          </motion.div>
        </GridRow>
      </motion.div>

      <div className="section-gap" />

      {/* ─── PIPELINE SCROLL CAROUSEL ─── */}
      <PipelineCarousel steps={PIPELINE} />

      <div className="section-gap" />

      {/* ─── POWERED BY ─── */}
      <motion.div id="pipeline" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} style={{ background: "var(--color-bg-card)" }}>
        <SectionBar number="04" label="POWERED BY" count={`/ ${TOOLS.length} TOOLS`} />

        <ContentMax style={{ padding: "48px 24px" }}>
          <motion.h2 variants={fadeUp} transition={{ duration: 0.5 }} style={{ fontSize: 36, fontFamily: "var(--font-poppins)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15, margin: 0, color: "var(--color-text-primary)" }}>
            Built with best-in-class tools
          </motion.h2>
        </ContentMax>

        <div style={{ borderTop: borderLine }}>
          <ContentMax>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <FallingTools tools={TOOLS} />
            </motion.div>
          </ContentMax>
        </div>
      </motion.div>

      <div className="section-gap" />

      {/* ─── WHY NOT CHATGPT ─── */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerSlow} style={{ background: "var(--color-bg-card)" }}>
        <SectionBar number="05" label="WHY NOT CHATGPT?" count="/ 4 REASONS" />

        <ContentMax style={{ padding: "48px 24px" }}>
          <motion.h2 variants={fadeUp} transition={{ duration: 0.5 }} style={{ fontSize: 36, fontFamily: "var(--font-poppins)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15, margin: 0, color: "var(--color-text-primary)" }}>
            General AI tools search differently<br />
            <span style={{ color: "var(--color-text-muted)" }}>every single time.</span>
          </motion.h2>
        </ContentMax>

        <GridRow>
          {[
            { icon: <ShieldCheck size={18} />, color: "var(--color-tier-match)", title: "Verified, official data", desc: "Crawled directly from university websites. Every acceptance rate, tuition figure, and requirement is scraped, validated, and stored.", v: slideInLeft },
            { icon: <Database size={18} />, color: "var(--color-stage-new)", title: "Full coverage, every time", desc: "250+ universities, 2,500+ programs in one verified dataset. Every query hits the same data. No undeterministic search paths.", v: slideInRight },
          ].map((item, i) => (
            <motion.div key={item.title} variants={item.v} transition={{ duration: 0.5 }} style={{ padding: "28px 24px", borderRight: i === 0 ? borderLine : undefined }}>
              <div className="flex items-center" style={{ gap: 10, marginBottom: 10 }}>
                <div style={{ color: item.color, flexShrink: 0 }}>{item.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, fontFamily: "var(--font-poppins)", margin: 0, color: "var(--color-text-primary)" }}>{item.title}</h3>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--color-text-secondary)", margin: 0, fontFamily: "var(--font-geist-sans)" }}>{item.desc}</p>
            </motion.div>
          ))}
        </GridRow>

        <GridRow>
          <motion.div variants={slideInLeft} transition={{ duration: 0.5 }} style={{ padding: "28px 24px", borderRight: borderLine }}>
            <div className="flex items-center" style={{ gap: 10, marginBottom: 10 }}>
              <div style={{ color: "var(--color-warning)", flexShrink: 0 }}><RefreshCw size={18} /></div>
              <h3 style={{ fontSize: 16, fontWeight: 600, fontFamily: "var(--font-poppins)", margin: 0, color: "var(--color-text-primary)" }}>Reproducible, auditable results</h3>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--color-text-secondary)", margin: 0, fontFamily: "var(--font-geist-sans)" }}>Same student, same scores, same recommendations. Transparent scoring consultants can defend to parents.</p>
          </motion.div>
          <motion.div variants={slideInRight} transition={{ duration: 0.5 }} style={{ padding: "28px 24px" }}>
            <div className="flex items-center" style={{ gap: 10, marginBottom: 10 }}>
              <div style={{ color: "var(--color-destructive)", flexShrink: 0 }}><AlertTriangle size={18} /></div>
              <h3 style={{ fontSize: 16, fontWeight: 600, fontFamily: "var(--font-poppins)", margin: 0, color: "var(--color-text-primary)" }}>No hallucinated numbers</h3>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--color-text-secondary)", margin: 0, fontFamily: "var(--font-geist-sans)" }}>Structured data, crawled and verified. When we say 4.5% acceptance rate, it&apos;s sourced directly, not generated.</p>
          </motion.div>
        </GridRow>
      </motion.div>

      <div className="section-gap" />

      {/* ─── IMPACT ─── */}
      <motion.div id="impact" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} style={{ background: "var(--color-bg-card)" }}>
        <SectionBar number="06" label="IMPACT" count="/ 3 METRICS" />

        <ContentMax style={{ padding: "48px 24px" }}>
          <motion.h2 variants={fadeUp} transition={{ duration: 0.5 }} style={{ fontSize: 36, fontFamily: "var(--font-poppins)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15, margin: 0, color: "var(--color-text-primary)" }}>
            Better matches. Happier students.
          </motion.h2>
        </ContentMax>

        <div style={{ borderTop: borderLine }}>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", maxWidth: 960, margin: "0 auto" }}>
            {[
              { value: 250, suffix: "+", label: "Universities", sub: "Full QS rankings & admission data", color: "var(--color-tier-match)" },
              { value: 2500, suffix: "+", label: "Programs", sub: "Per-major admission requirements", color: "var(--color-stage-new)" },
              { value: 5, suffix: "", label: "Dimensions", sub: "Transparent weighted scoring", color: "var(--color-warning)" },
            ].map((stat, i) => (
              <motion.div key={stat.label} variants={fadeUp} transition={{ duration: 0.4 }} className="flex flex-col items-center text-center" style={{ gap: 8, padding: 36, borderRight: i < 2 ? borderLine : undefined }}>
                <NumberTicker value={stat.value} suffix={stat.suffix} style={{ fontSize: 40, fontWeight: 700, fontFamily: "var(--font-poppins)", color: stat.color, lineHeight: 1 }} />
                <span style={{ fontSize: 15, fontWeight: 600, fontFamily: "var(--font-poppins)", color: "var(--color-text-primary)" }}>{stat.label}</span>
                <span style={{ fontSize: 13, color: "var(--color-text-muted)", fontFamily: "var(--font-geist-sans)" }}>{stat.sub}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="section-gap" />

      {/* ─── ROADMAP ─── */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerSlow} style={{ background: "var(--color-bg-card)" }}>
        <SectionBar number="07" label="ROADMAP" count="/ 4 INITIATIVES" />

        <ContentMax style={{ padding: "48px 24px" }}>
          <motion.h2 variants={fadeUp} transition={{ duration: 0.5 }} style={{ fontSize: 36, fontFamily: "var(--font-poppins)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15, margin: 0, color: "var(--color-text-primary)" }}>
            What&apos;s next
          </motion.h2>
        </ContentMax>

        <GridRow>
          {[
            { icon: <Crosshair size={18} />, color: "var(--color-stage-presented)", title: "Smarter Valsea Pipeline", desc: "Expand Valsea with more skills and parameters to push matching accuracy toward 95%, with deeper sentiment analysis to surface student tendencies automatically.", v: slideInLeft },
            { icon: <GraduationCap size={18} />, color: "var(--color-stage-decided)", title: "Interview & Test Prep Ecosystem", desc: "Interpret student performance in mock interviews and standardized tests. Define ideal preparation paths based on current gaps, automating support for consultancies at scale.", v: slideInRight },
          ].map((item, i) => (
            <motion.div key={item.title} variants={item.v} transition={{ duration: 0.5 }} style={{ padding: "28px 24px", borderRight: i === 0 ? borderLine : undefined }}>
              <div className="flex items-center" style={{ gap: 10, marginBottom: 10 }}>
                <div style={{ color: item.color, flexShrink: 0 }}>{item.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, fontFamily: "var(--font-poppins)", margin: 0, color: "var(--color-text-primary)" }}>{item.title}</h3>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--color-text-secondary)", margin: 0, fontFamily: "var(--font-geist-sans)" }}>{item.desc}</p>
            </motion.div>
          ))}
        </GridRow>

        <GridRow>
          {[
            { icon: <Wallet size={18} />, color: "var(--color-warning)", title: "Scholarship & Financial Aid Matching", desc: "Crawl and match students to scholarships, financial aid, and funding opportunities so we don't just find the right university, but make it affordable too.", v: slideInLeft },
            { icon: <Users size={18} />, color: "var(--color-tier-match)", title: "Parent Portal", desc: "A dedicated view for parents to review recommendations, compare options, track progress, and give feedback throughout the process.", v: slideInRight },
          ].map((item, i) => (
            <motion.div key={item.title} variants={item.v} transition={{ duration: 0.5 }} style={{ padding: "28px 24px", borderRight: i === 0 ? borderLine : undefined }}>
              <div className="flex items-center" style={{ gap: 10, marginBottom: 10 }}>
                <div style={{ color: item.color, flexShrink: 0 }}>{item.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, fontFamily: "var(--font-poppins)", margin: 0, color: "var(--color-text-primary)" }}>{item.title}</h3>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--color-text-secondary)", margin: 0, fontFamily: "var(--font-geist-sans)" }}>{item.desc}</p>
            </motion.div>
          ))}
        </GridRow>
      </motion.div>

      <div className="section-gap" />

      {/* ─── CTA ─── */}
      <motion.div
        className="flex flex-col items-center justify-center text-center"
        style={{ padding: "120px 24px", borderTop: borderLine, background: "var(--color-bg-card)" }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <div className="flex flex-col items-center" style={{ gap: 20, maxWidth: 480 }}>
          <motion.h2 variants={fadeUp} transition={{ duration: 0.5 }} style={{ fontSize: 36, fontFamily: "var(--font-poppins)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15, margin: 0, color: "var(--color-text-primary)" }}>
            Ready to see it in action?
          </motion.h2>
          <motion.p variants={fadeUp} transition={{ duration: 0.5 }} style={{ fontSize: 15, lineHeight: 1.65, color: "var(--color-text-secondary)", margin: 0, fontFamily: "var(--font-geist-sans)" }}>
            We&apos;re looking for education consultancies ready to give their students better outcomes, powered by AI that&apos;s transparent, fast, and genuinely useful.
          </motion.p>
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
            <Link href="/login" className="inline-flex items-center gap-2" style={{ fontSize: 15, fontWeight: 600, fontFamily: "var(--font-geist-sans)", background: "var(--color-accent)", color: "var(--color-text-inverse)", padding: "14px 36px", borderRadius: 8, textDecoration: "none", marginTop: 8 }}>
              Try the Demo
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 7h12M8 2l5 5-5 5" /></svg>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="flex items-center justify-center py-8" style={{ borderTop: borderLine, background: "var(--color-bg-card)" }}>
        <span style={{ ...mono, fontSize: 13, color: "var(--color-text-muted)" }}>Edify | Built for LotusHack 2026</span>
      </footer>
    </div>
  );
}
