
var socket =io();
var textBox = document.getElementById('textInput');
var chatScroll = document.getElementById('chatScroll');
var settingsbtn = document.getElementById('settingsButton');
var settings = document.getElementById('settingsMenu');
var screenName = "user";

document.getElementById('startButton').onclick = function() {
  screenName = document.getElementById('nameEntry').value;
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
    console.log("Settings closed");
		} else {
		settings.classList.add("settingsOpened");
    console.log("Settings opened");
  }
}

document.addEventListener("keydown", function(event) {
	if(event.which == 13 && document.activeElement == textBox) {
		send();
	}
});

document.addEventListener("keydown", function(event) {
	if(event.which == 88) {
    var x = document.getElementById('chatScroll').children.length;
		console.log("No. of children: "+x);
    console.log("Last child: "+document.getElementById('chatScroll').children[x-1].classList)
	}
});

// document.onclick = function(e) {
//   console.log(e.target.id);
// }

function send() {
  if(textBox.value != "") {
    displayMyMessage(textBox.value);
    socket.emit('chat message', textBox.value);
    textBox.value = "";
  }
}

socket.on('chat message', function(msg) {
  displayReceivedMessage(msg);
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
	displayImage(msg.file);
  console.log("Image Received: "+msg.fileName);
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
