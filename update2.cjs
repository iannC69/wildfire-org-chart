const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, 'src', 'data', 'staffData.js')
let code = fs.readFileSync(filePath, 'utf-8')

code = code.replace(/steamLink: 'https:\/\/steamcommunity\.com\/id\/example',/g, match => {
  return `${match}\n        avatarUrl: null,`
})

code = code.replace(/name: 'iannC',\n        status: (.*),\n        joinDate: (.*),\n        steamLink: (.*),\n        avatarUrl: null,/g, "name: 'iannC',\n        status: $1,\n        joinDate: $2,\n        steamLink: $3,\n        avatarUrl: 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',")

code = code.replace(/steamLink: 'https:\/\/steamcommunity\.com\/id\/example',\n  role/g, "steamLink: 'https:\/\/steamcommunity\.com\/id\/example',\n  avatarUrl: null,\n  role")
code = code.replace(/steamLink: 'https:\/\/steamcommunity\.com\/id\/example',\n      role/g, "steamLink: 'https:\/\/steamcommunity\.com\/id\/example',\n      avatarUrl: null,\n      role")
code = code.replace(/steamLink: 'https:\/\/steamcommunity\.com\/id\/example',\n          role/g, "steamLink: 'https:\/\/steamcommunity\.com\/id\/example',\n          avatarUrl: null,\n          role")
code = code.replace(/steamLink: 'https:\/\/steamcommunity\.com\/id\/example', children/g, "steamLink: 'https:\/\/steamcommunity\.com\/id\/example', avatarUrl: null, children")

// manual fix for iannC in ORG_TREE
code = code.replace(/name: 'iannC',\n        status: (.*),\n        joinDate: (.*),\n        steamLink: (.*),\n        avatarUrl: null,/g, "name: 'iannC',\n        status: $1,\n        joinDate: $2,\n        steamLink: $3,\n        avatarUrl: 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',")

fs.writeFileSync(filePath, code)
console.log('Updated staffData.js')
