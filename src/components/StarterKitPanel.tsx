import { useState } from 'react';
import type { PodcastStarterKit } from '../types';
import '../stageFlow.css';

export type StarterKitTextField = 'trailerScript';
export type StarterKitListField = Exclude<keyof PodcastStarterKit, StarterKitTextField>;

type StarterStage = 'trailer' | 'outline' | 'posts' | 'setup' | 'workflow';

interface StarterKitPanelProps {
  copyStatus?: string;
  onAddListItem: (field: StarterKitListField) => void;
  onCopy: (label: string, value: string) => void;
  onListItemChange: (field: StarterKitListField, index: number, value: string) => void;
  onRemoveListItem: (field: StarterKitListField, index: number) => void;
  onTextChange: (field: StarterKitTextField, value: string) => void;
  projectName: string;
  starterKit: PodcastStarterKit;
}

interface EditableStarterListProps {
  copyLabel: string;
  field: StarterKitListField;
  items: string[];
  label: string;
  onAddListItem: (field: StarterKitListField) => void;
  onCopy: (label: string, value: string) => void;
  onListItemChange: (field: StarterKitListField, index: number, value: string) => void;
  onRemoveListItem: (field: StarterKitListField, index: number) => void;
}

const starterKitLabels: Record<StarterKitListField, string> = {
  firstEpisodeOutline: 'First episode outline',
  socialLaunchPosts: 'Social launch posts',
  recordingSetup: 'Recording setup checklist',
  weeklyWorkflow: 'Weekly production workflow'
};

const starterStages: { id: StarterStage; label: string; helper: string }[] = [
  { id: 'trailer', label: 'Trailer', helper: 'What the show is and who it is for' },
  { id: 'outline', label: 'Episode 1', helper: 'The first episode shape' },
  { id: 'posts', label: 'Launch posts', helper: 'Ready-to-edit announcement copy' },
  { id: 'setup', label: 'Recording setup', helper: 'Gear, room, and workflow basics' },
  { id: 'workflow', label: 'Weekly rhythm', helper: 'Repeatable production cadence' }
];

function formatList(label: string, items: string[]) {
  return `${label}\n${items.map((item, index) => `${index + 1}. ${item}`).join('\n')}`;
}

function formatFullStarterKit(projectName: string, starterKit: PodcastStarterKit) {
  return [
    `${projectName} — Starter Kit`,
    '',
    `Trailer script\n${starterKit.trailerScript}`,
    '',
    formatList(starterKitLabels.firstEpisodeOutline, starterKit.firstEpisodeOutline),
    '',
    formatList(starterKitLabels.socialLaunchPosts, starterKit.socialLaunchPosts),
    '',
    formatList(starterKitLabels.recordingSetup, starterKit.recordingSetup),
    '',
    formatList(starterKitLabels.weeklyWorkflow, starterKit.weeklyWorkflow)
  ].join('\n');
}

function EditableStarterList({
  copyLabel,
  field,
  items,
  label,
  onAddListItem,
  onCopy,
  onListItemChange,
  onRemoveListItem
}: EditableStarterListProps) {
  return (
    <article className="starter-kit-card active-starter-stage-card">
      <div className="starter-kit-card-heading">
        <strong>{label}</strong>
        <button className="secondary-button small-action-button" onClick={() => onCopy(copyLabel, formatList(label, items))} type="button">
          Copy
        </button>
      </div>

      <div className="starter-edit-list">
        {items.map((item, index) => (
          <div className="starter-list-row" key={`${field}-${index}`}>
            <textarea
              aria-label={`${label} item ${index + 1}`}
              onChange={(event) => onListItemChange(field, index, event.target.value)}
              rows={3}
              value={item}
            />
            <button className="secondary-button small-action-button" onClick={() => onRemoveListItem(field, index)} type="button">
              Remove
            </button>
          </div>
        ))}
      </div>

      <button className="secondary-button starter-add-button" onClick={() => onAddListItem(field)} type="button">
        Add item
      </button>
    </article>
  );
}

