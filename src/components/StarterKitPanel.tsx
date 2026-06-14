import type { PodcastStarterKit } from '../types';

export type StarterKitTextField = 'trailerScript';
export type StarterKitListField = Exclude<keyof PodcastStarterKit, StarterKitTextField>;

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
    <article className="starter-kit-card">
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
  const fullStarterKit = formatFullStarterKit(projectName, starterKit);

  return (
    <section className="panel starter-kit-panel">
      <div className="starter-kit-heading-row">
        <div className="section-heading starter-kit-heading-copy">
          <p className="eyebrow">Starter Kit</p>
          <h2>Launch assets for {projectName}.</h2>
          <p>
            Edit the usable pieces around this project: trailer copy, first episode shape, launch posts,
            recording setup, and a weekly production rhythm.
          </p>
        </div>
        <div className="starter-kit-header-actions">
          <button className="primary-button" onClick={() => onCopy('Full starter kit', fullStarterKit)} type="button">
            Copy Full Starter Kit
          </button>
          {copyStatus ? <span className="copy-status">{copyStatus}</span> : null}
        </div>
      </div>

      <div className="starter-kit-grid">
        <article className="starter-kit-card wide-starter-card">
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
            rows={7}
            value={starterKit.trailerScript}
          />
        </article>

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
      </div>
    </section>
  );
}
