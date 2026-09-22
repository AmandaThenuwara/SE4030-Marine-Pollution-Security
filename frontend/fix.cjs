const fs = require('fs');
let c = fs.readFileSync('src/pages/VolunteerHub.jsx', 'utf-8');
c = c.replace(/\\`/g, '`');
c = c.replace(/\\\${/g, '${');
fs.writeFileSync('src/pages/VolunteerHub.jsx', c);
console.log('Fixed');
