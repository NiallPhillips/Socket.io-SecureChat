
var socket =io();
var textBox = document.getElementById('textInput');
var chatScroll = document.getElementById('chatScroll');
var settingsbtn = document.getElementById('settingsButton');
var settings = document.getElementById('settingsMenu');

var sha256 = require('js-sha256');
var cryptico = require('node-cryptico');
var aes256 = require('aes256');

var randomstring = require('randomstring');

var chatRunning = false;

var screenName = "user";
var myPassword = "1234";
var myPrivateKey = "pass";
var myPublicKey = "pass";

var otherPublicKey = null;
var keys = 0;

var aesSharedKey = null;
var firstHalfAES = null;

document.getElementById('startButton').onclick = function() {
  screenName = document.getElementById('nameEntry').value;
  myPassword = document.getElementById('password').value;
  generateRSAKeys();
  myPassword = hash(document.getElementById('password').value);
  emitPublicKey(myPublicKey,false);
  chatRunning = true;
  document.getElementById('modalContainer').classList.add('hide');
}

document.getElementById('sendButton').onclick = function() {
  send();
}

document.getElementById('attachmentButton').onclick = function() {
  document.getElementById('fileSelect').click();
}

settingsbtn.onclick = function() {
  if(settings.classList.contains("settingsOpened")){
		settings.classList.remove("settingsOpened");
    // console.log("Settings closed");
		} else {
		settings.classList.add("settingsOpened");
    // console.log("Settings opened");
  }
}

document.addEventListener("keydown", function(event) {
	if(event.which == 13 && document.activeElement == textBox) {
		send();
	}
});

function send() {
  if(textBox.value != "") {
    displayMyMessage(textBox.value);
    socket.emit('chat message', textBox.value);
    console.log(hash(textBox.value));
    textBox.value = "";
  }
}

socket.on('chat message', function(msg) {
  if(chatRunning) {
    displayReceivedMessage(msg);
  }
});

function displayMyMessage(message) {
  if(document.getElementById('chatScroll').children.length==0) {
    chatScroll.innerHTML += "<div class='myMessage'><div class='ye'></div>"+message+"</div>";
  } else {
    var lastChild = document.getElementById('chatScroll').children.length-1;
    if(document.getElementById('chatScroll').children[lastChild].classList.contains('myMessage')) {
      document.getElementById('chatScroll').children[lastChild].innerHTML+="<br>"+message;
    } else {
      chatScroll.innerHTML += "<div class='myMessage'><div class='ye'></div>"+message+"</div>";
    }
  }
  chatScroll.scrollTop = chatScroll.scrollHeight;
}

function displayReceivedMessage(message) {
  if(document.getElementById('chatScroll').children.length==0) {
    chatScroll.innerHTML += "<div class='receivedMessage'><div class='boi'></div>"+message+"</div>";
  } else {
    var lastChild = document.getElementById('chatScroll').children.length-1;
    if(document.getElementById('chatScroll').children[lastChild].classList.contains('receivedMessage')) {
      document.getElementById('chatScroll').children[lastChild].innerHTML+="<br>"+message;
    } else {
      chatScroll.innerHTML += "<div class='receivedMessage'><div class='boi'></div>"+message+"</div>";
    }
  }
  chatScroll.scrollTop = chatScroll.scrollHeight;
}

function readImageFile(input) {
	if (input.files && input.files[0]) {
		var fileName = input.files[0]; // get the name of the file
        var reader = new FileReader(); // Create a new file reader object

		// When data is available to the reader
        reader.onload = function (e) {
            var src = e.target.result; // get the source of the file
            displayMyImage(src);		// call displayMyImage() with the file source
            sendFile(fileName,src);	// Send the image with sendFile()
		};

        reader.readAsDataURL(fileName); // Read the file
	}
}

// This function emits the base 64 file object to the server
// it accepts a file name and the data of the file
function sendFile(file,data){
	var msg = {}; // create a message object
	msg.file = data;
	msg.fileName = file.name;
	socket.emit('base64 file', msg); // send the file to the server
}

// When a 'base64 file' event is received, run this function
socket.on('base64 file', function(msg) {
  if(chatRunning) {
    displayImage(msg.file);
    console.log("Image Received: "+msg.fileName);
  }
});

