import type {
  ChecklistItem,
  EpisodeIdea,
  GuestLead,
  PodcastBlueprint,
  PodcastInputs,
  PodcastStarterKit
} from '../types';

const fallback = (value: string, backup: string) => value.trim() || backup;

const usesAnArticle = (phrase: string) => {
  const normalized = phrase.trim().toLowerCase();
  return normalized.startsWith('honest') || /^[aeiou]/.test(normalized);
};

const includesAny = (value: string, terms: string[]) =>
  terms.some((term) => value.includes(term));

type GeneratorContext = {
  article: string;
  audience: string;
  cadence: string;
  format: string;
  goal: string;
  isRebuildShow: boolean;
  niche: string;
  showName: string;
  tone: string;
};

function getGeneratorContext(inputs: PodcastInputs): GeneratorContext {
  const showName = fallback(inputs.showName, 'Untitled Podcast');
  const niche = fallback(inputs.niche, 'starting and maintaining a meaningful podcast');
  const audience = fallback(inputs.audience, 'creators who need structure, momentum, and a real launch plan');
  const tone = fallback(inputs.tone, 'honest, practical, focused, and motivational');
  const format = fallback(inputs.format, 'solo episodes, guest conversations, and weekly progress updates');
  const cadence = fallback(inputs.cadence, 'weekly');
  const goal = fallback(inputs.goal, 'help the host and listeners build something consistent that lasts');
  const context = `${niche} ${audience} ${goal}`.toLowerCase();

  return {
    article: usesAnArticle(tone) ? 'an' : 'a',
    audience,
    cadence,
    format,
    goal,
    isRebuildShow: includesAny(context, [
      'rebuild',
      'rebuilding',
      'fatherhood',
      'fitness',
      'stuck',
      'restart',
      'off schedule',
      'lock in'
    ]),
    niche,
    showName,
    tone
  };
}

function makeEpisode(
  id: string,
  title: string,
  hook: string,
  status: EpisodeIdea['status'],
  segments: string[],
  clipIdeas: string[]
): EpisodeIdea {
  return { id, title, hook, status, segments, clipIdeas };
}

