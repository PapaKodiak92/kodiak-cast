import { useMemo, useState } from 'react';
import type { PodcastInputs } from '../types';
import './projectWizard.css';

interface ProjectWizardProps {
  isOpen: boolean;
  onCancel: () => void;
  onCreate: (inputs: PodcastInputs) => void;
  projectNumber: number;
}

interface ShowTypeOption {
  id: string;
  title: string;
  description: string;
  format: string;
  tone: string;
}

const blankInputs: PodcastInputs = {
  showName: '',
  niche: '',
  audience: '',
  tone: '',
  format: '',
  cadence: 'weekly',
  goal: ''
};

const showTypeOptions: ShowTypeOption[] = [
  {
    id: 'solo',
    title: 'Solo Show',
    description: 'One host, direct lessons, personal stories, and repeatable segments.',
    format: 'solo episodes with a cold open, main lesson, practical takeaways, and a weekly action step',
    tone: 'clear, honest, practical, and confident'
  },
  {
    id: 'interview',
    title: 'Interview Show',
    description: 'Guest-led conversations with prepared angles, follow-ups, and takeaways.',
    format: 'guest interviews with a short intro, origin story, focused topic, listener takeaways, and closing resources',
    tone: 'curious, conversational, prepared, and useful'
  },
  {
    id: 'cohosted',
    title: 'Co-hosted Show',
    description: 'Two or more hosts with banter, recurring segments, and shared perspective.',
    format: 'co-hosted episodes with opening banter, topic rounds, debate moments, listener questions, and closing picks',
    tone: 'natural, funny, energetic, and opinionated'
  },
  {
    id: 'video',
    title: 'Video Podcast',
    description: 'Built for clips, camera moments, visual examples, and YouTube distribution.',
    format: 'video podcast episodes with visual hooks, short segments, clip moments, on-screen examples, and strong calls to action',
    tone: 'visual, punchy, engaging, and creator-friendly'
  },
  {
    id: 'story',
    title: 'Story / Documentary',
    description: 'Narrative episodes built around arcs, scenes, tension, and payoff.',
    format: 'story-driven episodes with setup, scene context, conflict, turning point, lesson, and reflective close',
    tone: 'immersive, thoughtful, emotional, and cinematic'
  },
  {
    id: 'brand',
    title: 'Business / Brand',
    description: 'Authority-building content for founders, teams, services, or communities.',
    format: 'brand podcast episodes with problem framing, case studies, expert advice, customer lessons, and business takeaways',
    tone: 'professional, helpful, strategic, and trusted'
  },
  {
    id: 'journey',
    title: 'Personal Journey',
    description: 'A public build, reset, recovery, fitness, career, or creator journey.',
    format: 'personal journey episodes with weekly check-ins, wins, losses, main lesson, build log, and listener action step',
    tone: 'honest, raw, motivational, funny, and no-BS'
  }
];

