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
      <div style={{ maxWidth:
     "700px", margin: "0 auto",
     textAlign: "center" }}>
        
        <h1> Welcome to NeuroRead Early
          Access 🎉 </h1> 
          
      <p style={{ fontWeight: "bold",
      marginTop: "10px", color:
        "#2e7d32",
         fontSize: "16px" }}>
      ✅ Your early access spot is confirmed. 
      </p>
      <p style={{ marginTop: "12px", lineHeight: "1.7" }}>
      You're officially part of NeuroRead Early Access. We'll follow up shortly with your onboarding details and next steps.
    </p>
      <p style={{ fontWeight: "bold",
      marginTop: "16px",
       fontSize: "16px" }}>
        You're helping to shape the future of reading for neurodiverse learners.
      </p> 
      <p style={{ color: "#d32f2f",
      marginTop: "12px",
      fontWeight: "600",
      textAlign: "center" 
       }}>
        Limited early access spots are filling fast.
      </p> 
    <div
    style={{
    marginTop: "24px",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "12px",
    backgroundColor:
      "#f9f9f9",
    textAlign: "left" }}
    >
      <h3> What happens next
      </h3>
    
    
    <ul style={{ lineHeight: "1.8" }}>
    <li> You'll receive confirmation and onboarding details.</li>
    <li> You'll be among the first users helping shape the product.</li>
    <li> We'll contact you with access details and updates as new features roll out.</li>
      </ul>
      </div>
      <button
     onClick={() =>
  (window.location.href = "/?start=true"
   )}
      style={{
        marginTop: "24px",
        padding: "12px 20px",
        backgroundColor:
          "#7C3AED",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "bold"
      }}
     >
        Start Your Reading Journey 
          </button>
        <p style={{ fontSize: "13px",
         color: "#666", marginTop:
         "24px" }}> 
          Check your email for your access details.
        </p> 
          </div>
  
      ) : ! started ? ( 
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
          <p style={{ fontWeight: "bold", color: "#7C3AED" }}>
            Lesson Progress: Step {readingStep} of 3
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
      {readingStep === 1 && (
        <>
          <h3>Step 1: Read</h3>
          <p>The quick brown fox jumps over the lazy dog.</p>
        </>
  )}
        {readingStep === 2 && (
        <>
      <h3>Step 2: Read More</h3>
      <p>
        Reading tools can help learners hear words, understand vocabulary, and
        build confidence one sentence at a time.
      </p>
    </>
  )}

  {readingStep === 3 && (
      <>
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
        <p style={{ color: "green" }}>Correct!</p>
      )}
      </>
  )}
</div>

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

  {readingStep === 3 && selectedAnswer === "confidence" && (
    <button onClick={() => setShowPaywall(true)}>
      Unlock Full Access
    </button>
  )}
</div>    
            style={{ marginTop: "20px",
              padding: "10px 18px",
          backgroundColor: "#111827",
                    color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer", 
          fontWeight: "bold" }}
            >
            
          ) : (
          <div
            style={{
              marginTop: "24px", padding: "20px", border: "2px solid #7C3AED", borderRadius: "12px", backgroundColor: "faf5ff",
                textAlign: "center" }}
          >
          <h2> Unlock Full NeuroRead</h2>
           <p> Unlock personalized AI reading support built to help neurodiverse learners improve confidence, focus, and comprehension.
           </p>
          <ul style={{
            listStyle: "none",
            padding: 0,
            marginTop: "16px",
            textAlign: "left",
            display: "inline-block"
          }}
          >
            <li style={{ marginBottom: "8px" }}>
              <span style={{ color: "22c55e", marginRight: "8px" }}
            >
             {"\u2713"}
            </span>
             Personalized AI reading support
            </li>
            <li style={{ marginBottom: "8px" }} >
            <span style={{ color: "#22c55e", marginRight: "8px" }}
              >
              {"\u2713"}
            </span>
             Built for neurodiverse learners
              </li>
            <li>
            <span style={{ color: "#22c55e", marginRight: "8px" }}
              >
              {"\u2713"}
            </span>
              Improve focus, comprehension,  and confidence
            </li>
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
    );
}
  
