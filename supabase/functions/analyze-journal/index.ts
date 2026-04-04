run import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    if (!content || content.trim().length < 10) {
      return new Response(JSON.stringify({ 
        risk_level: 'low',
        mood_tags: [],
        analysis: { summary: 'Entry too short for analysis' }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a mental health screening assistant analyzing journal entries for risk indicators. 
            
Analyze the journal entry and return a JSON object with:
1. risk_level: "low", "medium", or "high"
   - "high": mentions of self-harm, suicide, hopelessness, wanting to die, or severe distress
   - "medium": significant sadness, anxiety, isolation, or emotional struggles
   - "low": normal emotional expression, positive or neutral content
2. mood_tags: array of 2-4 mood/emotion tags detected (e.g., "anxious", "hopeful", "stressed", "calm")
3. summary: brief 1-2 sentence supportive observation (do not diagnose, just acknowledge feelings)

IMPORTANT: Be sensitive but accurate. Flag genuine risk indicators appropriately.
Return ONLY valid JSON, no other text.`
          },
          {
            role: 'user',
            content: `Analyze this journal entry:\n\n${content}`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_journal",
              description: "Analyze journal entry for risk level and mood",
              parameters: {
                type: "object",
                properties: {
                  risk_level: { type: "string", enum: ["low", "medium", "high"] },
                  mood_tags: { type: "array", items: { type: "string" } },
                  summary: { type: "string" }
                },
                required: ["risk_level", "mood_tags", "summary"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_journal" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response:', JSON.stringify(data));
    
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const analysis = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({
        risk_level: analysis.risk_level || 'low',
        mood_tags: analysis.mood_tags || [],
        analysis: { summary: analysis.summary || '' }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fallback if no tool call
    return new Response(JSON.stringify({
      risk_level: 'low',
      mood_tags: [],
      analysis: { summary: 'Unable to analyze entry' }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-journal:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      risk_level: 'low',
      mood_tags: [],
      analysis: { summary: 'Analysis unavailable' }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
