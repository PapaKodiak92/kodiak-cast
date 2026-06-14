export type EpisodeStatus =
  | 'idea'
  | 'outline'
  | 'outlined'
  | 'scheduled'
  | 'ready'
  | 'recorded'
  | 'published';

export type GuestStatus = 'wishlist' | 'contacted' | 'scheduled' | 'recorded' | 'passed';
export type LaunchStatus = 'todo' | 'doing' | 'done';
export type LaunchPriority = 'low' | 'medium' | 'high';

export interface PodcastInputs {
  showName: string;
  niche: string;
  audience: string;
  tone: string;
  format: string;
  cadence: string;
  goal: string;
}

export interface PodcastBlueprint {
  name: string;
  tagline: string;
  description: string;
  listenerPromise: string;
  format: string[];
  pillars: string[];
  firstEpisodes: EpisodeIdea[];
  launchChecklist: ChecklistItem[];
}

export interface EpisodeIdea {
  id: string;
  title: string;
  hook: string;
  status: EpisodeStatus;
  segments: string[];
  clipIdeas: string[];
  mainIdea?: string;
  listenerTakeaway?: string;
  notes?: string;
  publishDate?: string;
}

export interface GuestLead {
  id: string;
  name: string;
  fit: string;
  episodeAngle: string;
  status: GuestStatus;
  notes?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  status?: LaunchStatus;
  priority?: LaunchPriority;
  dueDate?: string;
  notes?: string;
}

export interface PodcastStarterKit {
  trailerScript: string;
  firstEpisodeOutline: string[];
  socialLaunchPosts: string[];
  recordingSetup: string[];
  weeklyWorkflow: string[];
}

export interface PodcastProject {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  inputs: PodcastInputs;
  blueprint: PodcastBlueprint;
  launchItems: ChecklistItem[];
  episodes: EpisodeIdea[];
  guests: GuestLead[];
  starterKit: PodcastStarterKit;
}

export interface WorkspacePayload {
  projects: PodcastProject[];
  activeProjectId: string;
}
