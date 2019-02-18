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

    this.health = 1000;
    this.circleRadius = CIRCLE_RADIUS;
    this.friction = FRICTION;
    this.acceleration = ACCELERATION;
    this.maxSpeed = MAX_SPEED;

    this.player = 1;
    this.radius = this.circleRadius;
    this.visualRadius = 100;
    this.colors = ["Red", "Green", "Blue", "black"];
    this.setHealthy();
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

    // this.acceleration += 200;
	// this.friction -= 10
    // this.maxSpeed -= 5;
  }
  setHealthy() {
    this.infected = false;
    this.color = 3;
    this.visualRadius = 100;
	this.health = 500;

  }
  collide(other) {
    return distance(this, other) < this.radius + other.radius;
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

		if (this.infected) {
			let min = 0; let max = 10000;
			if (Math.floor(Math.random() * (max - min)) + min >= 9993) {
				this.setHealthy();
			}
		}

		if (!this.infected) {
			//attempt to find food, if food not found then take health away
			let min = 0; let max = 10000;
			if (Math.floor(Math.random() * (max - min)) + min >= 9900) {
				this.health -= 250;
			} else {
				this.health++;
			}
			if (this.health <= 0) {
				this.setInfected();
			}
		}

		if (this.game.click) {
				console.log('click');
				let zom = new Zombie(this, this.canvasWidthHeight);
				zom.x = this.game.click.x;
				zom.y = this.game.click.y;
				// this.game.addEntity(zom);
		}
		if (this.game.rightclick) {
				console.log('right click');

		}


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
    for (var i = 0; i < this.game.entities.length; i++) {
      var ent = this.game.entities[i];
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
        if (this.infected) {
          ent.setInfected();
        } else if (ent.infected) {
          this.setInfected();
        }
      }
      if (ent != this && this.collide({
          x: ent.x,
          y: ent.y,
          radius: this.visualRadius
        })) {
        var dist = distance(this, ent);
        if (this.infected && dist > this.radius + ent.radius + 10) {
          var difX = (ent.x - this.x) / dist;
          var difY = (ent.y - this.y) / dist;
          this.velocity.x += difX * this.acceleration / (dist * dist);
          this.velocity.y += difY * this.acceleration / (dist * dist);
          var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
          if (speed > this.maxSpeed) {
            var ratio = this.maxSpeed / speed;
            this.velocity.x *= ratio;
            this.velocity.y *= ratio;
          }
        }
        if (ent.infected && dist > this.radius + ent.radius) {
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
  }
}
