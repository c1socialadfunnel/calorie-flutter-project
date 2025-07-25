import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SendMessageRequest {
  sessionId?: string;
  message: string;
}

interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface SendMessageResponse {
  sessionId: string;
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
}

async function generateAIResponseWithGemini(userMessage: string, userProfile?: any, recentMessages?: any[]): Promise<string> {
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
  if (!geminiApiKey) {
    throw new Error('Gemini API key not configured');
  }

  // Build context about the user
  let userContext = "";
  if (userProfile) {
    const { plan_type, daily_calorie_target, current_weight_kg, target_weight_kg, activity_level } = userProfile;
    userContext = `User Profile:
- Plan: ${plan_type || 'Not set'} (${daily_calorie_target || 'Unknown'} calories/day)
- Current Weight: ${current_weight_kg ? Math.round(current_weight_kg) + 'kg' : 'Not set'}
- Target Weight: ${target_weight_kg ? Math.round(target_weight_kg) + 'kg' : 'Not set'}
- Activity Level: ${activity_level || 'Not set'}
`;
  }

  // Build conversation history
  let conversationHistory = "";
  if (recentMessages && recentMessages.length > 0) {
    conversationHistory = "\nRecent conversation:\n" + 
      recentMessages.slice(-6).map(msg => `${msg.role}: ${msg.content}`).join('\n') + '\n';
  }

  const systemPrompt = `You are Calorie.Help AI, a friendly and knowledgeable nutrition coach and calorie tracking assistant. You help users achieve their health and weight goals through personalized nutrition guidance.

${userContext}

${conversationHistory}

Guidelines for responses:
- Be encouraging, supportive, and motivational
- Provide specific, actionable advice when possible
- Keep responses concise but informative (2-3 sentences usually)
- Use the user's profile information to personalize advice
- For food/calorie questions, be specific with numbers when helpful
- If asked about food analysis, mention they can use the photo/text analysis feature
- Stay focused on nutrition, health, and wellness topics
- Be conversational and friendly, not overly clinical

Current user message: "${userMessage}"

Respond as Calorie.Help AI:`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: systemPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 512,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('No response from Gemini API');
    }

    return generatedText.trim();

  } catch (error) {
    console.error('Gemini API error:', error);
    
    // Fallback to basic responses if Gemini fails
    return generateFallbackResponse(userMessage);
  }
}

function generateFallbackResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes("calorie") || lowerMessage.includes("food")) {
    return "I can help you track calories and analyze your food! You can take a photo of your meal or describe what you're eating, and I'll provide detailed nutritional information. What would you like to know about your food today?";
  } else if (lowerMessage.includes("meal") || lowerMessage.includes("recipe")) {
    return "I'd be happy to suggest meals that fit your daily calorie targets! Based on your current plan, I can recommend balanced meals with the right mix of protein, carbs, and healthy fats. What type of meal are you looking for?";
  } else if (lowerMessage.includes("weight") || lowerMessage.includes("goal")) {
    return "Great question about your weight goals! I'm here to help you stay on track with your plan. Remember, sustainable weight loss is about creating a consistent calorie deficit while maintaining proper nutrition. How has your progress been so far?";
  } else if (lowerMessage.includes("exercise") || lowerMessage.includes("workout")) {
    return "Exercise is a fantastic complement to your nutrition plan! While diet is the primary driver of weight loss, physical activity can help you burn additional calories and improve your overall health. What kind of activities do you enjoy?";
  } else if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
    return "Hello! I'm your personal nutrition coach from Calorie.Help, here to help you reach your health goals. I can assist with calorie counting, meal planning, nutrition advice, and keeping you motivated on your journey. What can I help you with today?";
  } else {
    return "I'm here to help with all your nutrition and health questions! Whether you need help tracking calories, planning meals, understanding nutrition, or staying motivated, I'm ready to assist. What specific area would you like to focus on?";
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Parse request body
    const { sessionId, message }: SendMessageRequest = await req.json()

    if (!message?.trim()) {
      throw new Error('Message is required')
    }

    let currentSessionId = sessionId;

    // Create new session if none provided
    if (!currentSessionId) {
      const { data: newSession, error: sessionError } = await supabaseClient
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          title: 'New Chat'
        })
        .select()
        .single()

      if (sessionError) {
        throw new Error('Failed to create chat session')
      }

      currentSessionId = newSession.id;
    } else {
      // Verify session belongs to user
      const { data: session, error: sessionError } = await supabaseClient
        .from('chat_sessions')
        .select('id')
        .eq('id', currentSessionId)
        .eq('user_id', user.id)
        .single()

      if (sessionError || !session) {
        throw new Error('Chat session not found')
      }
    }

    // Get user profile for context
    const { data: userProfile } = await supabaseClient
      .from('user_profiles')
      .select('plan_type, daily_calorie_target, current_weight_kg, target_weight_kg, activity_level')
      .eq('user_id', user.id)
      .single()

    // Get recent messages for context
    const { data: recentMessages } = await supabaseClient
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', currentSessionId)
      .order('created_at', { ascending: false })
      .limit(6)

    // Save user message
    const { data: userMessage, error: userMessageError } = await supabaseClient
      .from('chat_messages')
      .insert({
        session_id: currentSessionId,
        role: 'user',
        content: message.trim()
      })
      .select()
      .single()

    if (userMessageError) {
      throw new Error('Failed to save user message')
    }

    // Generate AI response using Gemini
    const aiResponse = await generateAIResponseWithGemini(
      message.trim(), 
      userProfile, 
      recentMessages?.reverse()
    );

    // Save AI response
    const { data: assistantMessage, error: assistantMessageError } = await supabaseClient
      .from('chat_messages')
      .insert({
        session_id: currentSessionId,
        role: 'assistant',
        content: aiResponse
      })
      .select()
      .single()

    if (assistantMessageError) {
      throw new Error('Failed to save assistant message')
    }

    // Update session timestamp
    await supabaseClient
      .from('chat_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', currentSessionId)

    const response: SendMessageResponse = {
      sessionId: currentSessionId,
      userMessage: {
        id: userMessage.id,
        sessionId: userMessage.session_id,
        role: userMessage.role,
        content: userMessage.content,
        createdAt: userMessage.created_at
      },
      assistantMessage: {
        id: assistantMessage.id,
        sessionId: assistantMessage.session_id,
        role: assistantMessage.role,
        content: assistantMessage.content,
        createdAt: assistantMessage.created_at
      }
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Send message error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
