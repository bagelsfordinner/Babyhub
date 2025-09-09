export interface TimelineEvent {
  id: string;
  title: string;
  event_date: string;
  description?: string;
  created_by: string;
  created_at: string;
  creator?: {
    display_name: string;
    avatar_url?: string;
  };
}