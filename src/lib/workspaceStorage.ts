import type { ChecklistItem, PodcastBlueprint, PodcastInputs } from '../types';

const WORKSPACE_STORAGE_KEY = 'kodiak-cast:workspace:v1';

export type WorkspacePayload = {
  inputs: PodcastInputs;
  blueprint: PodcastBlueprint;
  launchItems: ChecklistItem[];
};

export interface SavedWorkspace extends WorkspacePayload {
  version: 1;
  savedAt: string;
}

export function loadWorkspace(): SavedWorkspace | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawWorkspace = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);
    return rawWorkspace ? (JSON.parse(rawWorkspace) as SavedWorkspace) : null;
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
    version: 1,
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
