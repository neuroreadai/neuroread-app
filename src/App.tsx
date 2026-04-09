import { useState } from "react";

export default function App() {
  const [started, setStarted] = useState(false);

  return (
    <div style={{ fontFamily: "Arial", padding: "40px" }}>
      {!started ? (
       <div style={{ textAlign: "center" }}>
  <h1>🧠 NeuroRead</h1>
  <p>AI-powered reading support for neurodiverse learners.</p>

  {/* Start Reading Button */}
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

  {/* Try Demo Button */}   
  <br />
  <a
    href="https://www.figma.com/proto/t4QZKpzfCLU7gACNGCeujK/Welcome-Screen--Community-?node-id=4-8&t=zOogO8SF6CHrGVRG-1
    target="_blank"
    rel="noopener noreferrer"
    style={{
      display: "inline-block",
      padding: "12px 20px",
      backgroundColor: "#7C3AED",
      color: "white",
      borderRadius: "8px",
      textDecoration: "none",
      marginTop: "12px",
      fontWeight: "bold"
    }}
  >
    Try Demo
  </a>
</div>
      ) : (
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <h1>Reading Practice</h1>
          <p>
            Welcome to NeuroRead. This is your first reading screen.
          </p>
          <div
            style={{
              marginTop: "20px",
              padding: "20px",
              border: "1px solid #ddd",
              borderRadius: "10px",
              backgroundColor: "#f9f9f9",
              lineHeight: "1.7"
            }}
          >
            The quick brown fox jumps over the lazy dog. Reading tools can help
            learners hear words, understand vocabulary, and build confidence one
            sentence at a time.
          </div>

          <button
            onClick={() => setStarted(false)}
            style={{
              padding: "10px 16px",
              marginTop: "20px",
              backgroundColor: "#666",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            Back
          </button>
        </div>
    )}
    </div>
  );
}
