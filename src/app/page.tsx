"use client";

import Link from "next/link";
import { PipelineCarousel } from "@/components/landing/pipeline-carousel";
import { FallingTools } from "@/components/landing/falling-tools";
import { GradualBlur } from "@/components/ui/gradual-blur";
import { ShapeGrid } from "@/components/ui/shape-grid";

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

export default function LandingPage() {
  return (
    <div style={{ background: "var(--color-bg-base)" }}>
      {/* Fixed bottom blur */}
      <GradualBlur target="page" position="bottom" height="7rem" strength={2} divCount={5} curve="bezier" exponential opacity={1} />

      {/* Nav */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8"
        style={{ height: 64, background: "rgba(248,247,244,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--color-border-subtle)" }}
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
        {/* Animated grid background */}
        <div className="absolute inset-0 z-0">
          <ShapeGrid speed={0.3} squareSize={48} direction="diagonal" borderColor="rgba(226,224,217,0.5)" hoverFillColor="rgba(26,26,26,0.08)" hoverTrailAmount={5} />
        </div>

        <div className="relative z-10 flex flex-col items-center" style={{ gap: 24, maxWidth: 640 }}>
          <div className="inline-flex items-center gap-2" style={{ fontSize: 12, fontFamily: "var(--font-geist-mono)", fontWeight: 500, color: "var(--color-success)", background: "var(--color-success-dim)", padding: "6px 16px", borderRadius: 100, border: "1px solid rgba(16,185,129,0.15)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-success)" }} />
            AI-Powered University Matching
          </div>

          <h1 style={{ fontSize: 48, fontWeight: 700, fontFamily: "var(--font-poppins)", letterSpacing: "-0.03em", lineHeight: 1.1, margin: 0, color: "var(--color-text-primary)" }}>
            Smarter student<br />placement starts here
          </h1>

          <p style={{ fontSize: 17, fontFamily: "var(--font-geist-sans)", color: "var(--color-text-secondary)", lineHeight: 1.65, maxWidth: 500, margin: 0 }}>
            Edify helps education consultants discover the best university opportunities, powered by semantic analysis, transparent scoring, and conversation intelligence.
          </p>

          <div className="flex items-center" style={{ gap: 12, paddingTop: 8 }}>
            <Link href="/login" className="inline-flex items-center gap-2" style={{ fontSize: 15, fontWeight: 600, fontFamily: "var(--font-geist-sans)", background: "var(--color-accent)", color: "var(--color-text-inverse)", padding: "14px 32px", borderRadius: 8, textDecoration: "none" }}>
              Get Started
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 7h12M8 2l5 5-5 5" /></svg>
            </Link>
            <Link href="#problem" className="inline-flex items-center" style={{ fontSize: 15, fontWeight: 600, fontFamily: "var(--font-geist-sans)", color: "var(--color-text-primary)", padding: "14px 32px", borderRadius: 8, border: "1px solid var(--color-border)", textDecoration: "none" }}>
              Learn More
            </Link>
          </div>
        </div>

        {/* Tool logos strip */}
        <div className="relative z-10 flex items-center justify-center" style={{ gap: 28, marginTop: 72 }}>
          <span style={{ fontSize: 11, fontFamily: "var(--font-geist-mono)", color: "var(--color-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Built with</span>
          {TOOLS.map((t) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={t.name} src={t.logo} alt={t.name} width={22} height={22} style={{ borderRadius: "50%", objectFit: "cover" }} title={t.name} />
          ))}
        </div>
      </section>

      {/* ─── PROBLEM ─── */}
      <section id="problem" className="relative" style={{ padding: "100px 24px", background: "var(--color-bg-wash)", borderTop: "1px solid var(--color-border-subtle)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <span style={{ fontSize: 12, fontFamily: "var(--font-geist-mono)", color: "var(--color-text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>THE PROBLEM</span>
          <h2 style={{ fontSize: 36, fontFamily: "var(--font-poppins)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15, margin: "16px 0 40px 0", color: "var(--color-text-primary)" }}>
            Students miss opportunities.<br />
            <span style={{ color: "var(--color-text-muted)" }}>Consultants miss context.</span>
          </h2>

          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ padding: 28, background: "var(--color-bg-card)", border: "1px solid var(--color-border-subtle)", borderRadius: 12 }}>
              <span style={{ fontSize: 12, fontFamily: "var(--font-geist-mono)", color: "var(--color-warning)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>CONSULTANT SIDE</span>
              <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--color-text-secondary)", margin: "12px 0 0 0", fontFamily: "var(--font-geist-sans)" }}>
                Managing 10-50 students manually across spreadsheets. Juggling evolving test scores, budgets, and preferences against 250+ universities with 2,500+ programs. The process is slow, inconsistent, and error-prone.
              </p>
            </div>
            <div style={{ padding: 28, background: "var(--color-bg-card)", border: "1px solid var(--color-border-subtle)", borderRadius: 12 }}>
              <span style={{ fontSize: 12, fontFamily: "var(--font-geist-mono)", color: "var(--color-stage-presented)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>STUDENT SIDE</span>
              <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--color-text-secondary)", margin: "12px 0 0 0", fontFamily: "var(--font-geist-sans)" }}>
                Miscommunication leads to lower satisfaction. Accents, nuance, and context get lost in meetings. Key preferences are missed or forgotten, leading to recommendations that don&apos;t truly fit.
              </p>
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex items-center justify-between" style={{ marginTop: 16, padding: "24px 28px", background: "var(--color-bg-card)", border: "1px solid var(--color-border-subtle)", borderRadius: 12 }}>
            {[
              { n: "10–50", label: "Students per consultant" },
              { n: "250+", label: "Universities to consider" },
              { n: "2,500+", label: "Programs to match" },
            ].map((s, i) => (
              <div key={s.label} className="flex items-center" style={{ gap: i < 2 ? 0 : undefined }}>
                <div className="flex flex-col">
                  <span style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--font-poppins)", color: "var(--color-text-primary)" }}>{s.n}</span>
                  <span style={{ fontSize: 13, color: "var(--color-text-muted)", fontFamily: "var(--font-geist-sans)" }}>{s.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SOLUTION ─── */}
      <section id="solution" style={{ padding: "100px 24px", borderTop: "1px solid var(--color-border-subtle)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <span style={{ fontSize: 12, fontFamily: "var(--font-geist-mono)", color: "var(--color-text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>THE SOLUTION</span>
          <h2 style={{ fontSize: 36, fontFamily: "var(--font-poppins)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15, margin: "16px 0 40px 0", color: "var(--color-text-primary)" }}>
            AI that understands students<br />
            <span style={{ color: "var(--color-text-muted)" }}>and the universities that fit.</span>
          </h2>

          <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { dot: "var(--color-stage-new)", title: "Semantic Matching", desc: "Student profiles and university data converted into embeddings for deep semantic comparison, going beyond keyword matching." },
              { dot: "var(--color-tier-match)", title: "Transparent Scoring", desc: "Five weighted dimensions with full rationale. Consultants see exactly why each school is Reach, Match, or Safety." },
              { dot: "var(--color-stage-presented)", title: "Conversation Intelligence", desc: "Valsea captures meeting context via live transcription and semantic analysis, so consultants never miss what students really mean." },
            ].map((f) => (
              <div key={f.title} style={{ padding: 24, background: "var(--color-bg-card)", border: "1px solid var(--color-border-subtle)", borderRadius: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: f.dot, marginBottom: 16 }} />
                <h3 style={{ fontSize: 16, fontWeight: 600, fontFamily: "var(--font-poppins)", margin: "0 0 10px 0", color: "var(--color-text-primary)" }}>{f.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--color-text-secondary)", margin: 0, fontFamily: "var(--font-geist-sans)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PIPELINE ─── */}
      <section id="pipeline" style={{ padding: "100px 24px 24px", background: "var(--color-bg-wash)", borderTop: "1px solid var(--color-border-subtle)" }}>

        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <span style={{ fontSize: 12, fontFamily: "var(--font-geist-mono)", color: "var(--color-text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>HOW IT WORKS</span>
          <h2 style={{ fontSize: 36, fontFamily: "var(--font-poppins)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15, margin: "16px 0 40px 0", color: "var(--color-text-primary)" }}>
            Built with best-in-class tools
          </h2>

          {/* Tools - falling physics */}
          <div style={{ marginBottom: 40 }}>
            <FallingTools tools={TOOLS} />
          </div>

          {/* Pipeline - scroll-driven carousel rendered outside this container */}
        </div>
      </section>

      {/* ─── PIPELINE SCROLL CAROUSEL ─── */}
      <PipelineCarousel steps={PIPELINE} />

      {/* ─── WHY NOT CHATGPT ─── */}
      <section style={{ padding: "100px 24px", background: "var(--color-bg-wash)", borderTop: "1px solid var(--color-border-subtle)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <span style={{ fontSize: 12, fontFamily: "var(--font-geist-mono)", color: "var(--color-text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>WHY NOT JUST CHATGPT?</span>
          <h2 style={{ fontSize: 36, fontFamily: "var(--font-poppins)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15, margin: "16px 0 40px 0", color: "var(--color-text-primary)" }}>
            General AI tools search differently<br />
            <span style={{ color: "var(--color-text-muted)" }}>every single time.</span>
          </h2>

          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { dot: "var(--color-tier-match)", title: "Verified, official data", desc: "Crawled directly from university websites. Every acceptance rate, tuition figure, and requirement is scraped, validated, and stored." },
              { dot: "var(--color-stage-new)", title: "Full coverage, every time", desc: "250+ universities, 2,500+ programs in one verified dataset. Every query hits the same data. No undeterministic search paths." },
              { dot: "var(--color-warning)", title: "Reproducible, auditable results", desc: "Same student, same scores, same recommendations. Transparent scoring consultants can defend to parents." },
              { dot: "var(--color-destructive)", title: "No hallucinated numbers", desc: "Structured data, crawled and verified. When we say 4.5% acceptance rate, it's sourced directly, not generated." },
            ].map((item) => (
              <div key={item.title} style={{ padding: 24, background: "var(--color-bg-card)", border: "1px solid var(--color-border-subtle)", borderRadius: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.dot, marginBottom: 16 }} />
                <h3 style={{ fontSize: 16, fontWeight: 600, fontFamily: "var(--font-poppins)", margin: "0 0 10px 0", color: "var(--color-text-primary)" }}>{item.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--color-text-secondary)", margin: 0, fontFamily: "var(--font-geist-sans)" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── IMPACT ─── */}
      <section id="impact" style={{ padding: "100px 24px", borderTop: "1px solid var(--color-border-subtle)" }}>

        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <span style={{ fontSize: 12, fontFamily: "var(--font-geist-mono)", color: "var(--color-text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>IMPACT</span>
          <h2 style={{ fontSize: 36, fontFamily: "var(--font-poppins)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15, margin: "16px 0 40px 0", color: "var(--color-text-primary)" }}>
            Better matches. Happier students.
          </h2>

          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {[
              { value: "250+", label: "Universities", sub: "Full QS rankings & admission data", dot: "var(--color-tier-match)" },
              { value: "2,500+", label: "Programs", sub: "Per-major admission requirements", dot: "var(--color-stage-new)" },
              { value: "5", label: "Dimensions", sub: "Transparent weighted scoring", dot: "var(--color-warning)" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center" style={{ gap: 8, padding: 36, background: "var(--color-bg-card)", border: "1px solid var(--color-border-subtle)", borderRadius: 12 }}>
                <span style={{ fontSize: 40, fontWeight: 700, fontFamily: "var(--font-poppins)", color: stat.dot, lineHeight: 1 }}>{stat.value}</span>
                <span style={{ fontSize: 15, fontWeight: 600, fontFamily: "var(--font-poppins)", color: "var(--color-text-primary)" }}>{stat.label}</span>
                <span style={{ fontSize: 13, color: "var(--color-text-muted)", fontFamily: "var(--font-geist-sans)" }}>{stat.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ROADMAP ─── */}
      <section style={{ padding: "100px 24px", background: "var(--color-bg-wash)", borderTop: "1px solid var(--color-border-subtle)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <span style={{ fontSize: 12, fontFamily: "var(--font-geist-mono)", color: "var(--color-text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>ROADMAP</span>
          <h2 style={{ fontSize: 36, fontFamily: "var(--font-poppins)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15, margin: "16px 0 40px 0", color: "var(--color-text-primary)" }}>
            What&apos;s next
          </h2>

          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { dot: "var(--color-stage-presented)", title: "Deep Valsea Integration", desc: "Conversation data enriches student embeddings in real-time, improving quality with every meeting." },
              { dot: "var(--color-stage-decided)", title: "Meeting Intelligence", desc: "Auto-extract preferences from transcripts. Handle accents, capture nuance, ensure nothing is missed." },
              { dot: "var(--color-warning)", title: "Continuous Data Refresh", desc: "Automated pipelines re-scrape deadlines, tuition changes, and new programs." },
              { dot: "var(--color-tier-match)", title: "Parent Portal", desc: "Dedicated view for parents to review recommendations, compare options, and give feedback." },
            ].map((item) => (
              <div key={item.title} style={{ padding: 24, background: "var(--color-bg-card)", border: "1px solid var(--color-border-subtle)", borderRadius: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.dot, marginBottom: 16 }} />
                <h3 style={{ fontSize: 16, fontWeight: 600, fontFamily: "var(--font-poppins)", margin: "0 0 10px 0", color: "var(--color-text-primary)" }}>{item.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--color-text-secondary)", margin: 0, fontFamily: "var(--font-geist-sans)" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="flex flex-col items-center justify-center text-center" style={{ padding: "120px 24px", borderTop: "1px solid var(--color-border-subtle)" }}>
        <div className="flex flex-col items-center" style={{ gap: 20, maxWidth: 480 }}>
          <h2 style={{ fontSize: 36, fontFamily: "var(--font-poppins)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15, margin: 0, color: "var(--color-text-primary)" }}>
            Ready to see it in action?
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--color-text-secondary)", margin: 0, fontFamily: "var(--font-geist-sans)" }}>
            We&apos;re looking for education consultancies ready to give their students better outcomes, powered by AI that&apos;s transparent, fast, and genuinely useful.
          </p>
          <Link href="/login" className="inline-flex items-center gap-2" style={{ fontSize: 15, fontWeight: 600, fontFamily: "var(--font-geist-sans)", background: "var(--color-accent)", color: "var(--color-text-inverse)", padding: "14px 36px", borderRadius: 8, textDecoration: "none", marginTop: 8 }}>
            Try the Demo
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 7h12M8 2l5 5-5 5" /></svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex items-center justify-center py-8" style={{ borderTop: "1px solid var(--color-border-subtle)" }}>
        <span style={{ fontSize: 13, fontFamily: "var(--font-geist-mono)", color: "var(--color-text-muted)" }}>Edify | Built for LotusHack 2026</span>
      </footer>
    </div>
  );
}
