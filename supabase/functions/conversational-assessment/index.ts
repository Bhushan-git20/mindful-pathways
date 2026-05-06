import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_INSTRUCTION = `You are MindMate, an intelligent, empathetic clinical AI companion for students.
Your goal is to conduct a conversational mental health assessment (replacing static PHQ-9/GAD-7 forms).
You must evaluate the user's mood, anxiety, and safety through natural, warm conversation.

INSTRUCTIONS:
1. Ask ONE thoughtful question at a time. Keep it conversational and empathetic.
2. If you DO NOT have enough context to confidently assess their risk level (usually takes 3-4 turns), set "isComplete": false and provide your next question in "replyText".
3. If the user mentions self-harm, suicide, or severe crisis, IMMEDIATELY set "isComplete": true and "riskLevel": "High". Provide a highly supportive "replyText" indicating you are connecting them to help.
4. Once you have a clear picture of their wellness, set "isComplete": true.
5. When "isComplete": true, you MUST provide a "riskLevel" (Low, Medium, High), a "clinicalSummary" (for a counselor), and "suggestedHabits" (1-3 actionable smart habits based on their specific concerns, e.g., "Sleep routine", "5-min mindfulness").

STRICT RULE: Your output MUST be ONLY a raw JSON object matching the exact schema below. DO NOT wrap the JSON in markdown formatting (like \`\`\`json). Just return the raw JSON object.

{
  "isComplete": boolean,
  "replyText": "Your conversational response or next question to the user",
  "riskLevel": "Low" | "Medium" | "High" | null,
  "clinicalSummary": "Brief clinical summary of their state if complete, else null",
  "suggestedHabits": ["Habit 1", "Habit 2"]
}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [] } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Please enter a message.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const recentHistory = conversationHistory.slice(-10); // Keep last 10 messages for context
    const messages = [
      { role: 'system', content: SYSTEM_INSTRUCTION },
      ...recentHistory.map((msg: { role: string; content: string }) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    let aiMessage = data.choices?.[0]?.message?.content || "{}";
    
    // Clean up potential markdown formatting if the LLM ignores instructions
    aiMessage = aiMessage.replace(/```json/g, '').replace(/```/g, '').trim();

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiMessage);
    } catch (e) {
      console.error("Failed to parse JSON from AI:", aiMessage);
      parsedResponse = {
        isComplete: false,
        replyText: "I'm having a little trouble understanding right now. Could you tell me more about how you're feeling?",
        riskLevel: null,
        clinicalSummary: null,
        suggestedHabits: []
      };
    }

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Conversational assessment error:', error);
    return new Response(JSON.stringify({ 
      error: 'I encountered an issue connecting. Please try again.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
