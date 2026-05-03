export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Enums matching actual Supabase enums
export type ChannelEnum = 'Ads' | 'Content' | 'Tools' | 'Events' | 'SEO'
export type ActivityStatusEnum = 'Planned' | 'Completed'
export type PlanTypeEnum = 'free' | 'pro' | 'enterprise'

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          plan_type: PlanTypeEnum
          created_at: string
        }
        Insert: {
          id: string
          name?: string
          email?: string
          plan_type?: PlanTypeEnum
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          plan_type?: PlanTypeEnum
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      businesses: {
        Row: {
          id: string
          user_id: string
          business_name: string
          industry_type: string
          monthly_budget: number
          goal: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_name: string
          industry_type?: string
          monthly_budget?: number
          goal?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_name?: string
          industry_type?: string
          monthly_budget?: number
          goal?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "businesses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      marketing_plans: {
        Row: {
          id: string
          business_id: string
          month: number
          year: number
          total_budget: number
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          month: number
          year: number
          total_budget?: number
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          month?: number
          year?: number
          total_budget?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_plans_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          }
        ]
      }
      budget_allocations: {
        Row: {
          id: string
          business_id: string
          channel: ChannelEnum
          percentage: number
          allocated_amount: number
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          channel: ChannelEnum
          percentage?: number
          allocated_amount?: number
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          channel?: ChannelEnum
          percentage?: number
          allocated_amount?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_allocations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          }
        ]
      }
      activities: {
        Row: {
          id: string
          plan_id: string
          title: string
          channel: ChannelEnum
          activity_date: string
          budget_used: number
          status: ActivityStatusEnum
          created_at: string
        }
        Insert: {
          id?: string
          plan_id: string
          title: string
          channel: ChannelEnum
          activity_date: string
          budget_used?: number
          status?: ActivityStatusEnum
          created_at?: string
        }
        Update: {
          id?: string
          plan_id?: string
          title?: string
          channel?: ChannelEnum
          activity_date?: string
          budget_used?: number
          status?: ActivityStatusEnum
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "marketing_plans"
            referencedColumns: ["id"]
          }
        ]
      }
      templates: {
        Row: {
          id: string
          name: string
          industry_type: string
          description: string
          default_allocations: Json
          default_activities: Json
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          industry_type?: string
          description?: string
          default_allocations?: Json
          default_activities?: Json
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          industry_type?: string
          description?: string
          default_allocations?: Json
          default_activities?: Json
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      channel_enum: ChannelEnum
      activity_status_enum: ActivityStatusEnum
      plan_type_enum: PlanTypeEnum
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  T extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
> = (DefaultSchema["Tables"] & DefaultSchema["Views"])[T] extends { Row: infer R } ? R : never

export type TablesInsert<
  T extends keyof DefaultSchema["Tables"]
> = DefaultSchema["Tables"][T] extends { Insert: infer I } ? I : never

export type TablesUpdate<
  T extends keyof DefaultSchema["Tables"]
> = DefaultSchema["Tables"][T] extends { Update: infer U } ? U : never

export const Constants = {
  public: {
    Enums: {
      channel_enum: ['Ads', 'Content', 'Tools', 'Events', 'SEO'] as const,
      activity_status_enum: ['Planned', 'Completed'] as const,
      plan_type_enum: ['free', 'pro', 'enterprise'] as const,
    },
  },
} as const
