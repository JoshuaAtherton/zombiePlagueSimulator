window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function( /* function */ callback, /* DOMElement */ element) {
      window.setTimeout(callback, 1000 / 60);
    };
})();

class GameEngine {
  constructor(ctx) {
    this.entities = [];
    this.showOutlines = false;
    this.click = null;
    this.mouse = null;
    this.gameState = {};

    this.infectedCount = 0;
    this.survivorCount = 0;

    this.ctx = ctx;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.startInput();
    this.timer = new Timer();
    console.log('game initialized');
  }
  start() {
    console.log("starting game");
    this.updateCounters();
    this.gameState = this.saveGameState(); // to reload initial game

    var that = this;
    (function gameLoop() {
      that.loop();
      requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
  }
  updateCounters() {
    //initialize counters
    this.infectedCount = 0;
    this.survivorCount = 0;
    this.entities.forEach(item => {
      if (item.infected) {
        this.infectedCount++;
      } else {
        this.survivorCount++;
      }
    });
    // console.log(this.infectedCount, this.survivorCount);
  }
  startInput() {
    console.log('Starting input');
    var that = this;
    var getXandY = function(e) {
      var x = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
      var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;
      return {
        x: x,
        y: y
      };
    };
    this.ctx.canvas.addEventListener("mousemove", function(e) {
      //console.log(getXandY(e));
      that.mouse = getXandY(e);
    }, false);
    this.ctx.canvas.addEventListener("click", function(e) {
      //console.log(getXandY(e));
      that.click = getXandY(e);
      let z = new Zombie(that, that.surfaceWidth);
      z.x = that.click.x;
      z.y = that.click.y;
      z.setResistanceFighter();
      that.addEntity(z);
    }, false);
    this.ctx.canvas.addEventListener("contextmenu", function(e) {
      //console.log(getXandY(e));
      that.rightclick = getXandY(e);
      // console.log('right click');
      let z = new Zombie(that, that.surfaceWidth);
      z.x = that.rightclick.x;
      z.y = that.rightclick.y;
      z.setInfected();
      that.addEntity(z);
      e.preventDefault();
    }, false);
    console.log('Input started');
  }
  addEntity(entity) {
    console.log('added entity');
    this.entities.push(entity);
  }
  update() {
    this.updateCounters();
    var entitiesCount = this.entities.length;
    for (var i = 0; i < entitiesCount; i++) {
      var entity = this.entities[i];
      if (!entity.removeFromWorld) {
        entity.update();
      }
    }
    for (var i = this.entities.length - 1; i >= 0; --i) {
      if (this.entities[i].removeFromWorld) {
        this.entities.splice(i, 1);
      }
    }
  }
  draw() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.save();
    var entitiesCount = this.entities.length;
    for (var i = 0; i < this.entities.length; i++) {
      if (!this.entities[i].removeFromWorld) {
        this.entities[i].draw(this.ctx);
      }
    }
    this.ctx.restore();
  }
  loop() {
    this.clockTick = this.timer.tick();
    this.update();
    this.draw();
    this.click = null;
    this.rightclick = null;
    this.wheel = null;
  }

  saveGameState() {
    this.gameState.infectedCount = this.infectedCount;
    this.gameState.survivorCount = this.survivorCount;
    this.gameState.entities = [];

    for (var i = 0; i < this.entities.length; i++) {
      if (!this.entities[i].removeFromWorld) {
        let save = this.entities[i].getSaveState();
        this.gameState.entities.push(save);
      }
    }

    return this.gameState;
  }
  /*
  clear all entities from array
  create all entites and add them to the entities array while setting them to their saved state
  data {
    infectedCount: number
    survivorCount: number
    entites: [ array of get save state function]
  }
  */
  loadGameState(data) {
    console.log('from load game eng');
    console.log(data.infectedCount);
    console.log('end from load game eng');
    console.log('end from load game eng');
    this.infectedCount = data.infectedCount;
    this.survivorCount = data.survivorCount;
    this.entities = [];
    for (let i = 0; i < this.infectedCount + this.survivorCount; i++) {
      let loadedEntity = new Zombie(this, this.surfaceWidth);
      loadedEntity.setFromSavedSate(data.entities[i]);
      this.entities.push(loadedEntity);
    }
  }

  drawFinishedScreen() {
    //this is done in update method of zombie class
  }
}

class Entity {
  constructor(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.removeFromWorld = false;
  }
  update() {}
  draw(ctx) {
    if (this.game.showOutlines && this.radius) {
      this.game.ctx.beginPath();
      this.game.ctx.strokeStyle = "green";
      this.game.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      this.game.ctx.stroke();
      this.game.ctx.closePath();
    }
  }
  rotateAndCache(image, angle) {
    var offscreenCanvas = document.createElement('canvas');
    var size = Math.max(image.width, image.height);
    offscreenCanvas.width = size;
    offscreenCanvas.height = size;
    var offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.save();
    offscreenCtx.translate(size / 2, size / 2);
    offscreenCtx.rotate(angle);
    offscreenCtx.translate(0, 0);
    offscreenCtx.drawImage(image, -(image.width / 2), -(image.height / 2));
    offscreenCtx.restore();
    //offscreenCtx.strokeStyle = "red";
    //offscreenCtx.strokeRect(0,0,size,size);
    return offscreenCanvas;
  }
}

//keep track of game clockTick
class Timer {
  constructor() {
    this.gameTime = 0;
    this.maxStep = 0.05;
    this.wallLastTimestamp = 0;
  }
  tick() {
    var wallCurrent = Date.now();
    var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
    this.wallLastTimestamp = wallCurrent;
    var gameDelta = Math.min(wallDelta, this.maxStep);
    this.gameTime += gameDelta;
    return gameDelta;
  }
}

class AssetManager {
  constructor() {
    this.successCount = 0;
    this.errorCount = 0;
    this.cache = [];
    this.downloadQueue = [];
  }
  queueDownload(path) {
    // console.log("Queueing " + path);
    this.downloadQueue.push(path);
  }
  isDone() {
    return this.downloadQueue.length === this.successCount + this.errorCount;
  }
  downloadAll(callback) {
    for (var i = 0; i < this.downloadQueue.length; i++) {
      var img = new Image();
      var that = this;
      var path = this.downloadQueue[i];
      // console.log(path);
      img.addEventListener("load", function() {
        // console.log("Loaded " + this.src);
        that.successCount++;
        if (that.isDone())
          callback();
      });
      img.addEventListener("error", function() {
        console.log("Error loading " + this.src);
        that.errorCount++;
        if (that.isDone())
          callback();
      });
      img.src = path;
      this.cache[path] = img;
    }
  }
  getAsset(path) {
    return this.cache[path];
  }
}
