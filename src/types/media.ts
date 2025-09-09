export type MediaType = 'photo' | 'video';

export interface Media {
  id: string;
  url: string;
  caption?: string;
  type: MediaType;
  uploaded_by: string;
  event_date?: string;
  age_tag?: string;
  created_at: string;
  uploader?: {
    display_name: string;
    avatar_url?: string;
  };
}

export interface MediaUploadData {
  caption?: string;
  eventDate?: string;
  ageTag?: string;
}