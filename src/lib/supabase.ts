import { createClient } from '@supabase/supabase-js';

// TODO: Replace these with your actual Supabase project details
const supabaseUrl = 'https://limlwtqlxrymgdhpzazk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpbWx3dHFseHJ5bWdkaHB6YXprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDQ3MTQsImV4cCI6MjA2OTAyMDcxNH0.5kHwYXPlu5ErRBhEGbZZ81YmK_xBTWpgQkMZZZRBIoU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          gender: 'male' | 'female' | null
          height_cm: number | null
          birth_date: string | null
          current_weight_kg: number | null
          target_weight_kg: number | null
          activity_level: 'sedentary' | 'low_active' | 'active' | 'very_active' | null
          plan_type: 'steady' | 'intensive' | 'accelerated' | null
          daily_calorie_target: number | null
          stripe_customer_id: string | null
          subscription_id: string | null
          subscription_status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete' | 'incomplete_expired' | 'trialing' | null
          subscription_current_period_start: string | null
          subscription_current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          gender?: 'male' | 'female' | null
          height_cm?: number | null
          birth_date?: string | null
          current_weight_kg?: number | null
          target_weight_kg?: number | null
          activity_level?: 'sedentary' | 'low_active' | 'active' | 'very_active' | null
          plan_type?: 'steady' | 'intensive' | 'accelerated' | null
          daily_calorie_target?: number | null
          stripe_customer_id?: string | null
          subscription_id?: string | null
          subscription_status?: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete' | 'incomplete_expired' | 'trialing' | null
          subscription_current_period_start?: string | null
          subscription_current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          gender?: 'male' | 'female' | null
          height_cm?: number | null
          birth_date?: string | null
          current_weight_kg?: number | null
          target_weight_kg?: number | null
          activity_level?: 'sedentary' | 'low_active' | 'active' | 'very_active' | null
          plan_type?: 'steady' | 'intensive' | 'accelerated' | null
          daily_calorie_target?: number | null
          stripe_customer_id?: string | null
          subscription_id?: string | null
          subscription_status?: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete' | 'incomplete_expired' | 'trialing' | null
          subscription_current_period_start?: string | null
          subscription_current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      food_logs: {
        Row: {
          id: string
          user_id: string
          food_item_id: string | null
          custom_food_name: string | null
          serving_size_g: number
          calories: number
          protein_g: number
          carbs_g: number
          fat_g: number
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          logged_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          food_item_id?: string | null
          custom_food_name?: string | null
          serving_size_g: number
          calories: number
          protein_g?: number
          carbs_g?: number
          fat_g?: number
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          logged_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          food_item_id?: string | null
          custom_food_name?: string | null
          serving_size_g?: number
          calories?: number
          protein_g?: number
          carbs_g?: number
          fat_g?: number
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          logged_at?: string
          created_at?: string
        }
      }
      chat_sessions: {
        Row: {
          id: string
          user_id: string
          title: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          session_id: string
          role: 'user' | 'assistant'
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          role: 'user' | 'assistant'
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          role?: 'user' | 'assistant'
          content?: string
          created_at?: string
        }
      }
    }
  }
}
