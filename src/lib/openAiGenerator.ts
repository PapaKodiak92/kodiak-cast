import { generateBlueprint, generateGuestLeads, generateStarterKit } from './blueprint';
import type { AiSettings } from './aiSettings';
import type {
  ChecklistItem,
  EpisodeIdea,
  EpisodeStatus,
  GuestLead,
  GuestStatus,
  LaunchPriority,
  LaunchStatus,
  PodcastBlueprint,
  PodcastInputs,
  PodcastStarterKit
} from '../types';

export interface AiStarterKitResult {
  blueprint: PodcastBlueprint;
  episodes: EpisodeIdea[];
  guests: GuestLead[];
  launchItems: ChecklistItem[];
  starterKit: PodcastStarterKit;
}

type UnknownRecord = Record<string, unknown>;

const episodeStatuses: EpisodeStatus[] = ['idea', 'outlined', 'ready', 'recorded', 'published'];
const guestStatuses: GuestStatus[] = ['wishlist', 'contacted', 'scheduled', 'recorded', 'passed'];
const launchStatuses: LaunchStatus[] = ['todo', 'doing', 'done'];
const launchPriorities: LaunchPriority[] = ['low', 'medium', 'high'];

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as UnknownRecord) : {};
}

function asString(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
}

function asStringArray(value: unknown, fallback: string[], minimum = 1) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const normalized = value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);

  return normalized.length >= minimum ? normalized : fallback;
}

function asEpisodeStatus(value: unknown): EpisodeStatus {
  if (typeof value === 'string') {
    const normalized = value === 'outline' || value === 'scheduled' ? (value === 'outline' ? 'outlined' : 'ready') : value;

    if (episodeStatuses.includes(normalized as EpisodeStatus)) {
      return normalized as EpisodeStatus;
    }
  }

  return 'idea';
}

function asGuestStatus(value: unknown): GuestStatus {
  return typeof value === 'string' && guestStatuses.includes(value as GuestStatus) ? (value as GuestStatus) : 'wishlist';
}

function asLaunchStatus(value: unknown): LaunchStatus {
  return typeof value === 'string' && launchStatuses.includes(value as LaunchStatus) ? (value as LaunchStatus) : 'todo';
}

function asLaunchPriority(value: unknown): LaunchPriority {
  return typeof value === 'string' && launchPriorities.includes(value as LaunchPriority) ? (value as LaunchPriority) : 'medium';
}

function makeId(prefix: string, index: number) {
  return `ai-${prefix}-${Date.now()}-${index + 1}`;
}

function extractJsonText(responseBody: UnknownRecord) {
  if (typeof responseBody.output_text === 'string') {
    return responseBody.output_text;
  }

  const output = Array.isArray(responseBody.output) ? responseBody.output : [];
  const textParts: string[] = [];

  for (const outputItem of output) {
    const content = Array.isArray(asRecord(outputItem).content) ? (asRecord(outputItem).content as unknown[]) : [];

    for (const contentItem of content) {
      const record = asRecord(contentItem);
      const text = record.text;

      if (typeof text === 'string') {
        textParts.push(text);
      }
    }
  }

  return textParts.join('\n').trim();
}

function parseJsonObject(text: string) {
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed) as UnknownRecord;
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');

    if (start === -1 || end === -1 || end <= start) {
      throw new Error('The AI response did not include a JSON object.');
    }

    return JSON.parse(trimmed.slice(start, end + 1)) as UnknownRecord;
  }
}

function normalizeBlueprint(value: unknown, fallbackBlueprint: PodcastBlueprint): PodcastBlueprint {
  const blueprint = asRecord(value);

  return {
    name: asString(blueprint.name, fallbackBlueprint.name),
    tagline: asString(blueprint.tagline, fallbackBlueprint.tagline),
    description: asString(blueprint.description, fallbackBlueprint.description),
    listenerPromise: asString(blueprint.listenerPromise, fallbackBlueprint.listenerPromise),
    format: asStringArray(blueprint.format, fallbackBlueprint.format, 3),
    pillars: asStringArray(blueprint.pillars, fallbackBlueprint.pillars, 3),
    firstEpisodes: fallbackBlueprint.firstEpisodes,
    launchChecklist: fallbackBlueprint.launchChecklist
  };
}

