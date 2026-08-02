// ─── ROLE DEFINITIONS ────────────────────────────────────────────────────────
export const ROLES = [
  {
    id: 'founder',
    title: 'Founder',
    color: '#F87171',
    glow: 'rgba(248,113,113,0.55)',
    glowSoft: 'rgba(248,113,113,0.1)',
    rank: 0,
    maxSlots: 1,
  },
  {
    id: 'community-manager',
    title: 'Community Manager',
    color: '#DC2626',
    glow: 'rgba(220,38,38,0.55)',
    glowSoft: 'rgba(220,38,38,0.1)',
    rank: 1,
    maxSlots: 2,
  },
  {
    id: 'community-advisor',
    title: 'Community Advisor',
    color: '#FB923C',
    glow: 'rgba(251,146,60,0.55)',
    glowSoft: 'rgba(251,146,60,0.1)',
    rank: 2,
    maxSlots: null,
  },
  {
    id: 'server-manager',
    title: 'Server Manager',
    color: '#8B6ED4',
    glow: 'rgba(139,110,212,0.55)',
    glowSoft: 'rgba(139,110,212,0.1)',
    rank: 2,
    maxSlots: null,
  },
  {
    id: 'supervizor',
    title: 'Supervizor',
    color: '#1D4ED8',
    glow: 'rgba(29,78,216,0.55)',
    glowSoft: 'rgba(29,78,216,0.1)',
    rank: 3,
    maxSlots: 2,
  },
  {
    id: 'administrator',
    title: 'Administrator',
    color: '#3B82F6',
    glow: 'rgba(59,130,246,0.55)',
    glowSoft: 'rgba(59,130,246,0.1)',
    rank: 4,
    maxSlots: 3,
  },
  {
    id: 'moderator',
    title: 'Moderator',
    color: '#EAB308',
    glow: 'rgba(234,179,8,0.55)',
    glowSoft: 'rgba(234,179,8,0.1)',
    rank: 5,
    maxSlots: 6,
  },
  {
    id: 'helper',
    title: 'Helper',
    color: '#22C55E',
    glow: 'rgba(34,197,94,0.55)',
    glowSoft: 'rgba(34,197,94,0.1)',
    rank: 6,
    maxSlots: null,
  },
]

