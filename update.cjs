const fs = require('fs');
let code = fs.readFileSync('src/data/staffData.js', 'utf8');

code = code.replace(/rank: 0,?\s*}/g, 'rank: 0,\n    maxSlots: 1,\n  }');
code = code.replace(/rank: 1,?\s*}/g, 'rank: 1,\n    maxSlots: 2,\n  }');
code = code.replace(/rank: 2,?\s*}/g, 'rank: 2,\n    maxSlots: null,\n  }');
code = code.replace(/rank: 3,?\s*}/g, 'rank: 3,\n    maxSlots: 2,\n  }');
code = code.replace(/rank: 4,?\s*}/g, 'rank: 4,\n    maxSlots: 3,\n  }');
code = code.replace(/rank: 5,?\s*}/g, 'rank: 5,\n    maxSlots: 6,\n  }');
code = code.replace(/rank: 6,?\s*}/g, 'rank: 6,\n    maxSlots: null,\n  }');

code = code.replace(/name: '([^']+)',/g, "name: '$1',\n        status: Math.random() > 0.5 ? 'online' : 'offline',\n        joinDate: '2023-01-15',\n        steamLink: 'https://steamcommunity.com/id/example',");

// Also add these fields to ORG_TREE nodes just in case they are used there
code = code.replace(/roleId: '([^']+)',/g, "roleId: '$1',\n      status: Math.random() > 0.5 ? 'online' : 'offline',\n      joinDate: '2023-01-15',\n      steamLink: 'https://steamcommunity.com/id/example',");

fs.writeFileSync('src/data/staffData.js', code);
console.log('staffData updated');
