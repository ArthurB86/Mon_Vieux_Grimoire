const fs = require('fs');
const crypto = require('crypto');

const secretKey = crypto.randomBytes(32).toString('hex');

// Écriture de la clé secrète dans un fichier .env
fs.writeFileSync('.env', `SECRET_KEY=${secretKey}\n`);

console.log('Secret key generated and written to .env file.');