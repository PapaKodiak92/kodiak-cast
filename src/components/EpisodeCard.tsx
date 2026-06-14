import type { EpisodeIdea } from '../types';

interface EpisodeCardProps {
  episode: EpisodeIdea;
}

export function EpisodeCard({ episode }: EpisodeCardProps) {
  return (
    <article className="episode-card">
      <div className="card-row">
        <span className="status-pill">{episode.status}</span>
        <span className="mini-label">{episode.segments.length} segments</span>
      </div>
      <h3>{episode.title}</h3>
      <p>{episode.hook}</p>
      <div className="mini-section">
        <strong>Segments</strong>
        <ul>
          {episode.segments.map((segment) => (
            <li key={segment}>{segment}</li>
          ))}
        </ul>
      </div>
      <div className="clip-grid">
        {episode.clipIdeas.map((clip) => (
          <span key={clip}>{clip}</span>
        ))}
      </div>
    </article>
  );
}
