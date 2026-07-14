export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, age, readingLevel, challenge, goal } = req.body ?? {};

  if (!name || !age || !readingLevel || !challenge || !goal) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  const prompt = `You are a specialist in literacy support for neurodiverse children.

Build a 5-day reading lesson plan for a child with these details:
- Name: ${name}
- Age: ${age}
- Reading level: ${readingLevel}
- Main challenge: ${challenge}
- Parent goal: ${goal}

Return ONLY valid JSON, no markdown, in this exact format:
{
  "weekTheme": "short theme title",
  "lessons": [
    {
      "day": "Day 1 — Monday",
      "title": "Lesson title",
      "passage": "2-3 short sentences appropriate for their level.",
      "tip": "One specific reading tip (15 words max)",
      "question": "One comprehension question",
      "answers": ["Correct answer", "Wrong answer 1", "Wrong answer 2"],
      "correct": "Correct answer"
    }
  ]
}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic error:", err);
      return res.status(502).json({ error: "AI service error" });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "";
    const clean = text.replace(/```json|```/g, "").trim();
    const plan = JSON.parse(clean);

    plan.lessons = plan.lessons.map((lesson) => ({
      ...lesson,
      answers: [...lesson.answers].sort(() => Math.random() - 0.5),
    }));

    return res.status(200).json(plan);
  } catch (err) {
    console.error("generate-plan error:", err);
    return res.status(500).json({ error: "Failed to generate plan" });
  }
}
