import type { GuestLead, GuestStatus } from '../types';

interface GuestCardProps {
  editable?: boolean;
  guest: GuestLead;
  onChange?: (guest: GuestLead) => void;
  onCopyPitch?: () => void;
  onDelete?: () => void;
  onMarkContacted?: () => void;
}

const guestStatuses: GuestStatus[] = ['wishlist', 'contacted', 'scheduled', 'recorded', 'passed'];

function formatStatus(status: GuestStatus) {
  return status.replace(/-/g, ' ');
}

export function GuestCard({ editable = false, guest, onChange, onCopyPitch, onDelete, onMarkContacted }: GuestCardProps) {
  const updateField = (field: keyof GuestLead, value: string | GuestStatus) => {
    onChange?.({ ...guest, [field]: value });
  };

  if (!editable) {
    return (
      <article className="guest-card">
        <div className="card-row">
          <h3>{guest.name}</h3>
          <span className="status-pill">{formatStatus(guest.status)}</span>
        </div>
        <p>{guest.fit}</p>
        <div className="angle-box">
          <strong>Episode angle</strong>
          <span>{guest.episodeAngle}</span>
        </div>
      </article>
    );
  }

  return (
    <article className="guest-card editable-work-card">
      <div className="work-card-topline">
        <label className="compact-label">
          Status
          <select value={guest.status} onChange={(event) => updateField('status', event.target.value as GuestStatus)}>
            {guestStatuses.map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>
        </label>
        <button className="secondary-button small-action-button" onClick={onMarkContacted} type="button">
          Mark contacted
        </button>
      </div>

      <label>
        Guest name / type
        <input value={guest.name} onChange={(event) => updateField('name', event.target.value)} />
      </label>

      <label>
        Why they fit
        <textarea rows={3} value={guest.fit} onChange={(event) => updateField('fit', event.target.value)} />
      </label>

      <label>
        Outreach angle
        <textarea rows={3} value={guest.episodeAngle} onChange={(event) => updateField('episodeAngle', event.target.value)} />
      </label>

      <label>
        Notes
        <textarea rows={4} value={guest.notes ?? ''} onChange={(event) => updateField('notes', event.target.value)} />
      </label>

      <div className="angle-box pitch-preview-box">
        <strong>Pitch preview</strong>
        <span>
          Hey [Name], I am building a podcast and I think your angle around “{guest.episodeAngle || 'this topic'}” would give listeners something useful. Would you be open to a focused conversation?
        </span>
      </div>

      <div className="work-card-actions">
        <button className="secondary-button" onClick={onCopyPitch} type="button">
          Copy pitch
        </button>
        <button className="secondary-button danger-button" onClick={onDelete} type="button">
          Delete
        </button>
      </div>
    </article>
  );
}
