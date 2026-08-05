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
let currentRoleTitle = null;
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
      result.push({ id: currentRoleId, title: currentRoleTitle, responsibilities: currentResps });
    }
    const titleStr = line.replace('## ', '').trim();
    currentRoleId = roleMapping[titleStr];
    currentRoleTitle = titleStr.toLowerCase().split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
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
  result.push({ id: currentRoleId, title: currentRoleTitle, responsibilities: currentResps });
}

// Preserve community-advisor which is missing from this list
const existingData = JSON.parse(fs.readFileSync('src/data/roleDetails.json', 'utf8'));
const existingAdvisor = existingData.find(d => d.id === 'community-advisor');
if (existingAdvisor) {
  result.push(existingAdvisor);
}

fs.writeFileSync('src/data/roleDetails.json', JSON.stringify(result, null, 2));
