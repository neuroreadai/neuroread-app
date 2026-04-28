
import { useState } from "react";

export default function App() {
  const isSuccessPage =
    typeof window !==
"undefined" &&
    new
 URLSearchParams(window.location.
 search).get("success")===
  "true";
  const shouldStartReading=
    typeof window !==
  "undefined" &&
    new
 URLSearchParams(window.location.
  search).get("start")=== "true";
  
  const [started, setStarted]=
 useState(shouldStartReading);
  const [showPaywall,
  setShowPaywall]=
  useState(false);
  const [readingStep,
  setReadingStep] = useState(1);
  const [selectedAnswer,
  setSelectedAnswer] =
  useState("");
    
  return (
  <div style={{ fontFamily: "Arial", padding: "40px" }}>
    
    {isSuccessPage ? (
      <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
        <h1>Welcome to NeuroRead Early Access 🎉</h1>

        <p style={{ fontWeight: "bold", marginTop: "10px", color: "#2e7d32" }}>
          ✅ Your early access spot is confirmed.
        </p>

        <p style={{ marginTop: "12px", lineHeight: "1.7" }}>
          You’re officially part of NeuroRead Early Access.
        </p>

        <button
          onClick={() => (window.location.href = "/?start=true")}
          style={{
            marginTop: "24px",
            padding: "12px 20px",
            backgroundColor: "#7C3AED",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Start Your Reading Journey
        </button>
      </div>
    ) : !started ? (
      <div style={{ textAlign: "center" }}>
        <h1>NeuroRead</h1>
        <p>AI-powered reading support for neurodiverse learners.</p>

        <button
          onClick={() => setStarted(true)}
          style={{
            padding: "12px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            marginTop: "20px"
          }}
        >
          Start Reading
        </button>

        <br /><br />
        <a
          href="https://buy.stripe.com/4gM9AUd2bdvpd0q17y4c800"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            padding: "12px 20px",
            backgroundColor: "#7C3AED",
            color: "white",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "bold"
          }}
        >
          Start Early Access - $29
        </a>
      </div>
) : (
      <div 
        style={{ maxWidth: "700px",
                   margin: "0 auto" }}>
        <h1>Reading Practice</h1>

        <p>The quick brown fox jumps over the lazy dog.</p>

        <p style={{ fontWeight: "bold", 
                   color: "#7C3AED" }}>
          Step {readingStep} of 3
        </p>

        {readingStep === 1 && (
          <div>
          <h3>Step 1: Read</h3>
            <p>The quick brown fox jumps over the lazy dog.</p>
          </div>
        )}

        {readingStep === 2 && (
          <div>
            <h3>Step 2: Read More</h3>
            <p>
              Reading tools can help learners hear words, understand vocabulary,
              and build confidence.
            </p>
          </div>
        )}

        {readingStep === 3 && (
          <div>
            <h3>Step 3: Quick Check</h3>
            <p>What can reading tools help learners build?</p>

            <button onClick={() => setSelectedAnswer("confidence")}>
              Confidence
            </button>

            <button onClick={() => setSelectedAnswer("confusion")}>
              Confusion
            </button>

            <button onClick={() => setSelectedAnswer("silence")}>
              Silence
            </button>
            {selectedAnswer === "confidence" && (
              <div style={{ marginTop: "16px" }}>
                <p style={{ color: "green", 
                           fontWeight: "bold" }}>
                  Correct!
                </p>

                <button
                  onClick={() => setShowPaywall(true)}
                  style={{
                    marginTop: "10px",
                    padding: "10px 18px",
                    backgroundColor: "#7C3AED",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer"
                  }}
                >
                  Unlock Full Access
                </button>
              </div>
            )}
          </div>
        )}
        <div style={{ marginTop: "20px" }}>
    {readingStep > 1 && (
    <button onClick={() => setReadingStep(readingStep - 1)}>
      Back
    </button>
  )}

  {readingStep < 3 && (
    <button onClick={() => setReadingStep(readingStep + 1)}>
      Continue →
    </button>
  )}
</div>

  {showPaywall && (
  <div style={{ marginTop: "24px", textAlign: "center" }}>
    <h2>Unlock Full NeuroRead</h2>

    <p>
      Personalized AI reading support built to help learners grow confidence.
    </p>

    <a
      href="https://buy.stripe.com/4gM9AUd2bdvpd0q17y4c800"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-block",
        padding: "12px 24px",
        backgroundColor: "#7C3AED",
        color: "white",
        borderRadius: "8px",
        textDecoration: "none",
        marginTop: "16px",
      }}
    >
      Upgrade Now - $29
    </a>

    <br />
    <br />
    <button
      onClick={() => {
        setStarted(false);
        setShowPaywall(false);
      }}
      style={{
        padding: "10px 16px",
        backgroundColor: "#666",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
      }}
      >
    
      Back
    </button>
  </div>
  )}
   </div>
    )}
    </div>
);
}

  
