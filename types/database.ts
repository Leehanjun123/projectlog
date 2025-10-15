export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          is_anonymous: boolean
          anonymous_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          is_anonymous?: boolean
          anonymous_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          is_anonymous?: boolean
          anonymous_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          goal: string | null
          status: string
          started_at: string
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          goal?: string | null
          status?: string
          started_at?: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          goal?: string | null
          status?: string
          started_at?: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      updates: {
        Row: {
          id: string
          project_id: string
          user_id: string
          content: string
          challenges: string | null
          mood: string | null
          time_spent: number | null
          day_number: number | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          content: string
          challenges?: string | null
          mood?: string | null
          time_spent?: number | null
          day_number?: number | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          content?: string
          challenges?: string | null
          mood?: string | null
          time_spent?: number | null
          day_number?: number | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          update_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          update_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          update_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          update_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          update_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          update_id?: string
          user_id?: string
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan: string
          status: string
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: string
          status?: string
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: string
          status?: string
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
