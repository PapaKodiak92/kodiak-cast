export type AiStyle = 'practical' | 'funny' | 'professional' | 'raw' | 'motivational';

export interface AiSettings {
  defaultEpisodeCount: number;
  enabled: boolean;
  launchPlanDepth: 'lean' | 'standard' | 'deep';
  model: string;
  style: AiStyle;
}

const AI_SETTINGS_KEY = 'kodiak-cast:ai-settings:v2';
const LEGACY_AI_SETTINGS_KEY = 'kodiak-cast:ai-settings:v1';
const DEFAULT_AI_MODEL = 'gpt-5.4-mini';
const KNOWN_BAD_MODEL_IDS = new Set(['gpt-5.1-mini']);

export const defaultAiSettings: AiSettings = {
  defaultEpisodeCount: 10,
  enabled: true,
  launchPlanDepth: 'standard',
  model: DEFAULT_AI_MODEL,
  style: 'practical'
};

function normalizeEpisodeCount(value: unknown) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return defaultAiSettings.defaultEpisodeCount;
  }

  return Math.min(25, Math.max(3, Math.round(parsed)));
}

function normalizeModel(value: unknown) {
  const model = typeof value === 'string' ? value.trim() : '';

  if (!model || KNOWN_BAD_MODEL_IDS.has(model)) {
    return defaultAiSettings.model;
  }

  return model;
}

function normalizeSettings(value: unknown): AiSettings {
  const parsedSettings = value && typeof value === 'object' ? (value as Partial<AiSettings>) : {};

  return {
    ...defaultAiSettings,
    defaultEpisodeCount: normalizeEpisodeCount(parsedSettings.defaultEpisodeCount),
    enabled: parsedSettings.enabled ?? defaultAiSettings.enabled,
    launchPlanDepth: parsedSettings.launchPlanDepth ?? defaultAiSettings.launchPlanDepth,
    model: normalizeModel(parsedSettings.model),
    style: parsedSettings.style ?? defaultAiSettings.style
  };
}

export function loadAiSettings(): AiSettings {
  if (typeof window === 'undefined') {
    return defaultAiSettings;
  }

  try {
    const rawSettings = window.localStorage.getItem(AI_SETTINGS_KEY) ?? window.localStorage.getItem(LEGACY_AI_SETTINGS_KEY);

    if (!rawSettings) {
      return defaultAiSettings;
    }

    const normalizedSettings = normalizeSettings(JSON.parse(rawSettings));

    if (rawSettings.includes('gpt-5.1-mini')) {
      window.localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(normalizedSettings));
      window.localStorage.removeItem(LEGACY_AI_SETTINGS_KEY);
    }

    return normalizedSettings;
  } catch {
    return defaultAiSettings;
  }
}

export function saveAiSettings(settings: AiSettings): AiSettings {
  const normalizedSettings = normalizeSettings(settings);

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(normalizedSettings));
    window.localStorage.removeItem(LEGACY_AI_SETTINGS_KEY);
  }

  return normalizedSettings;
}

export function clearAiSettings() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(AI_SETTINGS_KEY);
    window.localStorage.removeItem(LEGACY_AI_SETTINGS_KEY);
  }
}

export function canUseAi(settings: AiSettings) {
  return settings.enabled;
}
