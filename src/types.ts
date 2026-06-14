export type EpisodeStatus =
  | 'idea'
  | 'outline'
  | 'scheduled'
  | 'recorded'
  | 'published';

export type GuestStatus = 'wishlist' | 'contacted' | 'scheduled' | 'recorded';

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
}

export interface GuestLead {
  id: string;
  name: string;
  fit: string;
  episodeAngle: string;
  status: GuestStatus;
}

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
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
}

export interface WorkspacePayload {
  projects: PodcastProject[];
  activeProjectId: string;
}
