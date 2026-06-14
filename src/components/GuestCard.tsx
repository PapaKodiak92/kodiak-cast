import type { GuestLead } from '../types';

interface GuestCardProps {
  guest: GuestLead;
}

export function GuestCard({ guest }: GuestCardProps) {
  return (
    <article className="guest-card">
      <div className="card-row">
        <h3>{guest.name}</h3>
        <span className="status-pill">{guest.status}</span>
      </div>
      <p>{guest.fit}</p>
      <div className="angle-box">
        <strong>Episode angle</strong>
        <span>{guest.episodeAngle}</span>
      </div>
    </article>
  );
}