function buildFirstEpisodes(context: GeneratorContext): EpisodeIdea[] {
  const { cadence, isRebuildShow, niche, showName } = context;

  if (isRebuildShow) {
    return [
      makeEpisode(
        'gen-001',
        'I’m Tired of Restarting',
        'A raw first episode about admitting the old rhythm is not working anymore.',
        'outline',
        ['The breaking point', 'What keeps pulling me back', 'The reset I am choosing', 'What listeners can build with me'],
        ['The moment you stop pretending', 'Restarting is not failure', 'The first honest reset']
      ),
      makeEpisode(
        'gen-002',
        'What It Means to Lock In',
        'A practical definition of locking in when life is messy, not perfect.',
        'idea',
        ['Why motivation is unreliable', 'The minimum daily anchors', 'How projects create momentum', 'The weekly check-in system'],
        ['Locking in is a system', 'Motivation is not the plan', 'Build one anchor first']
      ),
      makeEpisode(
        'gen-003',
        'Building a Better Life While Building Real Projects',
        'A build-in-public episode on using apps, games, and creative work as proof that change is happening.',
        'idea',
        ['Why projects matter', 'The Kodiak Cast dogfood test', 'The discipline loop', 'What gets built next'],
        ['Your project can become accountability', 'Build the tool you need', 'Progress needs proof']
      ),
      makeEpisode(
        'gen-004',
        'The Problem with Motivation',
        'A no-BS breakdown of why motivation burns out and what has to replace it.',
        'idea',
        ['Motivation is temporary', 'Systems are repeatable', 'Identity follows evidence', 'The smallest lock-in habit'],
        ['Motivation is not a strategy', 'Proof beats hype', 'The system has to survive bad days']
      ),
      makeEpisode(
        'gen-005',
        'Turning Chaos into a Schedule',
        'How to build a weekly rhythm when life already feels scattered.',
        'idea',
        ['Audit the chaos', 'Pick fixed anchors', 'Make the schedule smaller', 'Review every week'],
        ['Stop designing fantasy schedules', 'Anchors before ambition', 'A schedule has to bend']
      ),
      makeEpisode(
        'gen-006',
        'Teaching My Son Through Projects',
        'A personal episode about using real builds to teach coding, discipline, and creativity.',
        'idea',
        ['Why projects teach better than lectures', 'What kids learn from seeing progress', 'How to keep it fun', 'The next small lesson'],
        ['Teach through building', 'Kids remember the project', 'Learning needs a win']
      ),
      makeEpisode(
        'gen-007',
        'The Weekly Reset That Keeps Me Honest',
        'A repeatable check-in format for wins, losses, adjustments, and next steps.',
        'idea',
        ['Wins from the week', 'What slipped', 'Why it slipped', 'The next adjustment'],
        ['The reset is the system', 'Track slips without shame', 'Review before restart']
      ),
      makeEpisode(
        'gen-008',
        'Building Kodiak Cast to Keep Myself Accountable',
        'The product story behind turning a personal need into a podcast tool.',
        'idea',
        ['The problem I needed solved', 'What the first version does', 'How dogfooding proves value', 'What users need next'],
        ['Build the tool you need', 'Dogfooding is proof', 'Your app should solve your real pain']
      ),
      makeEpisode(
        'gen-009',
        'The Version of Me I’m Trying to Build',
        'A future-self episode that defines the person, habits, and standards the show is chasing.',
        'idea',
        ['What has to change', 'The habits that prove it', 'The projects that support it', 'How listeners can define their version'],
        ['Define the version you are building', 'Standards need evidence', 'Future self needs a schedule']
      ),
      makeEpisode(
        'gen-010',
        'What I Learned After One Month of Rebuilding in Public',
        'A milestone episode reflecting on progress, mistakes, and what changes for the next month.',
        'idea',
        ['What worked', 'What failed', 'What surprised me', 'The next month plan'],
        ['Public progress creates pressure', 'Measure the month honestly', 'Change the plan, not the goal']
      )
    ];
  }

  return [
    makeEpisode(
      'gen-001',
      `Why ${showName} Exists`,
      'The origin story: the problem, the mission, and what the show is here to build.',
      'outline',
      ['The problem', 'The personal stake', 'The audience promise', 'The first season plan'],
      ['Why this show had to exist', 'Start before it feels perfect', 'The promise to listeners']
    ),
    makeEpisode(
      'gen-002',
      `The ${cadence} System That Keeps This Show Alive`,
      'A behind-the-scenes episode on how the podcast will avoid dying after three episodes.',
      'idea',
      ['Topic capture', 'Outline workflow', 'Recording rhythm', 'Maintenance checklist'],
      ['The system matters more than motivation', 'How to plan one episode fast', 'A rhythm that survives real life']
    ),
    makeEpisode(
      'gen-003',
      `The First Guest I Want on ${showName}`,
      'A transparent breakdown of what makes a guest worth inviting and how to craft a strong angle.',
      'idea',
      ['Guest criteria', 'Episode angle', 'Outreach message', 'Prep questions'],
      ['A guest needs a reason to say yes', 'The angle matters more than the name', 'Better guest prep in 10 minutes']
    ),
    makeEpisode(
      'gen-004',
      `The Beginner’s Guide to ${niche}`,
      'A simple foundation episode that helps new listeners understand the show’s world fast.',
      'idea',
      ['What beginners misunderstand', 'The first framework', 'Common traps', 'How to take action today'],
      ['Make the niche simple', 'Beginners need a first win', 'Avoid the obvious trap']
    ),
    makeEpisode(
      'gen-005',
      'What I Wish I Knew Before Starting',
      'A practical lessons-learned episode that creates instant trust with the target listener.',
      'idea',
      ['The first mistake', 'The hidden cost', 'The easier path', 'The listener shortcut'],
      ['What I wish I knew sooner', 'The shortcut is structure', 'The mistake everyone repeats']
    ),
    makeEpisode(
      'gen-006',
      'A Real Conversation with the Ideal Listener',
      'An interview-style episode with someone who represents the audience and their actual problems.',
      'idea',
      ['Their current struggle', 'What they already tried', 'What finally helped', 'What they need next'],
      ['Listen before you teach', 'Your audience tells you the show', 'Real pain creates real topics']
    ),
    makeEpisode(
      'gen-007',
      'The Framework Episode',
      'A signature method episode that names the show’s repeatable approach.',
      'idea',
      ['Name the framework', 'Step one', 'Step two', 'Step three', 'Where to use it this week'],
      ['A framework makes the show memorable', 'Name the method', 'Give listeners a repeatable tool']
    ),
    makeEpisode(
      'gen-008',
      'The Myth-Busting Episode',
      'An episode that challenges a common belief in the niche and replaces it with a better model.',
      'idea',
      ['The common belief', 'Why it fails', 'What works better', 'How to test it'],
      ['The advice everyone repeats is wrong', 'Replace the myth with a system', 'Test the better model']
    ),
    makeEpisode(
      'gen-009',
      'The Behind-the-Scenes Build Log',
      'A transparent update on building the show, what is working, and what needs refinement.',
      'idea',
      ['What got created', 'What felt clunky', 'What feedback says', 'What changes next'],
      ['Build in public creates trust', 'Show the messy middle', 'Feedback becomes the roadmap']
    ),
    makeEpisode(
      'gen-010',
      'The First Month Review',
      'A milestone episode that reviews the launch, listener response, and next content direction.',
      'idea',
      ['The numbers that matter', 'The strongest episode', 'The biggest lesson', 'The next month plan'],
      ['Review before scaling', 'Your audience shows the path', 'The first month teaches everything']
    )
  ];
}

