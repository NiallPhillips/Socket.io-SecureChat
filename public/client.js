
var socket = io();

var textBox = document.getElementById('textInput');
var chatScroll = document.getElementById('chatScroll');

document.getElementById('sendButton').onclick = function() {
  send();
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

function send() {
  if(textBox.value != "") {
    displayMyMessage(textBox.value);
    console.log(textBox.value);
    socket.emit('chat message', textBox.value);
    textBox.value = "";
  }
}

socket.on('chat message', function(msg) {
  displayReceivedMessage(msg);
});

function displayMyMessage(message) {
  if(document.getElementById('chatScroll').children.length==0) {
    chatScroll.innerHTML += "<div class='myMessage'>"+message+"</div>";
  } else {
    var lastChild = document.getElementById('chatScroll').children.length-1;
    if(document.getElementById('chatScroll').children[lastChild].classList.contains('myMessage')) {
      document.getElementById('chatScroll').children[lastChild].innerHTML+="<br>"+message;
    } else {
      chatScroll.innerHTML += "<div class='myMessage'>"+message+"</div>";
    }
  }
}

function displayReceivedMessage(message) {
  if(document.getElementById('chatScroll').children.length==0) {
    chatScroll.innerHTML += "<div class='receivedMessage'>"+message+"</div>";
  } else {
    var lastChild = document.getElementById('chatScroll').children.length-1;
    if(document.getElementById('chatScroll').children[lastChild].classList.contains('receivedMessage')) {
      document.getElementById('chatScroll').children[lastChild].innerHTML+="<br>"+message;
    } else {
      chatScroll.innerHTML += "<div class='receivedMessage'>"+message+"</div>";
    }
  }
}
