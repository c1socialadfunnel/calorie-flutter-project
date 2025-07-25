import { supabase } from './supabase'
import type { Database } from './supabase'

export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type FoodLog = Database['public']['Tables']['food_logs']['Row']
export type ChatSession = Database['public']['Tables']['chat_sessions']['Row']
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row']

export interface AnalyzeFoodRequest {
  description?: string;
  imageUrl?: string;
}

export interface AnalyzeFoodResponse {
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

export interface LogFoodRequest {
  foodItemId?: string;
  customFoodName?: string;
  servingSizeG: number;
  calories: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  loggedAt?: string;
}

export interface DailyNutritionSummary {
  date: string;
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  targetCalories?: number;
  meals: {
    breakfast: FoodLog[];
    lunch: FoodLog[];
    dinner: FoodLog[];
    snack: FoodLog[];
  };
}

export interface SendMessageRequest {
  sessionId?: string;
  message: string;
}

export interface SendMessageResponse {
  sessionId: string;
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
}

export interface UpdateProfileRequest {
  gender?: 'male' | 'female';
  heightCm?: number;
  birthDate?: string;
  currentWeightKg?: number;
  targetWeightKg?: number;
  activityLevel?: 'sedentary' | 'low_active' | 'active' | 'very_active';
  planType?: 'steady' | 'intensive' | 'accelerated';
}

// User Profile API
export const userApi = {
  async getProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) throw error
    return { user, profile }
  },

  async updateProfile(updates: UpdateProfileRequest) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Calculate daily calorie target if we have enough information
    let dailyCalorieTarget: number | undefined;
    if (updates.currentWeightKg && updates.heightCm && updates.activityLevel && updates.planType && updates.gender) {
      dailyCalorieTarget = calculateDailyCalorieTarget(
        updates.currentWeightKg,
        updates.heightCm,
        updates.gender,
        updates.activityLevel,
        updates.planType
      );
    }

    // Convert camelCase to snake_case for database columns
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.gender) updateData.gender = updates.gender;
    if (updates.heightCm) updateData.height_cm = updates.heightCm;
    if (updates.birthDate) updateData.birth_date = updates.birthDate;
    if (updates.currentWeightKg) updateData.current_weight_kg = updates.currentWeightKg;
    if (updates.targetWeightKg) updateData.target_weight_kg = updates.targetWeightKg;
    if (updates.activityLevel) updateData.activity_level = updates.activityLevel;
    if (updates.planType) updateData.plan_type = updates.planType;
    if (dailyCalorieTarget) updateData.daily_calorie_target = dailyCalorieTarget;

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getSubscriptionStatus() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('subscription_status, subscription_id, subscription_current_period_end, plan_type')
      .eq('user_id', user.id)
      .single()

    if (error) throw error
    return profile
  },

  async deleteAccount() {
    const { data, error } = await supabase.functions.invoke('delete-account', {
      body: {}
    })

    if (error) throw error
    return data
  }
}

// Food API
export const foodApi = {
  async analyzeFood(request: AnalyzeFoodRequest): Promise<AnalyzeFoodResponse> {
    const { data, error } = await supabase.functions.invoke('analyze-food', {
      body: request
    })

    if (error) throw error
    return data
  },

  async logFood(request: LogFoodRequest): Promise<FoodLog> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('food_logs')
      .insert({
        user_id: user.id,
        food_item_id: request.foodItemId,
        custom_food_name: request.customFoodName,
        serving_size_g: request.servingSizeG,
        calories: request.calories,
        protein_g: request.proteinG || 0,
        carbs_g: request.carbsG || 0,
        fat_g: request.fatG || 0,
        meal_type: request.mealType,
        logged_at: request.loggedAt || new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getDailyNutrition(date: string): Promise<DailyNutritionSummary> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Get user's calorie target
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('daily_calorie_target')
      .eq('user_id', user.id)
      .single()

    // Get all food logs for the date
    const { data: foodLogs, error } = await supabase
      .from('food_logs')
      .select(`
        *,
        food_items (
          name,
          brand
        )
      `)
      .eq('user_id', user.id)
      .gte('logged_at', `${date}T00:00:00.000Z`)
      .lt('logged_at', `${date}T23:59:59.999Z`)
      .order('logged_at', { ascending: true })

    if (error) throw error

    // Calculate totals
    const totalCalories = foodLogs.reduce((sum, log) => sum + log.calories, 0)
    const totalProteinG = foodLogs.reduce((sum, log) => sum + log.protein_g, 0)
    const totalCarbsG = foodLogs.reduce((sum, log) => sum + log.carbs_g, 0)
    const totalFatG = foodLogs.reduce((sum, log) => sum + log.fat_g, 0)

    // Group by meal type
    const meals = {
      breakfast: foodLogs.filter(log => log.meal_type === 'breakfast'),
      lunch: foodLogs.filter(log => log.meal_type === 'lunch'),
      dinner: foodLogs.filter(log => log.meal_type === 'dinner'),
      snack: foodLogs.filter(log => log.meal_type === 'snack')
    }

    return {
      date,
      totalCalories,
      totalProteinG,
      totalCarbsG,
      totalFatG,
      targetCalories: profile?.daily_calorie_target || undefined,
      meals
    }
  }
}

// Coach API
export const coachApi = {
  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    const { data, error } = await supabase.functions.invoke('send-message', {
      body: request
    })

    if (error) throw error
    return data
  },

  async getChatHistory(): Promise<{ sessions: ChatSession[] }> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: sessions, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return { sessions }
  },

  async getSessionMessages(sessionId: string): Promise<{ session: ChatSession; messages: ChatMessage[] }> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single()

    if (sessionError) throw sessionError

    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    if (messagesError) throw messagesError

    return { session, messages }
  }
}

function calculateDailyCalorieTarget(
  weightKg: number,
  heightCm: number,
  gender: string,
  activityLevel: string,
  planType: string
): number {
  // Basic BMR calculation using Mifflin-St Jeor Equation
  // Assuming age 30 for simplification (would need birth_date for accurate calculation)
  const age = 30;
  let bmr: number;
  
  if (gender === "male") {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }

  // Activity multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    low_active: 1.375,
    active: 1.55,
    very_active: 1.725
  };

  const tdee = bmr * activityMultipliers[activityLevel as keyof typeof activityMultipliers];

  // Plan deficits
  const planDeficits = {
    steady: 500,    // 1 lb/week
    intensive: 1000, // 2 lb/week
    accelerated: 750 // 1.5 lb/week
  };

  const deficit = planDeficits[planType as keyof typeof planDeficits];
  return Math.round(tdee - deficit);
}
