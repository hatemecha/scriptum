export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          display_name: string | null;
          avatar_url: string | null;
          plan: string;
          preferences: Json;
          onboarding_completed_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id: string;
          email?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          plan?: string;
          preferences?: Json;
          onboarding_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          plan?: string;
          preferences?: Json;
          onboarding_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          owner_profile_id: string;
          title: string;
          author: string | null;
          description: string | null;
          language: string;
          status: string;
          current_snapshot_id: string | null;
          latest_revision: number;
          last_edited_at: string;
          created_at: string;
          updated_at: string;
          archived_at: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id: string;
          owner_profile_id: string;
          title: string;
          author?: string | null;
          description?: string | null;
          language?: string;
          status?: string;
          current_snapshot_id?: string | null;
          latest_revision?: number;
          last_edited_at?: string;
          created_at?: string;
          updated_at?: string;
          archived_at?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          owner_profile_id?: string;
          title?: string;
          author?: string | null;
          description?: string | null;
          language?: string;
          status?: string;
          current_snapshot_id?: string | null;
          latest_revision?: number;
          last_edited_at?: string;
          created_at?: string;
          updated_at?: string;
          archived_at?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      document_snapshots: {
        Row: {
          id: string;
          project_id: string;
          owner_profile_id: string;
          document_id: string;
          revision: number;
          snapshot_kind: string;
          document_schema_version: number;
          document_data: Json;
          created_at: string;
        };
        Insert: {
          id: string;
          project_id: string;
          owner_profile_id: string;
          document_id: string;
          revision: number;
          snapshot_kind?: string;
          document_schema_version: number;
          document_data: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          owner_profile_id?: string;
          document_id?: string;
          revision?: number;
          snapshot_kind?: string;
          document_schema_version?: number;
          document_data?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      soft_delete_project: {
        Args: { p_project_id: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
