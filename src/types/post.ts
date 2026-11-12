export type SectionId =
  | 'sec-1'
  | 'sec-2'
  | 'sec-3'
  | 'sec-4'
  | 'sec-5'
  | 'sec-6'
  | 'sec-7';

export type SectionFilter = 'all' | SectionId | 'external' | 'bookmarks';

export type StudyPostFormat =
  | 'flashcard_flip'
  | 'flashcard_carousel'
  | 'infographic'
  | 'short_video';

export interface Persona {
  id: string;
  handle: string;
  display_name: string;
  avatar_color: string;
  avatar_initials: string;
  section_id: SectionId;
  section_name: string;
  bio: string;
  verified: boolean;
}

export interface StudySlide {
  type: 'question' | 'answer' | 'concept' | 'trap';
  title: string;
  prompt?: string;
  body?: string;
  exam_tip?: string;
  media_url?: string | null;
}

export interface InfographicHotspot {
  id: string;
  x: number;
  y: number;
  label: string;
  detail: string;
}

export interface InfographicPayload {
  image_url: string;
  summary: string;
  hotspots: InfographicHotspot[];
}

export interface VideoReelPayload {
  video_url?: string | null;
  animated_svg_url?: string | null;
  duration_seconds: number;
  hook_overlay: string;
  key_takeaways: string[];
}

export interface StudyPost {
  id: string;
  created_at: string;
  batch_cycle: number;
  persona_id: string;
  section_id: SectionId;
  source: {
    book: string;
    chapter: string;
    pages: string;
    anchor_concept: string;
  };
  format: StudyPostFormat;
  slides: StudySlide[];
  infographic: InfographicPayload | null;
  video: VideoReelPayload | null;
  caption: string;
  tags: string[];
  difficulty: 1 | 2 | 3;
  is_external?: false;
}

export interface ExternalPost {
  id: string;
  created_at: string;
  is_external: true;
  platform: 'instagram' | 'linkedin';
  author: {
    handle: string;
    display_name: string;
    role: string;
    profile_url: string;
  };
  media_url: string | null;
  headline: string;
  caption: string;
  external_url: string;
  tags: string[];
}

export type TimelinePost = StudyPost | ExternalPost;

export interface ServerLoopState {
  needs_generation: boolean;
  completed_cycles: number;
  last_exhausted_at: string | null;
  last_generated_at: string;
  total_study_posts: number;
}

export interface FeedRequest {
  seed: number;
  section_filter: SectionFilter;
  seen_ids: string[];
  bookmarked_ids: string[];
  limit?: number;
}

export interface FeedResponse {
  posts: TimelinePost[];
  personas: Record<string, Persona>;
  unseen_remaining: number;
  total_study_posts: number;
  cycle_reset_triggered: boolean;
  server_state: ServerLoopState;
}

export function isValidStudyPost(raw: unknown): raw is StudyPost {
  if (!raw || typeof raw !== 'object') return false;
  const obj = raw as Record<string, unknown>;
  const validFormats = [
    'flashcard_flip',
    'flashcard_carousel',
    'infographic',
    'short_video',
  ];
  return (
    typeof obj.id === 'string' &&
    typeof obj.created_at === 'string' &&
    typeof obj.persona_id === 'string' &&
    typeof obj.section_id === 'string' &&
    typeof obj.format === 'string' &&
    validFormats.includes(obj.format) &&
    typeof obj.source === 'object' &&
    obj.source !== null &&
    Array.isArray(obj.slides) &&
    typeof obj.caption === 'string'
  );
}

export function isValidExternalPost(raw: unknown): raw is ExternalPost {
  if (!raw || typeof raw !== 'object') return false;
  const obj = raw as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    obj.is_external === true &&
    (obj.platform === 'instagram' || obj.platform === 'linkedin') &&
    typeof obj.author === 'object' &&
    obj.author !== null &&
    typeof obj.caption === 'string' &&
    typeof obj.external_url === 'string'
  );
}
