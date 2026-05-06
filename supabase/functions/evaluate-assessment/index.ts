import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { responses, questions } = await req.json();

    const apiKey = Deno.env.get('LOVABLE_API_KEY') || Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error("Missing Gemini API key");
    }

    const prompt = `
    You are a clinical psychologist evaluator. A user has just completed a mental wellness assessment containing standard psychological questions (PHQ-9 and GAD-7).
    
    Here are the questions and the user's responses (0 = Not at all, 1 = Several days, 2 = More than half the days, 3 = Nearly every day):
    ${questions.map((q: any, i: number) => `Q: ${q.text} | Answer Score: ${responses[i]}`).join('\n')}

    Analyze these responses. Provide an honest, compassionate evaluation. DO NOT just add the scores up. Look at the context of what they are experiencing. Are they giving positive answers because they misunderstand the scale, or are they genuinely struggling? Provide a nuanced risk level.

    Respond in JSON format with exactly this structure:
    {
      "overallRisk": "low" | "medium" | "high",
      "overallInterpretation": "A 2-3 sentence compassionate, professional summary of their current mental state based on their specific answers."
    }
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          responseMimeType: "application/json",
        }
      })
    });

    const data = await response.json();
    console.log("Gemini Response:", data);

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Invalid response from Gemini");
    }

    const aiResponse = JSON.parse(data.candidates[0].content.parts[0].text);

    return new Response(JSON.stringify(aiResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error evaluating assessment:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