// ─── INITIAL STAFF DATA ───────────────────────────────────────────────────────
export const INITIAL_ROLES_DATA = [
  {
    id: 'founder',
    members: [
      {
        id: 'm1',
        name: 'Trapi',
        status: Math.random() > 0.5 ? 'online' : 'offline',
        joinDate: '2023-01-15',
        steamLink: 'https://steamcommunity.com/profiles/76561197966909956',
        avatarUrl: 'https://avatars.fastly.steamstatic.com/e0bc71c8cc0a992273ab3428e40778fe55800218_full.jpg',
        responsibilities: [
          'Proprietar și fondator al comunității',
          'Viziunea și direcția strategică',
          'Infrastructura serverelor',
          'Decizii financiare și parteneri',
          'Recrutarea echipei de top management',
        ],
      },
    ],
  },
  {
    id: 'community-manager',
    members: [
      {
        id: 'm2',
        name: 'Iannc',
        status: Math.random() > 0.5 ? 'online' : 'offline',
        joinDate: '2023-01-15',
        steamLink: 'https://steamcommunity.com/profiles/76561198863614059',
        avatarUrl: 'https://avatars.fastly.steamstatic.com/a340dc57c25c5776e6adb9373e2e8ab5d5821d72_full.jpg',
        responsibilities: [
          'Coordonarea echipei de staff',
          'Gestionarea comunității Discord',
          'Planificarea evenimentelor',
          'Relația cu partenerii externi',
          'Rapoarte lunare către Founder',
        ],
      },
      {
        id: 'm3',
        name: 'Spark (Ultra)',
        status: Math.random() > 0.5 ? 'online' : 'offline',
        joinDate: '2023-01-15',
        steamLink: 'https://steamcommunity.com/profiles/76561197965422061',
        avatarUrl: 'https://avatars.fastly.steamstatic.com/c38e612b9cb04ca3c75618b7bd2b9a636a732c26_full.jpg',
        responsibilities: [
          'Managementul rețelelor de socializare',
          'Campanii de promovare',
          'Comunicare publică și PR',
          'Moderarea anunțurilor oficiale',
        ],
      },
    ],
  },
  {
    id: 'community-advisor',
    members: [
      {
        id: 'm4',
        name: 'langw0w',
        status: Math.random() > 0.5 ? 'online' : 'offline',
        joinDate: '2023-01-15',
        steamLink: 'https://steamcommunity.com/profiles/76561198841502450',
        avatarUrl: 'https://avatars.fastly.steamstatic.com/fbfd6af383257e2de1bf4db735a9f21993df1426_full.jpg',
        responsibilities: [
          'Consultanță în decizii strategice',
          'Mentoriat pentru staff junior',
          'Feedback și audit intern',
        ],
      },
      {
        id: 'm5',
        name: 'ZLK',
        status: Math.random() > 0.5 ? 'online' : 'offline',
        joinDate: '2023-01-15',
        steamLink: 'https://steamcommunity.com/profiles/76561199006087203',
        avatarUrl: 'https://avatars.fastly.steamstatic.com/40bf29a0a7d3e4a36e64456677985317e46ff3de_full.jpg',
        responsibilities: [
          'Analiza comportamentului comunității',
          'Propuneri de reguli și politici',
          'Suport în rezolvarea conflictelor',
        ],
      },
      {
        id: 'm6',
        name: 'rLoner',
        status: Math.random() > 0.5 ? 'online' : 'offline',
        joinDate: '2023-01-15',
        steamLink: 'https://steamcommunity.com/profiles/76561199202045077',
        avatarUrl: 'https://avatars.fastly.steamstatic.com/523bed88e7ebbe542a5e007f74e5a865a0dc756c_full.jpg',
        responsibilities: [
          'Monitorizarea activității serverelor',
          'Raportare incidente critice',
          'Sprijin Community Manager',
        ],
      },
      {
        id: 'm7',
        name: 'Booyeto',
        status: Math.random() > 0.5 ? 'online' : 'offline',
        joinDate: '2023-01-15',
        steamLink: 'https://steamcommunity.com/profiles/76561198368502127',
        avatarUrl: 'https://avatars.fastly.steamstatic.com/7645c030071b46e0a5e7cac29a9f9f9f035c927e_full.jpg',
        responsibilities: [
          'Coordonare evenimente speciale',
          'Testare funcționalități noi',
          'Comunicare cu jucătorii activi',
        ],
      },
    ],
  },
  {
    id: 'server-manager',
    members: [
      {
        id: 'm8',
        name: 'Umpy',
        status: Math.random() > 0.5 ? 'online' : 'offline',
        joinDate: '2023-01-15',
        steamLink: 'https://steamcommunity.com/profiles/76561198974838451',
        avatarUrl: 'https://avatars.fastly.steamstatic.com/562c921ff1c8b59f1c5f9642c39608af2984128b_full.jpg',
        responsibilities: [
          'Administrarea serverelor de joc',
          'Instalare și actualizare plugins',
          'Mentenanță și uptime monitoring',
          'Configurare maps și rotații',
          'Backup-uri periodice',
        ],
      },
    ],
  },
  {
    id: 'supervizor',
    members: [
      {
        id: 'm9',
        name: 'Yakuza',
        status: Math.random() > 0.5 ? 'online' : 'offline',
        joinDate: '2023-01-15',
        steamLink: 'https://steamcommunity.com/profiles/76561199384249731',
        avatarUrl: 'https://avatars.fastly.steamstatic.com/e2847cb722e1ec8bf9df607659f7f5e3804a0182_full.jpg',
        responsibilities: [
          'Supravegherea echipei de Admin',
          'Aprobare ban-uri permanente',
          'Audit rapoarte de activitate',
          'Intervenție în situații complexe',
          'Formare continuă a administratorilor',
        ],
      },
    ],
  },
  {
    id: 'administrator',
    members: [],
  },
  {
    id: 'moderator',
    members: [
      {
        id: 'm10',
        name: 'Dibu',
        status: Math.random() > 0.5 ? 'online' : 'offline',
        joinDate: '2023-01-15',
        steamLink: 'https://steamcommunity.com/profiles/76561199044843735',
        avatarUrl: 'https://avatars.fastly.steamstatic.com/095f3bbb014f0efc95665e60bfcceb0b0f16c9ff_full.jpg',
        responsibilities: [
          'Monitorizarea chat-ului in-game',
          'Sancționarea jucătorilor rule-breakers',
          'Completarea raportului de activitate',
          'Răspuns la reclamații',
        ],
      },
      {
        id: 'm11',
        name: 'LEGALE',
        status: Math.random() > 0.5 ? 'online' : 'offline',
        joinDate: '2023-01-15',
        steamLink: 'https://steamcommunity.com/profiles/76561199496891246',
        avatarUrl: 'https://avatars.fastly.steamstatic.com/83961e4642c3e472cd20da37d1056664844db409_full.jpg',
        responsibilities: [
          'Moderare chat și voice Discord',
          'Gestionarea ticket-urilor',
          'Ban temporar pentru abateri',
          'Raport zilnic de activitate',
        ],
      },
      {
        id: 'm12',
        name: 'r3ally',
        status: Math.random() > 0.5 ? 'online' : 'offline',
        joinDate: '2023-01-15',
        steamLink: 'https://steamcommunity.com/profiles/76561199439185612',
        avatarUrl: 'https://avatars.fastly.steamstatic.com/1358a6f462ce93511842f9c3d067ec0e7662aab7_full.jpg',
        responsibilities: [
          'Verificare hărți custom',
          'Monitorizare scoreboard',
          'Sancționare cheaters',
          'Completarea raportului',
        ],
      },
      {
        id: 'm13',
        name: 'bounty',
        status: Math.random() > 0.5 ? 'online' : 'offline',
        joinDate: '2023-01-15',
        steamLink: 'https://steamcommunity.com/profiles/76561199226358217',
        avatarUrl: 'https://avatars.fastly.steamstatic.com/d768ab6b9bdd99e15b6ac4ea0b6d7774b7fbf9be_full.jpg',
        responsibilities: [
          'Supraveghere servere active',
          'Comunicare cu jucătorii noi',
          'Raport de activitate',
        ],
      },
      {
        id: 'm14',
        name: 'V1ccX',
        status: Math.random() > 0.5 ? 'online' : 'offline',
        joinDate: '2023-01-15',
        steamLink: 'https://steamcommunity.com/profiles/76561199698821208',
        avatarUrl: 'https://avatars.fastly.steamstatic.com/4963bca91b1b3edf88de548e459b2092a35312e7_full.jpg',
        responsibilities: [
          'Moderare generală in-game',
          'Escaladare cazuri complexe',
          'Raport de activitate',
        ],
      },
    ],
  },
  {
    id: 'helper',
    members: [
      {
        id: 'm15',
        name: 'n3lutzU',
        status: Math.random() > 0.5 ? 'online' : 'offline',
        joinDate: '2023-01-15',
        steamLink: 'https://steamcommunity.com/profiles/76561199070188905',
        avatarUrl: 'https://avatars.fastly.steamstatic.com/59e75dc27ff9c6a73ef242ac14dc4c3fc7001827_full.jpg',
        responsibilities: [
          'Tutore Helper nou',
          'Mesaj-Bun-Venit jucători',
          'Completarea Raportului',
          'Sprijin moderatori',
        ],
      },
      {
        id: 'm16',
        name: 'LcNneb',
        status: Math.random() > 0.5 ? 'online' : 'offline',
        joinDate: '2023-01-15',
        steamLink: 'https://steamcommunity.com/profiles/76561198711973791',
        avatarUrl: 'https://avatars.fastly.steamstatic.com/c78e87c68a89fcdd6c895f2b6b13474085a9c5ab_full.jpg',
        responsibilities: [
          'Mesaj-Bun-Venit jucători',
          'Completarea Raportului',
          'Suport în reguli de bază',
        ],
      },
      {
        id: 'm17',
        name: 'dropYA-',
        status: Math.random() > 0.5 ? 'online' : 'offline',
        joinDate: '2023-01-15',
        steamLink: 'https://steamcommunity.com/profiles/76561199172444948',
        avatarUrl: 'https://avatars.fastly.steamstatic.com/53a234baae33c23f1326d23d0699039d7cccfddf_full.jpg',
        responsibilities: [
          'Tutore Helper nou',
          'Mesaj-Bun-Venit jucători',
          'Completarea Raportului',
        ],
      },
    ],
  },
]

