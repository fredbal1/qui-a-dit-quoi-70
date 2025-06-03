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
      achievements: {
        Row: {
          description: string | null
          emoji: string | null
          id: string
          name: string | null
          rarity: string | null
        }
        Insert: {
          description?: string | null
          emoji?: string | null
          id: string
          name?: string | null
          rarity?: string | null
        }
        Update: {
          description?: string | null
          emoji?: string | null
          id?: string
          name?: string | null
          rarity?: string | null
        }
        Relationships: []
      }
      answers: {
        Row: {
          content: string | null
          id: string
          is_bluff: boolean | null
          player_id: string | null
          round_id: string | null
          timestamp: string | null
        }
        Insert: {
          content?: string | null
          id?: string
          is_bluff?: boolean | null
          player_id?: string | null
          round_id?: string | null
          timestamp?: string | null
        }
        Update: {
          content?: string | null
          id?: string
          is_bluff?: boolean | null
          player_id?: string | null
          round_id?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "answers_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      game_history: {
        Row: {
          coins_gained: number | null
          completed_at: string | null
          final_position: number | null
          final_score: number | null
          game_id: string | null
          id: string
          player_id: string | null
          xp_gained: number | null
        }
        Insert: {
          coins_gained?: number | null
          completed_at?: string | null
          final_position?: number | null
          final_score?: number | null
          game_id?: string | null
          id?: string
          player_id?: string | null
          xp_gained?: number | null
        }
        Update: {
          coins_gained?: number | null
          completed_at?: string | null
          final_position?: number | null
          final_score?: number | null
          game_id?: string | null
          id?: string
          player_id?: string | null
          xp_gained?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "game_history_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_history_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      game_players: {
        Row: {
          coins: number | null
          game_id: string | null
          id: string
          is_host: boolean | null
          level: number | null
          score: number | null
          user_id: string | null
          xp: number | null
        }
        Insert: {
          coins?: number | null
          game_id?: string | null
          id?: string
          is_host?: boolean | null
          level?: number | null
          score?: number | null
          user_id?: string | null
          xp?: number | null
        }
        Update: {
          coins?: number | null
          game_id?: string | null
          id?: string
          is_host?: boolean | null
          level?: number | null
          score?: number | null
          user_id?: string | null
          xp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "game_players_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_players_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          code: string
          created_at: string | null
          current_game: string | null
          current_round: number | null
          host: string | null
          id: string
          phase: string | null
          settings: Json
          status: string | null
          total_rounds: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          current_game?: string | null
          current_round?: number | null
          host?: string | null
          id?: string
          phase?: string | null
          settings: Json
          status?: string | null
          total_rounds?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          current_game?: string | null
          current_round?: number | null
          host?: string | null
          id?: string
          phase?: string | null
          settings?: Json
          status?: string | null
          total_rounds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "games_host_fkey"
            columns: ["host"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          created_at: string | null
          email: string | null
          id: string
          pseudo: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          pseudo: string
        }
        Update: {
          avatar?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          pseudo?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          ambiance: string | null
          category: string | null
          game_type: string | null
          id: string
          text: string
        }
        Insert: {
          ambiance?: string | null
          category?: string | null
          game_type?: string | null
          id: string
          text: string
        }
        Update: {
          ambiance?: string | null
          category?: string | null
          game_type?: string | null
          id?: string
          text?: string
        }
        Relationships: []
      }
      rounds: {
        Row: {
          completed_at: string | null
          game_id: string | null
          id: string
          mini_game_id: string | null
          question_id: string | null
          round_number: number | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          game_id?: string | null
          id?: string
          mini_game_id?: string | null
          question_id?: string | null
          round_number?: number | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          game_id?: string | null
          id?: string
          mini_game_id?: string | null
          question_id?: string | null
          round_number?: number | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rounds_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_items: {
        Row: {
          description: string | null
          emoji: string | null
          id: string
          name: string
          price: number | null
          rarity: string | null
          type: string | null
        }
        Insert: {
          description?: string | null
          emoji?: string | null
          id: string
          name: string
          price?: number | null
          rarity?: string | null
          type?: string | null
        }
        Update: {
          description?: string | null
          emoji?: string | null
          id?: string
          name?: string
          price?: number | null
          rarity?: string | null
          type?: string | null
        }
        Relationships: []
      }
      user_purchases: {
        Row: {
          id: string
          item_id: string | null
          price: number | null
          purchased_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          item_id?: string | null
          price?: number | null
          purchased_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          item_id?: string | null
          price?: number | null
          purchased_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_purchases_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "shop_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats: {
        Row: {
          achievements: string[] | null
          best_streak: number | null
          bluffs_detected: number | null
          bluffs_successful: number | null
          coins: number | null
          games_played: number | null
          games_won: number | null
          level: number | null
          titles: string[] | null
          total_xp: number | null
          user_id: string
        }
        Insert: {
          achievements?: string[] | null
          best_streak?: number | null
          bluffs_detected?: number | null
          bluffs_successful?: number | null
          coins?: number | null
          games_played?: number | null
          games_won?: number | null
          level?: number | null
          titles?: string[] | null
          total_xp?: number | null
          user_id: string
        }
        Update: {
          achievements?: string[] | null
          best_streak?: number | null
          bluffs_detected?: number | null
          bluffs_successful?: number | null
          coins?: number | null
          games_played?: number | null
          games_won?: number | null
          level?: number | null
          titles?: string[] | null
          total_xp?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      votes: {
        Row: {
          answer_id: string | null
          id: string
          player_id: string | null
          round_id: string | null
          target_player_id: string | null
          timestamp: string | null
          vote_type: string | null
        }
        Insert: {
          answer_id?: string | null
          id?: string
          player_id?: string | null
          round_id?: string | null
          target_player_id?: string | null
          timestamp?: string | null
          vote_type?: string | null
        }
        Update: {
          answer_id?: string | null
          id?: string
          player_id?: string | null
          round_id?: string | null
          target_player_id?: string | null
          timestamp?: string | null
          vote_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "votes_answer_id_fkey"
            columns: ["answer_id"]
            isOneToOne: false
            referencedRelation: "answers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "rounds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_target_player_id_fkey"
            columns: ["target_player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_game: {
        Args: { game_id: string }
        Returns: boolean
      }
      can_access_game_player: {
        Args: { player_user_id: string }
        Returns: boolean
      }
      is_game_host: {
        Args: { game_id: string }
        Returns: boolean
      }
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
