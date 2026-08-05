// ─── ROLE DEFINITIONS ────────────────────────────────────────────────────────
export const ROLES = [
  {
    "id": "founder",
    "title": "Founder",
    "color": "#F87171",
    "glow": "rgba(248,113,113,0.55)",
    "glowSoft": "rgba(248,113,113,0.1)",
    "rank": 0,
    "maxSlots": 1
  },
  {
    "id": "community-manager",
    "title": "Community Manager",
    "color": "#DC2626",
    "glow": "rgba(220,38,38,0.55)",
    "glowSoft": "rgba(220,38,38,0.1)",
    "rank": 1,
    "maxSlots": 2
  },
  {
    "id": "adminul-lunii",
    "title": "Adminul Lunii",
    "color": "#FBBF24",
    "glow": "rgba(251,191,36,0.55)",
    "glowSoft": "rgba(251,191,36,0.1)",
    "rank": 1,
    "maxSlots": 1
  },
  {
    "id": "community-advisor",
    "title": "Community Advisor",
    "color": "#FB923C",
    "glow": "rgba(251,146,60,0.55)",
    "glowSoft": "rgba(251,146,60,0.1)",
    "rank": 2,
    "maxSlots": null
  },
  {
    "id": "server-manager",
    "title": "Server Manager",
    "color": "#8B6ED4",
    "glow": "rgba(139,110,212,0.55)",
    "glowSoft": "rgba(139,110,212,0.1)",
    "rank": 2,
    "maxSlots": null
  },
  {
    "id": "supervizor",
    "title": "Supervizor",
    "color": "#1D4ED8",
    "glow": "rgba(29,78,216,0.55)",
    "glowSoft": "rgba(29,78,216,0.1)",
    "rank": 3,
    "maxSlots": 2
  },
  {
    "id": "administrator",
    "title": "Administrator",
    "color": "#3B82F6",
    "glow": "rgba(59,130,246,0.55)",
    "glowSoft": "rgba(59,130,246,0.1)",
    "rank": 4,
    "maxSlots": 3
  },
  {
    "id": "moderator",
    "title": "Moderator",
    "color": "#EAB308",
    "glow": "rgba(234,179,8,0.55)",
    "glowSoft": "rgba(234,179,8,0.1)",
    "rank": 5,
    "maxSlots": 6
  },
  {
    "id": "helper",
    "title": "Helper",
    "color": "#22C55E",
    "glow": "rgba(34,197,94,0.55)",
    "glowSoft": "rgba(34,197,94,0.1)",
    "rank": 6,
    "maxSlots": null
  }
]

