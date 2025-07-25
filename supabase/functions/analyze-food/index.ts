import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalyzeFoodRequest {
  description?: string;
  imageUrl?: string;
}

interface AnalyzeFoodResponse {
  foodName: string;
  estimatedServingSize: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  confidence: number;
  additionalNutrition?: {
    fiber?: number;
    sugar?: number;
    sodium?: number;
    cholesterol?: number;
    saturatedFat?: number;
    transFat?: number;
    potassium?: number;
    calcium?: number;
    iron?: number;
  };
  vitaminsAndMinerals?: {
    [key: string]: string;
  };
  healthInsights?: string[];
  ingredients?: string[];
}

async function analyzeWithGeminiVision(imageUrl: string): Promise<AnalyzeFoodResponse> {
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
  if (!geminiApiKey) {
    throw new Error('Gemini API key not configured');
  }

  // Convert data URL to base64 if needed
  let base64Image: string;
  let mimeType: string;

  if (imageUrl.startsWith('data:')) {
    const [header, data] = imageUrl.split(',');
    base64Image = data;
    mimeType = header.split(':')[1].split(';')[0];
  } else {
    throw new Error('Invalid image format. Expected data URL.');
  }

  const prompt = `You are a nutrition expert and food recognition specialist. Analyze this food image and provide comprehensive nutritional information.

Please respond with ONLY a JSON object in this exact format (no additional text):
{
  "foodName": "specific food name",
  "estimatedServingSize": "serving size description (e.g., '1 medium apple (182g)' or '1 cup pasta (140g)')",
  "calories": number,
  "proteinG": number,
  "carbsG": number,
  "fatG": number,
  "confidence": number between 0 and 1,
  "additionalNutrition": {
    "fiber": number,
    "sugar": number,
    "sodium": number,
    "cholesterol": number,
    "saturatedFat": number,
    "transFat": number,
    "potassium": number,
    "calcium": number,
    "iron": number
  },
  "vitaminsAndMinerals": {
    "vitaminC": "amount with unit (e.g., '15mg' or '20% DV')",
    "vitaminA": "amount with unit",
    "vitaminD": "amount with unit",
    "vitaminE": "amount with unit",
    "vitaminK": "amount with unit",
    "thiamine": "amount with unit",
    "riboflavin": "amount with unit",
    "niacin": "amount with unit",
    "vitaminB6": "amount with unit",
    "folate": "amount with unit",
    "vitaminB12": "amount with unit",
    "magnesium": "amount with unit",
    "phosphorus": "amount with unit",
    "zinc": "amount with unit",
    "selenium": "amount with unit"
  },
  "healthInsights": [
    "brief health insight about this food",
    "another insight about nutritional benefits or concerns"
  ],
  "ingredients": [
    "main ingredient 1",
    "main ingredient 2",
    "main ingredient 3"
  ]
}

Guidelines:
- Identify the food items in the image as accurately as possible
- Estimate realistic serving sizes based on what you see
- Provide comprehensive nutritional data for the estimated serving
- Include vitamins and minerals that are significant in this food (omit if negligible)
- Health insights should be brief, factual, and helpful
- List main ingredients you can identify
- Confidence should reflect how certain you are about the food identification
- All nutritional values should be for the estimated serving size, not per 100g
- If multiple food items are visible, analyze them as a combined meal`;

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
            parts: [
              {
                text: prompt
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Image
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
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

    // Clean the response and parse JSON
    const cleanedText = generatedText.replace(/```json\n?|\n?```/g, '').trim();
    const nutritionData = JSON.parse(cleanedText);

    // Validate the response structure
    if (!nutritionData.foodName || typeof nutritionData.calories !== 'number') {
      throw new Error('Invalid response format from Gemini API');
    }

    // Clean and validate the response
    return {
      foodName: nutritionData.foodName,
      estimatedServingSize: nutritionData.estimatedServingSize || '1 serving',
      calories: Math.round(nutritionData.calories),
      proteinG: Math.round((nutritionData.proteinG || 0) * 10) / 10,
      carbsG: Math.round((nutritionData.carbsG || 0) * 10) / 10,
      fatG: Math.round((nutritionData.fatG || 0) * 10) / 10,
      confidence: Math.min(Math.max(nutritionData.confidence || 0.8, 0), 1),
      additionalNutrition: nutritionData.additionalNutrition ? {
        fiber: nutritionData.additionalNutrition.fiber ? Math.round(nutritionData.additionalNutrition.fiber * 10) / 10 : undefined,
        sugar: nutritionData.additionalNutrition.sugar ? Math.round(nutritionData.additionalNutrition.sugar * 10) / 10 : undefined,
        sodium: nutritionData.additionalNutrition.sodium ? Math.round(nutritionData.additionalNutrition.sodium) : undefined,
        cholesterol: nutritionData.additionalNutrition.cholesterol ? Math.round(nutritionData.additionalNutrition.cholesterol) : undefined,
        saturatedFat: nutritionData.additionalNutrition.saturatedFat ? Math.round(nutritionData.additionalNutrition.saturatedFat * 10) / 10 : undefined,
        transFat: nutritionData.additionalNutrition.transFat ? Math.round(nutritionData.additionalNutrition.transFat * 10) / 10 : undefined,
        potassium: nutritionData.additionalNutrition.potassium ? Math.round(nutritionData.additionalNutrition.potassium) : undefined,
        calcium: nutritionData.additionalNutrition.calcium ? Math.round(nutritionData.additionalNutrition.calcium) : undefined,
        iron: nutritionData.additionalNutrition.iron ? Math.round(nutritionData.additionalNutrition.iron * 10) / 10 : undefined,
      } : undefined,
      vitaminsAndMinerals: nutritionData.vitaminsAndMinerals || undefined,
      healthInsights: Array.isArray(nutritionData.healthInsights) ? nutritionData.healthInsights.slice(0, 3) : undefined,
      ingredients: Array.isArray(nutritionData.ingredients) ? nutritionData.ingredients.slice(0, 5) : undefined,
    };

  } catch (error) {
    console.error('Gemini Vision API error:', error);
    
    // Fallback to basic analysis if Gemini fails
    return fallbackImageAnalysis();
  }
}

async function analyzeWithGeminiText(description: string): Promise<AnalyzeFoodResponse> {
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
  if (!geminiApiKey) {
    throw new Error('Gemini API key not configured');
  }

  const prompt = `You are a nutrition expert. Analyze the following food description and provide detailed nutritional information.

Food description: "${description}"

Please respond with ONLY a JSON object in this exact format (no additional text):
{
  "foodName": "specific food name",
  "estimatedServingSize": "serving size description (e.g., '1 medium apple (182g)')",
  "calories": number,
  "proteinG": number,
  "carbsG": number,
  "fatG": number,
  "confidence": number between 0 and 1,
  "additionalNutrition": {
    "fiber": number,
    "sugar": number,
    "sodium": number,
    "cholesterol": number,
    "saturatedFat": number,
    "transFat": number,
    "potassium": number,
    "calcium": number,
    "iron": number
  },
  "vitaminsAndMinerals": {
    "vitaminC": "amount with unit",
    "vitaminA": "amount with unit",
    "other significant vitamins/minerals": "amount with unit"
  },
  "healthInsights": [
    "brief health insight about this food",
    "another insight about nutritional benefits"
  ],
  "ingredients": [
    "main ingredient 1",
    "main ingredient 2"
  ]
}

Guidelines:
- Be as accurate as possible with nutritional values
- Use standard serving sizes when possible
- Include comprehensive nutritional data
- Provide helpful health insights
- If the description is vague, make reasonable assumptions
- Confidence should reflect how certain you are about the analysis
- All nutritional values should be for the estimated serving size, not per 100g`;

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
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 1,
            maxOutputTokens: 1024,
          },
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

    // Clean the response and parse JSON
    const cleanedText = generatedText.replace(/```json\n?|\n?```/g, '').trim();
    const nutritionData = JSON.parse(cleanedText);

    // Validate the response structure
    if (!nutritionData.foodName || typeof nutritionData.calories !== 'number') {
      throw new Error('Invalid response format from Gemini API');
    }

    return {
      foodName: nutritionData.foodName,
      estimatedServingSize: nutritionData.estimatedServingSize || '1 serving',
      calories: Math.round(nutritionData.calories),
      proteinG: Math.round((nutritionData.proteinG || 0) * 10) / 10,
      carbsG: Math.round((nutritionData.carbsG || 0) * 10) / 10,
      fatG: Math.round((nutritionData.fatG || 0) * 10) / 10,
      confidence: Math.min(Math.max(nutritionData.confidence || 0.7, 0), 1),
      additionalNutrition: nutritionData.additionalNutrition,
      vitaminsAndMinerals: nutritionData.vitaminsAndMinerals,
      healthInsights: nutritionData.healthInsights,
      ingredients: nutritionData.ingredients,
    };

  } catch (error) {
    console.error('Gemini API error:', error);
    
    // Fallback to basic analysis if Gemini fails
    return fallbackAnalysis(description);
  }
}

