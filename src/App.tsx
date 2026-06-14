import { useEffect, useMemo, useState } from 'react';
import { BlueprintForm } from './components/BlueprintForm';
import { ConfirmDialog } from './components/ConfirmDialog';
import {
  EditableBlueprint,
  type BlueprintListField,
  type BlueprintTextField
} from './components/EditableBlueprint';
import { EpisodeCard } from './components/EpisodeCard';
import { GuestCard } from './components/GuestCard';
import { MetricCard } from './components/MetricCard';
import { Sidebar } from './components/Sidebar';
import { StarterKitPanel } from './components/StarterKitPanel';
import { generateBlueprint, generateGuestLeads, generateStarterKit } from './lib/blueprint';
import { clearWorkspace, loadWorkspace, saveWorkspace } from './lib/workspaceStorage';
import type {
  ChecklistItem,
  EpisodeIdea,
  GuestLead,
  PodcastBlueprint,
  PodcastInputs,
  PodcastProject
} from './types';
import './styles.css';
import './blueprintEditor.css';
import './workspace.css';

const emptyInputs: PodcastInputs = {
  showName: '',
  niche: '',
  audience: '',
  tone: '',
  format: '',
  cadence: 'weekly',
  goal: ''
};

type PendingConfirmation = {
  confirmLabel: string;
  message: string;
  onConfirm: () => void;
  title: string;
  variant?: 'default' | 'danger';
} | null;

