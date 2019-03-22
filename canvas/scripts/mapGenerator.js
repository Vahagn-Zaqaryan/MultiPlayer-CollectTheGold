stage = new createjs.Stage("canvas");//Main canvas for base for players and for stanes
stage_power = new createjs.Stage("canvas_power");//canvas for powers
stage_gold = new createjs.Stage("canvas_gold");//canvas for gold
gold = [];//gold in canvas
power = [];//powers in canvas
//----FUNCTIONS----//
//function f(mapGenerator) geterating map and draw in 3 canvases
function mapGenerator(arr, stage, num) {

  var queue;

  queue = new createjs.LoadQueue(false);

  queue.addEventListener("complete", handleComplete);
  queue.loadManifest([{id: "stone", src: "gui/obstacle/default.png"}, {id: "gold", src: "gui/resource/gold.png"}, {id: "power", src: "gui/resource/power.png"}]);

  function handleComplete(e) {
    for(var i = 0; i < arr.length; i++){
      if(num == "1"){
        var pic = new createjs.Bitmap(queue.getResult("stone"));
        pic.y = arr[i][0];
        pic.x = arr[i][1];
        stage.addChild(pic);
      }else if (num == "2") {
        var pic = new createjs.Bitmap(queue.getResult("gold"));
        pic.y = arr[i][0];
        pic.x = arr[i][1];
        gold.push(pic);
        stage_gold.addChild(pic);
      }else{
        var pic = new createjs.Bitmap(queue.getResult("power"));
        pic.y = arr[i][0];
        pic.x = arr[i][1];
        power.push(pic);
        stage_power.addChild(pic);
      }
    }
    createjs.Ticker.addEventListener("tick", tickHandler);
  }
  //function f(tickHandler) updating canvases
  function tickHandler(e) {
    stage.update();
    stage_power.update();
    stage_gold.update();
  }
}
//--------
//function f(basePlacement) for base placement
function basePlacement(){
  var queue;

  queue = new createjs.LoadQueue(false);

  queue.addEventListener("complete", handleComplete);
  queue.loadManifest([{id: "blue", src: "gui/camp/blue.png"}, {id: "green", src: "gui/camp/green.png"}, {id: "yellow", src: "gui/camp/yellow.png"}, {id: "red", src: "gui/camp/red.png"}]);

  function handleComplete(e) {
    var blue = new createjs.Bitmap(queue.getResult("blue"));
    blue.x = 0;
    blue.y = 0;
    stage.addChild(blue);
    var green = new createjs.Bitmap(queue.getResult("green"));
    green.x = 448;
    green.y = 0;
    stage.addChild(green);
    var red = new createjs.Bitmap(queue.getResult("red"));
    red.x = 448;
    red.y = 480;
    stage.addChild(red);
    var yellow = new createjs.Bitmap(queue.getResult("yellow"));
    yellow.x = 0;
    yellow.y = 480;
    stage.addChild(yellow);
    createjs.Ticker.addEventListener("tick", tickHandler);
  }
  //function f(tickHandler) updating canvas stage on line 1
  function tickHandler(e) {
    stage.update();
  }
}
//--------
function canvasClearGold(id) {//removeing gold when collition detected
  createjs.Tween.get(gold[id]).to({alpha: 0},300);
  gold.splice(id, 1);
}
//--------
function canvasClearPower(id) {//removeing power when collition detected
  createjs.Tween.get(power[id]).to({alpha: 0},300);
  power.splice(id, 1);
}
//--------
//function f(playerMapPlaceMent) for golds on trucks which is at first opacity 0 and for playes there ara global vars
function playerMapPlaceMent() {
  var queue;
  queue = new createjs.LoadQueue(false);
  queue.addEventListener("complete", handleComplete);
  queue.loadManifest([{id: "bluePlayer", src: "gui/truck/player_blue_2.png"}, {id: "greenPlayer", src: "gui/truck/player_green_2.png"}, {id: "yellowPlayer", src: "gui/truck/player_yellow_2.png"}, {id: "redPlayer", src: "gui/truck/player_red_2.png"}, {id: "gold", src: "gui/cargo/gold.png"}]);

  function handleComplete(e) {
    gold1 = new createjs.Bitmap(queue.getResult("gold"));
    gold2 = new createjs.Bitmap(queue.getResult("gold"));
    gold3 = new createjs.Bitmap(queue.getResult("gold"));
    gold4 = new createjs.Bitmap(queue.getResult("gold"));
    gold1.x = 0;
    gold1.y = 0;
    gold2.x = 0;
    gold2.y = 0;
    gold3.x = 0;
    gold3.y = 0;
    gold4.x = 0;
    gold4.y = 0;
    createjs.Tween.get(gold1).to({alpha: 0},50);
    createjs.Tween.get(gold2).to({alpha: 0},50);
    createjs.Tween.get(gold3).to({alpha: 0},50);
    createjs.Tween.get(gold4).to({alpha: 0},50);

    bluePlayer = new createjs.Bitmap(queue.getResult("bluePlayer"));
    greenPlayer = new createjs.Bitmap(queue.getResult("greenPlayer"));
    redPlayer = new createjs.Bitmap(queue.getResult("redPlayer"));
    yellowPlayer = new createjs.Bitmap(queue.getResult("yellowPlayer"));
    bluePlayer.x = 64;
    bluePlayer.y = 0;
    stage.addChild(bluePlayer);
    greenPlayer.x = 416;
    greenPlayer.y = 0;
    stage.addChild(greenPlayer);
    redPlayer.x = 416;
    redPlayer.y = 512;
    stage.addChild(redPlayer);
    yellowPlayer.x = 64;
    yellowPlayer.y = 512;
    stage.addChild(yellowPlayer);
    stage.addChild(gold1, gold2, gold3, gold4);

    createjs.Ticker.addEventListener("tick", tickHandler);
  }
  function tickHandler(e) {
    stage.update();
  }
}
//--------
//function f(playerMap) changing coord fo players when pressed button
function playerMap(arr, id){
  color = arr[id].color;
  console.log(arr[id].goldChecker);
  if(color == "Blue"){
    console.log("blue");
    createjs.Tween.get(bluePlayer, {loop: false})
    .to({x:  arr[id].x, y: arr[id].y}, 10);
    if (arr[id].goldChecker === true) {
      createjs.Tween.get(gold1, {loop: false})
      .to({x:  arr[id].x, y: arr[id].y}, 10);
      createjs.Tween.get(gold1).to({alpha: 1},50);
    }else{
      createjs.Tween.get(gold1).to({alpha: 0},50);
    }
  }else if (color == "Green") {
    console.log("green");
    createjs.Tween.get(greenPlayer, {loop: false})
    .to({x: arr[id].x , y: arr[id].y}, 10);
    if (arr[id].goldChecker === true) {
      createjs.Tween.get(gold2, {loop: false})
      .to({x:  arr[id].x, y: arr[id].y}, 10);
      createjs.Tween.get(gold2).to({alpha: 1},50);
    }else{
      createjs.Tween.get(gold2).to({alpha: 0},50);
    }
  }else if (color == "Red") {
    console.log("red");
    createjs.Tween.get(redPlayer, {loop: false})
    .to({x: arr[id].x , y: arr[id].y}, 10);
    if (arr[id].goldChecker === true) {
      createjs.Tween.get(gold3, {loop: false})
      .to({x:  arr[id].x, y: arr[id].y}, 10);
      createjs.Tween.get(gold3).to({alpha: 1},50);
    }else{
      createjs.Tween.get(gold3).to({alpha: 0},50);
    }
  }else if (color == "Yellow") {
    console.log("Yellow");
    createjs.Tween.get(yellowPlayer, {loop: false})
    .to({x: arr[id].x , y: arr[id].y}, 10);
    if (arr[id].goldChecker === true) {
      createjs.Tween.get(gold4, {loop: false})
      .to({x:  arr[id].x, y: arr[id].y}, 10);
      createjs.Tween.get(gold4).to({alpha: 1},50);
    }else{
      createjs.Tween.get(gold4).to({alpha: 0},50);
    }
  }
}