function buildLaunchChecklist(isRebuildShow: boolean): ChecklistItem[] {
  if (isRebuildShow) {
    return [
      { id: 'launch-001', label: 'Lock show name and reset-season promise', done: true },
      { id: 'launch-002', label: 'Finalize the trailer script: why I am rebuilding in public', done: false },
      { id: 'launch-003', label: 'Choose the first 10 Reset Season episode ideas', done: false },
      { id: 'launch-004', label: 'Outline episode 1: I’m Tired of Restarting', done: false },
      { id: 'launch-005', label: 'Pick the weekly recording day and backup day', done: false },
      { id: 'launch-006', label: 'Record trailer episode', done: false },
      { id: 'launch-007', label: 'Record first full episode', done: false },
      { id: 'launch-008', label: 'Create cover art direction and short show description', done: false },
      { id: 'launch-009', label: 'Create the first weekly progress check-in template', done: false },
      { id: 'launch-010', label: 'Publish launch post and ask for first listener questions', done: false }
    ];
  }

  return [
    { id: 'launch-001', label: 'Lock show name and one-sentence promise', done: true },
    { id: 'launch-002', label: 'Choose first-season theme', done: false },
    { id: 'launch-003', label: 'Write intro and outro scripts', done: false },
    { id: 'launch-004', label: 'Create first 10 episode ideas', done: false },
    { id: 'launch-005', label: 'Outline the first full episode', done: false },
    { id: 'launch-006', label: 'Record trailer episode', done: false },
    { id: 'launch-007', label: 'Prepare guest wishlist and first outreach message', done: false },
    { id: 'launch-008', label: 'Pick publishing day and maintenance rhythm', done: false },
    { id: 'launch-009', label: 'Write launch social posts', done: false },
    { id: 'launch-010', label: 'Create a simple post-launch feedback loop', done: false }
  ];
}

export function generateBlueprint(inputs: PodcastInputs): PodcastBlueprint {
  const context = getGeneratorContext(inputs);
  const { article, audience, cadence, format, goal, isRebuildShow, niche, showName, tone } = context;

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
    firstEpisodes: buildFirstEpisodes(context),
    launchChecklist: buildLaunchChecklist(isRebuildShow)
  };
}

export function generateGuestLeads(inputs: PodcastInputs): GuestLead[] {
  const { audience, isRebuildShow, niche, showName } = getGeneratorContext(inputs);

  if (isRebuildShow) {
    return [
      {
        id: 'guest-001',
        name: 'Fitness coach or habit coach',
        fit: 'Can help the show talk honestly about getting back in control without selling fake motivation.',
        episodeAngle: 'Why people fall off routines and what actually gets them back on track.',
        status: 'wishlist'
      },
      {
        id: 'guest-002',
        name: 'Indie developer / builder in public',
        fit: 'Connects the rebuild story to app building, games, tools, and creative accountability.',
        episodeAngle: 'Building real projects while life is still messy.',
        status: 'wishlist'
      },
      {
        id: 'guest-003',
        name: 'Fatherhood creator or hands-on parent',
        fit: 'Adds family, responsibility, and teaching-through-creation to the show.',
        episodeAngle: 'How parents can model growth by building something with their kids.',
        status: 'wishlist'
      },
      {
        id: 'guest-004',
        name: 'Small business owner who rebuilt from a rough season',
        fit: 'Gives listeners a real story of rebuilding instead of polished success theater.',
        episodeAngle: 'The honest middle between chaos and momentum.',
        status: 'wishlist'
      },
      {
        id: 'guest-005',
        name: 'Listener rebuilding their own life',
        fit: 'Keeps the show grounded in the exact people it is trying to help.',
        episodeAngle: 'A real weekly reset conversation with someone who is tired of restarting.',
        status: 'wishlist'
      }
    ];
  }

  return [
    {
      id: 'guest-001',
      name: 'Ideal listener representative',
      fit: `Someone who matches the audience: ${audience}.`,
      episodeAngle: `What ${audience} actually need before ${showName} tries to teach them anything.`,
      status: 'wishlist'
    },
    {
      id: 'guest-002',
      name: 'Subject-matter expert',
      fit: `Adds credibility and practical depth around ${niche}.`,
      episodeAngle: 'A beginner-friendly breakdown of the most useful first framework.',
      status: 'wishlist'
    },
    {
      id: 'guest-003',
      name: 'Experienced podcaster in the niche',
      fit: 'Can share what makes a show consistent after launch excitement fades.',
      episodeAngle: 'How to build a podcast rhythm that survives real life.',
      status: 'wishlist'
    },
    {
      id: 'guest-004',
      name: 'Community builder or moderator',
      fit: 'Helps the show think about listener feedback, community, and recurring segments.',
      episodeAngle: 'Turning listeners into a feedback loop instead of shouting into the void.',
      status: 'wishlist'
    },
    {
      id: 'guest-005',
      name: 'Potential customer / client story',
      fit: 'Gives the podcast a grounded, practical case study instead of abstract advice.',
      episodeAngle: 'What problem they needed solved and what finally moved them forward.',
      status: 'wishlist'
    }
  ];
}

