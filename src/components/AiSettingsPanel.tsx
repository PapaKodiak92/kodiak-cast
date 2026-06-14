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
    setSavedMessage(canUseAi(savedSettings) ? 'AI settings saved. OpenAI generation is ready.' : 'AI settings saved. Add a key and enable AI when ready.');
    onStatusChange?.(canUseAi(savedSettings) ? 'AI settings saved' : 'AI settings saved without active key');
    window.setTimeout(() => setSavedMessage(''), 2800);
  };

  const handleClear = () => {
    clearAiSettings();
    setSettings(defaultAiSettings);
    setSavedMessage('AI settings cleared from this browser.');
    onStatusChange?.('AI settings cleared');
    window.setTimeout(() => setSavedMessage(''), 2800);
  };

  return (
    <section className={compact ? 'panel ai-settings-panel compact-ai-settings' : 'panel ai-settings-panel'}>
      <div className="ai-settings-heading">
        <div className="section-heading">
          <p className="eyebrow">AI Engine</p>
          <h2>{compact ? 'OpenAI generation settings.' : 'Connect Kodiak Cast to OpenAI.'}</h2>
          <p>
            Store a local API key for development, choose the model/style, then use Generate Starter Kit to create real AI output for each podcast project.
          </p>
        </div>
        <div className={canUseAi(settings) ? 'ai-engine-status ready' : 'ai-engine-status'}>
          <span>{canUseAi(settings) ? 'AI Ready' : 'Local Mode'}</span>
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
            <strong>Use OpenAI when generating</strong>
            <small>Falls back to Kodiak local templates if AI is off or fails.</small>
          </span>
        </label>

        <label>
          OpenAI API key
          <input
            autoComplete="off"
            onChange={(event) => updateSettings('apiKey', event.target.value)}
            placeholder="sk-..."
            type="password"
            value={settings.apiKey}
          />
          <small className="field-note">Development only: saved in this browser localStorage. We will move keys server-side before launch.</small>
        </label>

        <label>
          Preferred model
          <input
            onChange={(event) => updateSettings('model', event.target.value)}
            placeholder="gpt-5.1-mini"
            value={settings.model}
          />
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
          Save AI Settings
        </button>
        <button className="secondary-button danger-button" onClick={handleClear} type="button">
          Clear Key
        </button>
        {savedMessage ? <span className="copy-status">{savedMessage}</span> : null}
      </div>
    </section>
  );
}