function createProjectId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `project-${crypto.randomUUID()}`;
  }

  return `project-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function cloneEpisodes(episodes: EpisodeIdea[], namespace: string) {
  return episodes.map((episode, index) => ({
    ...episode,
    id: `${namespace}-episode-${index + 1}-${episode.id}`,
    segments: [...episode.segments],
    clipIdeas: [...episode.clipIdeas]
  }));
}

function cloneGuests(guests: GuestLead[], namespace: string) {
  return guests.map((guest, index) => ({
    ...guest,
    id: `${namespace}-guest-${index + 1}-${guest.id}`
  }));
}

function buildEpisodesForProject(projectId: string, blueprint: PodcastBlueprint) {
  return cloneEpisodes(blueprint.firstEpisodes, projectId);
}

function buildGuestsForProject(projectId: string, inputs: PodcastInputs) {
  return cloneGuests(generateGuestLeads(inputs), projectId);
}

function createPodcastProject(inputs: PodcastInputs, fallbackName = 'Untitled Podcast'): PodcastProject {
  const now = new Date().toISOString();
  const id = createProjectId();
  const blueprint = generateBlueprint(inputs);
  const name = inputs.showName.trim() || fallbackName;

  return {
    id,
    name,
    createdAt: now,
    updatedAt: now,
    inputs,
    blueprint,
    launchItems: blueprint.launchChecklist,
    episodes: buildEpisodesForProject(id, blueprint),
    guests: buildGuestsForProject(id, inputs),
    starterKit: generateStarterKit(inputs, blueprint)
  };
}

function createBlankProject(projectNumber: number) {
  return createPodcastProject(emptyInputs, `Podcast Project ${projectNumber}`);
}

function formatSavedAt(savedAt: string) {
  if (!savedAt) {
    return 'Not saved yet';
  }

  const savedDate = new Date(savedAt);

  if (Number.isNaN(savedDate.getTime())) {
    return 'Not saved yet';
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(savedDate);
}

function App() {
  const restoredWorkspace = useMemo(() => loadWorkspace(), []);
  const initialProjects = restoredWorkspace?.projects ?? [];
  const initialActiveProjectId = restoredWorkspace?.activeProjectId ?? initialProjects[0]?.id ?? '';

  const [activeSection, setActiveSection] = useState('dashboard');
  const [projects, setProjects] = useState<PodcastProject[]>(initialProjects);
  const [activeProjectId, setActiveProjectId] = useState(initialActiveProjectId);
  const [lastSavedAt, setLastSavedAt] = useState(restoredWorkspace?.savedAt ?? '');
  const [saveStatus, setSaveStatus] = useState(
    restoredWorkspace ? 'Restored saved workspace' : 'Ready to create first project'
  );
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation>(null);

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) ?? projects[0] ?? null,
    [activeProjectId, projects]
  );
  const hasProjects = projects.length > 0;
  const completedLaunchItems = activeProject?.launchItems.filter((item) => item.done).length ?? 0;
  const formattedSaveTime = useMemo(() => formatSavedAt(lastSavedAt), [lastSavedAt]);

  useEffect(() => {
    const savedWorkspace = saveWorkspace({ projects, activeProjectId: activeProject?.id ?? '' });

    if (savedWorkspace) {
      setLastSavedAt(savedWorkspace.savedAt);
      setSaveStatus(projects.length > 0 ? 'Saved locally' : 'Workspace empty');
      return;
    }

    setSaveStatus('Unable to save locally');
  }, [activeProject?.id, activeProjectId, projects]);

  const updateProject = (projectId: string, updater: (project: PodcastProject) => PodcastProject) => {
    setProjects((currentProjects) =>
      currentProjects.map((project) => {
        if (project.id !== projectId) {
          return project;
        }

        const nextProject = updater(project);

        return {
          ...nextProject,
          id: project.id,
          createdAt: project.createdAt,
          updatedAt: new Date().toISOString(),
          name: nextProject.inputs.showName.trim() || nextProject.name || 'Untitled Podcast'
        };
      })
    );
  };

  const updateActiveProject = (updater: (project: PodcastProject) => PodcastProject) => {
    if (!activeProject) {
      return;
    }

    updateProject(activeProject.id, updater);
  };

  const handleInputsChange = (nextInputs: PodcastInputs) => {
    updateActiveProject((project) => ({
      ...project,
      name: nextInputs.showName.trim() || project.name,
      inputs: nextInputs
    }));
  };

  const handleGenerate = () => {
    if (!activeProject) {
      return;
    }

    const nextBlueprint = generateBlueprint(activeProject.inputs);
    const nextStarterKit = generateStarterKit(activeProject.inputs, nextBlueprint);

    updateActiveProject((project) => ({
      ...project,
      blueprint: nextBlueprint,
      launchItems: nextBlueprint.launchChecklist,
      episodes: buildEpisodesForProject(project.id, nextBlueprint),
      guests: buildGuestsForProject(project.id, activeProject.inputs),
      starterKit: nextStarterKit
    }));

    setSaveStatus('Starter kit generated');
    setActiveSection('blueprint');
  };

  const handleCreateProject = () => {
    const nextProject = createBlankProject(projects.length + 1);

    setProjects((currentProjects) => [...currentProjects, nextProject]);
    setActiveProjectId(nextProject.id);
    setActiveSection('blueprint');
    setSaveStatus('New podcast project created');
  };

  const handleDeleteProject = (projectId: string) => {
    const projectToDelete = projects.find((project) => project.id === projectId);

    if (!projectToDelete) {
      return;
    }

    setPendingConfirmation({
      confirmLabel: 'Delete Project',
      message: 'This only removes it from this local workspace. Your other podcast projects stay untouched.',
      onConfirm: () => {
        const nextProjects = projects.filter((project) => project.id !== projectId);
        setProjects(nextProjects);
        setSaveStatus('Project deleted');

        if (nextProjects.length === 0) {
          setActiveProjectId('');
          setActiveSection('dashboard');
          return;
        }

        if (activeProjectId === projectId) {
          setActiveProjectId(nextProjects[0].id);
          setActiveSection('dashboard');
        }
      },
      title: `Delete "${projectToDelete.name}"?`,
      variant: 'danger'
    });
  };

  const handleResetWorkspace = () => {
    setPendingConfirmation({
      confirmLabel: 'Clear Workspace',
      message: 'This clears every local podcast project from this browser. Use it when you want a fresh Kodiak Cast workspace.',
      onConfirm: () => {
        clearWorkspace();
        setProjects([]);
        setActiveProjectId('');
        setLastSavedAt('');
        setSaveStatus('Workspace cleared');
        setActiveSection('dashboard');
      },
      title: 'Clear the whole workspace?',
      variant: 'danger'
    });
  };

  const handleConfirmAction = () => {
    if (!pendingConfirmation) {
      return;
    }

    const action = pendingConfirmation.onConfirm;
    setPendingConfirmation(null);
    action();
  };

  const updateBlueprintText = (field: BlueprintTextField, value: string) => {
    updateActiveProject((project) => ({
      ...project,
      blueprint: {
        ...project.blueprint,
        [field]: value
      }
    }));
  };

  const updateBlueprintListItem = (field: BlueprintListField, index: number, value: string) => {
    updateActiveProject((project) => ({
      ...project,
      blueprint: {
        ...project.blueprint,
        [field]: project.blueprint[field].map((item, itemIndex) => (itemIndex === index ? value : item))
      }
    }));
  };

  const addBlueprintListItem = (field: BlueprintListField) => {
    updateActiveProject((project) => ({
      ...project,
      blueprint: {
        ...project.blueprint,
        [field]: [...project.blueprint[field], 'New item to shape']
      }
    }));
  };

  const removeBlueprintListItem = (field: BlueprintListField, index: number) => {
    updateActiveProject((project) => {
      const nextItems = project.blueprint[field].filter((_, itemIndex) => itemIndex !== index);

      return {
        ...project,
        blueprint: {
          ...project.blueprint,
          [field]: nextItems.length > 0 ? nextItems : ['']
        }
      };
    });
  };

  const toggleLaunchItem = (id: string) => {
    updateActiveProject((project) => ({
      ...project,
      launchItems: project.launchItems.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    }));
  };

  return (
    <div className="app-shell">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      <main className="main-content">
        <header className="hero">
          <div>
            <p className="eyebrow">Podcast operating system</p>
            <h2>Plan, launch, and maintain multiple podcasts.</h2>
            <p>
              Kodiak Cast is becoming an AI-guided workspace for show setup, content generation,
              guest planning, launch checklists, and repeatable publishing systems.
            </p>
          </div>
          <div className="hero-actions">
            {activeProject ? (
              <label className="project-picker">
                Active project
                <select value={activeProject.id} onChange={(event) => setActiveProjectId(event.target.value)}>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <div className="project-picker">
                <span>Active project</span>
                <div className="empty-picker">No active project yet</div>
              </div>
            )}
            <button className="primary-button" onClick={handleCreateProject} type="button">
              New Podcast Project
            </button>
            <button
              className="secondary-button"
              disabled={!activeProject}
              onClick={() => setActiveSection('blueprint')}
              type="button"
            >
              Open Blueprint
            </button>
            <button className="secondary-button" disabled={!hasProjects} onClick={handleResetWorkspace} type="button">
              Reset Workspace
            </button>
            <div className="save-status" aria-live="polite">
              <span className="save-dot" aria-hidden="true" />
              <span>{saveStatus}</span>
              <small>{formattedSaveTime}</small>
            </div>
          </div>
        </header>

        {activeSection === 'dashboard' && (
          <section className="content-stack">
            <section className="panel project-library-panel">
              <div className="section-heading">
                <p className="eyebrow">Project Library</p>
                <h2>Every show gets its own workspace.</h2>
                <p>
                  Create multiple podcast projects, switch between them, and keep each blueprint, launch checklist,
                  episodes, guest list, and starter kit separate.
                </p>
              </div>

              {projects.length === 0 ? (
                <article className="project-card empty-project-card">
                  <div>
                    <span>Start here</span>
                    <h3>Create your first podcast project.</h3>
                    <p>
                      Start with your own show, then generate the blueprint, starter episodes, guest angles,
                      trailer script, social launch posts, and launch checklist around that idea.
                    </p>
                  </div>
                  <button className="primary-button" onClick={handleCreateProject} type="button">
                    Create First Project
                  </button>
                </article>
              ) : (
                <div className="project-grid">
                  {projects.map((project) => (
                    <article key={project.id} className={project.id === activeProject?.id ? 'project-card active' : 'project-card'}>
                      <div>
                        <span>{project.id === activeProject?.id ? 'Active project' : 'Saved project'}</span>
                        <h3>{project.name}</h3>
                        <p>{project.blueprint.tagline}</p>
                      </div>
                      <div className="project-card-actions">
                        <button
                          className="secondary-button"
                          onClick={() => {
                            setActiveProjectId(project.id);
                            setActiveSection('blueprint');
                          }}
                          type="button"
                        >
                          Open
                        </button>
                        <button className="secondary-button danger-button" onClick={() => handleDeleteProject(project.id)} type="button">
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <div className="metric-grid">
              <MetricCard label="Projects" value={String(projects.length)} note="Podcast workspaces" />
              <MetricCard label="Active" value={activeProject?.name ?? 'None yet'} note="Current project" />
              <MetricCard label="Episodes" value={String(activeProject?.episodes.length ?? 0)} note="Ideas ready to shape" />
              <MetricCard
                label="Launch"
                value={activeProject ? `${completedLaunchItems}/${activeProject.launchItems.length}` : '0/0'}
                note="Checklist complete"
              />
            </div>

            <section className="panel two-column-panel">
              <div>
                <p className="eyebrow">Next Action</p>
                <h2>{activeProject ? 'Generate the full starter kit for this show.' : 'Create your first real podcast project.'}</h2>
                <p>
                  {activeProject
                    ? 'Fill out the setup wizard, generate the starter kit, then shape the promise, format, pillars, first episodes, guest list, trailer script, launch posts, and checklist until it sounds like the real show.'
                    : 'Start with your own podcast idea instead of a demo project. The workspace will save each show separately as you build it.'}
                </p>
              </div>
              <div className="action-list">
                <span>{activeProject ? 'Choose the active podcast project' : 'Create the first podcast project'}</span>
                <span>Answer the setup wizard</span>
                <span>Generate the full starter kit</span>
                <span>Refine and save the launch assets</span>
              </div>
            </section>

            <section className="panel">
              <div className="section-heading">
                <p className="eyebrow">This Week</p>
                <h2>{activeProject ? 'Suggested episode focus' : 'No episode focus yet'}</h2>
              </div>
              {activeProject ? (
                <EpisodeCard episode={activeProject.episodes[0]} />
              ) : (
                <p>Create a podcast project and generate its starter kit to get the first suggested episode focus.</p>
              )}
            </section>
          </section>
        )}

        {activeSection === 'blueprint' && (
          <section className="content-stack">
            {activeProject ? (
              <>
                <BlueprintForm inputs={activeProject.inputs} onChange={handleInputsChange} onGenerate={handleGenerate} />

                <EditableBlueprint
                  blueprint={activeProject.blueprint}
                  onAddListItem={addBlueprintListItem}
                  onListItemChange={updateBlueprintListItem}
                  onRemoveListItem={removeBlueprintListItem}
                  onTextChange={updateBlueprintText}
                />

                <StarterKitPanel projectName={activeProject.name} starterKit={activeProject.starterKit} />
              </>
            ) : (
              <section className="panel empty-section-panel">
                <p className="eyebrow">Blueprint</p>
                <h2>No project selected.</h2>
                <p>Create your first podcast project before generating a starter kit.</p>
                <button className="primary-button" onClick={handleCreateProject} type="button">
                  Create First Project
                </button>
              </section>
            )}
          </section>
        )}

        {activeSection === 'episodes' && (
          <section className="content-stack">
            <section className="section-heading outside-heading">
              <p className="eyebrow">Episode Pipeline</p>
              <h2>Ideas become outlines. Outlines become recordings.</h2>
            </section>
            {activeProject ? (
              <div className="episode-grid">
                {activeProject.episodes.map((episode) => (
                  <EpisodeCard key={episode.id} episode={episode} />
                ))}
              </div>
            ) : (
              <section className="panel empty-section-panel">
                <h2>No episode pipeline yet.</h2>
                <p>Create a podcast project and generate its starter kit to seed episode ideas.</p>
                <button className="primary-button" onClick={handleCreateProject} type="button">
                  Create First Project
                </button>
              </section>
            )}
          </section>
        )}

        {activeSection === 'guests' && (
          <section className="content-stack">
            {activeProject ? (
              <>
                <section className="section-heading outside-heading">
                  <p className="eyebrow">Guest CRM</p>
                  <h2>Track who fits {activeProject.name} and why they should say yes.</h2>
                </section>
                <div className="guest-grid">
                  {activeProject.guests.map((guest) => (
                    <GuestCard key={guest.id} guest={guest} />
                  ))}
                </div>
                <section className="panel">
                  <p className="eyebrow">Outreach Draft</p>
                  <h2>Starter guest pitch</h2>
                  <p className="pitch-copy">
                    Hey [Name], I am launching {activeProject.name}, a show about {activeProject.inputs.niche || 'a focused topic'}.
                    I think your story around [specific angle] would give listeners something practical and honest.
                    Would you be open to joining me for a focused conversation?
                  </p>
                </section>
              </>
            ) : (
              <section className="panel empty-section-panel">
                <p className="eyebrow">Guest CRM</p>
                <h2>No guest workspace yet.</h2>
                <p>Create a podcast project before tracking guest ideas and outreach angles.</p>
                <button className="primary-button" onClick={handleCreateProject} type="button">
                  Create First Project
                </button>
              </section>
            )}
          </section>
        )}

        {activeSection === 'launch' && (
          <section className="content-stack">
            {activeProject ? (
              <>
                <section className="panel">
                  <div className="section-heading">
                    <p className="eyebrow">Launch Checklist</p>
                    <h2>Keep {activeProject.name} moving.</h2>
                    <p>Click items as they are completed. Each project saves its own progress locally in this browser.</p>
                  </div>

                  <div className="checklist">
                    {activeProject.launchItems.map((item: ChecklistItem) => (
                      <label key={item.id} className={item.done ? 'checked' : ''}>
                        <input
                          checked={item.done}
                          onChange={() => toggleLaunchItem(item.id)}
                          type="checkbox"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </section>

                <StarterKitPanel projectName={activeProject.name} starterKit={activeProject.starterKit} />
              </>
            ) : (
              <section className="panel empty-section-panel">
                <p className="eyebrow">Launch Checklist</p>
                <h2>No launch checklist yet.</h2>
                <p>Create a podcast project and generate its starter kit to build a launch checklist.</p>
                <button className="primary-button" onClick={handleCreateProject} type="button">
                  Create First Project
                </button>
              </section>
            )}
          </section>
        )}
      </main>

      {pendingConfirmation ? (
        <ConfirmDialog
          confirmLabel={pendingConfirmation.confirmLabel}
          message={pendingConfirmation.message}
          onCancel={() => setPendingConfirmation(null)}
          onConfirm={handleConfirmAction}
          title={pendingConfirmation.title}
          variant={pendingConfirmation.variant}
        />
      ) : null}
    </div>
  );
}

export default App;