export function StarterKitPanel({
  copyStatus,
  onAddListItem,
  onCopy,
  onListItemChange,
  onRemoveListItem,
  onTextChange,
  projectName,
  starterKit
}: StarterKitPanelProps) {
  const [activeStage, setActiveStage] = useState<StarterStage>('trailer');
  const fullStarterKit = formatFullStarterKit(projectName, starterKit);

  const renderActiveStage = () => {
    if (activeStage === 'trailer') {
      return (
        <article className="starter-kit-card wide-starter-card active-starter-stage-card">
          <div className="starter-kit-card-heading">
            <strong>Trailer script</strong>
            <button className="secondary-button small-action-button" onClick={() => onCopy('Trailer script', starterKit.trailerScript)} type="button">
              Copy
            </button>
          </div>
          <textarea
            aria-label="Trailer script"
            className="starter-script-editor"
            onChange={(event) => onTextChange('trailerScript', event.target.value)}
            rows={9}
            value={starterKit.trailerScript}
          />
        </article>
      );
    }

    if (activeStage === 'outline') {
      return (
        <EditableStarterList
          copyLabel="First episode outline"
          field="firstEpisodeOutline"
          items={starterKit.firstEpisodeOutline}
          label={starterKitLabels.firstEpisodeOutline}
          onAddListItem={onAddListItem}
          onCopy={onCopy}
          onListItemChange={onListItemChange}
          onRemoveListItem={onRemoveListItem}
        />
      );
    }

    if (activeStage === 'posts') {
      return (
        <EditableStarterList
          copyLabel="Social launch posts"
          field="socialLaunchPosts"
          items={starterKit.socialLaunchPosts}
          label={starterKitLabels.socialLaunchPosts}
          onAddListItem={onAddListItem}
          onCopy={onCopy}
          onListItemChange={onListItemChange}
          onRemoveListItem={onRemoveListItem}
        />
      );
    }

    if (activeStage === 'setup') {
      return (
        <EditableStarterList
          copyLabel="Recording setup checklist"
          field="recordingSetup"
          items={starterKit.recordingSetup}
          label={starterKitLabels.recordingSetup}
          onAddListItem={onAddListItem}
          onCopy={onCopy}
          onListItemChange={onListItemChange}
          onRemoveListItem={onRemoveListItem}
        />
      );
    }

    return (
      <EditableStarterList
        copyLabel="Weekly production workflow"
        field="weeklyWorkflow"
        items={starterKit.weeklyWorkflow}
        label={starterKitLabels.weeklyWorkflow}
        onAddListItem={onAddListItem}
        onCopy={onCopy}
        onListItemChange={onListItemChange}
        onRemoveListItem={onRemoveListItem}
      />
    );
  };

  return (
    <section className="panel starter-kit-panel staged-panel">
      <div className="stage-kicker-row">
        <span className="stage-pill">Stage 4 of 5</span>
        <span className="stage-ready">Starter kit review</span>
      </div>

      <div className="starter-kit-heading-row">
        <div className="section-heading starter-kit-heading-copy">
          <p className="eyebrow">Starter Kit</p>
          <h2>Review one launch asset at a time.</h2>
          <p>
            Instead of dumping every generated asset onto one page, Kodiak Cast now walks through the trailer, first episode, posts, setup, and weekly rhythm as separate review stages.
          </p>
        </div>
        <div className="starter-kit-header-actions">
          <button className="primary-button" onClick={() => onCopy('Full starter kit', fullStarterKit)} type="button">
            Copy Full Starter Kit
          </button>
          {copyStatus ? <span className="copy-status">{copyStatus}</span> : null}
        </div>
      </div>

      <div className="starter-stage-tabs" role="tablist" aria-label="Starter kit review stages">
        {starterStages.map((stage, index) => (
          <button
            aria-selected={activeStage === stage.id}
            className={activeStage === stage.id ? 'starter-stage-tab active' : 'starter-stage-tab'}
            key={stage.id}
            onClick={() => setActiveStage(stage.id)}
            role="tab"
            type="button"
          >
            <span>{index + 1}. {stage.label}</span>
            <small>{stage.helper}</small>
          </button>
        ))}
      </div>

      <div className="starter-stage-panel">{renderActiveStage()}</div>
    </section>
  );
}
