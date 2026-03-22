"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import { createStudent } from "@/app/(app)/dashboard/actions";

interface NewStudentDialogProps {
  open: boolean;
  onClose: () => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-muted)", margin: "0 0 8px" }}>
      {children}
    </p>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col" style={{ gap: 4 }}>
      <label style={{ fontSize: 12, fontFamily: "var(--font-sans)", fontWeight: 500, color: "var(--color-text-secondary)" }}>
        {label}{required && <span style={{ color: "var(--color-destructive)", marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  height: 34, padding: "0 10px", fontSize: 13,
  fontFamily: "var(--font-mono)", color: "var(--color-text-primary)",
  background: "var(--color-bg-surface)", border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-xs)", outline: "none", width: "100%",
};

const selectStyle: React.CSSProperties = { ...inputStyle, fontFamily: "var(--font-sans)", cursor: "pointer" };

function Input({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      style={inputStyle}
      onFocus={(e) => (e.target.style.borderColor = "var(--color-accent)")}
      onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
    />
  );
}

function TagInput({ values, onChange, suggestions }: { values: string[]; onChange: (v: string[]) => void; suggestions?: string[] }) {
  const [input, setInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const add = (v?: string) => {
    const val = (v ?? input).trim();
    if (val && !values.includes(val)) onChange([...values, val]);
    setInput("");
    setShowDropdown(false);
  };
  const filtered = (suggestions ?? []).filter(
    (s) => !values.includes(s) && (!input || s.toLowerCase().includes(input.toLowerCase())),
  );
  const quickPicks = (suggestions ?? []).filter((s) => !values.includes(s));
  return (
    <div>
      {/* Quick-pick chips */}
      {quickPicks.length > 0 && (
        <div className="flex flex-wrap" style={{ gap: 4, marginBottom: 6 }}>
          {quickPicks.map((s) => (
            <button key={s} type="button" onClick={() => add(s)}
              className="inline-flex items-center transition-colors"
              style={{
                fontSize: 11, fontFamily: "var(--font-sans)", fontWeight: 500,
                padding: "2px 8px", borderRadius: "var(--radius-xs)",
                background: "var(--color-hover-bg)", color: "var(--color-text-muted)",
                border: "1px dashed var(--color-border)", cursor: "pointer",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--color-accent)"; e.currentTarget.style.color = "var(--color-text-primary)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.color = "var(--color-text-muted)"; }}
            >+ {s}</button>
          ))}
        </div>
      )}
      {/* Selected tags */}
      <div className="flex flex-wrap" style={{ gap: 4, marginBottom: values.length ? 6 : 0 }}>
        {values.map((v) => (
          <span key={v} className="inline-flex items-center gap-1"
            style={{ fontSize: 12, padding: "2px 8px", background: "var(--color-hover-bg-strong)", borderRadius: "var(--radius-xs)", color: "var(--color-text-secondary)" }}
          >
            {v}
            <button type="button" onClick={() => onChange(values.filter((x) => x !== v))}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: 0, fontSize: 12, lineHeight: 1 }}
            >×</button>
          </span>
        ))}
      </div>
      {/* Input with autocomplete dropdown */}
      <div style={{ position: "relative" }}>
        <input type="text" value={input} onChange={(e) => { setInput(e.target.value); setShowDropdown(true); }}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
          placeholder="Type and press Enter"
          style={inputStyle}
          onFocus={(e) => { e.target.style.borderColor = "var(--color-accent)"; setShowDropdown(true); }}
          onBlur={(e) => { e.target.style.borderColor = "var(--color-border)"; setTimeout(() => setShowDropdown(false), 150); add(); }}
        />
        {showDropdown && input && filtered.length > 0 && (
          <div style={{
            position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
            background: "var(--color-bg-card)", border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xs)", marginTop: 2, maxHeight: 120, overflowY: "auto",
          }}>
            {filtered.map((s) => (
              <button key={s} type="button"
                onMouseDown={(e) => { e.preventDefault(); add(s); }}
                className="block w-full text-left transition-colors"
                style={{ fontSize: 13, fontFamily: "var(--font-sans)", padding: "6px 10px", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-hover-bg)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
              >{s}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function NewStudentDialog({ open, onClose }: NewStudentDialogProps) {
  const router = useRouter();
  const [mode, setMode] = useState<null | "form">(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 — Basic info
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [dob, setDob] = useState("");

  // Step 2 — Snapshot (skippable)
  const [sat, setSat] = useState("");
  const [act, setAct] = useState("");
  const [gpa, setGpa] = useState("");
  const [ielts, setIelts] = useState("");
  const [budget, setBudget] = useState("");
  const [financialAid, setFinancialAid] = useState("");
  const [minAcceptance, setMinAcceptance] = useState("");
  const [majors, setMajors] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [setting, setSetting] = useState("");
  const [size, setSize] = useState("");

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const save = (withSnapshot: boolean) => {
    if (!name.trim()) { setError("Name is required"); return; }
    setError(null);
    startTransition(async () => {
      try {
        const hasSnapshot = withSnapshot && (sat || act || gpa || ielts || budget || majors.length || countries.length);
        const id = await createStudent({
          name: name.trim(),
          grade: grade || null,
          dob: dob || null,
          snapshot: hasSnapshot ? {
            sat_score: sat ? Number(sat) : null,
            act_score: act ? Number(act) : null,
            gpa: gpa ? Number(gpa) : null,
            ielts_score: ielts ? Number(ielts) : null,
            budget_usd: budget ? Number(budget) : null,
            needs_financial_aid: financialAid === "yes" ? true : financialAid === "no" ? false : null,
            target_acceptance_rate_min: minAcceptance ? Number(minAcceptance) : null,
            target_majors: majors.length ? majors : null,
            preferred_countries: countries.length ? countries : null,
            preferred_setting: setting || null,
            preferred_size: size || null,
          } : null,
        });
        onClose();
        router.push(`/students/${id}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    });
  };

  return (
    <Dialog open={open} onClose={onClose} title="New Student">
      <div className="flex flex-col" style={{ gap: "var(--space-md)" }}>

        {mode === null ? (
          <>
            <p style={{ fontSize: 12, color: "var(--color-text-muted)", fontFamily: "var(--font-sans)", margin: 0 }}>
              How would you like to add a student?
            </p>
            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "var(--space-sm)" }}>
              <button
                onClick={() => setMode("form")}
                className="flex flex-col items-center justify-center transition-colors"
                style={{
                  padding: "var(--space-md)",
                  background: "var(--color-bg-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  gap: 8,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--color-accent)"; e.currentTarget.style.background = "var(--color-hover-bg)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.background = "var(--color-bg-surface)"; }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <span style={{ fontSize: 13, fontFamily: "var(--font-sans)", fontWeight: 600, color: "var(--color-text-primary)" }}>
                  Form
                </span>
                <span style={{ fontSize: 11, fontFamily: "var(--font-sans)", color: "var(--color-text-muted)" }}>
                  Manually enter student info
                </span>
              </button>
              <div
                className="flex flex-col items-center justify-center"
                style={{
                  padding: "var(--space-md)",
                  background: "var(--color-bg-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                  opacity: 0.45,
                  cursor: "not-allowed",
                  gap: 8,
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
                <span style={{ fontSize: 13, fontFamily: "var(--font-sans)", fontWeight: 600, color: "var(--color-text-primary)" }}>
                  Meeting Intelligence
                </span>
                <span style={{ fontSize: 11, fontFamily: "var(--font-sans)", color: "var(--color-text-muted)" }}>
                  Coming soon
                </span>
              </div>
            </div>
            <div className="flex justify-end" style={{ paddingTop: 4 }}>
              <button
                onClick={onClose}
                style={{
                  height: 36, padding: "0 16px", fontSize: 14, fontFamily: "var(--font-sans)", fontWeight: 500,
                  color: "var(--color-text-secondary)", background: "transparent",
                  border: "1px solid var(--color-border)", borderRadius: "var(--radius-xs)", cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Step bar */}
            <div className="flex items-center" style={{ gap: 6 }}>
              {[1, 2, 3].map((s) => (
                <div key={s} style={{
                  height: 3, flex: 1, borderRadius: 2,
                  background: s <= step ? "var(--color-accent)" : "var(--color-border)",
                  transition: "background 0.2s",
                }} />
              ))}
            </div>
            <p style={{ fontSize: 12, color: "var(--color-text-muted)", margin: 0 }}>
              {step === 1 ? "Step 1 of 3 — Student Info" : step === 2 ? "Step 2 of 3 — Test Scores (optional)" : "Step 3 of 3 — Application (optional)"}
            </p>

            {step === 1 ? (
              <div>
                <SectionLabel>Basic Info</SectionLabel>
                <div className="flex flex-col" style={{ gap: "var(--space-sm)" }}>
                  <Field label="Full Name" required><Input value={name} onChange={setName} placeholder="e.g. Nguyễn Thị Lan" /></Field>
                  <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "var(--space-sm)" }}>
                    <Field label="Grade"><Input value={grade} onChange={setGrade} placeholder="e.g. 11" /></Field>
                    <Field label="Date of Birth"><Input value={dob} onChange={setDob} type="date" /></Field>
                  </div>
                </div>
              </div>
            ) : step === 2 ? (
              <div>
                <SectionLabel>Test Scores</SectionLabel>
                <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "var(--space-sm)" }}>
                  <Field label="SAT"><Input value={sat} onChange={setSat} placeholder="400–1600 (e.g. 1450)" type="number" /></Field>
                  <Field label="ACT"><Input value={act} onChange={setAct} placeholder="1–36 (e.g. 33)" type="number" /></Field>
                  <Field label="GPA"><Input value={gpa} onChange={setGpa} placeholder="0.0–4.0 (e.g. 3.8)" type="number" /></Field>
                  <Field label="IELTS"><Input value={ielts} onChange={setIelts} placeholder="0.0–9.0 (e.g. 8.0)" type="number" /></Field>
                </div>
              </div>
            ) : (
              <div className="flex flex-col" style={{ gap: "var(--space-md)" }}>
                <div>
                  <SectionLabel>Application</SectionLabel>
                  <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "var(--space-sm)" }}>
                    <Field label="Budget (USD/year)"><Input value={budget} onChange={setBudget} placeholder="e.g. 50000" type="number" /></Field>
                    <Field label="Min Acceptance Rate (%)"><Input value={minAcceptance} onChange={setMinAcceptance} placeholder="e.g. 20" type="number" /></Field>
                    <Field label="Financial Aid">
                      <select value={financialAid} onChange={(e) => setFinancialAid(e.target.value)} style={selectStyle}>
                        <option value="">—</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </Field>
                  </div>
                </div>
                <div>
                  <SectionLabel>Preferences</SectionLabel>
                  <div className="flex flex-col" style={{ gap: "var(--space-sm)" }}>
                    <Field label="Target Majors"><TagInput values={majors} onChange={setMajors} suggestions={["Computer Science", "Economics", "Mechanical Engineering", "Psychology"]} /></Field>
                    <Field label="Preferred Countries"><TagInput values={countries} onChange={setCountries} suggestions={["United States of America", "United Kingdom", "Australia", "Canada"]} /></Field>
                    <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "var(--space-sm)" }}>
                      <Field label="Setting">
                        <select value={setting} onChange={(e) => setSetting(e.target.value)} style={selectStyle}>
                          <option value="">—</option>
                          <option value="Urban">Urban</option>
                          <option value="Suburban">Suburban</option>
                          <option value="Rural">Rural</option>
                        </select>
                      </Field>
                      <Field label="Size">
                        <select value={size} onChange={(e) => setSize(e.target.value)} style={selectStyle}>
                          <option value="">—</option>
                          <option value="Small">Small (&lt;5k)</option>
                          <option value="Medium">Medium (5–15k)</option>
                          <option value="Large">Large (&gt;15k)</option>
                        </select>
                      </Field>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && <p style={{ fontSize: 13, color: "var(--color-destructive)", margin: 0 }}>{error}</p>}

            <div className="flex justify-between items-center" style={{ paddingTop: 4 }}>
              <button
                onClick={step === 1 ? () => setMode(null) : () => setStep((step - 1) as 1 | 2)}
                style={{
                  height: 36, padding: "0 16px", fontSize: 14, fontWeight: 500,
                  color: "var(--color-text-secondary)", background: "transparent",
                  border: "1px solid var(--color-border)", borderRadius: "var(--radius-xs)", cursor: "pointer",
                }}
              >
                Back
              </button>

              <div className="flex items-center" style={{ gap: "var(--space-sm)" }}>
                {step >= 2 && (
                  <button
                    onClick={() => save(false)}
                    disabled={isPending}
                    style={{
                      height: 36, padding: "0 16px", fontSize: 14, fontWeight: 500,
                      color: "var(--color-text-secondary)", background: "transparent",
                      border: "1px solid var(--color-border)", borderRadius: "var(--radius-xs)", cursor: "pointer",
                    }}
                  >
                    Skip
                  </button>
                )}
                <button
                  onClick={
                    step === 1
                      ? () => { if (!name.trim()) { setError("Name is required"); return; } setError(null); setStep(2); }
                      : step === 2
                        ? () => { setError(null); setStep(3); }
                        : () => save(true)
                  }
                  disabled={isPending}
                  style={{
                    height: 36, padding: "0 16px", fontSize: 14, fontWeight: 600,
                    color: "#ffffff", background: "var(--color-accent)",
                    border: "none", borderRadius: "var(--radius-xs)", cursor: isPending ? "not-allowed" : "pointer",
                    opacity: isPending ? 0.6 : 1,
                  }}
                >
                  {step < 3 ? "Next" : isPending ? "Creating…" : "Create Student"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}
