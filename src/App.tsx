import { useEffect, useMemo, useState } from 'react';
import { AiSettingsPanel } from './components/AiSettingsPanel';
import { BlueprintForm } from './components/BlueprintForm';
import { ConfirmDialog } from './components/ConfirmDialog';
import {
  EditableBlueprint,
  type BlueprintListField,
  type BlueprintTextField
} from './components/EditableBlueprint';
import { EpisodeCard } from './components/EpisodeCard';
import { GuestCard } from './components/GuestCard';
import { LaunchCommandCenter } from './components/LaunchCommandCenter';
import { MetricCard } from './components/MetricCard';
import { ProjectWizard } from './components/ProjectWizard';
import { Sidebar } from './components/Sidebar';
import {
  StarterKitPanel,
  type StarterKitListField,
  type StarterKitTextField
} from './components/StarterKitPanel';
import { generateBlueprint, generateGuestLeads, generateStarterKit } from './lib/blueprint';
import { canUseAi, loadAiSettings } from './lib/aiSettings';
import { generateAiStarterKit, type AiStarterKitResult } from './lib/openAiGenerator';
import { clearWorkspace, loadWorkspace, saveWorkspace } from './lib/workspaceStorage';
import type {
  ChecklistItem,
  EpisodeIdea,
  EpisodeStatus,
  GuestLead,
  GuestStatus,
  PodcastBlueprint,
  PodcastInputs,
  PodcastProject,
  PodcastStarterKit
} from './types';
import './styles.css';
import './blueprintEditor.css';
import './workspace.css';
import './launchCommand.css';
import './aiSettings.css';

type PendingConfirmation = {
  confirmLabel: string;
  message: string;
  onConfirm: () => void;
  title: string;
  variant?: 'default' | 'danger';
} | null;

const episodeStatusFlow: EpisodeStatus[] = ['idea', 'outlined', 'ready', 'recorded', 'published'];