// Create an HTML img element and use it to display the image
function displayImage(src) {
	var img = document.createElement("img");
	img.classList.add("image");
	img.src = src;
	chatScroll.innerHTML += "<div class='imageContainer'></div>"; // Attach the image Container to the chatBox
	chatScroll.getElementsByClassName("imageContainer")[chatScroll.getElementsByClassName("imageContainer").length-1].appendChild(img);
	// This line gets the array of elements of className 'imageContainer' and appends 'img' to the last 'imageContainer'
  chatScroll.scrollTop = chatScroll.scrollHeight;
}

// This is same as above but displays the Image frm this client instead of received images
function displayMyImage(src) {
	// console.log("Showing Image: "+ );
  var img = document.createElement("img");
	img.classList.add("image");
	img.src = src;
	chatScroll.innerHTML += "<div class='myImageContainer'></div>"; // Attach the image Container to the chatBox
	chatScroll.getElementsByClassName("myImageContainer")[chatScroll.getElementsByClassName("myImageContainer").length-1].appendChild(img);
  chatScroll.scrollTop = chatScroll.scrollHeight;
}

function hash(text) {
  return sha256(text);
}

function verifyHash(hash,text) {
  if(sha256(text)==hash) {
    console.log('Hash verified');
    return true;
  } else {
    console.log('Hash not verified');
    return false;
  }
}

function verifySignature(signedMessage) {
  if(signedMessage.publicKeyString == otherPublicKey) {
    console.log("Key verified");
  } else {
    console.log("Key not verified");
  }
}

function aes_encrypt(key,plaintext) {
  console.log("Pre AES encryption: "+plaintext);
  var cipher = aes256.encrypt(key,plaintext);
  console.log("Post AES encryption: "+cipher);
  return cipher;
}

function aes_decrypt(key,encrypted) {
  console.log("Pre AES decryption: "+encrypted);
  var plaintext = aes256.decrypt(key,encrypted);
  console.log("Post AES dencryption: "+plaintext);
  return plaintext;
}

function generateRSAKeys(password) {
  myPrivateKey = cryptico.generateRSAKey(myPassword, 1024);
  myPublicKey = cryptico.publicKeyString(myPrivateKey);
  // console.log("My Public Key: "+myPublicKey);
}

function emitPublicKey(key, isReturn) {
  msg = {}
  msg.publicKey = key;
  // console.log('Emitting Key: '+ key);
  // console.log('type of key: '+ typeof key);
	msg.hashedKey = hash(key);
  // console.log('Emitting hashed Key: '+ hash(key));
  // console.log('type of hashed key: '+ typeof hash(key));
	msg.userName = screenName;
  // console.log('Emitting name: '+ screenName);
  // console.log('type of name: '+ typeof screenName);
  msg.hashedUserName = hash(screenName);
  // console.log('Emitting hashed name: '+ hash(screenName));
  // console.log('type of hashedName: '+ typeof hash(screenName));
  if(isReturn) {
    socket.emit('returnPublicKey', msg);
    console.log('Returning public Key');
  } else {
    socket.emit('publicKey', msg);
    console.log('Emitting Public Key');
  }
}

socket.on('publicKey', function(msg) {
  if(chatRunning) {
    // Check integrity of publickey hash and userName
    console.log('Public Key Received');
    // console.log('publicKey: '+msg.publicKey);
    // console.log('hashedKey: '+msg.hashedKey);
    // console.log('userName: '+msg.userName);
    // console.log('hashedUserName: '+msg.hashedUserName);

    if(verifyHash(msg.hashedKey,msg.publicKey) && verifyHash(msg.hashedUserName,msg.userName)) {
      console.log("Public Key Received for "+msg.userName);
      otherPublicKey = msg.publicKey;
      emitPublicKey(myPublicKey,true);
    }
  }
});

socket.on('returnPublicKey', function(msg) {
  if(chatRunning) {
    // Check integrity of publickey hash and userName
    console.log('Returned public key received');
    // console.log('publicKey: '+msg.publicKey);
    // console.log('hashedKey: '+msg.hashedKey);
    // console.log('userName: '+msg.userName);
    // console.log('hashedUserName: '+msg.hashedUserName);

    if(verifyHash(msg.hashedKey,msg.publicKey) && verifyHash(msg.hashedUserName,msg.userName)) {
      console.log("Return public Key Received for "+msg.userName);
      otherPublicKey = msg.publicKey;
      protocolStep1();
    }
  }
});

