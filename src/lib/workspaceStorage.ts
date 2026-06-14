import type { PodcastProject, WorkspacePayload } from '../types';

const WORKSPACE_STORAGE_KEY = 'kodiak-cast:workspace:v1';

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
      return null;
    }

    const parsedWorkspace = JSON.parse(rawWorkspace) as unknown;

    if (isWorkspacePayload(parsedWorkspace)) {
      return parsedWorkspace;
    }

    return migrateLegacyWorkspace(parsedWorkspace);
  } catch {
    window.localStorage.removeItem(WORKSPACE_STORAGE_KEY);
    return null;
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
