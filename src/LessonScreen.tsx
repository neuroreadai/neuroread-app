// ─── LessonScreen.tsx ────────────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback } from "react";

interface Lesson {
  day: string;
  title: string;
  passage: string;
  question: string;
  answers: string[];
  correct: string;
  tip: string;
}

interface HesitationWord {
  word: string;
  index: number;
  pauseSeconds: number;
}

interface Props {
  lesson: Lesson;
  lessonIdx: number;
  totalLessons: number;
  isPaid: boolean;
  onComplete: () => void;
  onBack: () => void;
  onUpgrade: () => void;
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
  orangeLight: "#FEF3C7",
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

function tokenise(text: string): string[] {
  return text.match(/\S+/g) ?? [];
}

function stripPunct(word: string): string {
  return word.replace(/[^a-zA-Z']/g, "").toLowerCase();
}

function useTTS(words: string[]) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<any>(null);

  const speak = useCallback(() => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    if (timerRef.current) clearTimeout(timerRef.current);

    const text = words.join(" ");
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.65;
    utter.pitch = 1.05;

    let boundaryWorking = false;

    utter.onboundary = (e) => {
      if (e.name !== "word") return;
      boundaryWorking = true;
      let charCount = 0;
      for (let i = 0; i < words.length; i++) {
        if (e.charIndex >= charCount && e.charIndex < charCount + words[i].length) {
          setActiveIdx(i);
          break;
        }
        charCount += words[i].length + 1;
      }
    };

    utter.onstart = () => {
      setSpeaking(true);
      let idx = 0;
      function advance() {
        if (boundaryWorking) return;
        if (idx >= words.length) { setActiveIdx(null); return; }
        setActiveIdx(idx);
        // At rate 0.8, ~110 words/min = ~545ms per average word
        // Scale by word length for better accuracy
        const wordLen = Math.max(2, words[idx].replace(/[^a-zA-Z]/g, "").length);
        const duration = 420+ (wordLen * 22);
        idx++;
        timerRef.current = setTimeout(advance, duration);
      }
      // Wait 400ms for TTS engine to spin up on mobile
      timerRef.current = setTimeout(advance, 50);
    };

    utter.onend = () => {
      setSpeaking(false);
      setActiveIdx(null);
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    };

    utter.onerror = () => {
      setSpeaking(false);
      setActiveIdx(null);
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    };

    utterRef.current = utter;
    window.speechSynthesis.speak(utter);
  }, [words]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setActiveIdx(null);
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  useEffect(() => () => {
    window.speechSynthesis.cancel();
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return { activeIdx, speaking, speak, stop };
}

function useMicReading(words: string[], onHesitation: (h: HesitationWord) => void) {
  const [listening, setListening] = useState(false);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [micSupported, setMicSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const wordIdxRef = useRef(0);
  const lastMatchTimeRef = useRef(Date.now());
  const hesitationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const HESITATION_THRESHOLD_MS = 3000;

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { setMicSupported(false); return; }
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    wordIdxRef.current = 0;
    setCurrentWordIdx(0);
    lastMatchTimeRef.current = Date.now();
    rec.onresult = (event: any) => {
      const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join(" ").toLowerCase();
      const spokenWords = transcript.match(/\S+/g)?.map(stripPunct) ?? [];
      let pointer = wordIdxRef.current;
      for (const spoken of spokenWords) {
        if (pointer >= words.length) break;
        const target = stripPunct(words[pointer]);
        if (spoken === target || spoken.includes(target) || target.includes(spoken)) {
          pointer++;
          lastMatchTimeRef.current = Date.now();
        }
      }
      if (pointer !== wordIdxRef.current) { wordIdxRef.current = pointer; setCurrentWordIdx(pointer); }
    };
    rec.onerror = (e: any) => { if (e.error === "not-allowed") setMicSupported(false); };
    rec.onend = () => { if (recognitionRef.current === rec) { try { rec.start(); } catch {} } };
    recognitionRef.current = rec;
    hesitationTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - lastMatchTimeRef.current;
      const idx = wordIdxRef.current;
      if (elapsed > HESITATION_THRESHOLD_MS && idx < words.length) {
        onHesitation({ word: words[idx], index: idx, pauseSeconds: Math.round(elapsed / 1000) });
        lastMatchTimeRef.current = Date.now();
      }
    }, 1000);
    try { rec.start(); setListening(true); } catch { setMicSupported(false); }
  }, [words, onHesitation]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) { recognitionRef.current.onend = null; recognitionRef.current.stop(); recognitionRef.current = null; }
    if (hesitationTimerRef.current) { clearInterval(hesitationTimerRef.current); hesitationTimerRef.current = null; }
    setListening(false);
  }, []);

  useEffect(() => () => { stopListening(); }, [stopListening]);
  return { listening, currentWordIdx, micSupported, startListening, stopListening };
}

