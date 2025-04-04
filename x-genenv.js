const fs = require('fs');

console.log('# FIREBASE');
console.log('FIREBASE_ENABLED=true');
console.log('# FIREBASE ADMIN');
let rawdata = fs.readFileSync('firebase-adminsdk.json');
let configs = JSON.parse(rawdata);
for (var key in configs) {
  console.log(
    'FIREBASEADMIN_' + key.toUpperCase() + '=' + JSON.stringify(configs[key]),
  );
}
