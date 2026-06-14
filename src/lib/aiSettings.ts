export type AiStyle = 'practical' | 'funny' | 'professional' | 'raw' | 'motivational';

export interface AiSettings {
  apiKey: string;
  defaultEpisodeCount: number;
  enabled: boolean;
  launchPlanDepth: 'lean' | 'standard' | 'deep';
  model: string;
  style: AiStyle;
}

const AI_SETTINGS_KEY = 'kodiak-cast:ai-settings:v1';

export const defaultAiSettings: AiSettings = {
  apiKey: '',
  defaultEpisodeCount: 10,
  enabled: false,
  launchPlanDepth: 'standard',
  model: 'gpt-5.1-mini',
  style: 'practical'
};

function normalizeEpisodeCount(value: unknown) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return defaultAiSettings.defaultEpisodeCount;
  }

  return Math.min(25, Math.max(3, Math.round(parsed)));
}

export function loadAiSettings(): AiSettings {
  if (typeof window === 'undefined') {
    return defaultAiSettings;
  }

  try {
    const rawSettings = window.localStorage.getItem(AI_SETTINGS_KEY);

    if (!rawSettings) {
      return defaultAiSettings;
    }

    const parsedSettings = JSON.parse(rawSettings) as Partial<AiSettings>;

    return {
      ...defaultAiSettings,
      ...parsedSettings,
      apiKey: parsedSettings.apiKey ?? '',
      defaultEpisodeCount: normalizeEpisodeCount(parsedSettings.defaultEpisodeCount),
      enabled: Boolean(parsedSettings.enabled),
      launchPlanDepth: parsedSettings.launchPlanDepth ?? defaultAiSettings.launchPlanDepth,
      model: parsedSettings.model?.trim() || defaultAiSettings.model,
      style: parsedSettings.style ?? defaultAiSettings.style
    };
  } catch {
    return defaultAiSettings;
  }
}

export function saveAiSettings(settings: AiSettings): AiSettings {
  const normalizedSettings: AiSettings = {
    ...settings,
    apiKey: settings.apiKey.trim(),
    defaultEpisodeCount: normalizeEpisodeCount(settings.defaultEpisodeCount),
    model: settings.model.trim() || defaultAiSettings.model
  };

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(normalizedSettings));
  }

  return normalizedSettings;
}

export function clearAiSettings() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(AI_SETTINGS_KEY);
  }
}

export function canUseAi(settings: AiSettings) {
  return settings.enabled && settings.apiKey.trim().length > 0;
}
