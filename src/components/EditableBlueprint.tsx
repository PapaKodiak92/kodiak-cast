import type { PodcastBlueprint } from '../types';

export type BlueprintTextField = 'name' | 'tagline' | 'description' | 'listenerPromise';
export type BlueprintListField = 'format' | 'pillars';

interface EditableBlueprintProps {
  blueprint: PodcastBlueprint;
  onTextChange: (field: BlueprintTextField, value: string) => void;
  onListItemChange: (field: BlueprintListField, index: number, value: string) => void;
  onAddListItem: (field: BlueprintListField) => void;
  onRemoveListItem: (field: BlueprintListField, index: number) => void;
}

interface EditableListProps {
  title: string;
  helper: string;
  items: string[];
  field: BlueprintListField;
  onListItemChange: (field: BlueprintListField, index: number, value: string) => void;
  onAddListItem: (field: BlueprintListField) => void;
  onRemoveListItem: (field: BlueprintListField, index: number) => void;
}

function EditableList({
  title,
  helper,
  items,
  field,
  onListItemChange,
  onAddListItem,
  onRemoveListItem
}: EditableListProps) {
  return (
    <div className="editable-list-panel">
      <div className="editable-list-heading">
        <div>
          <h3>{title}</h3>
          <p>{helper}</p>
        </div>
        <button className="secondary-button" onClick={() => onAddListItem(field)} type="button">
          Add item
        </button>
      </div>

      <div className="editable-list">
        {items.map((item, index) => (
          <div className="editable-list-row" key={`${field}-${index}`}>
            <textarea
              aria-label={`${title} item ${index + 1}`}
              onChange={(event) => onListItemChange(field, index, event.target.value)}
              rows={2}
              value={item}
            />
            <button
              className="secondary-button danger-button"
              disabled={items.length === 1}
              onClick={() => onRemoveListItem(field, index)}
              type="button"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EditableBlueprint({
  blueprint,
  onTextChange,
  onListItemChange,
  onAddListItem,
  onRemoveListItem
}: EditableBlueprintProps) {
  return (
    <section className="panel editor-panel">
      <div className="section-heading editor-heading">
        <div>
          <p className="eyebrow">Generated Blueprint</p>
          <h2>Make the draft yours.</h2>
          <p>
            The generator gives you a starting point. Edit the title, description, promise, format,
            and pillars until it sounds like the real show.
          </p>
        </div>
      </div>

      <div className="editor-stack">
        <label className="wide-label">
          Show title
          <input value={blueprint.name} onChange={(event) => onTextChange('name', event.target.value)} />
        </label>

        <label className="wide-label">
          Show description
          <textarea
            onChange={(event) => onTextChange('description', event.target.value)}
            rows={5}
            value={blueprint.description}
          />
        </label>

        <div className="blueprint-grid editor-grid">
          <label className="editable-card">
            <strong>Tagline</strong>
            <textarea
              onChange={(event) => onTextChange('tagline', event.target.value)}
              rows={3}
              value={blueprint.tagline}
            />
          </label>

          <label className="editable-card">
            <strong>Listener promise</strong>
            <textarea
              onChange={(event) => onTextChange('listenerPromise', event.target.value)}
              rows={5}
              value={blueprint.listenerPromise}
            />
          </label>
        </div>

        <div className="split-list-grid editor-list-grid">
          <EditableList
            field="format"
            helper="Shape the repeatable episode flow."
            items={blueprint.format}
            onAddListItem={onAddListItem}
            onListItemChange={onListItemChange}
            onRemoveListItem={onRemoveListItem}
            title="Show format"
          />

          <EditableList
            field="pillars"
            helper="Define the themes this show keeps returning to."
            items={blueprint.pillars}
            onAddListItem={onAddListItem}
            onListItemChange={onListItemChange}
            onRemoveListItem={onRemoveListItem}
            title="Content pillars"
          />
        </div>
      </div>
    </section>
  );
}
