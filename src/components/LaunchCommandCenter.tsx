import type { ChecklistItem, LaunchPriority, LaunchStatus, PodcastProject } from '../types';

interface LaunchCommandCenterProps {
  copyStatus?: string;
  onAddTask: () => void;
  onCopy: (label: string, value: string) => void;
  onDeleteTask: (taskId: string) => void;
  onMarkDone: (taskId: string) => void;
  onTaskChange: (taskId: string, nextTask: ChecklistItem) => void;
  project: PodcastProject;
}

const priorityOptions: LaunchPriority[] = ['high', 'medium', 'low'];
const statusOptions: LaunchStatus[] = ['todo', 'doing', 'done'];

function getLaunchStatus(task: ChecklistItem): LaunchStatus {
  return task.status ?? (task.done ? 'done' : 'todo');
}

function getLaunchPriority(task: ChecklistItem): LaunchPriority {
  return task.priority ?? 'medium';
}

function getReadinessCriteria(project: PodcastProject) {
  const completedLaunchTasks = project.launchItems.filter((item) => getLaunchStatus(item) === 'done' || item.done).length;
  const readyEpisodes = project.episodes.filter((episode) => episode.status === 'ready' || episode.status === 'recorded' || episode.status === 'published').length;

  return [
    {
      label: 'Blueprint is filled out',
      done: Boolean(project.blueprint.description && project.blueprint.listenerPromise && project.blueprint.tagline)
    },
    {
      label: 'Starter kit assets exist',
      done: Boolean(project.starterKit.trailerScript && project.starterKit.socialLaunchPosts.length)
    },
    {
      label: 'At least 3 episodes planned',
      done: project.episodes.length >= 3
    },
    {
      label: 'At least 1 episode ready to record',
      done: readyEpisodes >= 1
    },
    {
      label: 'At least 1 guest lead captured',
      done: project.guests.length >= 1
    },
    {
      label: 'Launch checklist has momentum',
      done: completedLaunchTasks > 0
    }
  ];
}

function calculateReadiness(project: PodcastProject) {
  const criteria = getReadinessCriteria(project);
  const completed = criteria.filter((item) => item.done).length;

  return {
    completed,
    criteria,
    score: Math.round((completed / criteria.length) * 100),
    total: criteria.length
  };
}

function formatList(title: string, items: string[]) {
  return [`## ${title}`, ...items.map((item, index) => `${index + 1}. ${item}`)].join('\n');
}

function formatBlueprint(project: PodcastProject) {
  return [
    `# ${project.name} — Blueprint`,
    '',
    `**Tagline:** ${project.blueprint.tagline}`,
    '',
    `## Description\n${project.blueprint.description}`,
    '',
    `## Listener Promise\n${project.blueprint.listenerPromise}`,
    '',
    formatList('Show Format', project.blueprint.format),
    '',
    formatList('Content Pillars', project.blueprint.pillars)
  ].join('\n');
}

function formatEpisodes(project: PodcastProject) {
  return [
    `# ${project.name} — Episodes`,
    '',
    ...project.episodes.map((episode, index) =>
      [
        `## ${index + 1}. ${episode.title}`,
        `**Status:** ${episode.status}`,
        `**Publish date:** ${episode.publishDate || 'Not scheduled'}`,
        '',
        `**Hook:** ${episode.hook}`,
        `**Main idea:** ${episode.mainIdea || episode.hook}`,
        '',
        formatList('Talking Points', episode.segments),
        '',
        `**Listener takeaway:** ${episode.listenerTakeaway || 'Add listener takeaway.'}`,
        episode.notes ? `\n**Notes:** ${episode.notes}` : ''
      ].join('\n')
    )
  ].join('\n\n');
}

function formatGuests(project: PodcastProject) {
  return [
    `# ${project.name} — Guest List`,
    '',
    ...project.guests.map((guest, index) =>
      [
        `## ${index + 1}. ${guest.name}`,
        `**Status:** ${guest.status}`,
        `**Why they fit:** ${guest.fit}`,
        `**Outreach angle:** ${guest.episodeAngle}`,
        guest.notes ? `**Notes:** ${guest.notes}` : ''
      ].join('\n')
    )
  ].join('\n\n');
}

function formatLaunchChecklist(project: PodcastProject) {
  return [
    `# ${project.name} — Launch Checklist`,
    '',
    ...project.launchItems.map((item, index) =>
      [
        `## ${index + 1}. ${item.label}`,
        `**Status:** ${getLaunchStatus(item)}`,
        `**Priority:** ${getLaunchPriority(item)}`,
        `**Due date:** ${item.dueDate || 'Not scheduled'}`,
        item.notes ? `**Notes:** ${item.notes}` : ''
      ].join('\n')
    )
  ].join('\n\n');
}

function formatStarterKit(project: PodcastProject) {
  return [
    `# ${project.name} — Starter Kit`,
    '',
    `## Trailer Script\n${project.starterKit.trailerScript}`,
    '',
    formatList('First Episode Outline', project.starterKit.firstEpisodeOutline),
    '',
    formatList('Social Launch Posts', project.starterKit.socialLaunchPosts),
    '',
    formatList('Recording Setup Checklist', project.starterKit.recordingSetup),
    '',
    formatList('Weekly Production Workflow', project.starterKit.weeklyWorkflow)
  ].join('\n');
}

function formatFullExport(project: PodcastProject) {
  return [
    `# ${project.name} — Kodiak Cast Launch Kit`,
    '',
    formatBlueprint(project),
    '',
    formatStarterKit(project),
    '',
    formatEpisodes(project),
    '',
    formatGuests(project),
    '',
    formatLaunchChecklist(project)
  ].join('\n\n---\n\n');
}

