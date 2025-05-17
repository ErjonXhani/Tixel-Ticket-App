export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      Events: {
        Row: {
          category: string | null
          description: string | null
          event_date: string
          event_id: number
          image: string | null
          organizer_name: string | null
          title: string
          venue_id: number | null
        }
        Insert: {
          category?: string | null
          description?: string | null
          event_date: string
          event_id?: number
          image?: string | null
          organizer_name?: string | null
          title: string
          venue_id?: number | null
        }
        Update: {
          category?: string | null
          description?: string | null
          event_date?: string
          event_id?: number
          image?: string | null
          organizer_name?: string | null
          title?: string
          venue_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "Venues"
            referencedColumns: ["venue_id"]
          },
        ]
      }
      Notifications: {
        Row: {
          created_at: string | null
          is_read: boolean | null
          message: string
          notification_id: number
          type: string | null
          user_id: number | null
        }
        Insert: {
          created_at?: string | null
          is_read?: boolean | null
          message: string
          notification_id?: number
          type?: string | null
          user_id?: number | null
        }
        Update: {
          created_at?: string | null
          is_read?: boolean | null
          message?: string
          notification_id?: number
          type?: string | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      ResaleListings: {
        Row: {
          expires_at: string | null
          listed_by: number | null
          resale_id: number
          resale_price: number | null
          resale_status: string | null
          ticket_id: number | null
        }
        Insert: {
          expires_at?: string | null
          listed_by?: number | null
          resale_id?: number
          resale_price?: number | null
          resale_status?: string | null
          ticket_id?: number | null
        }
        Update: {
          expires_at?: string | null
          listed_by?: number | null
          resale_id?: number
          resale_price?: number | null
          resale_status?: string | null
          ticket_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ResaleListings_listed_by_fkey"
            columns: ["listed_by"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ResaleListings_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: true
            referencedRelation: "Tickets"
            referencedColumns: ["ticket_id"]
          },
        ]
      }
      SystemLogs: {
        Row: {
          action_type: string | null
          description: string | null
          log_id: number
          timestamp: string | null
          user_id: number | null
        }
        Insert: {
          action_type?: string | null
          description?: string | null
          log_id?: number
          timestamp?: string | null
          user_id?: number | null
        }
        Update: {
          action_type?: string | null
          description?: string | null
          log_id?: number
          timestamp?: string | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "SystemLogs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      Tickets: {
        Row: {
          event_id: number | null
          owner_id: number | null
          seat_info: string | null
          status: string | null
          ticket_id: number
          ticket_type: string | null
        }
        Insert: {
          event_id?: number | null
          owner_id?: number | null
          seat_info?: string | null
          status?: string | null
          ticket_id?: number
          ticket_type?: string | null
        }
        Update: {
          event_id?: number | null
          owner_id?: number | null
          seat_info?: string | null
          status?: string | null
          ticket_id?: number
          ticket_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "Events"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "Tickets_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      Transactions: {
        Row: {
          buyer_id: number | null
          payment_method: string | null
          payment_status: string | null
          ticket_id: number | null
          total_amount: number | null
          transaction_id: number
          transaction_time: string | null
        }
        Insert: {
          buyer_id?: number | null
          payment_method?: string | null
          payment_status?: string | null
          ticket_id?: number | null
          total_amount?: number | null
          transaction_id?: number
          transaction_time?: string | null
        }
        Update: {
          buyer_id?: number | null
          payment_method?: string | null
          payment_status?: string | null
          ticket_id?: number | null
          total_amount?: number | null
          transaction_id?: number
          transaction_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Transactions_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "Transactions_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: true
            referencedRelation: "Tickets"
            referencedColumns: ["ticket_id"]
          },
        ]
      }
      Users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          is_verified: boolean | null
          password_hash: string
          phone_number: string | null
          role: string | null
          user_id: number
          username: string
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          is_verified?: boolean | null
          password_hash: string
          phone_number?: string | null
          role?: string | null
          user_id?: number
          username: string
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          is_verified?: boolean | null
          password_hash?: string
          phone_number?: string | null
          role?: string | null
          user_id?: number
          username?: string
        }
        Relationships: []
      }
      Venues: {
        Row: {
          capacity: number | null
          description: string | null
          location: string | null
          name: string
          venue_id: number
        }
        Insert: {
          capacity?: number | null
          description?: string | null
          location?: string | null
          name: string
          venue_id?: number
        }
        Update: {
          capacity?: number | null
          description?: string | null
          location?: string | null
          name?: string
          venue_id?: number
        }
        Relationships: []
      }
      Verifications: {
        Row: {
          doc_path: string | null
          doc_type: string | null
          status: string | null
          user_id: number | null
          verification_id: number
        }
        Insert: {
          doc_path?: string | null
          doc_type?: string | null
          status?: string | null
          user_id?: number | null
          verification_id?: number
        }
        Update: {
          doc_path?: string | null
          doc_type?: string | null
          status?: string | null
          user_id?: number | null
          verification_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "Verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
