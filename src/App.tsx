import { useState, useEffect, useRef } from "react";
import LessonScreen from "./LessonScreen";

type Screen =
  | "landing"
  | "onboarding"
  | "generating"
  | "dashboard"
  | "lesson"
  | "success"
  | "paywall"
  | "pricing";

interface ChildProfile {
  name: string;
  age: string;
  challenge: string;
  goal: string;
  readingLevel: string;
}

interface Lesson {
  day: string;
  title: string;
  passage: string;
  question: string;
  answers: string[];
  correct: string;
  tip: string;
}

interface LessonPlan {
  weekTheme: string;
  lessons: Lesson[];
}

const STRIPE_URL = "https://buy.stripe.com/4gM9AUd2bdvpd0q17y4c800";

function getParam(key: string) {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(key);
}

const colors = {
  cream: "#FDF8F0",
  softYellow: "#FFF8E1",
  purple: "#6D28D9",
  purpleLight: "#EDE9FE",
  purpleDark: "#4C1D95",
  green: "#059669",
  greenLight: "#D1FAE5",
  orange: "#EA580C",
  gray100: "#F3F4F6",
  gray300: "#D1D5DB",
  gray500: "#6B7280",
  gray700: "#374151",
  gray900: "#111827",
  white: "#FFFFFF",
  red: "#DC2626",
  redLight: "#FEE2E2",
};

const font = {
  display: "'Lexend', 'Arial Rounded MT Bold', Arial, sans-serif",
  body: "'Atkinson Hyperlegible', 'Verdana', sans-serif",
};

const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;600;700;800&family=Atkinson+Hyperlegible:wght@400;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${colors.cream}; font-family: ${font.body}; color: ${colors.gray900}; font-size: 18px; line-height: 1.75; letter-spacing: 0.01em; -webkit-font-smoothing: antialiased; }
  h1, h2, h3 { font-family: ${font.display}; line-height: 1.2; letter-spacing: -0.01em; }
  button { cursor: pointer; font-family: ${font.body}; }
  @media (max-width: 640px) { body { font-size: 16px; } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  .fade-in { animation: fadeIn 0.4s ease both; }
  .pulse { animation: pulse 1.5s ease infinite; }
`;

function NavBar({ onBack, label, onPricing }: { onBack?: () => void; label?: string; onPricing?: () => void }) {
  return (
    <nav style={{ background: colors.white, borderBottom: `2px solid ${colors.purpleLight}`, padding: "14px 24px", display: "flex", alignItems: "center", gap: "12px", position: "sticky", top: 0, zIndex: 10 }}>
      {onBack && <button onClick={onBack} aria-label="Go back" style={{ background: colors.purpleLight, border: "none", borderRadius: "8px", padding: "6px 12px", color: colors.purple, fontWeight: 700, fontSize: "15px" }}>← Back</button>}
      <span style={{ fontFamily: font.display, fontWeight: 800, fontSize: "20px", color: colors.purple, letterSpacing: "-0.02em" }}>
        Neuro<span style={{ color: colors.orange }}>Read</span>
      </span>
      {label && <span style={{ color: colors.gray500, fontSize: "14px" }}>— {label}</span>}
      {onPricing && (
        <button onClick={onPricing} style={{ marginLeft: "auto", background: "none", border: "none", color: colors.purple, fontWeight: 700, fontSize: "15px", cursor: "pointer", fontFamily: font.body }}>
          Pricing
        </button>
      )}
    </nav>
  );
}

function PrimaryBtn({ children, onClick, href, disabled, style: extra }: { children: React.ReactNode; onClick?: () => void; href?: string; disabled?: boolean; style?: React.CSSProperties }) {
  const base: React.CSSProperties = { display: "inline-block", padding: "14px 28px", background: disabled ? colors.gray300 : colors.purple, color: colors.white, border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "18px", textDecoration: "none", boxShadow: disabled ? "none" : "0 4px 14px rgba(109,40,217,0.3)", cursor: disabled ? "not-allowed" : "pointer", ...extra };
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" style={base}>{children}</a>;
  return <button onClick={onClick} disabled={disabled} style={base}>{children}</button>;
}

function Card({ children, style: extra }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: colors.white, borderRadius: "16px", padding: "28px", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", ...extra }}>{children}</div>;
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div style={{ margin: "12px 0" }}>
      <div style={{ height: "12px", background: colors.gray100, borderRadius: "99px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${colors.purple}, ${colors.orange})`, borderRadius: "99px", transition: "width 0.5s ease" }} />
      </div>
      <p style={{ fontSize: "13px", color: colors.gray500, marginTop: "4px" }}>{current} of {total} lessons complete</p>
    </div>
  );
}