function downloadMarkdown(project: PodcastProject, markdown: string) {
  const safeName = project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'podcast-project';
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${safeName}-kodiak-cast-launch-kit.md`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function LaunchCommandCenter({
  copyStatus,
  onAddTask,
  onCopy,
  onDeleteTask,
  onMarkDone,
  onTaskChange,
  project
}: LaunchCommandCenterProps) {
  const readiness = calculateReadiness(project);
  const fullExport = formatFullExport(project);
  const blueprintExport = formatBlueprint(project);
  const episodeExport = formatEpisodes(project);
  const guestExport = formatGuests(project);
  const launchExport = formatLaunchChecklist(project);

  return (
    <section className="content-stack">
      <section className="panel launch-command-panel">
        <div className="launch-command-header">
          <div className="section-heading">
            <p className="eyebrow">Launch Command Center</p>
            <h2>Move {project.name} from planned to published.</h2>
            <p>Edit launch tasks, assign priority and due dates, export the plan, and track whether the show is actually launch-ready.</p>
          </div>
          <div className="readiness-card">
            <span>Launch Readiness</span>
            <strong>{readiness.score}%</strong>
            <small>{readiness.completed} of {readiness.total} readiness checks complete</small>
          </div>
        </div>

        <div className="readiness-checks">
          {readiness.criteria.map((criterion) => (
            <span key={criterion.label} className={criterion.done ? 'ready-check done' : 'ready-check'}>
              {criterion.done ? '✓' : '•'} {criterion.label}
            </span>
          ))}
        </div>
      </section>

      <section className="panel export-panel">
        <div className="section-heading">
          <p className="eyebrow">Export</p>
          <h2>Take the podcast plan out of Kodiak Cast.</h2>
          <p>Copy pieces into docs, notes, Notion, email, or download a Markdown launch kit.</p>
        </div>
        <div className="export-grid">
          <button className="primary-button" onClick={() => onCopy('Full launch kit', fullExport)} type="button">
            Copy Full Starter Kit
          </button>
          <button className="secondary-button" onClick={() => downloadMarkdown(project, fullExport)} type="button">
            Download .md
          </button>
          <button className="secondary-button" onClick={() => onCopy('Blueprint', blueprintExport)} type="button">
            Copy Blueprint
          </button>
          <button className="secondary-button" onClick={() => onCopy('Episodes', episodeExport)} type="button">
            Copy Episodes
          </button>
          <button className="secondary-button" onClick={() => onCopy('Guest list', guestExport)} type="button">
            Copy Guest List
          </button>
          <button className="secondary-button" onClick={() => onCopy('Launch checklist', launchExport)} type="button">
            Copy Launch Checklist
          </button>
        </div>
        {copyStatus ? <span className="copy-status">{copyStatus}</span> : null}
      </section>

      <section className="panel launch-task-panel">
        <div className="workspace-toolbar-panel flush-toolbar">
          <div className="section-heading">
            <p className="eyebrow">Launch Tasks</p>
            <h2>Build the launch one task at a time.</h2>
            <p>Each task can carry status, priority, due date, and notes so the launch plan is more than a checkbox list.</p>
          </div>
          <div className="workspace-toolbar-actions">
            <button className="primary-button" onClick={onAddTask} type="button">
              Add Task
            </button>
            <button className="secondary-button" onClick={() => onCopy('Launch plan', launchExport)} type="button">
              Copy Launch Plan
            </button>
          </div>
        </div>

        <div className="launch-task-grid">
          {project.launchItems.map((task) => {
            const status = getLaunchStatus(task);
            const priority = getLaunchPriority(task);

            return (
              <article key={task.id} className={status === 'done' ? 'launch-task-card done' : 'launch-task-card'}>
                <div className="launch-task-topline">
                  <textarea
                    aria-label="Launch task title"
                    onChange={(event) => onTaskChange(task.id, { ...task, label: event.target.value })}
                    rows={2}
                    value={task.label}
                  />
                  <button className="secondary-button small-action-button danger-button" onClick={() => onDeleteTask(task.id)} type="button">
                    Delete
                  </button>
                </div>

                <div className="launch-task-meta-grid">
                  <label>
                    Status
                    <select
                      onChange={(event) =>
                        onTaskChange(task.id, {
                          ...task,
                          done: event.target.value === 'done',
                          status: event.target.value as LaunchStatus
                        })
                      }
                      value={status}
                    >
                      {statusOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Priority
                    <select
                      onChange={(event) => onTaskChange(task.id, { ...task, priority: event.target.value as LaunchPriority })}
                      value={priority}
                    >
                      {priorityOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Due date
                    <input
                      onChange={(event) => onTaskChange(task.id, { ...task, dueDate: event.target.value })}
                      type="date"
                      value={task.dueDate ?? ''}
                    />
                  </label>
                </div>

                <label className="launch-task-notes">
                  Notes
                  <textarea
                    onChange={(event) => onTaskChange(task.id, { ...task, notes: event.target.value })}
                    rows={3}
                    value={task.notes ?? ''}
                  />
                </label>

                <div className="work-card-actions">
                  <button className="secondary-button" onClick={() => onMarkDone(task.id)} type="button">
                    Mark Done
                  </button>
                  <button className="secondary-button" onClick={() => onCopy('Launch task', `${task.label}\nStatus: ${status}\nPriority: ${priority}\nDue: ${task.dueDate || 'Not scheduled'}\n${task.notes ?? ''}`)} type="button">
                    Copy Task
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </section>
  );
}
