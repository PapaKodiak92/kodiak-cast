import type { ChecklistItem, PodcastBlueprint, PodcastInputs } from '../types';

const WORKSPACE_STORAGE_KEY = 'kodiak-cast:workspace:v1';

type WorkspacePayload = {
  inputs: PodcastInputs;
  blueprint: PodcastBlueprint;
  launchItems: ChecklistItem[];
};

export interface SavedWorkspace extends WorkspacePayload {
  version: 1;
  savedAt: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isPodcastInputs(value: unknown): value is PodcastInputs {
  if (!isRecord(value)) {
    return false;
  }

  return ['showName', 'niche', 'audience', 'tone', 'format', 'cadence', 'goal'].every(
    (key) => typeof value[key] === 'string'
  );
}

function isChecklist(value: unknown): value is ChecklistItem[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        isRecord(item) &&
        typeof item.id === 'string' &&
        typeof item.label === 'string' &&
        typeof item.done === 'boolean'
    )
  );
}

function isBlueprint(value: unknown): value is PodcastBlueprint {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.name === 'string' &&
    typeof value.tagline === 'string' &&
    typeof value.description === 'string' &&
    typeof value.listenerPromise === 'string' &&
    isStringArray(value.format) &&
    isStringArray(value.pillars) &&
    Array.isArray(value.firstEpisodes) &&
    isChecklist(value.launchChecklist)
  );
}

function isSavedWorkspace(value: unknown): value is SavedWorkspace {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value.version === 1 &&
    typeof value.savedAt === 'string' &&
    isPodcastInputs(value.inputs) &&
    isBlueprint(value.blueprint) &&
    isChecklist(value.launchItems)
  );
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

    const workspace = JSON.parse(rawWorkspace) as unknown;

    if (!isSavedWorkspace(workspace)) {
      window.localStorage.removeItem(WORKSPACE_STORAGE_KEY);
      return null;
    }

    return workspace;
  } catch {
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