function NavBar({ onBack, label }: { onBack?: () => void; label?: string }) {
  return (
    <nav style={{ background: colors.white, borderBottom: `2px solid ${colors.purpleLight}`, padding: "14px 24px", display: "flex", alignItems: "center", gap: "12px", position: "sticky", top: 0, zIndex: 10 }}>
      {onBack && <button onClick={onBack} style={{ background: colors.purpleLight, border: "none", borderRadius: "8px", padding: "6px 12px", color: colors.purple, fontWeight: 700, fontSize: "15px", cursor: "pointer" }}>← Back</button>}
      <span style={{ fontFamily: font.display, fontWeight: 800, fontSize: "20px", color: colors.purple }}>
        Neuro<span style={{ color: colors.orange }}>Read</span>
      </span>
      {label && <span style={{ color: colors.gray500, fontSize: "14px" }}>— {label}</span>}
    </nav>
  );
}

function Card({ children, style: extra }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: colors.white, borderRadius: "16px", padding: "28px", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", ...extra }}>{children}</div>;
}

function PrimaryBtn({ children, onClick, disabled, style: extra }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; style?: React.CSSProperties }) {
  return <button onClick={onClick} disabled={disabled} style={{ display: "inline-block", padding: "14px 28px", background: disabled ? colors.gray300 : colors.purple, color: colors.white, border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "18px", cursor: disabled ? "not-allowed" : "pointer", boxShadow: disabled ? "none" : "0 4px 14px rgba(109,40,217,0.3)", fontFamily: font.body, width: "100%", ...extra }}>{children}</button>;
}

function HighlightedPassage({ words, ttsActiveIdx, micActiveIdx, hesitatedIndices, mode }: { words: string[]; ttsActiveIdx: number | null; micActiveIdx: number; hesitatedIndices: Set<number>; mode: "listen" | "read" | "idle" }) {
  const activeIdx = mode === "listen" ? ttsActiveIdx : mode === "read" ? micActiveIdx : null;
  return (
    <p style={{ fontSize: "22px", lineHeight: 2, letterSpacing: "0.03em", wordSpacing: "0.1em", fontFamily: font.body }}>
      {words.map((word, i) => {
        const isActive = activeIdx === i;
        const isRead = mode === "read" && i < micActiveIdx;
        const isHesitated = hesitatedIndices.has(i);
        let bg = "transparent", color = colors.gray900, borderBottom = "none", fontWeight: any = 400;
        if (isActive) { bg = colors.orange; color = colors.white; fontWeight = 700; }
        else if (isHesitated && mode === "read") { bg = colors.redLight; color = colors.red; borderBottom = `2px solid ${colors.red}`; }
        else if (isRead) { color = colors.green; fontWeight = 600; }
        return (
          <span key={i}>
            <span style={{ background: bg, color, fontWeight, borderBottom, borderRadius: isActive ? "6px" : "0", padding: isActive ? "2px 6px" : "2px 2px", transition: "background 0.15s, color 0.15s", display: "inline-block", marginBottom: "2px" }}>{word}</span>{" "}
          </span>
        );
      })}
    </p>
  );
}