export function ProjectWizard({ isOpen, onCancel, onCreate, projectNumber }: ProjectWizardProps) {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<PodcastInputs>(blankInputs);
  const [selectedShowType, setSelectedShowType] = useState('journey');

  const selectedOption = useMemo(
    () => showTypeOptions.find((option) => option.id === selectedShowType) ?? showTypeOptions[0],
    [selectedShowType]
  );

  if (!isOpen) {
    return null;
  }

  const updateDraft = (field: keyof PodcastInputs, value: string) => {
    setDraft((currentDraft) => ({ ...currentDraft, [field]: value }));
  };

  const selectShowType = (option: ShowTypeOption) => {
    setSelectedShowType(option.id);
    setDraft((currentDraft) => ({
      ...currentDraft,
      format: option.format,
      tone: currentDraft.tone.trim() ? currentDraft.tone : option.tone
    }));
  };

  const canContinue = draft.showName.trim().length > 0 && draft.niche.trim().length > 0;

  const createProject = () => {
    const nextInputs: PodcastInputs = {
      showName: draft.showName.trim() || `Podcast Project ${projectNumber}`,
      niche: draft.niche.trim(),
      audience: draft.audience.trim(),
      tone: draft.tone.trim() || selectedOption.tone,
      format: draft.format.trim() || selectedOption.format,
      cadence: draft.cadence.trim() || 'weekly',
      goal: draft.goal.trim()
    };

    onCreate(nextInputs);
    setDraft(blankInputs);
    setSelectedShowType('journey');
    setStep(1);
  };

  const cancelWizard = () => {
    onCancel();
    setStep(1);
  };

  return (
    <div className="wizard-backdrop" role="presentation">
      <section aria-modal="true" className="project-wizard" role="dialog" aria-labelledby="project-wizard-title">
        <div className="wizard-topline">
          <span className="wizard-badge">KC</span>
          <div>
            <p className="eyebrow">New Podcast Project</p>
            <h2 id="project-wizard-title">Build the workspace before the AI goes to work.</h2>
          </div>
        </div>

        <div className="wizard-progress" aria-label="Project setup progress">
          <span className={step === 1 ? 'active' : ''}>1. Show basics</span>
          <span className={step === 2 ? 'active' : ''}>2. Show type</span>
          <span>3. Starter kit</span>
        </div>

        {step === 1 ? (
          <div className="wizard-body">
            <div className="wizard-copy-card">
              <p className="eyebrow">Step 1</p>
              <h3>Tell Kodiak Cast what show this is.</h3>
              <p>
                This creates a real project instead of an empty placeholder. The starter kit will use this context for the
                blueprint, episode ideas, launch plan, guest wishlist, and social posts.
              </p>
            </div>

            <div className="wizard-form-grid">
              <label>
                Podcast name
                <input
                  autoFocus
                  onChange={(event) => updateDraft('showName', event.target.value)}
                  placeholder="The Kodiak Build"
                  value={draft.showName}
                />
              </label>

              <label>
                Cadence
                <select value={draft.cadence} onChange={(event) => updateDraft('cadence', event.target.value)}>
                  <option value="weekly">Weekly</option>
                  <option value="twice a week">Twice a week</option>
                  <option value="biweekly">Biweekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="seasonal">Seasonal</option>
                </select>
              </label>

              <label className="wizard-wide-label">
                Topic / niche
                <textarea
                  onChange={(event) => updateDraft('niche', event.target.value)}
                  placeholder="rebuilding life through discipline, fitness, fatherhood, creative projects, app building, gaming, and honest weekly progress"
                  value={draft.niche}
                />
              </label>

              <label className="wizard-wide-label">
                Target listener
                <textarea
                  onChange={(event) => updateDraft('audience', event.target.value)}
                  placeholder="people who feel stuck, off schedule, overwhelmed, or tired of restarting"
                  value={draft.audience}
                />
              </label>

              <label className="wizard-wide-label">
                Main goal
                <textarea
                  onChange={(event) => updateDraft('goal', event.target.value)}
                  placeholder="document the rebuild, stay accountable, help people lock in, and build a real audience around the journey"
                  value={draft.goal}
                />
              </label>
            </div>
          </div>
        ) : (
          <div className="wizard-body show-type-step">
            <div className="wizard-copy-card show-type-controls">
              <p className="eyebrow">Step 2</p>
              <h3>Pick the closest show type.</h3>
              <p>
                Choose the structure first, then tune the voice. This keeps the AI focused without making you fight a
                massive form.
              </p>

              <div className="selected-type-pill">
                <span>Selected</span>
                <strong>{selectedOption.title}</strong>
              </div>

              <div className="wizard-inline-fields">
                <label>
                  Tone
                  <input
                    onChange={(event) => updateDraft('tone', event.target.value)}
                    placeholder={selectedOption.tone}
                    value={draft.tone}
                  />
                </label>

                <label>
                  Format
                  <textarea
                    onChange={(event) => updateDraft('format', event.target.value)}
                    placeholder={selectedOption.format}
                    value={draft.format}
                  />
                </label>
              </div>
            </div>

            <div className="show-type-grid">
              {showTypeOptions.map((option) => (
                <button
                  className={option.id === selectedShowType ? 'show-type-card selected' : 'show-type-card'}
                  key={option.id}
                  onClick={() => selectShowType(option)}
                  type="button"
                >
                  <strong>{option.title}</strong>
                  <span>{option.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <footer className="wizard-actions">
          <button className="secondary-button" onClick={cancelWizard} type="button">
            Cancel
          </button>
          {step === 1 ? (
            <button className="primary-button" disabled={!canContinue} onClick={() => setStep(2)} type="button">
              Choose Show Type
            </button>
          ) : (
            <>
              <button className="secondary-button" onClick={() => setStep(1)} type="button">
                Back
              </button>
              <button className="primary-button" onClick={createProject} type="button">
                Create Project & Generate Starter Kit
              </button>
            </>
          )}
        </footer>
      </section>
    </div>
  );
}