function normalizeEpisodes(value: unknown, fallbackEpisodes: EpisodeIdea[], desiredCount: number): EpisodeIdea[] {
  const source = Array.isArray(value) ? value : [];
  const normalized = source.map((episodeValue, index) => {
    const episode = asRecord(episodeValue);
    const fallback = fallbackEpisodes[index] ?? fallbackEpisodes[0];

    return {
      id: makeId('episode', index),
      title: asString(episode.title, fallback?.title ?? 'New episode idea'),
      hook: asString(episode.hook, fallback?.hook ?? 'Open with the real problem this episode solves.'),
      mainIdea: asString(episode.mainIdea, fallback?.mainIdea ?? fallback?.hook ?? 'Shape the main idea.'),
      listenerTakeaway: asString(
        episode.listenerTakeaway,
        fallback?.listenerTakeaway ?? 'Give the listener one clear next step.'
      ),
      notes: asString(episode.notes, ''),
      publishDate: asString(episode.publishDate, ''),
      status: asEpisodeStatus(episode.status),
      segments: asStringArray(
        episode.segments ?? episode.talkingPoints,
        fallback?.segments ?? ['Set up the problem', 'Tell the story', 'Give the listener a next action'],
        3
      ),
      clipIdeas: asStringArray(episode.clipIdeas, fallback?.clipIdeas ?? ['One punchy short-form lesson'], 1)
    };
  });

  const targetCount = Math.min(Math.max(desiredCount, 3), 25);
  const filler = fallbackEpisodes.slice(0, targetCount).map((episode, index) => ({
    ...episode,
    id: makeId('episode-fallback', index),
    status: asEpisodeStatus(episode.status)
  }));

  return normalized.length >= 3 ? normalized.slice(0, targetCount) : filler;
}

function normalizeGuests(value: unknown, fallbackGuests: GuestLead[]): GuestLead[] {
  const source = Array.isArray(value) ? value : [];
  const normalized = source.map((guestValue, index) => {
    const guest = asRecord(guestValue);
    const fallback = fallbackGuests[index] ?? fallbackGuests[0];

    return {
      id: makeId('guest', index),
      name: asString(guest.name, fallback?.name ?? 'Guest lead'),
      fit: asString(guest.fit, fallback?.fit ?? 'Why this guest belongs on the show.'),
      episodeAngle: asString(guest.episodeAngle ?? guest.outreachAngle, fallback?.episodeAngle ?? 'Useful guest angle.'),
      notes: asString(guest.notes, ''),
      status: asGuestStatus(guest.status)
    };
  });

  return normalized.length > 0 ? normalized : fallbackGuests;
}

function normalizeLaunchItems(value: unknown, fallbackItems: ChecklistItem[]): ChecklistItem[] {
  const source = Array.isArray(value) ? value : [];
  const normalized = source.map((itemValue, index) => {
    const item = asRecord(itemValue);
    const fallback = fallbackItems[index] ?? fallbackItems[0];
    const status = asLaunchStatus(item.status);

    return {
      id: makeId('launch', index),
      label: asString(item.label ?? item.title, fallback?.label ?? 'Launch task'),
      done: status === 'done' || Boolean(item.done),
      status,
      priority: asLaunchPriority(item.priority),
      dueDate: asString(item.dueDate, ''),
      notes: asString(item.notes, '')
    };
  });

  return normalized.length > 0 ? normalized : fallbackItems;
}

function normalizeStarterKit(value: unknown, fallbackStarterKit: PodcastStarterKit): PodcastStarterKit {
  const starterKit = asRecord(value);

  return {
    trailerScript: asString(starterKit.trailerScript, fallbackStarterKit.trailerScript),
    firstEpisodeOutline: asStringArray(starterKit.firstEpisodeOutline, fallbackStarterKit.firstEpisodeOutline, 4),
    socialLaunchPosts: asStringArray(starterKit.socialLaunchPosts, fallbackStarterKit.socialLaunchPosts, 3),
    recordingSetup: asStringArray(starterKit.recordingSetup, fallbackStarterKit.recordingSetup, 4),
    weeklyWorkflow: asStringArray(starterKit.weeklyWorkflow, fallbackStarterKit.weeklyWorkflow, 4)
  };
}

