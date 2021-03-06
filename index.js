var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('publicKey', function(msg){
    console.log('Public Key received from '+msg.userName);
    socket.broadcast.emit('publicKey', msg );
  });

  socket.on('returnPublicKey', function(msg){
    console.log('Public Key received from '+msg.userName);
    socket.broadcast.emit('returnPublicKey', msg);
  });

  socket.on('protocolStep1', function(msg){
    console.log('Protocol step 1 received');
    socket.broadcast.emit('protocolStep1', msg );
  });

  socket.on('protocolStep2', function(msg){
    console.log('Protocol step 2 received');
    socket.broadcast.emit('protocolStep2', msg );
  });

  socket.on('protocolStep3', function(msg){
    console.log('Protocol step 3 received');
    socket.broadcast.emit('protocolStep3', msg );
  });

  socket.on('AESKeyShared', function(msg){
    console.log(msg);
    socket.broadcast.emit('AESKeyShared', msg );
  });

  socket.on('chat message', function(msg){
    // console.log('message: ' + msg);
    socket.broadcast.emit('chat message', msg);
  });

  // When a socket (user) sends an image file...
  socket.on('base64 file', function (msg) {
    console.log('received base64 file from user');
    // The sending socket broadcasts the base64 file to all other connections
    socket.broadcast.emit('base64 file',msg);
  });

});



http.listen(3000, function(){
  console.log('listening on *:3000');
});

app.use(express.static('public'));
