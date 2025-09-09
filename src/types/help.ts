export type HelpItemType = 'counter' | 'task' | 'registry';

export interface HelpItem {
  id: string;
  title: string;
  type: HelpItemType;
  target_count?: number;
  current_count?: number;
  completed: boolean;
  category?: string;
  created_by: string;
  created_at: string;
  creator?: {
    display_name: string;
    avatar_url?: string;
  };
}