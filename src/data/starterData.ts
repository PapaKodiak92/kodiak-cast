import type { EpisodeIdea, GuestLead } from '../types';

export const starterEpisodes: EpisodeIdea[] = [
  {
    id: 'ep-001',
    title: 'The Reset Button: Why We Fall Off and How We Start Again',
    hook: 'A raw first episode about getting honest, rebuilding rhythm, and using the show itself as accountability.',
    status: 'idea',
    segments: [
      'What made this podcast necessary',
      'The problem with waiting to feel ready',
      'The system that keeps the show moving',
      'What listeners can expect next'
    ],
    clipIdeas: [
      'The moment you stop waiting to be ready',
      'Discipline breaks before it becomes identity',
      'Why restarting is part of the system'
    ]
  },
  {
    id: 'ep-002',
    title: 'Turning a Personal Problem Into a Product',
    hook: 'Use Kodiak Cast as the example: the podcast problem becomes the software blueprint.',
    status: 'outline',
    segments: [
      'What problem you personally feel',
      'How to prove other people feel it too',
      'The MVP line you should not cross',
      'What to build first'
    ],
    clipIdeas: [
      'Your pain point is your first user story',
      'Build the tool you needed yesterday',
      'MVP means proof, not perfection'
    ]
  },
  {
    id: 'ep-003',
    title: 'The Weekly Podcast Rhythm That Actually Survives Real Life',
    hook: 'A practical production loop for people who are busy, inconsistent, or starting from chaos.',
    status: 'scheduled',
    segments: [
      'Idea capture day',
      'Outline day',
      'Recording day',
      'Publishing and promotion day'
    ],
    clipIdeas: [
      'A schedule has to survive bad weeks',
      'Record before you redesign the whole brand',
      'Consistency is a maintenance problem'
    ]
  }
];

export const starterGuests: GuestLead[] = [
  {
    id: 'guest-001',
    name: 'Local creator or business owner',
    fit: 'Someone with a real journey and practical lessons, not just clout.',
    episodeAngle: 'How they started messy and built momentum anyway.',
    status: 'wishlist'
  },
  {
    id: 'guest-002',
    name: 'Fitness coach / discipline coach',
    fit: 'Good for episodes around habits, rebuilding structure, and staying consistent.',
    episodeAngle: 'Why people fall off routines and what actually gets them back on track.',
    status: 'wishlist'
  },
  {
    id: 'guest-003',
    name: 'Indie developer / builder',
    fit: 'Connects the show to product building, apps, games, and turning ideas into working systems.',
    episodeAngle: 'Building in public while life is still messy.',
    status: 'contacted'
  }
];
