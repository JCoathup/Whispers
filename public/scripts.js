/*
WHISPERS
A simple chat program with private messaging functionality
*/
// declare variables
var username = document.getElementById("username");
var connect = document.getElementById("connect");
var chatLogin = document.getElementById("chatLogin");
var chatWindow = document.getElementById("chatWindow");
var message = document.getElementById("message");
var sendMessage = document.getElementById("sendMessage");
var userLIst = document.getElementById("userList");
var socket = io.connect(); //socket must be asked for on both server and client
var privateUserList =[];

//function statements

//clears privateUserList
function resetList(){
  //console.log("heh");
  var list = document.getElementsByClassName('user');
  for (var x = 0; x < list.length; x++){
    list[x].style.color = "#ffffff";
  }
  privateUserList = [];
  socket.emit('private message', privateUserList);
}

//keeps scrollbar at bottom
function updateScroll(){
  var element = document.getElementById("chatWindow");
  element.scrollTop = element.scrollHeight;
}

//listening for messages sent by server !!
socket.on('new message', function(data){
  if (!data.msg == " "){
    chatWindow.innerHTML += "<div style='color:"+data.color+"' class='chathandle'>"+data.user+":</div></strong> <div style='background-color:"+data.color+"' id='chatmessage'>"+data.msg+"</div>";
    if (!data.list == " "){
      chatWindow.innerHTML += "<div id="+data.user+" class='privateReplyList'>Sshh... click to reply<br>"+data.list+"</div>";
    }
    updateScroll();
  }
});

//updates online user list
socket.on('get users', function(data){
  userList.innerHTML ="<h2>Online:</h2>";
  for (i=0; i<data.length; i++){
    userList.innerHTML += "<li id="+data[i]+" class='user'>"+data[i]+"</li>";
  }
  userList.innerHTML += "<span id='clear'>Return to global chat</span";
});

document.addEventListener("click", function(e){
  //listens for user to be selected
  if(e.target && e.target.className == "user"){
    if (privateUserList.length == 0){
      resetList();
    }
    for(var i=0; i<privateUserList.length; i++) {
      if (privateUserList[i] == e.target.id){
        e.target.style.color = "#ffffff";
        var index = privateUserList.indexOf(e.target.id);
        if (index > -1) {
          privateUserList.splice(index, 1);
          socket.emit('private message', privateUserList);
          return;
        }
      }
    }
    e.target.style.color = "#F87217";
    privateUserList.push(e.target.id);
    socket.emit('private message', privateUserList);
  }
});

document.addEventListener("click", function(e){
  //listens for reply to a private message
  if(e.target && e.target.className == "privateReplyList"){
    resetList();
    var str = e.target.textContent;
    var privateUserList = str.split(",");
    var senderReply = e.target.id;
    privateUserList.push(senderReply);
    var index = privateUserList.indexOf(username.value);
    if (index > -1) {
    privateUserList.splice(index, 1);
  }
  var users = document.getElementsByClassName("user");
  for (var y = 0; y < users.length; y++){
    for (var z = 0; z < privateUserList.length; z++){
      if (users[y].textContent == privateUserList[z]){
          users[y].style.color = "#F87217";
      }
    }
  }
  socket.emit('private message', privateUserList);
  }
  //clears private user list
  if (e.target && e.target.id == "clear"){
    resetList();
  }
  //processes username input
  if (e.target && e.target.id == "connect"){
    e.preventDefault();
    if (!username.value == " "){
      // check for duplicate user
      socket.on('duplicate username', function(data){
        if(data == true){
          username.value="";
          username.placeholder = "Username taken!";
          return;
        }
      });
      //no duplicate found... continue
      socket.emit('new user', username.value, function(){
        chatLogin.innerHTML = "<p>You are connected as: <span id='chatname'>" + username.value + "</span></p>";
      });
    }
  }
  //listens for message to be sent
  if (e.target && e.target.id == "sendMessage"){
    e.preventDefault();
    socket.emit('message', message.value);
    message.value = "";
  }
});
