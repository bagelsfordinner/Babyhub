export type VaultEntryType = 'letter' | 'recommendation' | 'memory' | 'advice';

export interface VaultEntry {
  id: string;
  title: string;
  content: string;
  type: VaultEntryType;
  recipient: 'baby' | 'parents';
  author_id: string;
  created_at: string;
  author?: {
    display_name: string;
    avatar_url?: string;
  };
}