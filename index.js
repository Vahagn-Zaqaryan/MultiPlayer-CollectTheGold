var express = require('express');
var app = express();

var http = require('http').createServer(app);

var io = require('socket.io').listen(http);

player = 0;//Player count

http.listen(8080);//Port
gameEnd = false;//Game end or not
io.set('log level', 1);//Off socket.io logs
// Functions
//Function f(getRandom) gatting a random number in interval the number is from - Z
function getRandom(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
//Function f(getRandom) end
colorTimes = 0;//Geting colors for players
//Function f(colorPlayer) basic information about player
function colorPlayer(){
  var info = [];//array for return information about that player
  colorTimes++;//Changing a var(colorTimes) on line 21
  var color = "";//player color var
  var coordX,coordY;//player coord x and y for canvas
  if(colorTimes == 1){//if for blue color
    color = "Blue";
    coordX = 64;
    coordY = 0;
  }
  else if(colorTimes == 2){//if for red color
    color = "Red";
    coordX = 416;
    coordY = 512;
  }
  else if(colorTimes == 3){//if for green color
    color = "Green";
    coordX = 416;
    coordY = 0;
  }
  else if(colorTimes == 4){//if for green color
    color = "Yellow";
    coordX = 64;
    coordY = 512;
  }
  info.push(color, coordX, coordY);//push all information about player
  return info;
}
//Function f(colorPlayer) end
//----------
app.use("/", express.static(__dirname + '/canvas'));
//file getting part
app.get("/:file", function(req, res, next) {
  console.log("File is - " + req.params.file);

  if (req.params.file == "canvas") {
    next();
  }else {
    res.sendfile( __dirname + '/' + req.params.file);
  }
});
//end of file getting part
//ERROR 404
app.get("/*", function(req, res) {
  res.send(404);
});
//end 404
ground = getRandom(1, 5) + ".png";//ground image for canavs
var h = 17, r = 16;//simple information about canvas h and r
//Function f(serverText_color) for ground number on line 70 Changing to color, color format HEX
function serverText_color() {
  var color = "#000";
  if(ground == "1.png")
    color = "#529607";
  else if(ground == "2.png")
    color = "#636363";
  else if(ground == "3.png")
    color = "#971708";
  else if(ground == "4.png")
    color = "#4f415e";
  else
    color = "#9e8808";
  return color;
}
//Function f(serverText_color) end
var coord = [];//All canvas coord
for(var i = 0; i < h; ++i){
  for(var j = 0; j < r; ++j){
    //console.log("Name " + i + " " + j);
    if((i*32 == 0 && j*32 == 0) || (i*32 == 512 && j*32 == 480) ||
       (i*32 == 0 && j*32 == 32) || (i*32 == 32 && j*32 == 32) ||
       (i*32 == 32 && j*32 == 0) || (i*32 == 0 && j*32 == 448) ||
       (i*32 == 0 && j*32 == 480) || (i*32 == 32 && j*32 == 448) ||
       (i*32 == 32 && j*32 == 480) || (i*32 == 480 && j*32 == 0) ||
       (i*32 == 480 && j*32 == 32) || (i*32 == 512 && j*32 == 0) ||
       (i*32 == 512 && j*32 == 0) || (i*32 == 512 && j*32 == 32) ||
       (i*32 == 480 && j*32 == 448) || (i*32 == 480 && j*32 == 480) ||
       (i*32 == 0 && j*32 == 64) || (i*32 == 0 && j*32 == 416) ||
       (i*32 == 512 && j*32 == 416) || (i*32 == 512 && j*32 == 64) ||
       (i*32 == 512 && j*32 == 448)){//base coord removing
      continue;
    }else {
      coord.push([i*32, j*32]);
    }
  }
}
resCoord = [];//Coord array for stones
goldCoord = [];//Coord array for gold
powerCoord = [];//Coord array for power
//Randomly getting coords for stones
for(var c = 0; c < getRandom(11, 16); c++){
  var number = getRandom(0, (coord.length - 1));
  resCoord.push(coord[number]);
  coord.splice(number, 1);
  console.log("Number " + number);
}
//Randomly getting coords for gold
for(var c = 0; c < getRandom(11, 16); c++){
  var number = getRandom(0, (coord.length - 1));
  goldCoord.push(coord[number]);
  coord.splice(number, 1);
  console.log("Number gold " + number);
}
//Randomly getting coords for power
for(var c = 0; c < getRandom(11, 16); c++){
  var number = getRandom(0, (coord.length - 1));
  powerCoord.push(coord[number]);
  coord.splice(number, 1);
  console.log("Number power " + number);
}
//console.log() for informatin coords
console.log("\nCount of elements");
console.log('\u00A0\u00A0\u00A0'+"Coord length - " + coord.length);
console.log('\u00A0\u00A0\u00A0'+"resCoord length - " + resCoord.length);
console.log('\u00A0\u00A0\u00A0'+"goldCoord length - " + goldCoord.length);
console.log('\u00A0\u00A0\u00A0'+"powerCoord length - " + powerCoord.length);

names = [];//array for names fo players
players = [];//array for ALL INFORMATION about player
collPower = null;//collition for power
collGold = null;//collition for gold
io.sockets.on('connection', function(socket) {
  socketID = socket.id;//Socket ID
  player++;//player count
  console.log(player);//log how many player are connected now
  socket.emit("player", player);//send to client player count
  var client = '';//client name var
  colldist = null;//from what direction collition is detected
  basaColl = null;//id fo player how is collisions with base
  basaCoord = [[0, 0], [480, 448], [0, 448], [480, 0]];//Base coords
  //NAME of user
  socket.on('name', function(name) {
    client = name;//name fo player
    var playerINFO = colorPlayer();//color fo player typefo array
    players.push({"Name" : client, "color" : playerINFO[0], "id" : socket.id, "x" : playerINFO[1], "y" : playerINFO[2], "energy" : 10000, "goldChecker" : false, "score" : 0})
    names.push(name);//name fo cilent to names array
    var textServer_join = "<b style = 'color: " + serverText_color() + "'>Server:</b> " + client + " joined the game!";//Text fo server when somebody is entered his(her) name
    io.sockets.emit("server", textServer_join);//send that text on line 159
    if(names.length == "4"){//When players are 4
      //text for entering game
      var start = "<h2>Server Chat</h2>";
      start += "<h4 style = 'text-align: center;'>The Game Has Started! Good Luck!</h4>"
      start += "<span style = 'font-family: arial;font-size: 18px;text-align: center;'>PLAYERS<span><br>";
      start += "<span style = 'color: " + players[0].color + ";'>[" + players[0].color + "]</span> - " + names[0] + "</br>";
      start += "<span style = 'color: " + players[1].color + ";'>[" + players[1].color + "]</span> - " + names[1] + "</br>";
      start += "<span style = 'color: " + players[2].color + ";'>[" + players[2].color + "]</span> - " + names[2] + "</br>";
      start += "<span style = 'color: " + players[3].color + ";'>[" + players[3].color + "]</span> - " + names[3] + "</br>";
      io.sockets.emit("game_start", start);//sending text on line 163
      io.sockets.emit("ground", ground);//sending to all players ground color
      io.sockets.emit("mapGold", goldCoord);//coord arr for golds
      io.sockets.emit("mapPower", powerCoord);//coord arr for powers
      io.sockets.emit("map", resCoord);//coord arr for stones
      for (var i = 0; i < 4; i++) {//sending to every player his color on map
        io.sockets.socket(players[i].id).emit("color_player", players[i].color);
      }
      energyInterval = setInterval(function(){// every 0.25 second adding energy to all players
        for (var i = 0; i < 4; i++) {
          if(players[i].energy + 4 <= 10000){
            players[i].energy += 4;
          }
          io.sockets.socket(players[i].id).emit("energy", players[i].energy);
        }
      }, 250);
    }
  });
  //END name of user
  for(var sckt in io.sockets.sockets){
    //console.log(io.sockets.sockets[sckt].id);
  }
  //Movement part
  socket.on('move_direction', function(data) {
    var id;//id fo player who is emit
    for(var i = 0; i < 4; i++){
      if(players[i].id == socket.id){
        id = i;
      }
    }
    //condition when can player move, when energy is 8 or more
    if(players[id].energy > 0 && players[id].energy >= 8){
      for (var i in data) {
        var coord = [];//array for sending coord to mapGenerator.js for generating player positions
        if(gameEnd == false){//game ends ro not
          if(i == 37){
            if (players[id].x - 1 > 0 && colldist != "right"){
              players[id].x--;
              players[id].energy -= 8;
            }
          }
          if(i == 39){
            if(players[id].x + 1 < 480 && colldist != "left"){
              players[id].x++;
              players[id].energy -= 8;
            }
          }
          if(i == 38){
            if(players[id].y - 1 > 0 && colldist != "bottom"){
              players[id].y--;
              players[id].energy -= 8;
            }
          }
          if(i == 40){
            if(players[id].y + 1 < 512 && colldist != "top"){
              players[id].y++;
              players[id].energy -= 8;
            }
          }
        }
        coord.push(players, id);
        io.sockets.emit("move", coord);//sending information to script.js emit
        //io.sockets.emit("collisions", checkColl(players[id].x, players[id].y));
      }
      checkCollPower(players[id].x, players[id].y);//collition with powers
      checkCollBasa(players[id].x, players[id].y, id);//collition with base
      checkCollRes(players[id].x, players[id].y);//collition with stones
      checkCollGold(players[id].x, players[id].y, id);//collition with golds
      //collPower is collitioned ro not
      if(collPower != null){
        powerCoord.splice(collPower, 1); //removing that coord fo power
        io.sockets.emit("canvasClearPower", collPower);//sending number fo array arrangment
        collPower = null;//Changing to null it means that power already have taken by player
        if(players[id].energy + 400 <= 10000){//giving a energy to player
          players[id].energy += 400;
        }
      }
      //basaColl is collitioned ro not
      if(basaColl != null && players[id].goldChecker === true){
        players[id].goldChecker = false;//Changing that player dont have any gold in his(her) truck
        players[id].score++;// + 1 to score
        if(players[id].score == 5){//if some player got 5 scores do
          gameEnd = true;//game is ending
          clearInterval(energyInterval);//clearing Interval for energy uping every 0.25 second
          //Function f(player_arrange) sort players by scores
          function player_arrange() {
            var list = "";
            players.sort(function (a, b)
            {
              return b.score - a.score;
            });
            var num = 0;
            for(var i in players){
              num++;
              //win text
              list += num + "<span style = 'color: " + players[i].color + ";'>.[" + players[i].color + "]</span> - " + players[i].Name + " - Score:" + players[i].score + "</br>";
            }
            return list;
          }
          //Function f(player_arrange) end
          var arrangText = player_arrange();
          //In this position player id is changing because we sort players by score on line 255
          for(var i = 0; i < 4; i++){
            if(players[i].id == socket.id){
              id = i;
            }
          }
          //in this position we getting new id for player
          //sending to all players win text
          for (var i in players) {
            var start = "<h2>Server Chat</h2>";
            if(id != i){//if not winner
              var text = "You Loss";
              start += "<h4 style = 'text-align: center;'>Congratulations " + names[id] + "</h4>";
            }else{//if winner
              var text = "You WIN";
              start += "<h4 style = 'text-align: center;'>Congratulations You WIN</h4>";
            }
            start += "<span style = 'font-family: arial;font-size: 18px;text-align: center;'>List of score<span><br>";
            start += arrangText;
            io.sockets.socket(players[i].id).emit("win", start);
            io.sockets.socket(players[i].id).emit("clearCanvas", text);
          }
        }
        socket.emit("score", players[id].score);//changing a score in html ro for client
        if(players[id].energy + 1000 <= 10000){
          players[id].energy += 1000;//up energy to 1000
        }
      }
      //collGold is collitioned ro not
      if(collGold != null){
        goldCoord.splice(collGold, 1);//removing that coord fo goldCoord
        io.sockets.emit("canvasClearGold", collGold);
        collGold = null;//Changing to null it means that gold already have taken by player
      }
      socket.emit("energy", players[id].energy);//changing a energy in html or fot cilent
    }
  });
  //Chat part
  socket.on('send message', function(data) {
    console.log("Data Recived - " + data);
    console.log("Name_send: " + client);
    var text = data.replace(/</g, "<span><</span>");
    if(text == "/info"){
      socket.emit("info", "information about game");
    }else{
      var textPlayerColor = "#FFF";
      for(var i = 0; i < 4; i++){
        if(players[i].id == socket.id){
          textPlayerColor = players[i].color;
        }
      }
      io.sockets.emit("new message", ("<span style = 'color: " + textPlayerColor + ";'>" + client + "</span>" + ' : ' + text));
    }
  });
});
//----FUNCTIONS----//
function checkCollGold(x, y, id) {
  if (players[id].goldChecker === false) {
    for(var i in goldCoord){
      if (x < goldCoord[i][1]  + 32 &&
          x + 32 > goldCoord[i][1] &&
          y < goldCoord[i][0] + 32 &&
          32 + y > goldCoord[i][0]) {
            collGold = i;
            players[id].goldChecker = true;
      }
    }
  }
}
//----
function checkCollPower(x, y, id) {
  for(var i in powerCoord){
    if (x < powerCoord[i][1]  + 32 &&
        x + 32 > powerCoord[i][1] &&
        y < powerCoord[i][0] + 32 &&
        32 + y > powerCoord[i][0]) {
          collPower = i;
    }
  }
}
//----
function checkCollBasa(x, y, id) {
  for(var i in basaCoord){
    if (x < basaCoord[i][1]  + 64 &&
        x + 32 > basaCoord[i][1] &&
        y < basaCoord[i][0] + 64 &&
        32 + y > basaCoord[i][0]) {
      if(i == id){
        basaColl = i;
        break;
      }else{
        basaColl = null;
      }
    }else{
      basaColl = null;
    }
  }
}
//----
function checkCollRes(x, y) {
  var collision = null;
  for(var i in resCoord){
    var dx=(x)-(resCoord[i][1]);
    var dy=(y)-(resCoord[i][0]);
    var width = 32;
    var height = 32;
    var crossWidth=width*dy;
    var crossHeight=height*dx;

    if(Math.abs(dx) <= width && Math.abs(dy) <= height){
      if(crossWidth > crossHeight){
          collision = (crossWidth > (-crossHeight))?'bottom':'left';
      }else{
          collision = (crossWidth > (-crossHeight))?'right':'top';
      }
    }
  }
  colldist = collision;
}
//----
