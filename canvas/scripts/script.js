$(function() {
  var socket = io.connect();
  socket.on("player", function(data) {//how many players are connected
    if(data == false){
      $('body').empty();
      $('head').append('<title>Game End</title>');
      var center = $('<center>');
      $('body').append(center);
      var text = $('<h1>Sorry!, you need to wait!!!</h1>');
      text.css({
        "color" : "#FFFFFF",
        "margin" : "300px 0",
        "font-size" : "40px"
      });
      center.append(text);
    }else{
      var energyStatus = $("#energyStatus");//energyStatus example(8920/10000)
      var energyProgress = $("#energyProgress");//energyProgress for green line
      stage = new createjs.Stage("canvas");//main canvas

      ctx = document.getElementById('canvas').getContext('2d');
      stage_power = new createjs.Stage("canvas_power");//power canvas
      stage_gold = new createjs.Stage("canvas_gold");//gold canvas

      var c = document.getElementById("canvas_power");
      var ctx_power = c.getContext("2d");


      //text for wait
      ctx.fillStyle = "blue";
      ctx.font = "bold 30px Arial";
      ctx.fillText("Waiting For Players To Join!", (canvas.width / 2) - 200, (canvas.height / 2) + 8);
      //end fo that text
      //coords in canvas when mouse is clicked
      var cW = ctx.canvas.width;
      var cH = ctx.canvas.height;
      var y = 0, x = 0;
      ctx.canvas.addEventListener('click', function(evt) {
        var mouseX = event.clientX - ctx.canvas.offsetLeft;
        var mouseY = event.clientY - ctx.canvas.offsetTop;
        console.log(mouseX/32 + " | " + mouseY/32);
      });
      //log that positions
      var position = $(document).width()/2 - ($('#canvas').width()/2 - 4);
      $('.canvasPart').css({"left" : (position + "px")});
      //canvas positionto center of map
      window.socket = socket;
      document.title = "Game";//document title
      //prompt for player name
      var textsimple = prompt("Wellcome to the game\nEnter your username (etc. John)");
      //Function f(titleCase) changing player name to capital size
      function titleCase(str) {
        var splitStr = str.toLowerCase().split(' ');
        for (var i = 0; i < splitStr.length; i++) {
          splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
        }
        return splitStr.join(' ');
      }
      //Function f(titleCase) end
      //using function f(titleCase) on line 52
      var text = titleCase(textsimple);
      //Changing title to game - (player name)
      document.title = "Game - " + text;
      //message from tag for submit
      var messageForm = $("#send_message");
      //message box input
      var messageBox = $("#message");
      //chat box for messages
      var chat = $("#chat");
      //information HOW TO PLAY game
      var infoWin = $(".blackScreen");
      //score example(Score: 3)
      var score = $("#scoreNumber");
      //close button fro information
      $(".crossClose").on("click", function() {
        infoWin.fadeOut();
      });
      //server chat
      var server = $("#chatS");
      //ground color putting
      socket.on("ground", function(data) {
        console.log("color - " + data);
        $('#canvas').css({"background-image": "url(../image/ground/" + data + ")"});
        basePlacement();
        playerMapPlaceMent();
      });
      //player color which player is you on map
      socket.on("color_player", function(data) {
        server.append("<h3>You are " + data + "</h3><br/>");
      });
      //server chat part
      socket.on("server", function(data) {
        //console.log(data);
        server.append(data + "<br/>");
      });
      //Main canvas draw
      socket.on("map", function(data) {
        mapGenerator(data, stage, 1);//for stones
      });
      //canvas for golds draw
      socket.on("mapGold", function(data) {
        mapGenerator(data, stage, 2);//for gold
      });
      //canvas for powers draw
      socket.on("mapPower", function(data) {
        mapGenerator(data, stage, 3);//for power
      });
      //information open up HOW TO PLAY game
      socket.on("info", function(data) {
        infoWin.fadeIn();
      });
      //game servar chat part with all players
      socket.on("game_start", function(data) {
        server.empty();
        server.append(data);
      });
      //when player wins appear text in servar chat
      socket.on("win", function(data) {
        server.empty();
        server.append(data);
      });
      //clear a canvas Main, gold, power
      socket.on("clearCanvas", function(data) {
        stage.removeAllChildren();
        stage.update();
        createjs.Tween.get(stage_power).to({alpha: 0},500);
        stage_power.removeAllChildren();
        stage_power.update();
        createjs.Tween.get(stage_gold).to({alpha: 0},500);
        stage_gold.removeAllChildren();
        stage_gold.update();
        createjs.Tween.get(stage).to({alpha: 1},500);
        //text how wins
        var text = new createjs.Text(data, "30px Arial", "blue");
        text.x = (512 / 2) - 80;
        text.y = (544 / 2) - 8;
        stage.addChild(text);
      });
      //score changing part
      socket.on("score", function(data) {
        score.text("Score: " + data);
      });
      //function f(scroller) for chat scrolling and always it staks at bottom
      function scroller() {
        chat[0].scrollTop = chat[0].scrollHeight;
      }
      //function f(scroller) end
      //message sending part
      socket.emit('name', text);
      messageForm.submit(function(e) {
        e.preventDefault();
        if(messageBox.val().replace(/^\s+|\s+$/g, "").length != 0){
          socket.emit('send message', messageBox.val());
          messageBox.val('');
        }
      });
      //resived message
      socket.on("new message", function(data) {
        console.log("The recived data is - " + data);
        chat.append(data + "<br/>");
        scroller();
      });
      //movement part
      var directions = {};
      $('html').keyup(stop).keydown(charMovement);

      function charMovement(e) {
          directions[e.which] = true;//Add in attr in Class
          socket.emit('move_direction', directions);
      }
      function stop(e) {
          delete directions[e.which];//Delete in attr in Class
      }
      //end fo movement part
      socket.on("move", function(data) {
        playerMap(data[0], data[1]);
      });
      //canvas power elemet remove when detected collition
      socket.on("canvasClearPower", function(data) {
        canvasClearPower(data);
      });
      //canvas gold elemet remove when detected collition
      socket.on("canvasClearGold", function(data) {
        canvasClearGold(data);
      });
      //for energy html part
      socket.on("energy", function(data) {
        energyStatus.text(data + "/10000");
        energyProgress.val(data/100);
      });
    }
  });
});
