import { useState } from 'react';
import {
  canUseAi,
  clearAiSettings,
  defaultAiSettings,
  loadAiSettings,
  saveAiSettings,
  type AiSettings,
  type AiStyle
} from '../lib/aiSettings';

const styleOptions: AiStyle[] = ['practical', 'funny', 'professional', 'raw', 'motivational'];
const depthOptions: AiSettings['launchPlanDepth'][] = ['lean', 'standard', 'deep'];

interface AiSettingsPanelProps {
  compact?: boolean;
  onStatusChange?: (message: string) => void;
}

export function AiSettingsPanel({ compact = false, onStatusChange }: AiSettingsPanelProps) {
  const [settings, setSettings] = useState<AiSettings>(() => loadAiSettings());
  const [savedMessage, setSavedMessage] = useState('');

  const updateSettings = <Key extends keyof AiSettings>(field: Key, value: AiSettings[Key]) => {
    setSettings((currentSettings) => ({ ...currentSettings, [field]: value }));
  };

  const handleSave = () => {
    const savedSettings = saveAiSettings(settings);
    setSettings(savedSettings);
    setSavedMessage(canUseAi(savedSettings) ? 'Kodiak Cloud AI preferences saved.' : 'AI disabled. Local generator will be used.');
    onStatusChange?.(canUseAi(savedSettings) ? 'Kodiak Cloud AI preferences saved' : 'AI disabled');
    window.setTimeout(() => setSavedMessage(''), 2800);
  };

  const handleClear = () => {
    clearAiSettings();
    setSettings(defaultAiSettings);
    setSavedMessage('AI preferences reset. Kodiak Cloud AI is back on.');
    onStatusChange?.('AI preferences reset');
    window.setTimeout(() => setSavedMessage(''), 2800);
  };

  return (
    <section className={compact ? 'panel ai-settings-panel compact-ai-settings' : 'panel ai-settings-panel'}>
      <div className="ai-settings-heading">
        <div className="section-heading">
          <p className="eyebrow">AI Engine</p>
          <h2>{compact ? 'Kodiak Cloud AI preferences.' : 'Kodiak Cloud AI is built in.'}</h2>
          <p>
            Customers should never paste their own AI keys. Kodiak Cast calls our local AI gateway in development and our hosted backend when we launch.
          </p>
        </div>
        <div className={canUseAi(settings) ? 'ai-engine-status ready' : 'ai-engine-status'}>
          <span>{canUseAi(settings) ? 'Cloud AI On' : 'Local Mode'}</span>
          <strong>{settings.model}</strong>
        </div>
      </div>

      <div className="ai-settings-grid">
        <label className="ai-toggle-card">
          <input
            checked={settings.enabled}
            onChange={(event) => updateSettings('enabled', event.target.checked)}
            type="checkbox"
          />
          <span>
            <strong>Use Kodiak Cloud AI when generating</strong>
            <small>Falls back to Kodiak local templates if the gateway is offline or the key is missing.</small>
          </span>
        </label>

        <label>
          Preferred model
          <input
            onChange={(event) => updateSettings('model', event.target.value)}
            placeholder="gpt-5.1-mini"
            value={settings.model}
          />
          <small className="field-note">Server-side only. The OpenAI key stays in .env and never goes to the browser.</small>
        </label>

        <label>
          AI style
          <select onChange={(event) => updateSettings('style', event.target.value as AiStyle)} value={settings.style}>
            {styleOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <label>
          Default episode count
          <input
            max={25}
            min={3}
            onChange={(event) => updateSettings('defaultEpisodeCount', Number(event.target.value))}
            type="number"
            value={settings.defaultEpisodeCount}
          />
        </label>

        <label>
          Launch plan depth
          <select
            onChange={(event) => updateSettings('launchPlanDepth', event.target.value as AiSettings['launchPlanDepth'])}
            value={settings.launchPlanDepth}
          >
            {depthOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="ai-settings-actions">
        <button className="primary-button" onClick={handleSave} type="button">
          Save AI Preferences
        </button>
        <button className="secondary-button" onClick={handleClear} type="button">
          Reset Preferences
        </button>
        {savedMessage ? <span className="copy-status">{savedMessage}</span> : null}
      </div>
    </section>
  );
}
