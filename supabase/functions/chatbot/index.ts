import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'want to die', 'better off dead',
  'self-harm', 'hurt myself', 'cutting', 'overdose', 'no reason to live'
];

const CRISIS_RESPONSE = {
  type: 'crisis',
  message: `I'm concerned about what you've shared. Your safety matters, and I want to make sure you get the right support.

**If you're in immediate danger, please:**
- Call **9152987821** (iCall Psychosocial Helpline)
- Call **1860-2662-345** (Vandrevala Foundation – 24/7)
- Call **080-46110007** (NIMHANS Helpline)
- Go to your nearest hospital emergency ward
- Contact your campus counseling centre

You don't have to face this alone. A trained counsellor can help you through this moment.

Would you like me to share some campus resources?`
};

const SYSTEM_INSTRUCTION = `You are a supportive, empathetic mental health assistant for a student wellness platform. Your role is to:

1. Provide psychoeducation about mental health topics (anxiety, stress, depression, sleep)
2. Suggest evidence-based coping strategies
3. Offer encouragement and validation
4. Guide users to appropriate resources

STRICT BOUNDARIES - You must NEVER:
- Provide clinical diagnoses
- Prescribe medications or dosages
- Offer therapy or treatment
- Claim to replace professional help
- Give medical advice

ALWAYS:
- Remind users this is a self-help tool, not therapy
- Encourage seeking professional help for persistent issues
- If someone mentions crisis/self-harm, immediately provide crisis resources
- Keep responses warm, brief (2-3 paragraphs max), and actionable
- Use "I" statements sparingly, focus on "you"

If asked about your capabilities, explain you're an AI assistant for mental wellness education and support, not a therapist.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [] } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const lowerMessage = message.toLowerCase();

    // Check for crisis keywords first
    const hasCrisisKeyword = CRISIS_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
    if (hasCrisisKeyword) {
      return new Response(JSON.stringify(CRISIS_RESPONSE), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Try FAQ matching first
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      
      const { data: faqs } = await supabase
        .from('chatbot_faqs')
        .select('*')
        .eq('is_active', true);

      if (faqs && faqs.length > 0) {
        for (const faq of faqs) {
          const keywords = faq.keywords || [];
          const matchesKeyword = keywords.some((kw: string) => lowerMessage.includes(kw.toLowerCase()));
          const matchesQuestion = faq.question.toLowerCase().split(' ').some((word: string) => 
            word.length > 3 && lowerMessage.includes(word)
          );

          if (matchesKeyword || matchesQuestion) {
            return new Response(JSON.stringify({
              type: 'faq',
              message: faq.answer,
              category: faq.category
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
      }
    }

    // Build Gemini conversation contents
    // Map prior history to Gemini format (role: user/model)
    const recentHistory = conversationHistory.slice(-6);
    const contents = recentHistory.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Add current user message
    contents.push({ role: 'user', parts: [{ text: message }] });

    // Call Gemini 1.5 Flash API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }],
          },
          contents,
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          type: 'error',
          message: "I'm a bit busy right now. Please try again in a moment." 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text 
      ?? "I'm here to listen. Could you tell me more about what's on your mind?";

    return new Response(JSON.stringify({
      type: 'ai',
      message: aiMessage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    return new Response(JSON.stringify({ 
      type: 'error',
      message: 'I encountered an issue. Please try again or reach out to campus support if you need immediate help.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