function LandingScreen({ onStart, onPay, onPricing }: { onStart: () => void; onPay: () => void; onPricing: () => void }) {
  const features = [
    { icon: "🧠", title: "AI Lesson Plans", desc: "Every plan is built for your child's exact reading level and challenges." },
    { icon: "🔊", title: "Read Aloud Support", desc: "Any word or passage can be spoken aloud at the tap of a button." },
    { icon: "🎯", title: "Step-by-Step Practice", desc: "Short daily lessons keep it manageable — never overwhelming." },
    { icon: "⭐", title: "Celebrates Every Win", desc: "Warm encouragement at each milestone builds lasting confidence." },
    { icon: "🌈", title: "Dyslexia-Friendly Design", desc: "Soft colors, spaced text, and easy-to-read fonts reduce eye strain." },
    { icon: "📈", title: "Progress Tracking", desc: "Parents and children can see exactly how far they've come." },
  ];
  return (
    <div>
      <NavBar onPricing={onPricing} />
      <div className="fade-in" style={{ background: `linear-gradient(135deg, ${colors.purpleDark} 0%, ${colors.purple} 60%, #7C3AED 100%)`, color: colors.white, padding: "72px 24px 80px", textAlign: "center" }}>
        <p style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.8, marginBottom: "16px" }}>AI-Powered Reading Support</p>
        <h1 style={{ fontFamily: font.display, fontSize: "clamp(36px, 6vw, 60px)", fontWeight: 800, maxWidth: "680px", margin: "0 auto 20px" }}>
          Learning to read should feel like <span style={{ color: "#FCD34D" }}>winning</span>, not struggling.
        </h1>
        <p style={{ fontSize: "20px", opacity: 0.9, maxWidth: "520px", margin: "0 auto 40px", lineHeight: 1.6 }}>
          NeuroRead builds a personalized reading plan for your child — built around how their brain actually works.
        </p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={onStart} style={{ padding: "16px 32px", background: "#FCD34D", color: colors.purpleDark, border: "none", borderRadius: "12px", fontWeight: 800, fontSize: "18px", cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>Try a Free Lesson →</button>
          <a href={STRIPE_URL} target="_blank" rel="noopener noreferrer" style={{ padding: "16px 32px", background: "rgba(255,255,255,0.15)", color: colors.white, border: "2px solid rgba(255,255,255,0.4)", borderRadius: "12px", fontWeight: 700, fontSize: "18px", textDecoration: "none" }}>Get Early Access — $29</a>
        </div>
        <p style={{ marginTop: "20px", fontSize: "14px", opacity: 0.7 }}>No commitment. Cancel anytime. Price locked for early members.</p>
      </div>

      <div style={{ padding: "64px 24px", maxWidth: "960px", margin: "0 auto" }}>
        <h2 style={{ fontFamily: font.display, fontSize: "32px", textAlign: "center", marginBottom: "40px" }}>Everything your child needs to grow</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
          {features.map((f) => (
            <Card key={f.title}>
              <div style={{ fontSize: "36px", marginBottom: "10px" }}>{f.icon}</div>
              <h3 style={{ fontFamily: font.display, fontSize: "18px", marginBottom: "6px" }}>{f.title}</h3>
              <p style={{ color: colors.gray700, fontSize: "15px", lineHeight: 1.6 }}>{f.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      <div style={{ background: colors.purpleLight, padding: "64px 24px", textAlign: "center" }}>
        <h2 style={{ fontFamily: font.display, fontSize: "32px", marginBottom: "12px" }}>Ready to see your child thrive?</h2>
        <p style={{ color: colors.gray700, marginBottom: "28px", fontSize: "18px" }}>Join families already using NeuroRead to build confidence one lesson at a time.</p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <PrimaryBtn onClick={onStart}>Try a Free Lesson</PrimaryBtn>
          <PrimaryBtn href={STRIPE_URL} style={{ background: colors.orange }}>Get Early Access — $29</PrimaryBtn>
          <PrimaryBtn onClick={onPricing} style={{ background: colors.white, color: colors.purple, boxShadow: "none", border: `2px solid ${colors.purple}` }}>View All Plans</PrimaryBtn>
        </div>
      </div>

      <footer style={{ background: colors.gray900, color: colors.gray300, padding: "32px 24px", textAlign: "center", fontSize: "14px" }}>
        <p style={{ fontFamily: font.display, color: colors.white, fontWeight: 700, fontSize: "18px", marginBottom: "8px" }}>Neuro<span style={{ color: colors.orange }}>Read</span></p>
        <p>AI-powered reading support for neurodiverse learners.</p>
        <p style={{ marginTop: "8px", opacity: 0.5 }}>© 2025 NeuroRead AI. hello@neuroread.ai</p>
      </footer>
    </div>
  );
}

function OnboardingScreen({ onComplete, onBack }: { onComplete: (profile: ChildProfile) => void; onBack: () => void }) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<ChildProfile>({ name: "", age: "", challenge: "", goal: "", readingLevel: "" });

  const questions = [
    { key: "name", label: "What's your child's first name?", type: "text", placeholder: "e.g. Maya", tip: "This personalises every lesson for them." },
    { key: "age", label: "How old are they?", type: "choice", choices: ["6–7", "8–9", "10–11", "12+"], tip: "Lessons are matched to their age group." },
    { key: "readingLevel", label: "How does reading feel for them right now?", type: "choice", choices: ["Very hard — they avoid reading", "Tricky — they try but struggle", "Okay — some words trip them up", "Pretty good — they just need a boost"], tip: "No wrong answers — just helps us set the right pace." },
    { key: "challenge", label: "What's their biggest challenge?", type: "choice", choices: ["Sounding out new words", "Understanding what they read", "Staying focused while reading", "Confidence — they feel like they can't do it"] },
    { key: "goal", label: "What's the one thing you'd love them to feel in 4 weeks?", type: "choice", choices: ["Excited to pick up a book", "Proud of how far they've come", "Able to read on their own", "Less anxious about reading aloud"] },
  ];

  const q = questions[step];
  const val = profile[q.key as keyof ChildProfile];
  const canContinue = val.trim().length > 0;

  function handleChoice(v: string) { setProfile({ ...profile, [q.key]: v }); }
  function next() { if (step < questions.length - 1) setStep(step + 1); else onComplete(profile); }

  return (
    <div style={{ minHeight: "100vh", background: colors.cream }}>
      <NavBar onBack={onBack} label="About your child" />
      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "48px 24px" }}>
        <ProgressBar current={step} total={questions.length} />
        <div className="fade-in" key={step} style={{ marginTop: "32px" }}>
          <p style={{ fontSize: "13px", fontWeight: 700, color: colors.purple, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>Question {step + 1} of {questions.length}</p>
          <h2 style={{ fontFamily: font.display, fontSize: "26px", marginBottom: "8px" }}>{q.label}</h2>
          {q.tip && <p style={{ color: colors.gray500, fontSize: "15px", marginBottom: "24px" }}>{q.tip}</p>}
          {q.type === "text" ? (
            <input autoFocus type="text" placeholder={q.placeholder} value={val} onChange={(e) => setProfile({ ...profile, [q.key]: e.target.value })} onKeyDown={(e) => e.key === "Enter" && canContinue && next()} style={{ width: "100%", padding: "14px 18px", fontSize: "20px", fontFamily: font.display, border: `2px solid ${colors.purple}`, borderRadius: "12px", outline: "none", background: colors.white }} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {q.choices!.map((c) => (
                <button key={c} onClick={() => handleChoice(c)} style={{ padding: "14px 18px", borderRadius: "12px", border: `2px solid ${val === c ? colors.purple : colors.gray300}`, background: val === c ? colors.purpleLight : colors.white, color: val === c ? colors.purpleDark : colors.gray700, fontFamily: font.body, fontSize: "17px", fontWeight: val === c ? 700 : 400, textAlign: "left", transition: "all 0.15s" }}>
                  {val === c ? "✓ " : ""}{c}
                </button>
              ))}
            </div>
          )}
          <div style={{ marginTop: "32px", display: "flex", gap: "12px" }}>
            {step > 0 && <button onClick={() => setStep(step - 1)} style={{ padding: "12px 20px", border: `2px solid ${colors.gray300}`, borderRadius: "12px", background: colors.white, color: colors.gray700, fontWeight: 600, fontSize: "16px", cursor: "pointer" }}>← Back</button>}
            <PrimaryBtn onClick={next} disabled={!canContinue} style={{ flex: 1 }}>{step < questions.length - 1 ? "Next →" : "Build my plan ✨"}</PrimaryBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

function GeneratingScreen({ profile }: { profile: ChildProfile }) {
  const steps = [`Reading ${profile.name}'s answers…`, "Choosing the right reading level…", "Writing 5 personalised lessons…", "Adding comprehension checks…", "Almost ready!"];
  const [stepIdx, setStepIdx] = useState(0);
  useEffect(() => { const t = setInterval(() => setStepIdx((i) => Math.min(i + 1, steps.length - 1)), 900); return () => clearInterval(t); }, []);
  return (
    <div style={{ minHeight: "100vh", background: colors.cream, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
      <div style={{ width: "64px", height: "64px", border: `6px solid ${colors.purpleLight}`, borderTop: `6px solid ${colors.purple}`, borderRadius: "50%", animation: "spin 0.9s linear infinite", marginBottom: "32px" }} />
      <h2 style={{ fontFamily: font.display, fontSize: "28px", marginBottom: "12px" }}>Building {profile.name}'s plan…</h2>
      <p className="pulse" style={{ color: colors.purple, fontWeight: 600, fontSize: "17px" }}>{steps[stepIdx]}</p>
    </div>
  );
}

function DashboardScreen({ profile, plan, completedLessons, onStartLesson, onBack }: { profile: ChildProfile; plan: LessonPlan; completedLessons: number[]; onStartLesson: (idx: number) => void; onBack: () => void }) {
  return (
    <div style={{ minHeight: "100vh", background: colors.cream }}>
      <NavBar onBack={onBack} label="Dashboard" />
      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "40px 24px" }}>
        <div className="fade-in" style={{ background: `linear-gradient(135deg, ${colors.purple}, ${colors.purpleDark})`, borderRadius: "20px", padding: "32px", color: colors.white, marginBottom: "28px" }}>
          <p style={{ fontSize: "13px", opacity: 0.8, marginBottom: "4px" }}>Welcome back!</p>
          <h1 style={{ fontFamily: font.display, fontSize: "32px", marginBottom: "8px" }}>{profile.name}'s Reading Journey ⭐</h1>
          <p style={{ opacity: 0.85, fontSize: "16px" }}>This week's theme: <strong>{plan.weekTheme}</strong></p>
          <div style={{ marginTop: "16px" }}>
            <div style={{ height: "10px", background: "rgba(255,255,255,0.2)", borderRadius: "99px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(completedLessons.length / plan.lessons.length) * 100}%`, background: "#FCD34D", borderRadius: "99px", transition: "width 0.5s" }} />
            </div>
            <p style={{ fontSize: "13px", opacity: 0.8, marginTop: "6px" }}>{completedLessons.length} of {plan.lessons.length} lessons complete</p>
          </div>
        </div>

        <h2 style={{ fontFamily: font.display, fontSize: "22px", marginBottom: "16px" }}>This week's lessons</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {plan.lessons.map((lesson, idx) => {
            const done = completedLessons.includes(idx);
            const isNext = !done && completedLessons.length === idx;
            return (
              <Card key={idx} style={{ border: isNext ? `2px solid ${colors.purple}` : `2px solid transparent`, opacity: done ? 0.7 : 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: done ? colors.greenLight : isNext ? colors.purpleLight : colors.gray100, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>
                    {done ? "✅" : isNext ? "📖" : "🔒"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "13px", color: colors.gray500 }}>{lesson.day}</p>
                    <p style={{ fontFamily: font.display, fontWeight: 700, fontSize: "17px" }}>{lesson.title}</p>
                  </div>
                  {(isNext || done) && (
                    <button onClick={() => onStartLesson(idx)} style={{ padding: "8px 16px", background: done ? colors.greenLight : colors.purple, color: done ? colors.green : colors.white, border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>
                      {done ? "Review" : "Start →"}
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        <Card style={{ marginTop: "28px", background: colors.softYellow, border: `2px solid #FDE68A` }}>
          <p style={{ fontSize: "14px", fontWeight: 700, color: colors.orange, marginBottom: "4px" }}>💡 Parent tip</p>
          <p style={{ fontSize: "15px", color: colors.gray700 }}>Sit with {profile.name} for their first lesson this week. Hearing you read along builds confidence faster than anything else.</p>
        </Card>
      </div>
    </div>
  );
}

function SuccessScreen({ onBegin }: { onBegin: () => void }) {
  return (
    <div style={{ minHeight: "100vh", background: colors.cream }}>
      <NavBar />
      <div className="fade-in" style={{ maxWidth: "600px", margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <div style={{ fontSize: "64px", marginBottom: "16px" }}>🎉</div>
        <h1 style={{ fontFamily: font.display, fontSize: "36px", marginBottom: "12px" }}>Welcome to NeuroRead!</h1>
        <div style={{ background: colors.greenLight, border: `2px solid ${colors.green}`, borderRadius: "12px", padding: "16px", marginBottom: "24px" }}>
          <p style={{ color: colors.green, fontWeight: 700 }}>✅ Your early access spot is confirmed.</p>
        </div>
        <p style={{ color: colors.gray700, fontSize: "18px", marginBottom: "32px", lineHeight: 1.7 }}>You've unlocked full access to NeuroRead. Let's build your child's personalised reading plan — it only takes 2 minutes.</p>
        <PrimaryBtn onClick={onBegin} style={{ width: "100%" }}>Build my child's plan →</PrimaryBtn>
        <p style={{ marginTop: "16px", fontSize: "14px", color: colors.gray500 }}>Questions? Email us at hello@neuroread.ai</p>
      </div>
    </div>
  );
}

function PaywallScreen({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ minHeight: "100vh", background: colors.cream }}>
      <NavBar onBack={onBack} />
      <div className="fade-in" style={{ maxWidth: "560px", margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <div style={{ fontSize: "52px", marginBottom: "16px" }}>🔓</div>
        <h1 style={{ fontFamily: font.display, fontSize: "32px", marginBottom: "12px" }}>Unlock full access</h1>
        <p style={{ color: colors.gray700, fontSize: "18px", marginBottom: "32px", lineHeight: 1.7 }}>Unlock personalised weekly lesson plans, mic reading, hesitation detection, and unlimited sessions — built around your child.</p>
        <Card style={{ marginBottom: "24px", border: `2px solid ${colors.purple}` }}>
          <p style={{ fontSize: "13px", fontWeight: 700, color: colors.purple, marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Early Access</p>
          <p style={{ fontFamily: font.display, fontSize: "48px", fontWeight: 800, color: colors.purpleDark }}>$29<span style={{ fontSize: "18px", color: colors.gray500 }}>/mo</span></p>
          <p style={{ color: colors.gray500, fontSize: "14px", marginBottom: "20px" }}>Price locked for early members — never goes up.</p>
          {["Personalised AI lesson plan each week", "Dyslexia-friendly reading sessions", "🎤 Microphone reading mode", "🔍 Hesitation detection & word reports", "🔊 Read-aloud with word highlighting", "Progress tracking for parents", "Cancel anytime"].map((f) => (
            <p key={f} style={{ textAlign: "left", padding: "6px 0", fontSize: "15px", color: colors.gray700, borderBottom: `1px solid ${colors.gray100}` }}>✓ {f}</p>
          ))}
        </Card>
        <PrimaryBtn href={STRIPE_URL} style={{ width: "100%", textAlign: "center" }}>Get Early Access — $29/mo →</PrimaryBtn>
        <p style={{ marginTop: "12px", fontSize: "14px", color: colors.gray500 }}>Secure checkout via Stripe. No commitment.</p>
      </div>
    </div>
  );
}

function PricingScreen({ onBack, onStart }: { onBack: () => void; onStart: () => void }) {
  const familyPlans = [
    {
      name: "Early Access",
      badge: "⚡ Limited spots",
      price: "$29",
      period: "/month",
      note: "Price locked forever for early members",
      color: colors.orange,
      features: ["1 child profile", "AI-generated weekly lesson plan", "Word highlighting & read-aloud", "🎤 Mic reading mode", "🔍 Hesitation detection", "Comprehension checks", "Progress tracking", "Cancel anytime"],
      cta: "Get Early Access",
      href: STRIPE_URL,
      highlight: true,
    },
    {
      name: "Individual Family",
      badge: "Coming soon",
      price: "$39",
      period: "/month",
      note: "For families joining after early access",
      color: colors.purple,
      features: ["1 child profile", "AI-generated weekly lesson plan", "Word highlighting & read-aloud", "🎤 Mic reading mode", "🔍 Hesitation detection", "Comprehension checks", "Progress tracking", "Cancel anytime"],
      cta: "Coming Soon",
      href: null,
      highlight: false,
    },
    {
      name: "Family Plus",
      badge: "Coming soon",
      price: "$49",
      period: "/month",
      note: "Support up to 3 children",
      color: colors.green,
      features: ["Up to 3 child profiles", "Individual AI plans per child", "Word highlighting & read-aloud", "🎤 Mic reading mode", "🔍 Hesitation detection", "Comprehension checks", "Progress tracking per child", "Cancel anytime"],
      cta: "Coming Soon",
      href: null,
      highlight: false,
    },
  ];

  const schoolPlans = [
    {
      name: "Classroom",
      price: "$199",
      period: "/month",
      annual: "$1,990/year — save 2 months",
      students: "Up to 30 students",
      features: ["30 student profiles", "AI lesson plans per student", "Teacher dashboard", "Progress reports", "Word highlighting & mic reading", "Hesitation detection per student", "Email support"],
    },
    {
      name: "School",
      price: "$499",
      period: "/month",
      annual: "$4,990/year — save 2 months",
      students: "Up to 150 students",
      features: ["150 student profiles", "AI lesson plans per student", "Admin & teacher dashboards", "School-wide progress reporting", "Word highlighting & mic reading", "Hesitation detection per student", "Priority support", "Onboarding session included"],
    },
    {
      name: "District",
      price: "Custom",
      period: "",
      annual: "Annual billing available",
      students: "Unlimited students",
      features: ["Unlimited student profiles", "AI lesson plans per student", "District-wide admin dashboard", "Custom reporting & analytics", "Full feature access", "Dedicated account manager", "Staff training included", "Custom onboarding"],
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: colors.cream }}>
      <NavBar onBack={onBack} />

      <div style={{ background: `linear-gradient(135deg, ${colors.purpleDark}, ${colors.purple})`, color: colors.white, padding: "56px 24px", textAlign: "center" }}>
        <p style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.8, marginBottom: "12px" }}>Simple, transparent pricing</p>
        <h1 style={{ fontFamily: font.display, fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, marginBottom: "16px" }}>Plans for every family and school</h1>
        <p style={{ fontSize: "18px", opacity: 0.9, maxWidth: "500px", margin: "0 auto" }}>Start free. Upgrade when you're ready. Cancel anytime.</p>
      </div>

      {/* Family Plans */}
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "56px 24px" }}>
        <h2 style={{ fontFamily: font.display, fontSize: "28px", textAlign: "center", marginBottom: "8px" }}>For Families</h2>
        <p style={{ color: colors.gray500, textAlign: "center", marginBottom: "40px", fontSize: "16px" }}>Personal reading support built around your child</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          {familyPlans.map((plan) => (
            <div key={plan.name} style={{ background: colors.white, borderRadius: "20px", padding: "32px", border: `2px solid ${plan.highlight ? plan.color : colors.gray100}`, boxShadow: plan.highlight ? "0 8px 32px rgba(234,88,12,0.15)" : "0 2px 12px rgba(0,0,0,0.07)", position: "relative" }}>
              {plan.highlight && (
                <div style={{ position: "absolute", top: "-14px", left: "50%", transform: "translateX(-50%)", background: colors.orange, color: colors.white, padding: "4px 16px", borderRadius: "99px", fontSize: "12px", fontWeight: 700, whiteSpace: "nowrap" }}>
                  ⚡ Early Access — Limited Spots
                </div>
              )}
              <p style={{ fontSize: "12px", fontWeight: 700, color: plan.color, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>{plan.badge}</p>
              <h3 style={{ fontFamily: font.display, fontSize: "22px", marginBottom: "8px" }}>{plan.name}</h3>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "4px" }}>
                <span style={{ fontFamily: font.display, fontSize: "42px", fontWeight: 800, color: colors.gray900 }}>{plan.price}</span>
                <span style={{ color: colors.gray500, fontSize: "16px" }}>{plan.period}</span>
              </div>
              <p style={{ fontSize: "13px", color: colors.gray500, marginBottom: "24px" }}>{plan.note}</p>
              <div style={{ borderTop: `1px solid ${colors.gray100}`, paddingTop: "20px", marginBottom: "24px" }}>
                {plan.features.map((f) => (
                  <p key={f} style={{ fontSize: "15px", color: colors.gray700, padding: "5px 0", display: "flex", gap: "8px" }}>
                    <span style={{ color: colors.green, fontWeight: 700 }}>✓</span> {f}
                  </p>
                ))}
              </div>
              {plan.href ? (
                <a href={plan.href} target="_blank" rel="noopener noreferrer" style={{ display: "block", textAlign: "center", padding: "14px", background: plan.color, color: colors.white, borderRadius: "12px", fontWeight: 700, fontSize: "16px", textDecoration: "none" }}>
                  {plan.cta} →
                </a>
              ) : (
                <div style={{ textAlign: "center", padding: "14px", background: colors.gray100, color: colors.gray500, borderRadius: "12px", fontWeight: 700, fontSize: "16px" }}>
                  {plan.cta}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "32px" }}>
          <p style={{ color: colors.gray500, marginBottom: "16px" }}>Not sure yet?</p>
          <button onClick={onStart} style={{ padding: "14px 32px", background: colors.purpleLight, color: colors.purple, border: `2px solid ${colors.purple}`, borderRadius: "12px", fontWeight: 700, fontSize: "16px", cursor: "pointer", fontFamily: font.body }}>
            Try a free lesson — no account needed
          </button>
        </div>
      </div>

      {/* School Plans */}
      <div style={{ background: colors.gray900, padding: "56px 24px" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <h2 style={{ fontFamily: font.display, fontSize: "28px", textAlign: "center", marginBottom: "8px", color: colors.white }}>For Schools & Districts</h2>
          <p style={{ color: colors.gray300, textAlign: "center", marginBottom: "40px", fontSize: "16px" }}>Scalable reading support for every student. Annual billing saves 2 months.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            {schoolPlans.map((plan) => (
              <div key={plan.name} style={{ background: "#1F2937", borderRadius: "20px", padding: "32px", border: "2px solid #374151" }}>
                <h3 style={{ fontFamily: font.display, fontSize: "22px", marginBottom: "4px", color: colors.white }}>{plan.name}</h3>
                <p style={{ fontSize: "13px", color: colors.orange, fontWeight: 700, marginBottom: "12px" }}>{plan.students}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "4px" }}>
                  <span style={{ fontFamily: font.display, fontSize: "38px", fontWeight: 800, color: colors.white }}>{plan.price}</span>
                  <span style={{ color: colors.gray300, fontSize: "16px" }}>{plan.period}</span>
                </div>
                <p style={{ fontSize: "13px", color: colors.gray300, marginBottom: "24px" }}>{plan.annual}</p>
                <div style={{ borderTop: "1px solid #374151", paddingTop: "20px", marginBottom: "24px" }}>
                  {plan.features.map((f) => (
                    <p key={f} style={{ fontSize: "14px", color: colors.gray300, padding: "5px 0", display: "flex", gap: "8px" }}>
                      <span style={{ color: colors.green, fontWeight: 700 }}>✓</span> {f}
                    </p>
                  ))}
                </div>
                <a href="mailto:hello@neuroread.ai" style={{ display: "block", textAlign: "center", padding: "14px", background: colors.purple, color: colors.white, borderRadius: "12px", fontWeight: 700, fontSize: "16px", textDecoration: "none" }}>
                  {plan.price === "Custom" ? "Contact us →" : "Get started →"}
                </a>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", color: colors.gray300, marginTop: "32px", fontSize: "14px" }}>
            All school plans include a free demo. Email <span style={{ color: colors.orange }}>hello@neuroread.ai</span>
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "56px 24px" }}>
        <h2 style={{ fontFamily: font.display, fontSize: "28px", textAlign: "center", marginBottom: "32px" }}>Common questions</h2>
        {[
          { q: "Can I cancel anytime?", a: "Yes — no contracts, no commitment. Cancel any time from your account settings and you won't be charged again." },
          { q: "Is the early access price really locked forever?", a: "Yes. Early Access members keep their $29/month rate permanently, even after we raise prices for new customers." },
          { q: "What ages is NeuroRead designed for?", a: "NeuroRead works best for children aged 6–14 who are learning to read or struggling with reading confidence, including those with dyslexia, ADHD, or other learning differences." },
          { q: "Do schools get a free trial?", a: "Yes — email us at hello@neuroread.ai and we'll set up a free 2-week pilot for your classroom or school." },
          { q: "What devices does NeuroRead work on?", a: "NeuroRead works on any device with a modern browser — phones, tablets, laptops, and desktops. No app download needed." },
        ].map((item) => (
          <div key={item.q} style={{ borderBottom: `1px solid ${colors.gray100}`, padding: "20px 0" }}>
            <p style={{ fontFamily: font.display, fontWeight: 700, fontSize: "17px", marginBottom: "8px" }}>{item.q}</p>
            <p style={{ color: colors.gray700, fontSize: "15px", lineHeight: 1.7 }}>{item.a}</p>
          </div>
        ))}
      </div>

      <footer style={{ background: colors.gray900, color: colors.gray300, padding: "32px 24px", textAlign: "center", fontSize: "14px" }}>
        <p style={{ fontFamily: font.display, color: colors.white, fontWeight: 700, fontSize: "18px", marginBottom: "8px" }}>Neuro<span style={{ color: colors.orange }}>Read</span></p>
        <p>AI-powered reading support for neurodiverse learners.</p>
        <p style={{ marginTop: "8px", opacity: 0.5 }}>© 2025 NeuroRead AI. hello@neuroread.ai</p>
      </footer>
    </div>
  );
}

export default function App() {
  const isSuccess = getParam("success") === "true";
  const startDirect = getParam("start") === "true";
  const isPaid = isSuccess;

  const [screen, setScreen] = useState<Screen>(
    isSuccess ? "success" : startDirect ? "onboarding" : "landing"
  );
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [plan, setPlan] = useState<LessonPlan | null>(null);
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const generatingRef = useRef(false);

  useEffect(() => {
    const tag = document.createElement("style");
    tag.textContent = globalStyle;
    document.head.appendChild(tag);
    return () => tag.remove();
  }, []);

  async function buildPlan(p: ChildProfile) {
    if (generatingRef.current) return;
    generatingRef.current = true;
    setScreen("generating");
    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: p.name, age: p.age, readingLevel: p.readingLevel, challenge: p.challenge, goal: p.goal }),
      });
      if (!res.ok) throw new Error("Server error");
      const parsed: LessonPlan = await res.json();
      setPlan(parsed);
      setScreen("dashboard");
    } catch {
      setPlan({
        weekTheme: "Building Confidence One Word at a Time",
        lessons: [
          { day: "Day 1 — Monday", title: "The Friendly Dog", passage: "Sam has a dog. The dog is big and brown. Sam and the dog play in the park every day.", tip: "Point to each word as you read it.", question: "Where do Sam and the dog play?", answers: ["In the park", "At school", "In the house"], correct: "In the park" },
          { day: "Day 2 — Tuesday", title: "A Rainy Morning", passage: "It rained this morning. Mia put on her red boots. She jumped in every puddle on the way to school.", tip: "Try reading it twice — the second time feels easier.", question: "What did Mia put on her feet?", answers: ["Her red boots", "Her socks", "Her shoes"], correct: "Her red boots" },
          { day: "Day 3 — Wednesday", title: "The Lost Kite", passage: "Ben flew his kite in the wind. The string got loose. The kite went up and up into the big blue sky.", tip: "Pause at every full stop. Let the words breathe.", question: "What happened to the kite string?", answers: ["It got loose", "It snapped", "It got longer"], correct: "It got loose" },
          { day: "Day 4 — Thursday", title: "Baking Cookies", passage: "Lily and her mom made cookies. They mixed flour, butter, and sugar. The kitchen smelled sweet and warm.", tip: "If a word is tricky, skip it and come back.", question: "How did the kitchen smell?", answers: ["Sweet and warm", "Cold and empty", "Smoky and dark"], correct: "Sweet and warm" },
          { day: "Day 5 — Friday", title: "My Superpower", passage: "Every reader starts somewhere. Each word you read makes your brain stronger. You are building your superpower right now.", tip: "Read this one out loud — you deserve to hear yourself do it.", question: "What are you building when you read?", answers: ["Your superpower", "A tower", "A story"], correct: "Your superpower" },
        ],
      });
      setScreen("dashboard");
    }
    generatingRef.current = false;
  }

  function handleLessonComplete() {
    if (!completedLessons.includes(activeLessonIdx)) setCompletedLessons([...completedLessons, activeLessonIdx]);
    setScreen("dashboard");
  }

  if (screen === "success") return <SuccessScreen onBegin={() => setScreen("onboarding")} />;
  if (screen === "paywall") return <PaywallScreen onBack={() => setScreen(plan ? "dashboard" : "landing")} />;
  if (screen === "pricing") return <PricingScreen onBack={() => setScreen("landing")} onStart={() => setScreen("onboarding")} />;

  if (screen === "landing") return (
    <LandingScreen
      onStart={() => setScreen("onboarding")}
      onPay={() => { window.location.href = STRIPE_URL; }}
      onPricing={() => setScreen("pricing")}
    />
  );

  if (screen === "onboarding") return (
    <OnboardingScreen
      onComplete={(p) => { setProfile(p); buildPlan(p); }}
      onBack={() => setScreen("landing")}
    />
  );

  if (screen === "generating" && profile) return <GeneratingScreen profile={profile} />;

  if (screen === "dashboard" && profile && plan) return (
    <DashboardScreen
      profile={profile}
      plan={plan}
      completedLessons={completedLessons}
      onStartLesson={(idx) => { setActiveLessonIdx(idx); setScreen("lesson"); }}
      onBack={() => setScreen("landing")}
    />
  );

  if (screen === "lesson" && plan) return (
    <LessonScreen
      lesson={plan.lessons[activeLessonIdx]}
      lessonIdx={activeLessonIdx}
      totalLessons={plan.lessons.length}
      isPaid={isPaid}
      onComplete={handleLessonComplete}
      onBack={() => setScreen("dashboard")}
      onUpgrade={() => setScreen("paywall")}
    />
  );

  return null;
}
