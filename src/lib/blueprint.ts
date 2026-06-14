import type { ChecklistItem, EpisodeIdea, PodcastBlueprint, PodcastInputs } from '../types';

const fallback = (value: string, backup: string) => value.trim() || backup;

const usesAnArticle = (phrase: string) => {
  const normalized = phrase.trim().toLowerCase();
  return normalized.startsWith('honest') || /^[aeiou]/.test(normalized);
};

const includesAny = (value: string, terms: string[]) =>
  terms.some((term) => value.includes(term));

function buildFirstEpisodes(showName: string, cadence: string, isRebuildShow: boolean): EpisodeIdea[] {
  if (isRebuildShow) {
    return [
      {
        id: 'gen-001',
        title: 'I’m Tired of Restarting',
        hook: 'A raw first episode about the moment you admit the old rhythm is not working anymore.',
        status: 'idea',
        segments: ['The breaking point', 'What keeps pulling me back', 'The reset I am choosing', 'What listeners can build with me'],
        clipIdeas: ['The moment you stop pretending', 'Restarting is not failure', 'The first honest reset']
      },
      {
        id: 'gen-002',
        title: 'What It Means to Lock In',
        hook: 'A practical definition of locking in when life is messy, not perfect.',
        status: 'outline',
        segments: ['Why motivation is unreliable', 'The minimum daily anchors', 'How projects create momentum', 'The weekly check-in system'],
        clipIdeas: ['Locking in is a system', 'Motivation is not the plan', 'Build one anchor first']
      },
      {
        id: 'gen-003',
        title: 'Building a Better Life While Building Real Projects',
        hook: 'A build-in-public episode on using apps, games, and creative work as proof that change is happening.',
        status: 'idea',
        segments: ['Why projects matter', 'The Kodiak Cast dogfood test', 'The discipline loop', 'What gets built next'],
        clipIdeas: ['Your project can become accountability', 'Build the tool you need', 'Progress needs proof']
      }
    ];
  }

  return [
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
  ];
}

function buildLaunchChecklist(isRebuildShow: boolean): ChecklistItem[] {
  if (isRebuildShow) {
    return [
      { id: 'launch-001', label: 'Lock show name and reset-season promise', done: true },
      { id: 'launch-002', label: 'Write the trailer script: why I am rebuilding in public', done: false },
      { id: 'launch-003', label: 'Choose the first 10 Reset Season episode ideas', done: false },
      { id: 'launch-004', label: 'Pick the weekly recording day and backup day', done: false },
      { id: 'launch-005', label: 'Record trailer episode', done: false },
      { id: 'launch-006', label: 'Create first guest wishlist around discipline, creativity, and rebuilding', done: false },
      { id: 'launch-007', label: 'Create the first weekly progress check-in template', done: false }
    ];
  }

  return [
    { id: 'launch-001', label: 'Lock show name and one-sentence promise', done: true },
    { id: 'launch-002', label: 'Choose first-season theme', done: false },
    { id: 'launch-003', label: 'Write intro and outro scripts', done: false },
    { id: 'launch-004', label: 'Create first 10 episode ideas', done: false },
    { id: 'launch-005', label: 'Record trailer episode', done: false },
    { id: 'launch-006', label: 'Prepare guest wishlist and first outreach message', done: false },
    { id: 'launch-007', label: 'Pick publishing day and maintenance rhythm', done: false }
  ];
}

export function generateBlueprint(inputs: PodcastInputs): PodcastBlueprint {
  const showName = fallback(inputs.showName, 'Untitled Podcast');
  const niche = fallback(inputs.niche, 'starting and maintaining a meaningful podcast');
  const audience = fallback(inputs.audience, 'creators who need structure, momentum, and a real launch plan');
  const tone = fallback(inputs.tone, 'honest, practical, focused, and motivational');
  const format = fallback(inputs.format, 'solo episodes, guest conversations, and weekly progress updates');
  const cadence = fallback(inputs.cadence, 'weekly');
  const goal = fallback(inputs.goal, 'help the host and listeners build something consistent that lasts');
  const article = usesAnArticle(tone) ? 'an' : 'a';
  const context = `${niche} ${audience} ${goal}`.toLowerCase();
  const isRebuildShow = includesAny(context, [
    'rebuild',
    'rebuilding',
    'fatherhood',
    'fitness',
    'stuck',
    'restart',
    'off schedule',
    'lock in'
  ]);

  return {
    name: showName,
    tagline: isRebuildShow
      ? 'Rebuilding life one week, one project, and one hard reset at a time.'
      : 'Plan, launch, and maintain a podcast that lasts.',
    description: isRebuildShow
      ? `${showName} is ${article} ${tone} show about ${niche}. It follows the messy but meaningful process of getting organized, staying accountable, building real projects, and helping ${audience} take the next honest step. New episodes are planned on a ${cadence} rhythm.`
      : `${showName} is ${article} ${tone} show about ${niche}. It is built for ${audience}. The show uses ${format} to ${goal}. New episodes are planned on a ${cadence} rhythm.`,
    listenerPromise: isRebuildShow
      ? `Every episode should give ${audience} one honest story, one practical lesson, and one next step they can use to start moving again.`
      : `Every episode should give ${audience} one clear idea, one useful framework, and one next step they can actually act on.`,
    format: isRebuildShow
      ? [
          'Cold open: the real problem or reset moment this episode tackles',
          'Weekly check-in: what worked, what slipped, and what gets adjusted',
          'Main lesson: 2-4 practical points from life, fitness, fatherhood, or building projects',
          'Build log: what I am creating and how it connects to discipline',
          'Listener action: one small next step for the week'
        ]
      : [
          'Cold open hook: 30-60 seconds',
          'Host setup: why this topic matters right now',
          'Main segments: 3-5 focused points',
          'Practical takeaway: one clear action step',
          'Closing CTA: ask, subscribe, comment, or guest suggestion'
        ],
    pillars: isRebuildShow
      ? [
          'Rebuilding discipline after falling off track',
          'Turning creative projects into accountability systems',
          'Fitness, fatherhood, and personal responsibility',
          'Building apps, games, and tools in public',
          'Helping listeners lock in without pretending the process is easy'
        ]
      : [
          'Planning the show before perfection kills momentum',
          'Building repeatable episode systems',
          'Finding and preparing strong guests',
          'Publishing consistently without burning out',
          'Turning listener feedback into better episodes'
        ],
    firstEpisodes: buildFirstEpisodes(showName, cadence, isRebuildShow),
    launchChecklist: buildLaunchChecklist(isRebuildShow)
  };
}
