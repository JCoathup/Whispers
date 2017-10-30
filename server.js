var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

connections = [];
users = [];

var privateUserList;

server.listen(process.env.PORT || 8000, process.env.IP || '127.0.0.1');
console.log('server running...');

app.use('/', express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.sockets.on ('connection', function(socket){
  connections.push(socket);
  console.log('Connected: %s sockets connected', connections.length);

  //on user disconnections
  socket.on ('disconnect', function(data){
    users.splice(users.indexOf(socket.username), 1);
    updateUsernames();
    connections.splice(connections.indexOf(socket), 1);
    console.log('Disconnected: %s sockets connected', connections.length);
  });

  //private message - collects private list usernames
  socket.on('private message', function(data){
    socket.privateList = data;
  });

  //send message
  socket.on('message', function(data){
    if(socket.privateList){
    if (socket.privateList.length > 0 ){
      for(var j = 0; j < socket.privateList.length; j++){
        for(var i= 0; i< connections.length; i++){
          if(socket.privateList[j] == connections[i].username){
            console.log("send message to:" + connections[i].username);
            connections[i].emit('new message', {msg:data, user:socket.username, list:socket.privateList, color: socket.userColour});
          }
        }
      }
      socket.emit('new message', {msg:data, user:socket.username, list:socket.privateList, color: socket.userColour});
    }
    else {
        io.sockets.emit('new message', {msg:data, user:socket.username, color: socket.userColour});
    }
  }
  });
  //new user
  socket.on('new user', function(data, callback){
    for (var a = 0; a < users.length; a++){
      var duplicate = false;
      if (data == users[a]){
        duplicate = true;
        socket.emit('duplicate username', duplicate);
        return;
      }
    }
    var colourArray = ["#ffd700", "#b1bb17", "#008000", "#006400", "#0000cd", "#191970", "#ffa500", "#f88017", "#ff7f50", "#ff0000", "#8b0000", "#faafba", "#f660ab", "#ff1493", "#c45aec", "#8b008b", "#800080", "#e2a76f", "#806517", "#8b4513", "#999999", "#666666", "#333333", "#000000"];
    socket.userColour = colourArray[Math.floor(Math.random() * colourArray.length)]
    socket.privateList = [];
    callback(true);
    socket.username = data;
    users.push(socket.username);
    updateUsernames();
  });

  function updateUsernames(){
    io.sockets.emit('get users', users);
  }
});
