export interface Comment {
  id: string;
  content: string;
  media_id: string;
  author_id: string;
  created_at: string;
  author?: {
    display_name: string;
    avatar_url?: string;
  };
}