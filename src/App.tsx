import { useState } from "react";

export default function App() {
  const [started, setStarted] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

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

  <button>Start Free Demo</button>
  <br />
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
    marginTop: "12px",
    fontWeight: "bold"
  }}
>
  Start Early Access - $29
</a>
<ul style={{ marginTop: "10px",fontSize:"14px", lineHeight:"1.6", listStyle: "none", padding: 0 }}>
<li> ✔ Personalized AI reading support</li>
<li> ✔ Built for neurodiverse learners</li>
<li> ✔ Improve focus,comprehension, and confidence</li>
</ul> 
         
<p style={{ color: "red",
fontWeight: "bold" }}>
   Limited early access spots available
</p>
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
          {!showPaywall ? (
          <button onClick={ () =>
            setShowPaywall(true)}
            style={{ marginTop: "20px",
              padding: "10px 18px",
          backgroundColor: "#111827",
                    color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer", 
          fontWeight: "bold" }}
            >
            Continue Reading ->
          </button>
          ) : (
          <div
            style={{
              marginTop: "24px", padding: "20px", border: "2px solid #7C3AED", borderRadius: "12px", backgroundColor: "faf5ff",
                textAlign: "center" }}
          >
          <h2> Unlock Full NeuroRead</h2>
           <p> Unlock personalized AI reading support designed to help neurodiverse learners build confidence, focus, and comprehension. 
           </p>
          <ul style={{ listStyle: "none", padding: 0, lineHeight: "1.6" }}>
            <li> Personalized AI reading support </li>
            <li> Built for neurodiverse learners </li>
            <li> Improve focus, comprehension,  and confidence </li>
          </ul>
          <a
            href="https://buy.stripe.com/4gM9AUd2bdvpd0q17y4c800"
            target="_blank" 
            rel="noopener noreferrer"
            style={{ display: "inline-block",
                    padding: "12px 20px",
                    backgroundColor: "#7C3AED",
                    color: "white", 
                    borderRadius: "8px",
                    textDecoration: "none",
                    fontWeight: "bold", 
                    marginTop: "10px"
                   }}
          >
          Start Early Access - $29
          </a>
        </div>
      )}

          <button
            onClick={() => {setStarted(false);
            setShowPaywall(false);}}
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
  )}