function HesitationReport({ hesitations }: { hesitations: HesitationWord[] }) {
  if (hesitations.length === 0) return null;
  return (
    <Card style={{ background: colors.redLight, border: `2px solid ${colors.red}`, marginTop: "16px" }}>
      <p style={{ fontWeight: 700, color: colors.red, marginBottom: "8px", fontSize: "15px" }}>🔍 Words to practise together</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {hesitations.map((h, i) => <span key={i} style={{ background: colors.white, border: `2px solid ${colors.red}`, borderRadius: "8px", padding: "4px 12px", fontSize: "16px", fontWeight: 700, color: colors.red }}>{h.word.replace(/[^a-zA-Z']/g, "")}</span>)}
      </div>
      <p style={{ fontSize: "13px", color: colors.red, marginTop: "8px", opacity: 0.8 }}>These are words where the reader paused for 3+ seconds. Try reading them together!</p>
    </Card>
  );
}

export default function LessonScreen({ lesson, lessonIdx, totalLessons, isPaid, onComplete, onBack, onUpgrade }: Props) {
  const [stage, setStage] = useState<"read" | "question" | "done">("read");
  const [selected, setSelected] = useState("");
  const [mode, setMode] = useState<"idle" | "listen" | "read">("idle");
  const [hesitations, setHesitations] = useState<HesitationWord[]>([]);
  const [hesitatedIndices, setHesitatedIndices] = useState<Set<number>>(new Set());
  const words = tokenise(lesson.passage);
  const correct = selected === lesson.correct;

  const handleHesitation = useCallback((h: HesitationWord) => {
    setHesitations((prev) => prev.find((x) => x.index === h.index) ? prev : [...prev, h]);
    setHesitatedIndices((prev) => new Set([...prev, h.index]));
  }, []);

  const { activeIdx: ttsActiveIdx, speaking, speak, stop: stopTTS } = useTTS(words);
  const { listening, currentWordIdx, micSupported, startListening, stopListening } = useMicReading(words, handleHesitation);

  function handleListen() {
    if (mode === "listen") { stopTTS(); setMode("idle"); }
    else { stopListening(); setMode("listen"); speak(); }
  }

  function handleReadAloud() {
    if (mode === "read") { stopListening(); setMode("idle"); }
    else { stopTTS(); setMode("read"); startListening(); }
  }

  function handleStopAll() { stopTTS(); stopListening(); setMode("idle"); }

  useEffect(() => { if (stage !== "read") handleStopAll(); }, [stage]);

  return (
    <div style={{ minHeight: "100vh", background: colors.cream }}>
      <NavBar onBack={() => { handleStopAll(); onBack(); }} label={`Lesson ${lessonIdx + 1} of ${totalLessons}`} />
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "40px 24px" }}>

        {stage === "read" && (
          <div>
            <p style={{ fontSize: "13px", fontWeight: 700, color: colors.purple, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>{lesson.day}</p>
            <h2 style={{ fontFamily: font.display, fontSize: "26px", marginBottom: "24px" }}>{lesson.title}</h2>

            <Card style={{ background: colors.softYellow, border: `2px solid #FDE68A`, marginBottom: "16px" }}>
              <HighlightedPassage words={words} ttsActiveIdx={ttsActiveIdx} micActiveIdx={currentWordIdx} hesitatedIndices={hesitatedIndices} mode={mode} />
            </Card>

            <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
              <button onClick={handleListen} style={{ flex: 1, padding: "14px 16px", borderRadius: "12px", border: `2px solid ${mode === "listen" ? colors.orange : colors.gray300}`, background: mode === "listen" ? colors.orange : colors.white, color: mode === "listen" ? colors.white : colors.gray700, fontWeight: 700, fontSize: "16px", cursor: "pointer", fontFamily: font.body, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                {mode === "listen" ? "⏹ Stop" : "🔊 Listen"}
              </button>

              {!isPaid ? (
                <button onClick={onUpgrade} style={{ flex: 1, padding: "14px 16px", borderRadius: "12px", border: `2px solid ${colors.purple}`, background: colors.purpleLight, color: colors.purpleDark, fontWeight: 700, fontSize: "15px", cursor: "pointer", fontFamily: font.body, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  🔒 Unlock mic reading
                </button>
              ) : micSupported ? (
                <button onClick={handleReadAloud} style={{ flex: 1, padding: "14px 16px", borderRadius: "12px", border: `2px solid ${mode === "read" ? colors.purple : colors.gray300}`, background: mode === "read" ? colors.purple : colors.white, color: mode === "read" ? colors.white : colors.gray700, fontWeight: 700, fontSize: "16px", cursor: "pointer", fontFamily: font.body, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  {mode === "read" ? "⏹ Stop reading" : "🎤 I'll read it"}
                </button>
              ) : (
                <div style={{ flex: 1, padding: "14px 16px", borderRadius: "12px", border: `2px solid ${colors.gray300}`, background: colors.gray100, color: colors.gray500, fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                  🎤 Mic not available on this device
                </div>
              )}
            </div>

            {!isPaid && (
              <div style={{ background: colors.purpleLight, border: `2px solid ${colors.purple}`, borderRadius: "12px", padding: "16px 20px", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                <div>
                  <p style={{ fontWeight: 700, color: colors.purpleDark, fontSize: "15px", margin: 0 }}>🔒 Mic reading & hesitation detection</p>
                  <p style={{ color: colors.purple, fontSize: "13px", margin: "4px 0 0" }}>Available for Early Access members</p>
                </div>
                <button onClick={onUpgrade} style={{ padding: "10px 18px", background: colors.purple, color: colors.white, border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "14px", cursor: "pointer", fontFamily: font.body, whiteSpace: "nowrap" }}>
                  Unlock — $29 →
                </button>
              </div>
            )}

            {mode === "listen" && (
              <Card style={{ background: colors.orangeLight, border: `2px solid ${colors.orange}`, marginBottom: "16px" }}>
                <p style={{ color: colors.orange, fontWeight: 700, fontSize: "15px", margin: 0 }}>🔊 Listen and follow along — each word lights up as it's spoken</p>
              </Card>
            )}
            {mode === "read" && (
              <Card style={{ background: colors.purpleLight, border: `2px solid ${colors.purple}`, marginBottom: "16px" }}>
                <p style={{ color: colors.purple, fontWeight: 700, fontSize: "15px", margin: 0 }}>🎤 Reading mode on — words turn green as you read them.</p>
              </Card>
            )}

            <Card style={{ marginBottom: "20px", background: colors.softYellow, border: `2px solid #FDE68A` }}>
              <p style={{ fontSize: "14px", fontWeight: 700, color: colors.orange, marginBottom: "4px" }}>✏️ Reading tip</p>
              <p style={{ fontSize: "15px", color: colors.gray700, margin: 0 }}>{lesson.tip}</p>
            </Card>

            {isPaid && <HesitationReport hesitations={hesitations} />}

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", margin: "16px 0", fontSize: "13px", color: colors.gray500 }}>
              <span><span style={{ background: colors.orange, color: colors.white, borderRadius: "4px", padding: "1px 6px" }}>word</span> = current word</span>
              {isPaid && <><span><span style={{ color: colors.green, fontWeight: 700 }}>word</span> = already read</span><span><span style={{ background: colors.redLight, color: colors.red, borderRadius: "4px", padding: "1px 6px" }}>word</span> = hesitation</span></>}
            </div>

            <PrimaryBtn onClick={() => { handleStopAll(); setStage("question"); }}>
              I've read it — check my understanding →
            </PrimaryBtn>
          </div>
        )}

        {stage === "question" && (
          <div>
            <h2 style={{ fontFamily: font.display, fontSize: "24px", marginBottom: "8px" }}>Quick check ✅</h2>
            <p style={{ color: colors.gray700, marginBottom: "24px", fontSize: "18px" }}>{lesson.question}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
              {lesson.answers.map((a) => {
                const isSelected = selected === a;
                const isCorrect = a === lesson.correct;
                let bg = colors.white, border = colors.gray300, color = colors.gray700;
                if (selected) {
                  if (isCorrect) { bg = colors.greenLight; border = colors.green; color = colors.green; }
                  else if (isSelected) { bg = colors.redLight; border = colors.red; color = colors.red; }
                } else if (isSelected) { bg = colors.purpleLight; border = colors.purple; color = colors.purpleDark; }
                return (
                  <button key={a} onClick={() => !selected && setSelected(a)} style={{ padding: "14px 18px", borderRadius: "12px", border: `2px solid ${border}`, background: bg, color, fontFamily: font.body, fontSize: "17px", fontWeight: isSelected || (selected && isCorrect) ? 700 : 400, textAlign: "left", cursor: selected ? "default" : "pointer", transition: "all 0.15s" }}>
                    {selected && isCorrect ? "✓ " : selected && isSelected ? "✗ " : ""}{a}
                  </button>
                );
              })}
            </div>
            {selected && (
              <div>
                <Card style={{ background: correct ? colors.greenLight : colors.softYellow, marginBottom: "20px" }}>
                  <p style={{ fontWeight: 700, color: correct ? colors.green : colors.orange, marginBottom: "4px" }}>{correct ? "🌟 Brilliant!" : "💛 Not quite — that's okay!"}</p>
                  <p style={{ fontSize: "15px", color: colors.gray700, margin: 0 }}>{correct ? "You understood the passage really well. Keep going!" : `The answer was "${lesson.correct}". Reading it again can help.`}</p>
                </Card>
                {isPaid && hesitations.length > 0 && (
                  <Card style={{ background: colors.purpleLight, border: `2px solid ${colors.purple}`, marginBottom: "20px" }}>
                    <p style={{ fontWeight: 700, color: colors.purpleDark, marginBottom: "8px" }}>📋 Reading session summary</p>
                    <p style={{ fontSize: "15px", color: colors.gray700, margin: 0 }}>
                      We noticed {hesitations.length} word{hesitations.length > 1 ? "s" : ""} where the reader paused: <strong>{hesitations.map((h) => h.word.replace(/[^a-zA-Z']/g, "")).join(", ")}</strong>. Try practising these together!
                    </p>
                  </Card>
                )}
                <PrimaryBtn onClick={() => setStage("done")}>Finish lesson →</PrimaryBtn>
              </div>
            )}
          </div>
        )}

        {stage === "done" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "72px", marginBottom: "16px" }}>🎉</div>
            <h2 style={{ fontFamily: font.display, fontSize: "32px", marginBottom: "12px" }}>Lesson complete!</h2>
            <p style={{ color: colors.gray700, fontSize: "18px", marginBottom: "32px" }}>
              {correct ? "You nailed the comprehension check too. That's a double win!" : "You finished the lesson and gave it your best shot. That's what counts."}
            </p>
            {isPaid && hesitations.length > 0 && (
              <Card style={{ marginBottom: "24px", textAlign: "left" }}>
                <p style={{ fontWeight: 700, color: colors.purpleDark, marginBottom: "8px", fontFamily: font.display }}>🎯 Words to revisit</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {hesitations.map((h, i) => <span key={i} style={{ background: colors.orangeLight, border: `2px solid ${colors.orange}`, borderRadius: "8px", padding: "4px 12px", fontSize: "16px", fontWeight: 700, color: colors.orange }}>{h.word.replace(/[^a-zA-Z']/g, "")}</span>)}
                </div>
                <p style={{ fontSize: "13px", color: colors.gray500, marginTop: "8px" }}>Share this with a parent or teacher to practise together.</p>
              </Card>
            )}
            <PrimaryBtn onClick={onComplete}>Back to my plan →</PrimaryBtn>
          </div>
        )}
      </div>
    </div>
  );
}