function createProjectId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `project-${crypto.randomUUID()}`;
  }

  return `project-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createWorkItemId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeEpisodeStatus(status: EpisodeStatus): EpisodeStatus {
  if (status === 'outline') {
    return 'outlined';
  }

  if (status === 'scheduled') {
    return 'ready';
  }

  return status;
}

function normalizeLaunchItem(item: ChecklistItem, index = 0): ChecklistItem {
  const status = item.status ?? (item.done ? 'done' : 'todo');

  return {
    ...item,
    done: status === 'done',
    status,
    priority: item.priority ?? (index < 3 ? 'high' : 'medium'),
    dueDate: item.dueDate ?? '',
    notes: item.notes ?? ''
  };
}

function cloneEpisodes(episodes: EpisodeIdea[], namespace: string) {
  return episodes.map((episode, index) => ({
    ...episode,
    id: `${namespace}-episode-${index + 1}-${episode.id}`,
    status: normalizeEpisodeStatus(episode.status),
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

function buildLaunchItems(blueprint: PodcastBlueprint) {
  return blueprint.launchChecklist.map(normalizeLaunchItem);
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
    launchItems: buildLaunchItems(blueprint),
    episodes: buildEpisodesForProject(id, blueprint),
    guests: buildGuestsForProject(id, inputs),
    starterKit: generateStarterKit(inputs, blueprint)
  };
}

function applyGeneratedKit(project: PodcastProject, generatedKit: AiStarterKitResult): PodcastProject {
  const launchItems = generatedKit.launchItems.map((item, index) =>
    normalizeLaunchItem({ ...item, id: `${project.id}-launch-${index + 1}-${item.id}` }, index)
  );
  const episodes = cloneEpisodes(generatedKit.episodes, project.id);
  const guests = cloneGuests(generatedKit.guests, project.id);

  return {
    ...project,
    blueprint: {
      ...generatedKit.blueprint,
      firstEpisodes: episodes,
      launchChecklist: launchItems
    },
    episodes,
    guests,
    launchItems,
    starterKit: generatedKit.starterKit
  };
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

function copyWithFallback(value: string) {
  const textArea = document.createElement('textarea');
  textArea.value = value;
  textArea.setAttribute('readonly', 'true');
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong.';
}

function formatEpisodeOutline(episode: EpisodeIdea) {
  const segments = episode.segments?.length ? episode.segments : ['Main talking point'];
  const clips = episode.clipIdeas?.length ? episode.clipIdeas : [];

  return [
    `Episode: ${episode.title}`,
    `Status: ${normalizeEpisodeStatus(episode.status)}`,
    '',
    `Hook:\n${episode.hook}`,
    '',
    `Main idea:\n${episode.mainIdea || episode.hook}`,
    '',
    `Talking points:\n${segments.map((segment, index) => `${index + 1}. ${segment}`).join('\n')}`,
    '',
    `Listener takeaway:\n${episode.listenerTakeaway || clips[0] || 'Give the listener one clear next step.'}`,
    '',
    `Publish date: ${episode.publishDate || 'Not scheduled yet'}`,
    '',
    episode.notes ? `Recording notes:\n${episode.notes}` : 'Recording notes: Add recording notes here.'
  ].join('\n');
}

function formatGuestPitch(project: PodcastProject, guest: GuestLead) {
  return [
    'Hey [Name],',
    '',
    `I am building ${project.name}, a podcast about ${project.inputs.niche || 'a focused topic'}.`,
    `I think your perspective around “${guest.episodeAngle || 'this angle'}” would give listeners something useful and honest.`,
    '',
    `The reason I think you fit: ${guest.fit || 'you have a story or skill that lines up with the show promise'}.`,
    '',
    'Would you be open to joining me for a focused conversation?'
  ].join('\n');
}

function makeBlankEpisode(project: PodcastProject): EpisodeIdea {
  return {
    id: createWorkItemId(`${project.id}-episode`),
    title: 'New episode idea',
    hook: 'Open with the real problem this episode solves.',
    mainIdea: 'What is the one big idea this episode should prove?',
    listenerTakeaway: 'Give the listener one clear next step they can actually use.',
    notes: '',
    publishDate: '',
    status: 'idea',
    segments: ['Set up the problem', 'Tell the story or teach the lesson', 'Give the listener a next action'],
    clipIdeas: ['One short punchy lesson from the episode']
  };
}

function makeBlankGuest(project: PodcastProject): GuestLead {
  return {
    id: createWorkItemId(`${project.id}-guest`),
    name: 'New guest lead',
    fit: 'Why this guest belongs on the show.',
    episodeAngle: 'What useful conversation angle would make them say yes?',
    notes: '',
    status: 'wishlist'
  };
}

function makeBlankLaunchTask(project: PodcastProject): ChecklistItem {
  return {
    id: createWorkItemId(`${project.id}-launch`),
    label: 'New launch task',
    done: false,
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    notes: ''
  };
}

function calculateLaunchReadiness(project: PodcastProject | null) {
  if (!project) {
    return 0;
  }

  const completedLaunchTasks = project.launchItems.filter((item) => item.done || item.status === 'done').length;
  const readyEpisodes = project.episodes.filter((episode) => {
    const status = normalizeEpisodeStatus(episode.status);
    return status === 'ready' || status === 'recorded' || status === 'published';
  }).length;

  const checks = [
    Boolean(project.blueprint.description && project.blueprint.listenerPromise && project.blueprint.tagline),
    Boolean(project.starterKit.trailerScript && project.starterKit.socialLaunchPosts.length),
    project.episodes.length >= 3,
    readyEpisodes >= 1,
    project.guests.length >= 1,
    completedLaunchTasks > 0
  ];

  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
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
  const [aiStatus, setAiStatus] = useState('AI generator waiting for settings');
  const [copyStatus, setCopyStatus] = useState('');
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation>(null);
  const [isProjectWizardOpen, setProjectWizardOpen] = useState(false);

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) ?? projects[0] ?? null,
    [activeProjectId, projects]
  );
  const hasProjects = projects.length > 0;
  const activeEpisodes = activeProject?.episodes ?? [];
  const activeGuests = activeProject?.guests ?? [];
  const completedLaunchItems = activeProject?.launchItems.filter((item) => item.done || item.status === 'done').length ?? 0;
  const launchRemaining = activeProject ? activeProject.launchItems.length - completedLaunchItems : 0;
  const episodesInProgress = activeEpisodes.filter((episode) => normalizeEpisodeStatus(episode.status) !== 'published').length;
  const episodesReadyToRecord = activeEpisodes.filter((episode) => normalizeEpisodeStatus(episode.status) === 'ready').length;
  const guestsToContact = activeGuests.filter((guest) => guest.status === 'wishlist').length;
  const launchReadiness = calculateLaunchReadiness(activeProject);
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
          name: nextProject.inputs.showName.trim() || nextProject.name || 'Untitled Podcast',
          launchItems: nextProject.launchItems.map(normalizeLaunchItem)
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

  const tryGenerateWithAi = async (inputs: PodcastInputs) => {
    const settings = loadAiSettings();

    if (!canUseAi(settings)) {
      return null;
    }

    setAiStatus(`Asking OpenAI (${settings.model}) to build the starter kit...`);
    const generatedKit = await generateAiStarterKit(inputs, settings);
    setAiStatus('OpenAI starter kit generated');
    return generatedKit;
  };

  const generateLocalKitForProject = (project: PodcastProject) => {
    const nextBlueprint = generateBlueprint(project.inputs);

    return {
      ...project,
      blueprint: nextBlueprint,
      launchItems: buildLaunchItems(nextBlueprint),
      episodes: buildEpisodesForProject(project.id, nextBlueprint),
      guests: buildGuestsForProject(project.id, project.inputs),
      starterKit: generateStarterKit(project.inputs, nextBlueprint)
    };
  };

  const handleInputsChange = (nextInputs: PodcastInputs) => {
    updateActiveProject((project) => ({
      ...project,
      name: nextInputs.showName.trim() || project.name,
      inputs: nextInputs
    }));
  };

  const handleGenerate = async () => {
    if (!activeProject) {
      return;
    }

    try {
      const generatedKit = await tryGenerateWithAi(activeProject.inputs);

      if (generatedKit) {
        updateProject(activeProject.id, (project) => applyGeneratedKit(project, generatedKit));
        setActiveSection('blueprint');
        setSaveStatus('AI starter kit generated');
        return;
      }
    } catch (error) {
      setAiStatus(`AI failed: ${getErrorMessage(error)} Using local generator.`);
    }

    updateProject(activeProject.id, generateLocalKitForProject);
    setSaveStatus('Local starter kit generated');
    setActiveSection('blueprint');
  };

  const handleRegenerateBlueprint = async () => {
    if (!activeProject) {
      return;
    }

    try {
      const generatedKit = await tryGenerateWithAi(activeProject.inputs);

      if (generatedKit) {
        updateProject(activeProject.id, (project) => ({
          ...project,
          blueprint: {
            ...generatedKit.blueprint,
            firstEpisodes: project.episodes,
            launchChecklist: project.launchItems
          },
          starterKit: generatedKit.starterKit
        }));
        setSaveStatus('AI blueprint regenerated');
        return;
      }
    } catch (error) {
      setAiStatus(`AI failed: ${getErrorMessage(error)} Using local blueprint.`);
    }

    updateProject(activeProject.id, (project) => {
      const nextBlueprint = generateBlueprint(project.inputs);

      return {
        ...project,
        blueprint: nextBlueprint,
        starterKit: generateStarterKit(project.inputs, nextBlueprint)
      };
    });
    setSaveStatus('Blueprint regenerated');
  };

  const handleRegenerateEpisodes = async () => {
    if (!activeProject) {
      return;
    }

    try {
      const generatedKit = await tryGenerateWithAi(activeProject.inputs);

      if (generatedKit) {
        updateProject(activeProject.id, (project) => ({
          ...project,
          episodes: cloneEpisodes(generatedKit.episodes, project.id)
        }));
        setSaveStatus('AI episode ideas regenerated');
        setActiveSection('episodes');
        return;
      }
    } catch (error) {
      setAiStatus(`AI failed: ${getErrorMessage(error)} Using local episodes.`);
    }

    updateProject(activeProject.id, (project) => {
      const nextBlueprint = generateBlueprint(project.inputs);

      return {
        ...project,
        episodes: buildEpisodesForProject(project.id, nextBlueprint)
      };
    });
    setSaveStatus('Episode ideas regenerated');
    setActiveSection('episodes');
  };

  const handleRegenerateGuests = async () => {
    if (!activeProject) {
      return;
    }

    try {
      const generatedKit = await tryGenerateWithAi(activeProject.inputs);

      if (generatedKit) {
        updateProject(activeProject.id, (project) => ({
          ...project,
          guests: cloneGuests(generatedKit.guests, project.id)
        }));
        setSaveStatus('AI guest list regenerated');
        setActiveSection('guests');
        return;
      }
    } catch (error) {
      setAiStatus(`AI failed: ${getErrorMessage(error)} Using local guests.`);
    }

    updateProject(activeProject.id, (project) => ({
      ...project,
      guests: buildGuestsForProject(project.id, project.inputs)
    }));
    setSaveStatus('Guest list regenerated');
    setActiveSection('guests');
  };

  const handleRegenerateLaunchPlan = async () => {
    if (!activeProject) {
      return;
    }

    try {
      const generatedKit = await tryGenerateWithAi(activeProject.inputs);

      if (generatedKit) {
        const nextLaunchItems = generatedKit.launchItems.map((item, index) =>
          normalizeLaunchItem({ ...item, id: `${activeProject.id}-launch-${index + 1}-${item.id}` }, index)
        );
        updateProject(activeProject.id, (project) => ({
          ...project,
          blueprint: {
            ...project.blueprint,
            launchChecklist: nextLaunchItems
          },
          launchItems: nextLaunchItems
        }));
        setSaveStatus('AI launch plan regenerated');
        setActiveSection('launch');
        return;
      }
    } catch (error) {
      setAiStatus(`AI failed: ${getErrorMessage(error)} Using local launch plan.`);
    }

    updateProject(activeProject.id, (project) => {
      const nextBlueprint = generateBlueprint(project.inputs);
      const nextLaunchItems = buildLaunchItems(nextBlueprint);

      return {
        ...project,
        blueprint: {
          ...project.blueprint,
          launchChecklist: nextLaunchItems
        },
        launchItems: nextLaunchItems
      };
    });
    setSaveStatus('Launch plan regenerated');
    setActiveSection('launch');
  };

  const handleRegenerateStarterKit = async () => {
    if (!activeProject) {
      return;
    }

    try {
      const generatedKit = await tryGenerateWithAi(activeProject.inputs);

      if (generatedKit) {
        updateProject(activeProject.id, (project) => ({
          ...project,
          starterKit: generatedKit.starterKit
        }));
        setSaveStatus('AI starter kit assets regenerated');
        return;
      }
    } catch (error) {
      setAiStatus(`AI failed: ${getErrorMessage(error)} Using local assets.`);
    }

    updateProject(activeProject.id, (project) => ({
      ...project,
      starterKit: generateStarterKit(project.inputs, project.blueprint)
    }));
    setSaveStatus('Starter kit assets regenerated');
  };

  const handleOpenProjectWizard = () => {
    setProjectWizardOpen(true);
  };

  const handleCreateProjectFromWizard = async (inputs: PodcastInputs) => {
    setProjectWizardOpen(false);
    setSaveStatus('Creating project...');
    let nextProject = createPodcastProject(inputs, `Podcast Project ${projects.length + 1}`);

    try {
      const generatedKit = await tryGenerateWithAi(inputs);

      if (generatedKit) {
        nextProject = applyGeneratedKit(nextProject, generatedKit);
      }
    } catch (error) {
      setAiStatus(`AI failed: ${getErrorMessage(error)} Created with local starter kit.`);
    }

    setProjects((currentProjects) => [...currentProjects, nextProject]);
    setActiveProjectId(nextProject.id);
    setActiveSection('blueprint');
    setSaveStatus('Project created and starter kit generated');
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

  const handleCopyContent = (label: string, value: string) => {
    const runCopy = async () => {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(value);
        } else {
          copyWithFallback(value);
        }

        setCopyStatus(`${label} copied`);
        setSaveStatus(`${label} copied`);
        window.setTimeout(() => setCopyStatus(''), 2500);
      } catch {
        try {
          copyWithFallback(value);
          setCopyStatus(`${label} copied`);
          setSaveStatus(`${label} copied`);
          window.setTimeout(() => setCopyStatus(''), 2500);
        } catch {
          setCopyStatus('Unable to copy');
          setSaveStatus('Unable to copy');
        }
      }
    };

    void runCopy();
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

  const updateStarterKitText = (field: StarterKitTextField, value: string) => {
    updateActiveProject((project) => ({
      ...project,
      starterKit: {
        ...project.starterKit,
        [field]: value
      }
    }));
  };

  const updateStarterKitListItem = (field: StarterKitListField, index: number, value: string) => {
    updateActiveProject((project) => ({
      ...project,
      starterKit: {
        ...project.starterKit,
        [field]: project.starterKit[field].map((item, itemIndex) => (itemIndex === index ? value : item))
      } as PodcastStarterKit
    }));
  };

  const addStarterKitListItem = (field: StarterKitListField) => {
    updateActiveProject((project) => ({
      ...project,
      starterKit: {
        ...project.starterKit,
        [field]: [...project.starterKit[field], 'New item to shape']
      } as PodcastStarterKit
    }));
  };

  const removeStarterKitListItem = (field: StarterKitListField, index: number) => {
    updateActiveProject((project) => {
      const nextItems = project.starterKit[field].filter((_, itemIndex) => itemIndex !== index);

      return {
        ...project,
        starterKit: {
          ...project.starterKit,
          [field]: nextItems.length > 0 ? nextItems : ['']
        } as PodcastStarterKit
      };
    });
  };

  const updateEpisode = (episodeId: string, nextEpisode: EpisodeIdea) => {
    updateActiveProject((project) => ({
      ...project,
      episodes: project.episodes.map((episode) => (episode.id === episodeId ? nextEpisode : episode))
    }));
  };

  const addEpisode = () => {
    updateActiveProject((project) => ({
      ...project,
      episodes: [...project.episodes, makeBlankEpisode(project)]
    }));
    setSaveStatus('Episode added');
  };

  const deleteEpisode = (episodeId: string) => {
    updateActiveProject((project) => ({
      ...project,
      episodes: project.episodes.filter((episode) => episode.id !== episodeId)
    }));
    setSaveStatus('Episode deleted');
  };

  const duplicateEpisode = (episode: EpisodeIdea) => {
    updateActiveProject((project) => ({
      ...project,
      episodes: [
        ...project.episodes,
        {
          ...episode,
          id: createWorkItemId(`${project.id}-episode-copy`),
          title: `${episode.title} Copy`,
          status: 'idea'
        }
      ]
    }));
    setSaveStatus('Episode duplicated');
  };

  const moveEpisodeStatus = (episode: EpisodeIdea) => {
    const normalizedStatus = normalizeEpisodeStatus(episode.status);
    const currentIndex = episodeStatusFlow.indexOf(normalizedStatus);
    const nextStatus = episodeStatusFlow[Math.min(currentIndex + 1, episodeStatusFlow.length - 1)] ?? normalizedStatus;
    updateEpisode(episode.id, { ...episode, status: nextStatus });
    setSaveStatus(`Episode moved to ${nextStatus}`);
  };

  const updateGuest = (guestId: string, nextGuest: GuestLead) => {
    updateActiveProject((project) => ({
      ...project,
      guests: project.guests.map((guest) => (guest.id === guestId ? nextGuest : guest))
    }));
  };

  const addGuest = () => {
    updateActiveProject((project) => ({
      ...project,
      guests: [...project.guests, makeBlankGuest(project)]
    }));
    setSaveStatus('Guest lead added');
  };

  const deleteGuest = (guestId: string) => {
    updateActiveProject((project) => ({
      ...project,
      guests: project.guests.filter((guest) => guest.id !== guestId)
    }));
    setSaveStatus('Guest lead deleted');
  };

  const markGuestContacted = (guest: GuestLead) => {
    updateGuest(guest.id, { ...guest, status: 'contacted' as GuestStatus });
    setSaveStatus('Guest marked contacted');
  };

  const updateLaunchTask = (taskId: string, nextTask: ChecklistItem) => {
    updateActiveProject((project) => ({
      ...project,
      launchItems: project.launchItems.map((item, index) =>
        item.id === taskId ? normalizeLaunchItem(nextTask, index) : normalizeLaunchItem(item, index)
      )
    }));
    setSaveStatus('Launch task updated');
  };

  const addLaunchTask = () => {
    updateActiveProject((project) => ({
      ...project,
      launchItems: [...project.launchItems, makeBlankLaunchTask(project)]
    }));
    setSaveStatus('Launch task added');
  };

  const deleteLaunchTask = (taskId: string) => {
    updateActiveProject((project) => ({
      ...project,
      launchItems: project.launchItems.filter((item) => item.id !== taskId)
    }));
    setSaveStatus('Launch task deleted');
  };

  const markLaunchTaskDone = (taskId: string) => {
    updateActiveProject((project) => ({
      ...project,
      launchItems: project.launchItems.map((item) =>
        item.id === taskId ? { ...item, done: true, status: 'done' } : item
      )
    }));
    setSaveStatus('Launch task marked done');
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
              Kodiak Cast is becoming an AI-guided workspace for show setup, content generation, guest planning,
              launch checklists, and repeatable publishing systems.
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
            <button className="primary-button" onClick={handleOpenProjectWizard} type="button">
              New Podcast Project
            </button>
            <button className="secondary-button" disabled={!activeProject} onClick={() => setActiveSection('blueprint')} type="button">
              Open Blueprint
            </button>
            <button className="secondary-button" onClick={() => setActiveSection('ai')} type="button">
              AI Settings
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

              {!hasProjects ? (
                <article className="project-card empty-project-card">
                  <div>
                    <span>Start here</span>
                    <h3>Create your first podcast project.</h3>
                    <p>
                      Start with your own show, then generate the blueprint, starter episodes, guest angles,
                      trailer script, social launch posts, and launch checklist around that idea.
                    </p>
                  </div>
                  <button className="primary-button" onClick={handleOpenProjectWizard} type="button">
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
              <MetricCard label="Readiness" value={`${launchReadiness}%`} note="Launch score" />
              <MetricCard label="In Progress" value={String(episodesInProgress)} note="Episodes not published" />
              <MetricCard label="Ready" value={String(episodesReadyToRecord)} note="Episodes ready to record" />
              <MetricCard label="Guests" value={String(guestsToContact)} note="Guest leads to contact" />
              <MetricCard label="Launch" value={String(launchRemaining)} note="Tasks remaining" />
            </div>

            <section className="panel two-column-panel">
              <div>
                <p className="eyebrow">Next Action</p>
                <h2>{activeProject ? 'Generate with AI, then get launch-ready.' : 'Create your first real podcast project.'}</h2>
                <p>
                  {activeProject
                    ? 'Connect OpenAI in AI Settings, regenerate the pieces you want, then export the starter kit when the plan is ready.'
                    : 'Start with your own podcast idea. The workspace will save each show separately as you build it.'}
                </p>
              </div>
              <div className="action-list">
                <span>{activeProject ? 'Open AI Settings' : 'Create the first podcast project'}</span>
                <span>Generate or improve the starter kit</span>
                <span>Move ready episodes toward recording</span>
                <span>Export the full starter kit when ready</span>
              </div>
            </section>

            <section className="panel">
              <div className="section-heading">
                <p className="eyebrow">This Week</p>
                <h2>{activeProject ? 'Suggested episode focus' : 'No episode focus yet'}</h2>
              </div>
              {activeProject && activeProject.episodes[0] ? (
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

                <AiSettingsPanel compact onStatusChange={setAiStatus} />

                <section className="panel regeneration-panel">
                  <div className="section-heading">
                    <p className="eyebrow">Workbench Controls</p>
                    <h2>Regenerate only the piece you want.</h2>
                    <p>
                      If OpenAI is enabled, these buttons ask AI for fresh content. If AI is off or fails, Kodiak Cast uses the local generator.
                    </p>
                  </div>
                  <div className="regeneration-actions">
                    <button className="primary-button" onClick={handleGenerate} type="button">
                      Generate Full Starter Kit
                    </button>
                    <button className="secondary-button" onClick={handleRegenerateBlueprint} type="button">
                      Regenerate Blueprint
                    </button>
                    <button className="secondary-button" onClick={handleRegenerateEpisodes} type="button">
                      Regenerate Episodes
                    </button>
                    <button className="secondary-button" onClick={handleRegenerateGuests} type="button">
                      Regenerate Guests
                    </button>
                    <button className="secondary-button" onClick={handleRegenerateLaunchPlan} type="button">
                      Regenerate Launch Plan
                    </button>
                    <button className="secondary-button" onClick={handleRegenerateStarterKit} type="button">
                      Regenerate Starter Kit Assets
                    </button>
                  </div>
                  <p className="ai-warning-note">{aiStatus}</p>
                </section>

                <EditableBlueprint
                  blueprint={activeProject.blueprint}
                  onAddListItem={addBlueprintListItem}
                  onListItemChange={updateBlueprintListItem}
                  onRemoveListItem={removeBlueprintListItem}
                  onTextChange={updateBlueprintText}
                />

                <StarterKitPanel
                  copyStatus={copyStatus}
                  onAddListItem={addStarterKitListItem}
                  onCopy={handleCopyContent}
                  onListItemChange={updateStarterKitListItem}
                  onRemoveListItem={removeStarterKitListItem}
                  onTextChange={updateStarterKitText}
                  projectName={activeProject.name}
                  starterKit={activeProject.starterKit}
                />
              </>
            ) : (
              <section className="panel empty-section-panel">
                <p className="eyebrow">Blueprint</p>
                <h2>No project selected.</h2>
                <p>Create your first podcast project before generating a starter kit.</p>
                <button className="primary-button" onClick={handleOpenProjectWizard} type="button">
                  Create First Project
                </button>
              </section>
            )}
          </section>
        )}

        {activeSection === 'episodes' && (
          <section className="content-stack">
            <section className="panel workspace-toolbar-panel">
              <div className="section-heading">
                <p className="eyebrow">Episode Pipeline</p>
                <h2>Ideas become outlines. Outlines become recordings.</h2>
                <p>Edit each episode, move it through the status pipeline, copy outlines, and keep recording notes in one place.</p>
              </div>
              {activeProject ? (
                <div className="workspace-toolbar-actions">
                  <button className="primary-button" onClick={addEpisode} type="button">
                    Add Episode
                  </button>
                  <button className="secondary-button" onClick={handleRegenerateEpisodes} type="button">
                    Regenerate Episodes
                  </button>
                </div>
              ) : null}
            </section>

            {activeProject ? (
              activeProject.episodes.length > 0 ? (
                <div className="episode-grid editable-grid">
                  {activeProject.episodes.map((episode) => (
                    <EpisodeCard
                      editable
                      episode={episode}
                      key={episode.id}
                      onChange={(nextEpisode) => updateEpisode(episode.id, nextEpisode)}
                      onCopyOutline={() => handleCopyContent('Episode outline', formatEpisodeOutline(episode))}
                      onDelete={() => deleteEpisode(episode.id)}
                      onDuplicate={() => duplicateEpisode(episode)}
                      onMoveStatus={() => moveEpisodeStatus(episode)}
                    />
                  ))}
                </div>
              ) : (
                <section className="panel empty-section-panel">
                  <h2>No episodes yet.</h2>
                  <p>Add an episode or regenerate episode ideas from the project setup.</p>
                  <button className="primary-button" onClick={addEpisode} type="button">
                    Add Episode
                  </button>
                </section>
              )
            ) : (
              <section className="panel empty-section-panel">
                <h2>No episode pipeline yet.</h2>
                <p>Create a podcast project and generate its starter kit to seed episode ideas.</p>
                <button className="primary-button" onClick={handleOpenProjectWizard} type="button">
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
                <section className="panel workspace-toolbar-panel">
                  <div className="section-heading">
                    <p className="eyebrow">Guest CRM</p>
                    <h2>Track who fits {activeProject.name} and why they should say yes.</h2>
                    <p>Add guest leads, shape the outreach angle, mark contact status, and copy a pitch when you are ready to reach out.</p>
                  </div>
                  <div className="workspace-toolbar-actions">
                    <button className="primary-button" onClick={addGuest} type="button">
                      Add Guest
                    </button>
                    <button className="secondary-button" onClick={handleRegenerateGuests} type="button">
                      Regenerate Guests
                    </button>
                  </div>
                </section>

                {activeProject.guests.length > 0 ? (
                  <div className="guest-grid editable-grid">
                    {activeProject.guests.map((guest) => (
                      <GuestCard
                        editable
                        guest={guest}
                        key={guest.id}
                        onChange={(nextGuest) => updateGuest(guest.id, nextGuest)}
                        onCopyPitch={() => handleCopyContent('Guest pitch', formatGuestPitch(activeProject, guest))}
                        onDelete={() => deleteGuest(guest.id)}
                        onMarkContacted={() => markGuestContacted(guest)}
                      />
                    ))}
                  </div>
                ) : (
                  <section className="panel empty-section-panel">
                    <h2>No guest leads yet.</h2>
                    <p>Add a guest lead or regenerate the guest wishlist from the project setup.</p>
                    <button className="primary-button" onClick={addGuest} type="button">
                      Add Guest
                    </button>
                  </section>
                )}

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
                <button className="primary-button" onClick={handleOpenProjectWizard} type="button">
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
                <LaunchCommandCenter
                  copyStatus={copyStatus}
                  onAddTask={addLaunchTask}
                  onCopy={handleCopyContent}
                  onDeleteTask={deleteLaunchTask}
                  onMarkDone={markLaunchTaskDone}
                  onTaskChange={updateLaunchTask}
                  project={activeProject}
                />

                <StarterKitPanel
                  copyStatus={copyStatus}
                  onAddListItem={addStarterKitListItem}
                  onCopy={handleCopyContent}
                  onListItemChange={updateStarterKitListItem}
                  onRemoveListItem={removeStarterKitListItem}
                  onTextChange={updateStarterKitText}
                  projectName={activeProject.name}
                  starterKit={activeProject.starterKit}
                />
              </>
            ) : (
              <section className="panel empty-section-panel">
                <p className="eyebrow">Launch Checklist</p>
                <h2>No launch checklist yet.</h2>
                <p>Create a podcast project and generate its starter kit to build a launch checklist.</p>
                <button className="primary-button" onClick={handleOpenProjectWizard} type="button">
                  Create First Project
                </button>
              </section>
            )}
          </section>
        )}

        {activeSection === 'ai' && (
          <section className="content-stack">
            <AiSettingsPanel onStatusChange={setAiStatus} />
            <section className="panel two-column-panel">
              <div>
                <p className="eyebrow">How it works</p>
                <h2>OpenAI powers generation. Kodiak local templates stay as fallback.</h2>
                <p>
                  Save your key, enable AI, then return to Blueprint and generate a starter kit. If the request fails, the app keeps working with the local generator.
                </p>
              </div>
              <div className="action-list">
                <span>{aiStatus}</span>
                <span>Full starter kit generation</span>
                <span>Section regeneration for blueprint, episodes, guests, launch, and assets</span>
                <span>Server-side key storage comes later with Supabase</span>
              </div>
            </section>
          </section>
        )}
      </main>

      <ProjectWizard
        isOpen={isProjectWizardOpen}
        onCancel={() => setProjectWizardOpen(false)}
        onCreate={(inputs) => void handleCreateProjectFromWizard(inputs)}
        projectNumber={projects.length + 1}
      />

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