// ─── INITIAL STAFF DATA ───────────────────────────────────────────────────────
export const INITIAL_ROLES_DATA = [
  {
    "id": "founder",
    "members": [
      {
        "id": "m1",
        "name": "Trapi",
        "status": "offline",
        "joinDate": "2023-01-15",
        "steamLink": "https://steamcommunity.com/profiles/76561197966909956",
        "avatarUrl": "https://avatars.fastly.steamstatic.com/e0bc71c8cc0a992273ab3428e40778fe55800218_full.jpg"
      }
    ]
  },
  {
    "id": "community-manager",
    "members": [
      {
        "id": "m2",
        "name": "Iannc",
        "status": "offline",
        "joinDate": "2023-01-15",
        "steamLink": "https://steamcommunity.com/profiles/76561198863614059",
        "avatarUrl": "https://avatars.fastly.steamstatic.com/a340dc57c25c5776e6adb9373e2e8ab5d5821d72_full.jpg"
      },
      {
        "id": "m3",
        "name": "Spark (Ultra)",
        "status": "offline",
        "joinDate": "2023-01-15",
        "steamLink": "https://steamcommunity.com/profiles/76561197965422061",
        "avatarUrl": "https://avatars.fastly.steamstatic.com/c38e612b9cb04ca3c75618b7bd2b9a636a732c26_full.jpg"
      }
    ]
  },
  {
    "id": "adminul-lunii",
    "members": []
  },
  {
    "id": "community-advisor",
    "members": [
      {
        "id": "m4",
        "name": "langw0w",
        "status": "online",
        "joinDate": "2023-01-15",
        "steamLink": "https://steamcommunity.com/profiles/76561198841502450",
        "avatarUrl": "https://avatars.fastly.steamstatic.com/fbfd6af383257e2de1bf4db735a9f21993df1426_full.jpg"
      },
      {
        "id": "m5",
        "name": "ZLK",
        "status": "online",
        "joinDate": "2023-01-15",
        "steamLink": "https://steamcommunity.com/profiles/76561199006087203",
        "avatarUrl": "https://avatars.fastly.steamstatic.com/40bf29a0a7d3e4a36e64456677985317e46ff3de_full.jpg"
      },
      {
        "id": "m6",
        "name": "rLoner",
        "status": "offline",
        "joinDate": "2023-01-15",
        "steamLink": "https://steamcommunity.com/profiles/76561199202045077",
        "avatarUrl": "https://avatars.fastly.steamstatic.com/523bed88e7ebbe542a5e007f74e5a865a0dc756c_full.jpg"
      },
      {
        "id": "m7",
        "name": "Booyeto",
        "status": "offline",
        "joinDate": "2023-01-15",
        "steamLink": "https://steamcommunity.com/profiles/76561198368502127",
        "avatarUrl": "https://avatars.fastly.steamstatic.com/7645c030071b46e0a5e7cac29a9f9f9f035c927e_full.jpg"
      }
    ]
  },
  {
    "id": "server-manager",
    "members": [
      {
        "id": "m8",
        "name": "Umpy",
        "status": "offline",
        "joinDate": "2023-01-15",
        "steamLink": "https://steamcommunity.com/profiles/76561198974838451",
        "avatarUrl": "https://avatars.fastly.steamstatic.com/562c921ff1c8b59f1c5f9642c39608af2984128b_full.jpg"
      }
    ]
  },
  {
    "id": "supervizor",
    "members": [
      {
        "id": "m9",
        "name": "Yakuza",
        "status": "online",
        "joinDate": "2023-01-15",
        "steamLink": "https://steamcommunity.com/profiles/76561199384249731",
        "avatarUrl": "https://avatars.fastly.steamstatic.com/e2847cb722e1ec8bf9df607659f7f5e3804a0182_full.jpg"
      }
    ]
  },
  {
    "id": "administrator",
    "members": []
  },
  {
    "id": "moderator",
    "members": [
      {
        "id": "m10",
        "name": "Dibu",
        "status": "offline",
        "joinDate": "2023-01-15",
        "steamLink": "https://steamcommunity.com/profiles/76561199044843735",
        "avatarUrl": "https://avatars.fastly.steamstatic.com/095f3bbb014f0efc95665e60bfcceb0b0f16c9ff_full.jpg"
      },
      {
        "id": "m11",
        "name": "LEGALE",
        "status": "online",
        "joinDate": "2023-01-15",
        "steamLink": "https://steamcommunity.com/profiles/76561199496891246",
        "avatarUrl": "https://avatars.fastly.steamstatic.com/83961e4642c3e472cd20da37d1056664844db409_full.jpg"
      },
      {
        "id": "m12",
        "name": "r3ally",
        "status": "offline",
        "joinDate": "2023-01-15",
        "steamLink": "https://steamcommunity.com/profiles/76561199439185612",
        "avatarUrl": "https://avatars.fastly.steamstatic.com/1358a6f462ce93511842f9c3d067ec0e7662aab7_full.jpg"
      },
      {
        "id": "m13",
        "name": "bounty",
        "status": "online",
        "joinDate": "2023-01-15",
        "steamLink": "https://steamcommunity.com/profiles/76561199226358217",
        "avatarUrl": "https://avatars.fastly.steamstatic.com/d768ab6b9bdd99e15b6ac4ea0b6d7774b7fbf9be_full.jpg"
      },
      {
        "id": "m14",
        "name": "V1ccX",
        "status": "offline",
        "joinDate": "2023-01-15",
        "steamLink": "https://steamcommunity.com/profiles/76561199698821208",
        "avatarUrl": "https://avatars.fastly.steamstatic.com/4963bca91b1b3edf88de548e459b2092a35312e7_full.jpg"
      }
    ]
  },
  {
    "id": "helper",
    "members": [
      {
        "id": "m15",
        "name": "n3lutzU",
        "status": "online",
        "joinDate": "2023-01-15",
        "steamLink": "https://steamcommunity.com/profiles/76561199070188905",
        "avatarUrl": "https://avatars.fastly.steamstatic.com/59e75dc27ff9c6a73ef242ac14dc4c3fc7001827_full.jpg"
      },
      {
        "id": "m16",
        "name": "LcNneb",
        "status": "online",
        "joinDate": "2023-01-15",
        "steamLink": "https://steamcommunity.com/profiles/76561198711973791",
        "avatarUrl": "https://avatars.fastly.steamstatic.com/c78e87c68a89fcdd6c895f2b6b13474085a9c5ab_full.jpg"
      },
      {
        "id": "m17",
        "name": "dropYA-",
        "status": "online",
        "joinDate": "2023-01-15",
        "steamLink": "https://steamcommunity.com/profiles/76561199172444948",
        "avatarUrl": "https://avatars.fastly.steamstatic.com/53a234baae33c23f1326d23d0699039d7cccfddf_full.jpg"
      }
    ]
  }
]