function protocolStep1() {
  console.log('Doing protocolStep1');
  var msg = {}
  firstHalfAES = randomstring.generate();
  console.log('First half of AES (passA): '+firstHalfAES);
  msg.passA = cryptico.encrypt(firstHalfAES,otherPublicKey).cipher;
  msg.hashPassA = cryptico.encrypt(hash(firstHalfAES),otherPublicKey,myPrivateKey).cipher;
  socket.emit('protocolStep1',msg);
}

socket.on('protocolStep1', function(msg) {
  var passA_plainText = cryptico.decrypt(msg.passA,myPrivateKey).plaintext;
  var hash_passA_plainText = cryptico.decrypt(msg.hashPassA,myPrivateKey);
  var publicID = hash_passA_plainText.publicKeyString;
  if ( hash_passA_plainText.plaintext == hash(passA_plainText) ) {
    console.log("Hash of protocolStep1 is verified");
    if(publicID == otherPublicKey) {
      console.log("Origin of step1 verified");
      console.log('DOing step 2');
      protocolStep2(passA_plainText);
    } else {
      console.log("Public key veriffication of step 1 failed");
    }
  }
});

function protocolStep2(passA) {
  var secondHalfAES = randomstring.generate();
  aesSharedKey = hash(passA+secondHalfAES);
  console.log('Shared AES key is: '+aesSharedKey);
  protocolStep3(passA,secondHalfAES);
}

socket.on('protocolStep2', function(msg) {

});

function protocolStep3(passA,passB) {
  console.log('Doing step 3');
  msg = {};
  msg.passB = cryptico.encrypt(passB,otherPublicKey).cipher;
  msg.response = cryptico.encrypt(aes_encrypt(aesSharedKey,passA),otherPublicKey).cipher;
  msg.hashPassB = cryptico.encrypt(hash(passB),otherPublicKey,myPrivateKey).cipher;
  msg.hashResponse = cryptico.encrypt(hash(aes_encrypt(aesSharedKey,passA)),otherPublicKey,myPrivateKey).cipher;
  socket.emit('protocolStep3',msg);

}

socket.on('protocolStep3', function(msg) {
  console.log('Received step 3');
  var passB = cryptico.decrypt(msg.passB, myPrivateKey).plaintext;
  var response = cryptico.decrypt(msg.response, myPrivateKey).plaintext;
  var hashPassB = cryptico.decrypt(msg.hashPassB, myPrivateKey);
  var hashResponse = cryptico.decrypt(msg.hashResponse, myPrivateKey);
  if(hashPassB.publicKeyString == hashResponse.publicKeyString && hashPassB.publicKeyString == otherPublicKey) {
    console.log("Protocol Step 3 signature verified");
    if(hashPassB.plaintext == hash(passB)) {
      console.log("Protocol Step 3 hash verified");
      aesSharedKey = hash(firstHalfAES+passB);
      console.log('AES Key is: '+aesSharedKey);
      console.log(firstHalfAES);
      if(aes_decrypt(aesSharedKey,response) == firstHalfAES) {
        console.log('AES key is verified');
      } else {
        console.log('AES Key is not verified');
        socket.emit('AESKeyShared','Both parties now have the shared AES key');
      }
    } else {
      console.log('Hashes not verified');
    }
  } else {
    console.log('Signatures not verified');
  }
});

socket.on('AESKeyShared', function(msg) {
  console.log(msg);
});

// function testSignatures() {
//   console.log("///////////////////////////////////////////////////////////////")
//   var password1 = "this is my password";
//   var key1 = cryptico.generateRSAKey(password1, 1024);
//   var publicKey1 = cryptico.publicKeyString(key1);
//   var myMessage = "This is text to be encrypted and signed";
//   var password2 = "this is the other passphrase";
//   var key2 = cryptico.generateRSAKey(password2, 1024);
//   var publicKey2 = cryptico.publicKeyString(key2);
//   console.log("Keys generated");
//   var encryptionResult = cryptico.encrypt(myMessage,publicKey2,key1);
//   console.log("Message encrypted");
//
//   var myCipher = encryptionResult.cipher;
//   // var signature = cryptico.publicKeyID(myCipher.publickey);
//   // console.log("Signature: "+signature);
//   var dc = cryptico.decrypt(myCipher,key2);
//   console.log("Other Signature: "+dc.signature);
//   console.log("Signature string:  "+dc.publicKeyString);
//   console.log("Signature compare: "+publicKey1);
//   console.log("Decryption result:"+ dc.plaintext);
//
//   console.log("///////////////////////////////////////////////////////////////")
// }
