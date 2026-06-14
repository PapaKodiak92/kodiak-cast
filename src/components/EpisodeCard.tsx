import type { EpisodeIdea, EpisodeStatus } from '../types';

interface EpisodeCardProps {
  editable?: boolean;
  episode: EpisodeIdea;
  onChange?: (episode: EpisodeIdea) => void;
  onCopyOutline?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onMoveStatus?: () => void;
}

const episodeStatuses: EpisodeStatus[] = ['idea', 'outlined', 'ready', 'recorded', 'published'];

type EpisodeTextField = 'title' | 'hook' | 'mainIdea' | 'listenerTakeaway' | 'notes' | 'publishDate';

function normalizeEpisodeStatus(status: EpisodeStatus): EpisodeStatus {
  if (status === 'outline') {
    return 'outlined';
  }

  if (status === 'scheduled') {
    return 'ready';
  }

  return status;
}

function formatStatus(status: EpisodeStatus) {
  return normalizeEpisodeStatus(status).replace(/-/g, ' ');
}

function safeSegments(episode: EpisodeIdea) {
  return episode.segments?.length ? episode.segments : ['Main talking point'];
}

function safeClipIdeas(episode: EpisodeIdea) {
  return episode.clipIdeas?.length ? episode.clipIdeas : ['Clip idea'];
}

export function EpisodeCard({
  editable = false,
  episode,
  onChange,
  onCopyOutline,
  onDelete,
  onDuplicate,
  onMoveStatus
}: EpisodeCardProps) {
  const updateTextField = (field: EpisodeTextField, value: string) => {
    onChange?.({ ...episode, [field]: value });
  };

  const updateStatus = (status: EpisodeStatus) => {
    onChange?.({ ...episode, status });
  };

  const updateListItem = (field: 'segments' | 'clipIdeas', index: number, value: string) => {
    const currentItems = field === 'segments' ? safeSegments(episode) : safeClipIdeas(episode);
    onChange?.({
      ...episode,
      [field]: currentItems.map((item, itemIndex) => (itemIndex === index ? value : item))
    });
  };

  const addListItem = (field: 'segments' | 'clipIdeas') => {
    const currentItems = field === 'segments' ? safeSegments(episode) : safeClipIdeas(episode);
    onChange?.({
      ...episode,
      [field]: [...currentItems, field === 'segments' ? 'New talking point' : 'New clip idea']
    });
  };

  const removeListItem = (field: 'segments' | 'clipIdeas', index: number) => {
    const currentItems = field === 'segments' ? safeSegments(episode) : safeClipIdeas(episode);
    const nextItems = currentItems.filter((_, itemIndex) => itemIndex !== index);
    onChange?.({
      ...episode,
      [field]: nextItems.length > 0 ? nextItems : ['']
    });
  };

  if (!editable) {
    return (
      <article className="episode-card">
        <div className="card-row">
          <span className="status-pill">{formatStatus(episode.status)}</span>
          <span className="mini-label">{safeSegments(episode).length} segments</span>
        </div>
        <h3>{episode.title}</h3>
        <p>{episode.hook}</p>
        <div className="mini-section">
          <strong>Segments</strong>
          <ul>
            {safeSegments(episode).map((segment, index) => (
              <li key={`${segment}-${index}`}>{segment}</li>
            ))}
          </ul>
        </div>
        <div className="clip-grid">
          {safeClipIdeas(episode).map((clip, index) => (
            <span key={`${clip}-${index}`}>{clip}</span>
          ))}
        </div>
      </article>
    );
  }

  return (
    <article className="episode-card editable-work-card">
      <div className="work-card-topline">
        <label className="compact-label">
          Status
          <select
            value={normalizeEpisodeStatus(episode.status)}
            onChange={(event) => updateStatus(event.target.value as EpisodeStatus)}
          >
            {episodeStatuses.map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>
        </label>
        <button className="secondary-button small-action-button" onClick={onMoveStatus} type="button">
          Move status
        </button>
      </div>

      <label>
        Title
        <input value={episode.title} onChange={(event) => updateTextField('title', event.target.value)} />
      </label>

      <label>
        Hook
        <textarea rows={3} value={episode.hook} onChange={(event) => updateTextField('hook', event.target.value)} />
      </label>

      <label>
        Main idea
        <textarea
          rows={3}
          value={episode.mainIdea ?? episode.hook ?? ''}
          onChange={(event) => updateTextField('mainIdea', event.target.value)}
        />
      </label>

      <div className="editable-list-block">
        <div className="work-card-topline">
          <strong>Talking points</strong>
          <button className="secondary-button small-action-button" onClick={() => addListItem('segments')} type="button">
            Add point
          </button>
        </div>
        {safeSegments(episode).map((segment, index) => (
          <div className="starter-list-row" key={`segment-${episode.id}-${index}`}>
            <textarea
              aria-label={`Talking point ${index + 1}`}
              rows={2}
              value={segment}
              onChange={(event) => updateListItem('segments', index, event.target.value)}
            />
            <button className="secondary-button small-action-button" onClick={() => removeListItem('segments', index)} type="button">
              Remove
            </button>
          </div>
        ))}
      </div>

      <label>
        Listener takeaway
        <textarea
          rows={3}
          value={episode.listenerTakeaway ?? safeClipIdeas(episode)[0] ?? ''}
          onChange={(event) => updateTextField('listenerTakeaway', event.target.value)}
        />
      </label>

      <label>
        Publish date
        <input
          type="date"
          value={episode.publishDate ?? ''}
          onChange={(event) => updateTextField('publishDate', event.target.value)}
        />
      </label>

      <label>
        Recording notes
        <textarea rows={4} value={episode.notes ?? ''} onChange={(event) => updateTextField('notes', event.target.value)} />
      </label>

      <div className="editable-list-block">
        <div className="work-card-topline">
          <strong>Clip ideas</strong>
          <button className="secondary-button small-action-button" onClick={() => addListItem('clipIdeas')} type="button">
            Add clip
          </button>
        </div>
        <div className="clip-grid editable-clip-grid">
          {safeClipIdeas(episode).map((clip, index) => (
            <div className="clip-edit-row" key={`clip-${episode.id}-${index}`}>
              <input
                aria-label={`Clip idea ${index + 1}`}
                value={clip}
                onChange={(event) => updateListItem('clipIdeas', index, event.target.value)}
              />
              <button className="secondary-button small-action-button" onClick={() => removeListItem('clipIdeas', index)} type="button">
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="work-card-actions">
        <button className="secondary-button" onClick={onCopyOutline} type="button">
          Copy outline
        </button>
        <button className="secondary-button" onClick={onDuplicate} type="button">
          Duplicate
        </button>
        <button className="secondary-button danger-button" onClick={onDelete} type="button">
          Delete
        </button>
      </div>
    </article>
  );
}
