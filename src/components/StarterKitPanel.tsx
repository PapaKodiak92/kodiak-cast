import type { PodcastStarterKit } from '../types';

interface StarterKitPanelProps {
  projectName: string;
  starterKit: PodcastStarterKit;
}

function StarterList({ items }: { items: string[] }) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  );
}

export function StarterKitPanel({ projectName, starterKit }: StarterKitPanelProps) {
  return (
    <section className="panel starter-kit-panel">
      <div className="section-heading">
        <p className="eyebrow">Starter Kit</p>
        <h2>Launch assets for {projectName}.</h2>
        <p>
          Kodiak Cast generates the usable pieces around this project: trailer copy, first episode shape,
          launch posts, recording setup, and a weekly production rhythm.
        </p>
      </div>

      <div className="starter-kit-grid">
        <article className="starter-kit-card wide-starter-card">
          <strong>Trailer script</strong>
          <p className="script-box">{starterKit.trailerScript}</p>
        </article>

        <article className="starter-kit-card">
          <strong>First episode outline</strong>
          <StarterList items={starterKit.firstEpisodeOutline} />
        </article>

        <article className="starter-kit-card">
          <strong>Social launch posts</strong>
          <div className="post-stack">
            {starterKit.socialLaunchPosts.map((post, index) => (
              <p key={`${post}-${index}`} className="social-post">
                {post}
              </p>
            ))}
          </div>
        </article>

        <article className="starter-kit-card">
          <strong>Recording setup</strong>
          <StarterList items={starterKit.recordingSetup} />
        </article>

        <article className="starter-kit-card">
          <strong>Weekly workflow</strong>
          <StarterList items={starterKit.weeklyWorkflow} />
        </article>
      </div>
    </section>
  );
}
