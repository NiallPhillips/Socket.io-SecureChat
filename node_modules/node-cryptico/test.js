console.log((function() {
var cryptico = require('./index');

var message = "Testing Testing 1 2 3";

var key = cryptico.generateRSAKey("Hello World!", 512);
var pubKey = cryptico.publicKeyString(key);

var c = cryptico.encrypt(message, pubKey);

if (c.status !== 'success') {
  return {working: false, reason: c.status};
}

var m = cryptico.decrypt(c.cipher, key);

if (m.status !== 'success') {
  return {working: false, reason: m.status};
}

if (message !== m.plaintext) {
  return {working: false, reason: "Bad encryption/decryption result"};
} else {
  return {working: true};
}
})());