/*
Ideas:
  - make zombies slower after being infected
  - make everyone slower so simulation lasts longer
  - chance for zombie to sponteneously become healthy again
  - animation on background
  - animation for healthy and zombie person
  - options in game (would have to do reload button better for html)
    -can select amount of zombies on start
    -click to spawn a new infected zombie
    -and right click to spawn new healthy person
  - fix wall bug????
*/

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/black.png");
ASSET_MANAGER.queueDownload("./img/white.png");

ASSET_MANAGER.downloadAll(function() {
  console.log("starting up da sheild");
  const canvas = document.getElementById('gameWorld');
  canvas.width = 600;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');

  const gameEngine = new GameEngine(ctx);
  var singleZombie = new Zombie(gameEngine, canvas.width);
  singleZombie.infect();
  gameEngine.addEntity(singleZombie);
  for (let i = 0; i < 16; i++) {
    singleZombie = new Zombie(gameEngine, canvas.width);
    gameEngine.addEntity(singleZombie);
  }

  // document.getElementById("restartSimulation")
  //   .addEventListener('click', function() {
  //     gameEngine = startNewSimulation(ctx);
  //   });

  gameEngine.start();
});
