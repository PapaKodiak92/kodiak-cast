import { generateBlueprint, generateGuestLeads, generateStarterKit } from './blueprint';
import type { ChecklistItem, EpisodeIdea, GuestLead, PodcastInputs, PodcastProject, WorkspacePayload } from '../types';

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

type SavedWorkspaceV2 = WorkspacePayload & {
  version: 2;
  savedAt: string;
};

export interface SavedWorkspace extends WorkspacePayload {
  version: 3;
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

function normalizeLaunchItem(item: ChecklistItem, index = 0): ChecklistItem {
  const status = item.status ?? (item.done ? 'done' : 'todo');

  return {
    ...item,
    done: status === 'done',
    status,
    priority: item.priority ?? (index < 3 ? 'high' : 'medium'),
    dueDate: item.dueDate ?? '',
    notes: item.notes ?? ''
  };
}

function normalizeLaunchItems(items: ChecklistItem[]) {
  return items.map(normalizeLaunchItem);
}

function buildProjectEpisodes(projectId: string, blueprint: PodcastProject['blueprint']) {
  return cloneEpisodes(blueprint.firstEpisodes, projectId);
}

function buildProjectGuests(projectId: string, inputs: PodcastInputs) {
  return cloneGuests(generateGuestLeads(inputs), projectId);
}

function normalizeProject(project: PodcastProject): PodcastProject {
  const blueprint = project.blueprint ?? generateBlueprint(project.inputs);
  const launchItems = project.launchItems?.length ? normalizeLaunchItems(project.launchItems) : normalizeLaunchItems(blueprint.launchChecklist);
  const episodes = project.episodes?.length ? project.episodes : buildProjectEpisodes(project.id, blueprint);
  const guests = project.guests?.length ? project.guests : buildProjectGuests(project.id, project.inputs);

  return {
    ...project,
    blueprint: {
      ...blueprint,
      launchChecklist: normalizeLaunchItems(blueprint.launchChecklist)
    },
    launchItems,
    episodes,
    guests,
    starterKit: project.starterKit ?? generateStarterKit(project.inputs, blueprint)
  };
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
    launchItems: normalizeLaunchItems(blueprint.launchChecklist),
    episodes: buildProjectEpisodes(EXAMPLE_PROJECT_ID, blueprint),
    guests: buildProjectGuests(EXAMPLE_PROJECT_ID, exampleInputs),
    starterKit: generateStarterKit(exampleInputs, blueprint)
  };

  return {
    version: 3,
    savedAt: now,
    projects: [project],
    activeProjectId: project.id
  };
}

function isWorkspacePayload(value: unknown): value is SavedWorkspace | SavedWorkspaceV2 {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const workspace = value as SavedWorkspace | SavedWorkspaceV2;
  return (workspace.version === 2 || workspace.version === 3) && Array.isArray(workspace.projects) && typeof workspace.activeProjectId === 'string';
}

function normalizeWorkspace(workspace: SavedWorkspace | SavedWorkspaceV2): SavedWorkspace {
  return {
    version: 3,
    savedAt: workspace.savedAt,
    projects: workspace.projects.map(normalizeProject),
    activeProjectId: workspace.activeProjectId
  };
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
    launchItems: normalizeLaunchItems(legacy.launchItems),
    episodes: buildProjectEpisodes('project-legacy', legacy.blueprint),
    guests: buildProjectGuests('project-legacy', legacy.inputs),
    starterKit: generateStarterKit(legacy.inputs, legacy.blueprint)
  };

  return {
    version: 3,
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
      return normalizeWorkspace(parsedWorkspace);
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
    version: 3,
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