function normalizeAiPayload(payload: UnknownRecord, inputs: PodcastInputs, settings: AiSettings): AiStarterKitResult {
  const fallbackBlueprint = generateBlueprint(inputs);
  const fallbackEpisodes = fallbackBlueprint.firstEpisodes;
  const fallbackGuests = generateGuestLeads(inputs);
  const fallbackLaunchItems = fallbackBlueprint.launchChecklist;
  const fallbackStarterKit = generateStarterKit(inputs, fallbackBlueprint);
  const blueprint = normalizeBlueprint(payload.blueprint, fallbackBlueprint);
  const episodes = normalizeEpisodes(payload.episodes, fallbackEpisodes, settings.defaultEpisodeCount);
  const launchItems = normalizeLaunchItems(payload.launchItems ?? payload.launchChecklist, fallbackLaunchItems);

  return {
    blueprint: {
      ...blueprint,
      firstEpisodes: episodes,
      launchChecklist: launchItems
    },
    episodes,
    guests: normalizeGuests(payload.guests, fallbackGuests),
    launchItems,
    starterKit: normalizeStarterKit(payload.starterKit, fallbackStarterKit)
  };
}

function buildPrompt(inputs: PodcastInputs, settings: AiSettings) {
  return `You are Kodiak Cast, an AI podcast launch strategist.
Create a complete podcast starter kit as strict JSON only.

Show setup:
- Show name: ${inputs.showName || 'Untitled Podcast'}
- Niche/topic: ${inputs.niche || 'not provided'}
- Target listener: ${inputs.audience || 'not provided'}
- Tone: ${inputs.tone || 'not provided'}
- Format: ${inputs.format || 'not provided'}
- Cadence: ${inputs.cadence || 'weekly'}
- Main goal: ${inputs.goal || 'not provided'}

Generation preferences:
- Style: ${settings.style}
- Episode count: ${settings.defaultEpisodeCount}
- Launch plan depth: ${settings.launchPlanDepth}

Return this exact JSON shape with no markdown and no code fences:
{
  "blueprint": {
    "name": "string",
    "tagline": "string",
    "description": "string",
    "listenerPromise": "string",
    "format": ["string"],
    "pillars": ["string"]
  },
  "episodes": [
    {
      "title": "string",
      "hook": "string",
      "status": "idea",
      "segments": ["string"],
      "clipIdeas": ["string"],
      "mainIdea": "string",
      "listenerTakeaway": "string",
      "notes": "string",
      "publishDate": ""
    }
  ],
  "guests": [
    {
      "name": "string",
      "fit": "string",
      "episodeAngle": "string",
      "status": "wishlist",
      "notes": "string"
    }
  ],
  "launchItems": [
    {
      "label": "string",
      "done": false,
      "status": "todo",
      "priority": "high",
      "dueDate": "",
      "notes": "string"
    }
  ],
  "starterKit": {
    "trailerScript": "string",
    "firstEpisodeOutline": ["string"],
    "socialLaunchPosts": ["string"],
    "recordingSetup": ["string"],
    "weeklyWorkflow": ["string"]
  }
}

Rules:
- Make the content specific to the show, not generic podcast advice.
- Episodes must include clear hooks, talking points, and listener takeaways.
- Guests can be guest archetypes if specific names are not appropriate.
- Launch tasks must be concrete and actionable.
- Use the requested tone without being corny.
- Keep strings concise enough to edit inside a dashboard.`;
}

export async function generateAiStarterKit(inputs: PodcastInputs, settings: AiSettings): Promise<AiStarterKitResult> {
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: settings.model,
      input: buildPrompt(inputs, settings),
      temperature: 0.7,
      max_output_tokens: 6500,
      store: false
    })
  });

  const responseBody = (await response.json().catch(() => ({}))) as UnknownRecord;

  if (!response.ok) {
    const error = asRecord(responseBody.error);
    throw new Error(asString(error.message, 'Kodiak AI gateway failed. Check OPENAI_API_KEY and restart npm run dev.'));
  }

  const text = extractJsonText(responseBody);

  if (!text) {
    throw new Error('Kodiak AI returned an empty response.');
  }

  return normalizeAiPayload(parseJsonObject(text), inputs, settings);
}
