import { starterEpisodes, starterGuests } from '../data/starterData';
import { generateBlueprint } from './blueprint';
import type { EpisodeIdea, GuestLead, PodcastInputs, PodcastProject, WorkspacePayload } from '../types';

const WORKSPACE_STORAGE_KEY = 'kodiak-cast:workspace:v1';
const EXAMPLE_PROJECT_ID = 'project-example-kodiak-cast';

const exampleInputs: PodcastInputs = {
  showName: 'Kodiak Cast',
  niche: 'building podcasts, personal discipline, creative momentum, and turning ideas into products',
  audience: 'people who want to start a real podcast but need structure and accountability',
  tone: 'honest, practical, focused, and motivational',
  format: 'solo episodes, guest interviews, and weekly build-in-public updates',
  cadence: 'weekly',
  goal: 'prove the system by using it to launch and maintain the show ourselves'
};

type LegacySavedWorkspace = {
  version: 1;
  savedAt: string;
  inputs?: PodcastProject['inputs'];
  blueprint?: PodcastProject['blueprint'];
  launchItems?: PodcastProject['launchItems'];
};

export interface SavedWorkspace extends WorkspacePayload {
  version: 2;
  savedAt: string;
}

function cloneEpisodes(episodes: EpisodeIdea[], namespace: string) {
  return episodes.map((episode, index) => ({
    ...episode,
    id: `${namespace}-episode-${index + 1}-${episode.id}`,
    segments: [...episode.segments],
    clipIdeas: [...episode.clipIdeas]
  }));
}

function cloneGuests(guests: GuestLead[], namespace: string) {
  return guests.map((guest, index) => ({
    ...guest,
    id: `${namespace}-guest-${index + 1}-${guest.id}`
  }));
}

function createExampleWorkspace(): SavedWorkspace {
  const now = new Date().toISOString();
  const blueprint = generateBlueprint(exampleInputs);
  const project: PodcastProject = {
    id: EXAMPLE_PROJECT_ID,
    name: 'Kodiak Cast',
    createdAt: now,
    updatedAt: now,
    inputs: exampleInputs,
    blueprint,
    launchItems: blueprint.launchChecklist,
    episodes: [
      ...cloneEpisodes(blueprint.firstEpisodes, EXAMPLE_PROJECT_ID),
      ...cloneEpisodes(starterEpisodes, `${EXAMPLE_PROJECT_ID}-starter`)
    ],
    guests: cloneGuests(starterGuests, EXAMPLE_PROJECT_ID)
  };

  return {
    version: 2,
    savedAt: now,
    projects: [project],
    activeProjectId: project.id
  };
}

function isWorkspacePayload(value: unknown): value is SavedWorkspace {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const workspace = value as SavedWorkspace;
  return workspace.version === 2 && Array.isArray(workspace.projects) && typeof workspace.activeProjectId === 'string';
}

function migrateLegacyWorkspace(value: unknown): SavedWorkspace | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const legacy = value as LegacySavedWorkspace;

  if (!legacy.inputs || !legacy.blueprint || !legacy.launchItems) {
    return null;
  }

  const now = legacy.savedAt || new Date().toISOString();
  const project: PodcastProject = {
    id: 'project-legacy',
    name: legacy.inputs.showName || legacy.blueprint.name || 'Untitled Podcast',
    createdAt: now,
    updatedAt: now,
    inputs: legacy.inputs,
    blueprint: legacy.blueprint,
    launchItems: legacy.launchItems,
    episodes: legacy.blueprint.firstEpisodes,
    guests: []
  };

  return {
    version: 2,
    savedAt: now,
    projects: [project],
    activeProjectId: project.id
  };
}

export function loadWorkspace(): SavedWorkspace | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawWorkspace = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);

    if (!rawWorkspace) {
      return createExampleWorkspace();
    }

    const parsedWorkspace = JSON.parse(rawWorkspace) as unknown;

    if (isWorkspacePayload(parsedWorkspace)) {
      return parsedWorkspace;
    }

    return migrateLegacyWorkspace(parsedWorkspace);
  } catch {
    window.localStorage.removeItem(WORKSPACE_STORAGE_KEY);
    return createExampleWorkspace();
  }
}

export function saveWorkspace(payload: WorkspacePayload): SavedWorkspace | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const workspace: SavedWorkspace = {
    version: 2,
    savedAt: new Date().toISOString(),
    ...payload
  };

  try {
    window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(workspace));
    return workspace;
  } catch {
    return null;
  }
}

export function clearWorkspace() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(WORKSPACE_STORAGE_KEY);
}