function fallbackImageAnalysis(): AnalyzeFoodResponse {
  return {
    foodName: "Mixed Food Item",
    estimatedServingSize: "1 serving (estimated)",
    calories: 200,
    proteinG: 10,
    carbsG: 25,
    fatG: 8,
    confidence: 0.3,
    healthInsights: ["Unable to analyze image automatically", "Please try describing the food instead"],
  };
}

function fallbackAnalysis(description: string): AnalyzeFoodResponse {
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes("apple")) {
    return { 
      foodName: "Apple", 
      estimatedServingSize: "1 medium (182g)", 
      calories: 95, 
      proteinG: 0.5, 
      carbsG: 25, 
      fatG: 0.3, 
      confidence: 0.8,
      additionalNutrition: {
        fiber: 4.4,
        sugar: 19,
        potassium: 195,
        calcium: 11
      },
      vitaminsAndMinerals: {
        vitaminC: "8.4mg",
        vitaminK: "4mcg"
      },
      healthInsights: ["Good source of fiber", "Contains antioxidants"],
      ingredients: ["Apple"]
    };
  } else if (lowerDesc.includes("banana")) {
    return { 
      foodName: "Banana", 
      estimatedServingSize: "1 medium (118g)", 
      calories: 105, 
      proteinG: 1.3, 
      carbsG: 27, 
      fatG: 0.4, 
      confidence: 0.8,
      additionalNutrition: {
        fiber: 3.1,
        sugar: 14,
        potassium: 422,
        magnesium: 32
      },
      vitaminsAndMinerals: {
        vitaminB6: "0.4mg",
        vitaminC: "10.3mg"
      },
      healthInsights: ["High in potassium", "Good source of vitamin B6"],
      ingredients: ["Banana"]
    };
  } else if (lowerDesc.includes("chicken breast")) {
    return { 
      foodName: "Chicken Breast", 
      estimatedServingSize: "100g", 
      calories: 165, 
      proteinG: 31, 
      carbsG: 0, 
      fatG: 3.6, 
      confidence: 0.7,
      additionalNutrition: {
        cholesterol: 85,
        sodium: 74,
        potassium: 256
      },
      vitaminsAndMinerals: {
        niacin: "14.8mg",
        vitaminB6: "0.9mg",
        phosphorus: "228mg"
      },
      healthInsights: ["Excellent source of lean protein", "Low in saturated fat"],
      ingredients: ["Chicken breast"]
    };
  } else {
    return { 
      foodName: "Mixed Food", 
      estimatedServingSize: "1 serving (100g)", 
      calories: 150, 
      proteinG: 8, 
      carbsG: 20, 
      fatG: 5, 
      confidence: 0.3,
      healthInsights: ["Nutritional analysis may not be accurate", "Consider providing more specific details"]
    };
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
    const { description, imageUrl }: AnalyzeFoodRequest = await req.json()

    if (!description?.trim() && !imageUrl) {
      throw new Error('Either description or image is required')
    }

    let response: AnalyzeFoodResponse;

    // Analyze based on input type
    if (imageUrl) {
      response = await analyzeWithGeminiVision(imageUrl);
    } else if (description) {
      response = await analyzeWithGeminiText(description.trim());
    } else {
      throw new Error('Invalid input');
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Food analysis error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