export function generateStarterKit(inputs: PodcastInputs, blueprint?: PodcastBlueprint): PodcastStarterKit {
  const context = getGeneratorContext(inputs);
  const { audience, cadence, goal, isRebuildShow, showName } = context;
  const showTitle = blueprint?.name || showName;
  const tagline = blueprint?.tagline || (isRebuildShow
    ? 'Rebuilding life one week, one project, and one hard reset at a time.'
    : 'Plan, launch, and maintain a podcast that lasts.');

  if (isRebuildShow) {
    return {
      trailerScript: `This is ${showTitle} — ${tagline} I am starting before everything is perfect because the whole point is to document the rebuild honestly. Each week, I will talk about discipline, fitness, fatherhood, creative projects, apps, games, and the hard resets that come with trying to build a better life. If you feel stuck, off schedule, overwhelmed, or tired of restarting, this show is for you. Let’s lock in one week at a time.`,
      firstEpisodeOutline: [
        'Cold open: I am tired of restarting and pretending the next Monday fixes everything.',
        'Explain why the show is starting now, before the host feels fully ready.',
        'Name the areas being rebuilt: discipline, health, projects, family, business, and creativity.',
        'Tell the truth about what keeps slipping and why tracking the process matters.',
        'Close with the first listener action: pick one thing you keep restarting and write the smallest next step.'
      ],
      socialLaunchPosts: [
        `I am launching ${showTitle}: a weekly podcast about rebuilding life through discipline, projects, fatherhood, fitness, and honest progress.`,
        `I do not want to wait until I have it all figured out. ${showTitle} starts in the messy middle and documents the rebuild in public.`,
        `If you feel stuck, off schedule, or tired of restarting, ${showTitle} is being built for you. First episodes are coming ${cadence}.`
      ],
      recordingSetup: [
        'Pick one quiet recording location and use it every week.',
        'Create a reusable episode outline template with hook, check-in, main lesson, build log, and listener action.',
        'Record one test clip and check voice level, background noise, and export settings.',
        'Create a folder structure for trailer, raw audio, edited episodes, clips, and show notes.',
        'Write a 15-second intro and 15-second outro that can be reused.'
      ],
      weeklyWorkflow: [
        'Monday: choose the reset topic and write the hook.',
        'Tuesday: build the episode outline and collect one personal story.',
        'Wednesday or Thursday: record the episode.',
        'Friday: edit, write show notes, and pull 2-3 clip ideas.',
        'Weekend: publish, promote, and capture listener feedback for the next reset.'
      ]
    };
  }

  return {
    trailerScript: `Welcome to ${showTitle} — ${tagline} This show is built for ${audience}. Each episode will help listeners understand one useful idea, apply one practical framework, and take one clear next step. The mission is simple: ${goal}. New episodes are planned on a ${cadence} rhythm.`,
    firstEpisodeOutline: [
      `Cold open: the problem ${showTitle} exists to solve.`,
      'Host setup: who the show is for and why the timing matters.',
      'Main segment: the first useful framework listeners can use immediately.',
      'Proof point: a personal story, example, or case study that makes the idea real.',
      'Close with one next action and an invitation to follow the launch.'
    ],
    socialLaunchPosts: [
      `I am launching ${showTitle}, a podcast for ${audience}. The goal: ${goal}.`,
      `${showTitle} is built around one promise: every episode gives one clear idea, one useful framework, and one next step.`,
      `First episodes of ${showTitle} are being planned now. If you care about this topic, send me the questions you want answered first.`
    ],
    recordingSetup: [
      'Choose the simplest recording setup that sounds clear enough to publish.',
      'Create reusable folders for raw audio, edited episodes, assets, clips, and show notes.',
      'Write reusable intro, outro, and guest intro blocks.',
      'Record a 60-second audio test before the trailer.',
      'Decide the publishing day and backup recording day.'
    ],
    weeklyWorkflow: [
      'Capture topic ideas as they happen.',
      'Pick one episode idea at the start of the week.',
      'Outline the hook, 3-5 segments, takeaway, and CTA.',
      'Record and edit before the publishing day.',
      'Publish, promote, and convert listener feedback into new topics.'
    ]
  };
}