// ─── FULL ORGANIZATION TREE ───────────────────────────────────────────────────
export const ORG_TREE = {
  "id": "trapi",
  "name": "Trapi",
  "role": "Founder",
  "roleId": "founder",
  "children": [
    {
      "id": "iannc",
      "name": "Iannc",
      "role": "Community Manager",
      "roleId": "community-manager",
      "children": [
        {
          "id": "umpy",
          "name": "Umpy",
          "role": "Server Manager",
          "roleId": "server-manager",
          "children": [
            {
              "id": "yakuza",
              "name": "Yakuza",
              "role": "Supervizor",
              "roleId": "supervizor",
              "children": [
                {
                  "id": "vacant-1785945580214",
                  "name": "Poziție Liberă",
                  "roleId": "administrator",
                  "vacant": true,
                  "avatarUrl": null,
                  "children": [
                    {
                      "id": "m12",
                      "name": "r3ally",
                      "role": "Moderator",
                      "roleId": "moderator",
                      "avatarUrl": "https://avatars.fastly.steamstatic.com/79a8119bd2a027755f93872d0d09b959909a0405_full.jpg",
                      "steamLink": "https://steamcommunity.com/profiles/76561199439185612",
                      "joinDate": "2023-01-15",
                      "status": "offline",
                      "immunity": 0,
                      "responsibilities": [],
                      "history": [
                        {
                          "date": "2026-05-26T12:00:00Z",
                          "action": "Promoted",
                          "toRole": "Helper"
                        },
                        {
                          "date": "2026-08-01T12:00:00Z",
                          "action": "Promoted",
                          "toRole": "Moderator"
                        }
                      ],
                      "children": [
                        {
                          "id": "m17",
                          "name": "dropYA-",
                          "role": "Helper",
                          "roleId": "helper",
                          "avatarUrl": "https://avatars.fastly.steamstatic.com/53a234baae33c23f1326d23d0699039d7cccfddf_full.jpg",
                          "steamLink": "https://steamcommunity.com/id/dropYA/",
                          "joinDate": "2023-01-15",
                          "status": "online",
                          "immunity": 0,
                          "responsibilities": [],
                          "history": [
                            {
                              "date": "2026-07-31T12:00:00Z",
                              "action": "Promoted",
                              "toRole": "Helper"
                            }
                          ],
                          "children": []
                        }
                      ]
                    },
                    {
                      "id": "m13",
                      "name": "bounty",
                      "role": "Moderator",
                      "roleId": "moderator",
                      "avatarUrl": "https://avatars.fastly.steamstatic.com/d768ab6b9bdd99e15b6ac4ea0b6d7774b7fbf9be_full.jpg",
                      "steamLink": "https://steamcommunity.com/id/hennessyx1/",
                      "joinDate": "2023-01-15",
                      "status": "online",
                      "immunity": 0,
                      "responsibilities": [],
                      "history": [
                        {
                          "date": "2026-07-01T12:00:00Z",
                          "action": "Promoted",
                          "toRole": "Helper"
                        },
                        {
                          "date": "2026-08-01T12:00:00Z",
                          "action": "Promoted",
                          "toRole": "Moderator"
                        }
                      ],
                      "children": [
                        {
                          "id": "m16",
                          "name": "LcNneb",
                          "role": "Helper",
                          "roleId": "helper",
                          "avatarUrl": "https://avatars.fastly.steamstatic.com/c78e87c68a89fcdd6c895f2b6b13474085a9c5ab_full.jpg",
                          "steamLink": "https://steamcommunity.com/profiles/76561198711973791/",
                          "joinDate": "2023-01-15",
                          "status": "online",
                          "immunity": 0,
                          "responsibilities": [],
                          "history": [
                            {
                              "date": "2026-07-06T16:46:00Z",
                              "action": "Promoted",
                              "toRole": "Helper"
                            }
                          ],
                          "children": []
                        }
                      ]
                    },
                    {
                      "id": "m14",
                      "name": "V1ccX",
                      "role": "Moderator",
                      "roleId": "moderator",
                      "avatarUrl": "https://avatars.fastly.steamstatic.com/4963bca91b1b3edf88de548e459b2092a35312e7_full.jpg",
                      "steamLink": "https://steamcommunity.com/profiles/76561199698821208",
                      "joinDate": "2023-01-15",
                      "status": "offline",
                      "immunity": 0,
                      "responsibilities": [],
                      "history": [
                        {
                          "date": "2026-06-30T12:00:00Z",
                          "action": "Promoted",
                          "toRole": "Helper"
                        },
                        {
                          "date": "2026-08-01T12:00:00Z",
                          "action": "Promoted",
                          "toRole": "Moderator"
                        }
                      ],
                      "children": [
                        {
                          "id": "m15",
                          "name": "n3lutzU",
                          "role": "Helper",
                          "roleId": "helper",
                          "avatarUrl": "https://avatars.fastly.steamstatic.com/4d199d4a935f8921a93abe8d443b48bc653fc82d_full.jpg",
                          "steamLink": "https://steamcommunity.com/profiles/76561199070188905",
                          "joinDate": "2023-01-15",
                          "status": "online",
                          "immunity": 0,
                          "responsibilities": [],
                          "history": [
                            {
                              "date": "2026-06-28T12:00:00Z",
                              "action": "Promoted",
                              "toRole": "Helper"
                            }
                          ],
                          "children": []
                        }
                      ]
                    },
                    {
                      "id": "m11",
                      "name": "LEGALE",
                      "role": "Moderator",
                      "roleId": "moderator",
                      "avatarUrl": "https://avatars.fastly.steamstatic.com/83961e4642c3e472cd20da37d1056664844db409_full.jpg",
                      "steamLink": "https://steamcommunity.com/id/LEGALEV2/",
                      "joinDate": "2023-01-15",
                      "status": "online",
                      "immunity": 0,
                      "responsibilities": [],
                      "history": [
                        {
                          "date": "2026-06-12T12:00:00Z",
                          "action": "Promoted",
                          "toRole": "Helper"
                        },
                        {
                          "date": "2026-07-01T12:00:00Z",
                          "action": "Promoted",
                          "toRole": "Moderator"
                        }
                      ],
                      "children": [],
                      "collapsed": false
                    },
                    {
                      "id": "node-1785953969682",
                      "name": "TEST2",
                      "roleId": "moderator",
                      "role": "Moderator",
                      "avatarUrl": "https://static.vecteezy.com/system/resources/thumbnails/057/068/323/small/single-fresh-red-strawberry-on-table-green-background-food-fruit-sweet-macro-juicy-plant-image-photo.jpg",
                      "vacant": false,
                      "responsibilities": [
                        "Pe lângă sarcinile de la gradul precedent, acesta primește următoarele atribuții",
                        "Menținerea ordinii și disciplinei pe server",
                        "Aplicarea sancțiunilor conform regulamentului",
                        "Observă comportamentul helperilor și intervine atunci când este cazul",
                        "Citește integral și detaliat o cerere de Helper și răspunde cât mai bine",
                        "Acces la comanda de ban și panel-ul wildfire.ro",
                        "Trimite mesajul de bun venit atunci când un membru staff intră în echipă",
                        "Ține legătura în permanență cu gradele inferioare și le ajută atunci când este cazul",
                        "Colaborează cu gradul de Administrator și comunică permanent problemele sau neclaritățile întâmpinate",
                        "Amintește adminilor să răspundă la aplicațiile staff",
                        "Intervenția atunci când un Helper greșește",
                        "Rol de mentor pentru gradele inferioare",
                        "Raportarea activității Helperilor către Administrator",
                        "Respectă aceleași responsabilități de la gradul anterior"
                      ],
                      "history": [
                        {
                          "action": "Promoted",
                          "fromRole": "Unknown",
                          "toRole": "Helper",
                          "date": "2026-08-05T00:00:00.000Z",
                          "by": "Iannc",
                          "reason": "PROMOVAT"
                        },
                        {
                          "action": "Promoted",
                          "fromRole": "Unknown",
                          "toRole": "Moderator",
                          "date": "2026-08-05T00:00:00.000Z",
                          "by": "Iannc",
                          "reason": "PROMOVAT"
                        },
                        {
                          "action": "Promoted",
                          "fromRole": "Unknown",
                          "toRole": "Administrator",
                          "date": "2026-08-05T00:00:00.000Z",
                          "by": "Iannc",
                          "reason": "PROMOVAT"
                        },
                        {
                          "action": "Demoted",
                          "fromRole": "Unknown",
                          "toRole": "Moderator",
                          "date": "2026-08-05T00:00:00.000Z",
                          "by": "Console",
                          "reason": "DA"
                        },
                        {
                          "action": "Demoted",
                          "fromRole": "Moderator",
                          "toRole": "Moderator",
                          "date": "2026-08-05T00:00:00.000Z",
                          "by": "Spark (Ultra)",
                          "reason": "DESTEPT CA YAKUZA"
                        },
                        {
                          "action": "Demoted",
                          "fromRole": "Moderator",
                          "toRole": "Moderator",
                          "date": "2026-08-05T00:00:00.000Z",
                          "by": "Console",
                          "reason": "test"
                        },
                        {
                          "action": "Demoted",
                          "fromRole": "Moderator",
                          "toRole": "Helper",
                          "date": "2026-08-05T00:00:00.000Z",
                          "by": "Iannc",
                          "reason": "TEST"
                        },
                        {
                          "action": "Promoted",
                          "fromRole": "Helper",
                          "toRole": "Moderator",
                          "date": "2026-08-05T00:00:00.000Z",
                          "by": "Console",
                          "reason": ""
                        },
                        {
                          "action": "Demoted",
                          "fromRole": "Moderator",
                          "toRole": "Helper",
                          "date": "2026-08-05T00:00:00.000Z",
                          "by": "Console",
                          "reason": ""
                        },
                        {
                          "action": "Promoted",
                          "fromRole": "Helper",
                          "toRole": "Moderator",
                          "date": "2026-08-05T00:00:00.000Z",
                          "by": "Iannc",
                          "reason": "TEST"
                        }
                      ],
                      "children": []
                    }
                  ],
                  "responsibilities": [],
                  "collapsed": false
                }
              ],
              "avatarUrl": "https://avatars.fastly.steamstatic.com/e2847cb722e1ec8bf9df607659f7f5e3804a0182_full.jpg",
              "steamLink": "https://steamcommunity.com/profiles/76561199384249731",
              "joinDate": "2023-01-15",
              "status": "online",
              "history": [
                {
                  "date": "2024-09-14T12:00:00Z",
                  "action": "Promoted",
                  "toRole": "Moderator"
                },
                {
                  "date": "2024-12-24T12:00:00Z",
                  "action": "Removed",
                  "toRole": "Moderator"
                },
                {
                  "date": "2026-05-14T12:00:00Z",
                  "action": "Promoted",
                  "toRole": "Moderator"
                },
                {
                  "date": "2026-06-01T12:00:00Z",
                  "action": "Promoted",
                  "toRole": "Administrator"
                },
                {
                  "date": "2026-08-01T12:00:00Z",
                  "action": "Promoted",
                  "toRole": "Supervizor"
                }
              ],
              "responsibilities": [],
              "immunity": 0,
              "collapsed": false
            }
          ],
          "avatarUrl": "https://avatars.fastly.steamstatic.com/562c921ff1c8b59f1c5f9642c39608af2984128b_full.jpg",
          "steamLink": "https://steamcommunity.com/profiles/76561198974838451",
          "joinDate": "2023-01-15",
          "status": "offline",
          "history": [
            {
              "date": "2026-03-14T12:00:00Z",
              "action": "Promoted",
              "toRole": "Server Manager"
            }
          ],
          "responsibilities": [],
          "collapsed": false,
          "immunity": 0
        },
        {
          "id": "spark",
          "name": "Spark (Ultra)",
          "role": "Community Manager",
          "roleId": "community-manager",
          "children": [
            {
              "id": "zlk",
              "name": "ZLK",
              "role": "Community Advisor",
              "roleId": "community-advisor",
              "children": [],
              "avatarUrl": "https://avatars.fastly.steamstatic.com/40bf29a0a7d3e4a36e64456677985317e46ff3de_full.jpg",
              "steamLink": "https://steamcommunity.com/profiles/76561199006087203",
              "joinDate": "2023-01-15",
              "status": "online",
              "history": [
                {
                  "date": "2026-03-14T12:00:00Z",
                  "action": "Promoted",
                  "toRole": "Server Manager"
                },
                {
                  "date": "2026-06-14T12:00:00Z",
                  "action": "Promoted",
                  "toRole": "Community Advisor"
                }
              ],
              "responsibilities": []
            },
            {
              "id": "rloner",
              "name": "rLoner",
              "role": "Community Advisor",
              "roleId": "community-advisor",
              "children": [],
              "avatarUrl": "https://avatars.fastly.steamstatic.com/523bed88e7ebbe542a5e007f74e5a865a0dc756c_full.jpg",
              "steamLink": "https://steamcommunity.com/profiles/76561199202045077",
              "joinDate": "2023-01-15",
              "status": "offline",
              "responsibilities": []
            },
            {
              "id": "booyeto",
              "name": "Booyeto",
              "role": "Server Manager",
              "roleId": "community-advisor",
              "children": [],
              "avatarUrl": "https://avatars.fastly.steamstatic.com/7645c030071b46e0a5e7cac29a9f9f9f035c927e_full.jpg",
              "steamLink": "https://steamcommunity.com/profiles/76561198368502127",
              "joinDate": "2023-01-15",
              "status": "offline",
              "responsibilities": [],
              "history": [
                {
                  "date": "2026-03-14T12:00:00Z",
                  "action": "Promoted",
                  "toRole": "Administrator"
                },
                {
                  "date": "2026-06-01T12:00:00Z",
                  "action": "Promoted",
                  "toRole": "Server Manager"
                },
                {
                  "date": "2026-07-19T12:00:00Z",
                  "action": "Promoted",
                  "toRole": "Community Advisor"
                }
              ],
              "immunity": 90
            }
          ],
          "avatarUrl": "https://avatars.fastly.steamstatic.com/c41386971a8f05a08d9c5ada6a4cdc28766af535_full.jpg",
          "steamLink": "https://steamcommunity.com/profiles/76561197965422061",
          "joinDate": "2023-01-15",
          "status": "offline",
          "history": [
            {
              "date": "2024-11-22T12:00:00Z",
              "action": "Promoted",
              "toRole": "Moderator"
            },
            {
              "date": "2025-02-08T12:00:00Z",
              "action": "Promoted",
              "toRole": "Administrator"
            },
            {
              "date": "2026-01-01T12:00:00Z",
              "action": "Promoted",
              "toRole": "Community Manager"
            }
          ],
          "responsibilities": [],
          "immunity": 97
        },
        {
          "id": "langw0w",
          "name": "langw0w",
          "role": "Community Manager",
          "roleId": "community-advisor",
          "children": [],
          "avatarUrl": "https://avatars.fastly.steamstatic.com/fbfd6af383257e2de1bf4db735a9f21993df1426_full.jpg",
          "steamLink": "https://steamcommunity.com/profiles/76561198841502450",
          "joinDate": "2023-01-15",
          "status": "online",
          "responsibilities": [
            "Consultanță strategică",
            "Monitorizarea staff-ului",
            "Sprijin decizional",
            "Feedback constant"
          ],
          "immunity": 0,
          "history": []
        }
      ],
      "avatarUrl": "https://avatars.fastly.steamstatic.com/5aae7060c5118b7da78bd6498e3e4bed4afa1fa2_full.jpg",
      "steamLink": "https://steamcommunity.com/profiles/76561198863614059",
      "joinDate": "2023-01-15",
      "status": "offline",
      "collapsed": false,
      "history": [
        {
          "date": "2026-03-14T12:00:00Z",
          "action": "Promoted",
          "toRole": "Community Manager"
        }
      ],
      "responsibilities": [],
      "immunity": 97
    }
  ],
  "avatarUrl": "https://avatars.fastly.steamstatic.com/e0bc71c8cc0a992273ab3428e40778fe55800218_full.jpg",
  "steamLink": "https://steamcommunity.com/profiles/76561197966909956",
  "joinDate": "2023-01-15",
  "status": "offline",
  "history": [
    {
      "date": "2024-01-01T12:00:00Z",
      "action": "Promoted",
      "toRole": "Founder"
    }
  ],
  "responsibilities": [],
  "immunity": 100
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
export function getRoleById(id) {
  return ROLES.find(r => r.id === id)
}

export function getInitials(name) {
  if (!name) return ''
  return name.split(/[\s()]+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

let _nextId = Date.now()
export function genId() {
  return `m${_nextId++}`
}
