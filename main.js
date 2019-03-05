//Joshua Atherton

/*
Ideas:
  - zombies slower after being infected
  - make everyone slower so simulation lasts longer
  - chance for zombie to sponteneously become healthy again
    (start with 50% health and smaller field of vision)
  - non infected zombies have random chance to gather food, if fail to gather food
    health is subtracted, if health <= 0 become a zombie
*/

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("zomb_back.jpg");

ASSET_MANAGER.downloadAll(function() {

  const canvas = document.getElementById('gameWorld');
  canvas.width = 600;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');

  const gameEngine = new GameEngine(ctx);

  //add infected zombies
  var singleZombie;
  for (let i = 0; i < 3; i++) {
    singleZombie = new Zombie(gameEngine, canvas.width);
    singleZombie.setInfected();
    gameEngine.addEntity(singleZombie);
  }

  //add the resistanceFighters
  for (let i = 0; i < 1; i++) {
    singleZombie = new Zombie(gameEngine, canvas.width);
    singleZombie.setResistanceFighter();
    gameEngine.addEntity(singleZombie);
  }

  //add the survivors
  for (let i = 0; i < 20; i++) {
    singleZombie = new Zombie(gameEngine, canvas.width);
    gameEngine.addEntity(singleZombie);
  }

  var socket = io.connect("http://24.16.255.56:8888");
  var saveButton = document.getElementById("save");
  var loadButton = document.getElementById("load");

  socket.on("load", function (data) {
      console.log(data);
      gameEngine.loadGameState(data.data);
  });

  // var gameState = { test: 1, cat: "orange", worked: true};

  saveButton.onclick = function () {
    console.log("save");
    let currentState = gameEngine.saveGameState();
    socket.emit("save", { studentname: "Joshua Atherton", statename: "zombieSlayer", data: currentState });
  };

  loadButton.onclick = function () {
    console.log("load");
    socket.emit("load", { studentname: "Joshua Atherton", statename: "zombieSlayer" });
  };


  // document.getElementById("restartSimulation")
  //   .addEventListener('click', function() {
  //     gameEngine = startNewSimulation(ctx);
  //   });

  gameEngine.start();
});
