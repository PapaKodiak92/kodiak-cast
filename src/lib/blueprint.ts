import type { PodcastBlueprint, PodcastInputs } from '../types';

const fallback = (value: string, backup: string) => value.trim() || backup;

export function generateBlueprint(inputs: PodcastInputs): PodcastBlueprint {
  const showName = fallback(inputs.showName, 'Kodiak Cast');
  const niche = fallback(inputs.niche, 'starting and maintaining a meaningful podcast');
  const audience = fallback(inputs.audience, 'creators who need structure, momentum, and a real launch plan');
  const tone = fallback(inputs.tone, 'honest, practical, focused, and motivational');
  const format = fallback(inputs.format, 'solo episodes, guest conversations, and weekly progress updates');
  const cadence = fallback(inputs.cadence, 'weekly');
  const goal = fallback(inputs.goal, 'help the host and listeners build something consistent that lasts');

  return {
    name: showName,
    tagline: 'Plan, launch, and maintain a podcast that lasts.',
    description: `${showName} is a ${tone} show about ${niche}. It is built for ${audience}. The show uses ${format} to ${goal}. New episodes are planned on a ${cadence} rhythm.`,
    listenerPromise: `Every episode should give ${audience} one clear idea, one useful framework, and one next step they can actually act on.`,
    format: [
      'Cold open hook: 30-60 seconds',
      'Host setup: why this topic matters right now',
      'Main segments: 3-5 focused points',
      'Practical takeaway: one clear action step',
      'Closing CTA: ask, subscribe, comment, or guest suggestion'
    ],
    pillars: [
      'Planning the show before perfection kills momentum',
      'Building repeatable episode systems',
      'Finding and preparing strong guests',
      'Publishing consistently without burning out',
      'Turning listener feedback into better episodes'
    ],
    firstEpisodes: [
      {
        id: 'gen-001',
        title: `Why ${showName} Exists`,
        hook: 'The honest origin story: the problem, the mission, and what the show is here to build.',
        status: 'idea',
        segments: ['The problem', 'The personal stake', 'The audience promise', 'The first season plan'],
        clipIdeas: ['Why this show had to exist', 'Start before it feels perfect', 'The promise to listeners']
      },
      {
        id: 'gen-002',
        title: `The ${cadence} System That Keeps This Show Alive`,
        hook: 'A behind-the-scenes episode on how the podcast will avoid dying after three episodes.',
        status: 'outline',
        segments: ['Topic capture', 'Outline workflow', 'Recording rhythm', 'Maintenance checklist'],
        clipIdeas: ['The system matters more than motivation', 'How to plan one episode fast', 'A rhythm that survives real life']
      },
      {
        id: 'gen-003',
        title: `The First Guest I Want on ${showName}`,
        hook: 'A transparent breakdown of what makes a guest worth inviting and how to craft a strong angle.',
        status: 'idea',
        segments: ['Guest criteria', 'Episode angle', 'Outreach message', 'Prep questions'],
        clipIdeas: ['A guest needs a reason to say yes', 'The angle matters more than the name', 'Better guest prep in 10 minutes']
      }
    ],
    launchChecklist: [
      { id: 'launch-001', label: 'Lock show name and one-sentence promise', done: true },
      { id: 'launch-002', label: 'Choose first-season theme', done: false },
      { id: 'launch-003', label: 'Write intro and outro scripts', done: false },
      { id: 'launch-004', label: 'Create first 10 episode ideas', done: false },
      { id: 'launch-005', label: 'Record trailer episode', done: false },
      { id: 'launch-006', label: 'Prepare guest wishlist and first outreach message', done: false },
      { id: 'launch-007', label: 'Pick publishing day and maintenance rhythm', done: false }
    ]
  };
}
