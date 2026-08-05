const fs = require('fs');

const rawText = fs.readFileSync('roles.txt', 'utf8');

const roleMapping = {
  'FOUNDER': 'founder',
  'DEVELOPER': 'developer',
  'COMMUNITY MANAGER': 'community-manager',
  'ADMINUL LUNII': 'adminul-lunii',
  'SERVER MANAGER': 'server-manager',
  'SUPERVIZOR': 'supervizor',
  'ADMINISTRATOR': 'administrator',
  'MODERATOR': 'moderator',
  'HELPER': 'helper'
};

const lines = rawText.split('\n');
const result = [];
let currentRoleId = null;
let currentResps = [];
let currentRespTitle = null;
let currentRespDetail = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line || line === '---') continue;

  if (line.startsWith('## ')) {
    if (currentRoleId) {
      if (currentRespTitle) {
        currentResps.push({ title: currentRespTitle, detail: currentRespDetail.join('\n').trim() });
        currentRespTitle = null;
        currentRespDetail = [];
      }
      result.push({ id: currentRoleId, responsibilities: currentResps });
    }
    const titleStr = line.replace('## ', '').trim();
    currentRoleId = roleMapping[titleStr];
    currentResps = [];
  } else if (line.startsWith('### ')) {
    if (currentRespTitle) {
      currentResps.push({ title: currentRespTitle, detail: currentRespDetail.join('\n').trim() });
    }
    currentRespTitle = line.replace('### ', '').trim();
    currentRespDetail = [];
  } else {
    if (currentRespTitle) {
      currentRespDetail.push(line);
    }
  }
}

if (currentRoleId) {
  if (currentRespTitle) {
    currentResps.push({ title: currentRespTitle, detail: currentRespDetail.join('\n').trim() });
  }
  result.push({ id: currentRoleId, responsibilities: currentResps });
}

// Now read existing roleDetails.json to preserve descriptions/requirements
const existingData = JSON.parse(fs.readFileSync('src/data/roleDetails.json', 'utf8'));

// Merge the new responsibilities into the existing objects
const mergedData = existingData.map(role => {
  const parsed = result.find(r => r.id === role.id);
  if (parsed) {
    return { ...role, responsibilities: parsed.responsibilities };
  }
  return role; // e.g. community-advisor
});

// Also add any roles that were in the text but NOT in the existing roleDetails.json (e.g. if I deleted them)
result.forEach(parsed => {
  if (!mergedData.find(r => r.id === parsed.id)) {
    mergedData.push({
      id: parsed.id,
      title: parsed.id, // basic fallback title
      responsibilities: parsed.responsibilities
    });
  }
});

fs.writeFileSync('src/data/roleDetails.json', JSON.stringify(mergedData, null, 2));