// ─── ORG CHART TREE ──────────────────────────────────────────────────────────
export const ORG_TREE = {
  id: 'trapi',
  name: 'Trapi',
  role: 'Founder',
  roleId: 'founder',
  children: [
    {
                  id: 'iannc',
                  name: 'Iannc',
                  role: 'Community Manager',
      roleId: 'community-manager',
      children: [
        {
          id: 'spark',
          name: 'Spark (Ultra)',
          role: 'Community Manager',
          roleId: 'community-manager',
          children: [
            { id: 'langw0w', name: 'langw0w', role: 'Community Advisor', roleId: 'community-advisor', children: [] },
            { id: 'zlk', name: 'ZLK', role: 'Community Advisor', roleId: 'community-advisor', children: [] },
            { id: 'rloner', name: 'rLoner', role: 'Community Advisor', roleId: 'community-advisor', children: [] },
            { id: 'booyeto', name: 'Booyeto', role: 'Community Advisor', roleId: 'community-advisor', children: [] },
          ],
        },
        {
          id: 'umpy',
          name: 'Umpy',
          role: 'Server Manager',
          roleId: 'server-manager',
          children: [],
        },
        {
          id: 'yakuza',
          name: 'Yakuza',
          role: 'Supervizor',
          roleId: 'supervizor',
          children: [
            {
              id: 'admin-vacant',
              name: 'Vacant',
              role: 'Administrator',
              roleId: 'administrator',
              vacant: true,
              children: [
                {
                  id: 'dibu', name: 'Dibu', role: 'Moderator', roleId: 'moderator', children: [
                    { id: 'n3lutzu', name: 'n3lutzU', role: 'Helper', roleId: 'helper', children: [] },
                    { id: 'lucian', name: 'LcNneb', role: 'Helper', roleId: 'helper', children: [] },
                  ]
                },
                {
                  id: 'legale', name: 'LEGALE', role: 'Moderator', roleId: 'moderator', children: [
                    { id: 'dropya', name: 'dropYA-', role: 'Helper', roleId: 'helper', children: [] },
                  ]
                },
                { id: 'r3ally', name: 'r3ally', role: 'Moderator', roleId: 'moderator', children: [] },
                { id: 'bounty', name: 'bounty', role: 'Moderator', roleId: 'moderator', children: [] },
                { id: 'v1ccx', name: 'V1ccX', role: 'Moderator', roleId: 'moderator', children: [] },
              ],
            },
          ],
        },
      ],
    },
  ],
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
export function getRoleById(id) {
  return ROLES.find(r => r.id === id)
}

export function getInitials(name) {
  return name
    .split(/[\s()]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')
}

let _nextId = 200
export function genId() {
  return `m${_nextId++}`
}
