// src/api/openai.js
export async function openai(prompt) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo", // ✅ use 3.5 for now unless you're sure gpt-4 is active
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    }),
  });

  const data = await res.json();

  // 💥 If the request failed (bad key, wrong model, etc.)
  if (!res.ok) {
    console.error("OpenAI API error:", data);
    throw new Error(data.error?.message || "Unknown API error");
  }

  // 💥 If GPT returned something malformed
  if (!data.choices || !data.choices[0]?.message?.content) {
    console.error("Invalid GPT response:", data);
    throw new Error("Invalid GPT response");
  }

  return data.choices[0].message.content;
}
