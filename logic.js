const CIRCLE_RADIUS = 8;
const FRICTION = 0.8;
const ACCELERATION = 10000;
const MAX_SPEED = 110;

// get distance between two coordinates
function distance(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

class Zombie extends Entity {
  constructor(game, canvasWidthHeight) {
    super(game, CIRCLE_RADIUS + Math.random() * (canvasWidthHeight - CIRCLE_RADIUS * 2),
      CIRCLE_RADIUS + Math.random() * (canvasWidthHeight - CIRCLE_RADIUS * 2));
    this.canvasWidthHeight = canvasWidthHeight;

    this.zombieDurability = 1000;

    this.resistanceFighter = false;
    this.health = 100;
    this.circleRadius = CIRCLE_RADIUS;
    this.friction = FRICTION;
    this.acceleration = ACCELERATION;
    this.maxSpeed = MAX_SPEED;

    this.infected = false;
    this.color = 3;
    this.legless = false;

    this.player = 1;
    this.radius = this.circleRadius;
    this.visualRadius = 100;
    this.colors = ["Red", "Green", "Blue", "black"];

    this.velocity = {
      x: Math.random() * 1000,
      y: Math.random() * 1000
    };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > this.maxSpeed) {
      var ratio = this.maxSpeed / speed;
      this.velocity.x *= ratio;
      this.velocity.y *= ratio;
    }
  }
  setInfected() {
    this.infected = true;
    this.color = 0;
    this.visualRadius = 500;

    this.maxSpeed -= 10;
    this.resistanceFighter = false;
  }
  setResistanceFighter() {
    this.resistanceFighter = true;
    this.color = 2;
    this.visualRadius = 600; // was 60
    this.maxSpeed -= 40;
  }
  setHealthy() {
    this.infected = false;
    this.color = 3;
    this.visualRadius = 50;
	  this.health = 50;
    this.maxSpeed = MAX_SPEED * .5;

  }
  setLegless() {
    this.maxSpeed = 0;
    this.legless = true;
    this.color = 1;
    // this.velocity = {
    //   x: 0,
    //   y: 0
    // };
    // console.log("Zombie's legs fell off");
  }
  //return boolean
  //is distance between field of view < the radiuses combined?
  collide(other) {
    return distance(this, other) < this.radius + other.radius;
  }
  isInView (other) {
    // console.log(distance(this, other));
    // console.log(this.x, this.y, other.x, other.y);
    return distance(this, other) <= this.visualRadius;
  }
  collideLeft() {
    return (this.x - this.radius) < 0;
  }
  collideRight() {
    return (this.x + this.radius) > this.canvasWidthHeight;
  }
  collideTop() {
    return (this.y - this.radius) < 0;
  }
  collideBottom() {
    return (this.y + this.radius) > this.canvasWidthHeight;
  }

  update() {
    //check zombies durability and chance to be cured
		if (this.infected) {
      this.zombieDurability--;
			let min = 0; let max = 10000;
      //chance to be cured only if zombieDurability not worn out and
			if (Math.floor(Math.random() * (max - min)) + min >= 9999 && this.zombieDurability > 0) {
				this.setHealthy();
			}
      if (this.zombieDurability <= 0) {
        this.setLegless();
        // this.removeFromWorld = true;
      }
		}

    //
    if(this.resistanceFighter) {
      //if he is doing a bad job killing zombies his health goes down
      if (this.game.survivorCount < (this.game.survivorCount + this.game.infectedCount) / 2) {
        this.health -= 10;
        if (this.health < 0) {
          this.setInfected();
        }
      }
    }

    //survivors have to gather food
		if (!this.infected) {
			//attempt to find food, if food not found then take health away
			let min = 0; let max = 10000;
			if (Math.floor(Math.random() * (max - min)) + min >= 9990) {
				this.health -= 50;
			} else {
				this.health++;
			}
			if (this.health <= 0) {
				this.setInfected();
			}
		}

    //update the counters on html pg
    document.getElementById("zombieCounter").innerHTML = "Zombies: " + this.game.infectedCount;
    document.getElementById("survivorCounter").innerHTML = "Survivors: " + this.game.survivorCount;

    //check collisions with borders
    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;
    if (this.collideLeft() || this.collideRight()) {
      this.velocity.x = -this.velocity.x * this.friction;
      if (this.collideLeft())
        this.x = this.radius;
      if (this.collideRight())
        this.x = this.canvasWidthHeight - this.radius;
      this.x += this.velocity.x * this.game.clockTick;
      this.y += this.velocity.y * this.game.clockTick;
    }
    if (this.collideTop() || this.collideBottom()) {
      this.velocity.y = -this.velocity.y * this.friction;
      if (this.collideTop())
        this.y = this.radius;
      if (this.collideBottom())
        this.y = this.canvasWidthHeight - this.radius;
      this.x += this.velocity.x * this.game.clockTick;
      this.y += this.velocity.y * this.game.clockTick;
    }

    //check for collisions between entities
    for (var i = 0; i < this.game.entities.length; i++) {
      var ent = this.game.entities[i];

      //check for collisions between entities
      if (ent !== this && this.collide(ent)) {
        var temp = {
          x: this.velocity.x,
          y: this.velocity.y
        };
        var dist = distance(this, ent);
        var delta = this.radius + ent.radius - dist;
        var difX = (this.x - ent.x) / dist;
        var difY = (this.y - ent.y) / dist;
        this.x += difX * delta / 2;
        this.y += difY * delta / 2;
        ent.x -= difX * delta / 2;
        ent.y -= difY * delta / 2;
        this.velocity.x = ent.velocity.x * this.friction;
        this.velocity.y = ent.velocity.y * this.friction;
        ent.velocity.x = temp.x * this.friction;
        ent.velocity.y = temp.y * this.friction;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
        ent.x += ent.velocity.x * this.game.clockTick;
        ent.y += ent.velocity.y * this.game.clockTick;
        //if collied with an infected entity set infected
        if (this.infected) {
          if (ent.resistanceFighter) { // resistance fighter hit & killed zombie
            this.removeFromWorld = true;
          } else {
            this.zombieDurability += 5;
            ent.setInfected();
          }
        } else if (ent.infected) {
          if (this.resistanceFighter) {
            ent.removeFromWorld = true;
          } else {
            this.setInfected();
          }
        }
      }

      //handle collisions
      if (ent != this && this.collide({
          x: ent.x,
          y: ent.y,
          radius: this.visualRadius })
      ) {
        var dist = distance(this, ent);
        // handle reistance fighter and infected zombie chasing behavior
        if (this.infected || this.resistanceFighter && dist > this.radius + ent.radius ) {
          var difX = (ent.x - this.x) / dist;
          var difY = (ent.y - this.y) / dist;
          if (this.infected) { //resistance figters dont chase survivors      /////
            this.velocity.x += difX * this.acceleration / (dist * dist);
            this.velocity.y += difY * this.acceleration / (dist * dist);
            var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
            if (speed > this.maxSpeed) {
              var ratio = this.maxSpeed / speed;
              this.velocity.x *= ratio;
              this.velocity.y *= ratio;
            }
          // resistance fighters chase zombies
          } else if (this.resistanceFighter && ent.infected) {
            this.velocity.x += difX * this.acceleration / (dist * dist);
            this.velocity.y += difY * this.acceleration / (dist * dist);
            var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
            if (speed > this.maxSpeed) {
              var ratio = this.maxSpeed / speed;
              this.velocity.x *= ratio;
              this.velocity.y *= ratio;
            }
          }
        }
        //resistance fighters don't run
        if (ent.infected && !this.resistanceFighter && dist > this.radius + ent.radius) {
          var difX = (ent.x - this.x) / dist;
          var difY = (ent.y - this.y) / dist;
          this.velocity.x -= difX * this.acceleration / (dist * dist);
          this.velocity.y -= difY * this.acceleration / (dist * dist);
          var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
          if (speed > this.maxSpeed) {
            var ratio = this.maxSpeed / speed;
            this.velocity.x *= ratio;
            this.velocity.y *= ratio;
          }
        }
      }

    }
    this.velocity.x -= (1 - this.friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - this.friction) * this.game.clockTick * this.velocity.y;
  }
  draw(ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.colors[this.color];
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();

    if ( this.game.infectedCount == 0 || this.game.survivorCount == 0) {
      ctx.font = "bold 30px Helvetica, Arial, sans-serif";
      ctx.fillStyle = '#989e25';
      if (this.game.infectedCount == 0)
        ctx.fillText('Humans Rule the World', 125, 310);
      if (this.game.survivorCount == 0)
        ctx.fillText('Zombies Rule the World', 125, 310);
    }
  }
}
