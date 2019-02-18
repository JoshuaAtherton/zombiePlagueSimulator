const circleRadius = 8;
const friction = 1;
const acceleration = 1000000;
const maxSpeed = 200;

// get distance between two coordinates
function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

class Zombie extends Entity{
    constructor(game, canvasWidthHeight) {
        super(game, circleRadius + Math.random() * (canvasWidthHeight - circleRadius * 2),
                   circleRadius + Math.random() * (canvasWidthHeight - circleRadius * 2));
				this.canvasWidthHeight = canvasWidthHeight;
        this.player = 1;
        this.radius = circleRadius;
        this.visualRadius = 500;
        this.colors = ["Red", "Green", "Blue", "black"];
        this.setHealthy();
        this.velocity = { x: Math.random() * 1000, y: Math.random() * 1000 };
        var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        if (speed > maxSpeed) {
            var ratio = maxSpeed / speed;
            this.velocity.x *= ratio;
            this.velocity.y *= ratio;
        }
    }
    infect() {
        this.it = true;
        this.color = 0;
        this.visualRadius = 500;
    }
    setHealthy() {
        this.it = false;
        this.color = 3;
        this.visualRadius = 200;
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
        Entity.prototype.update.call(this);
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
        if (this.collideLeft() || this.collideRight()) {
            this.velocity.x = -this.velocity.x * friction;
            if (this.collideLeft())
                this.x = this.radius;
            if (this.collideRight())
                this.x = this.canvasWidthHeight - this.radius;
            this.x += this.velocity.x * this.game.clockTick;
            this.y += this.velocity.y * this.game.clockTick;
        }
        if (this.collideTop() || this.collideBottom()) {
            this.velocity.y = -this.velocity.y * friction;
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
                var temp = { x: this.velocity.x, y: this.velocity.y };
                var dist = distance(this, ent);
                var delta = this.radius + ent.radius - dist;
                var difX = (this.x - ent.x) / dist;
                var difY = (this.y - ent.y) / dist;
                this.x += difX * delta / 2;
                this.y += difY * delta / 2;
                ent.x -= difX * delta / 2;
                ent.y -= difY * delta / 2;
                this.velocity.x = ent.velocity.x * friction;
                this.velocity.y = ent.velocity.y * friction;
                ent.velocity.x = temp.x * friction;
                ent.velocity.y = temp.y * friction;
                this.x += this.velocity.x * this.game.clockTick;
                this.y += this.velocity.y * this.game.clockTick;
                ent.x += ent.velocity.x * this.game.clockTick;
                ent.y += ent.velocity.y * this.game.clockTick;
                if (this.it) {
                    ent.infect();
                }
                else if (ent.it) {
                    this.infect();
                }
            }
            if (ent != this && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius })) {
                var dist = distance(this, ent);
                if (this.it && dist > this.radius + ent.radius + 10) {
                    var difX = (ent.x - this.x) / dist;
                    var difY = (ent.y - this.y) / dist;
                    this.velocity.x += difX * acceleration / (dist * dist);
                    this.velocity.y += difY * acceleration / (dist * dist);
                    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                    if (speed > maxSpeed) {
                        var ratio = maxSpeed / speed;
                        this.velocity.x *= ratio;
                        this.velocity.y *= ratio;
                    }
                }
                if (ent.it && dist > this.radius + ent.radius) {
                    var difX = (ent.x - this.x) / dist;
                    var difY = (ent.y - this.y) / dist;
                    this.velocity.x -= difX * acceleration / (dist * dist);
                    this.velocity.y -= difY * acceleration / (dist * dist);
                    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                    if (speed > maxSpeed) {
                        var ratio = maxSpeed / speed;
                        this.velocity.x *= ratio;
                        this.velocity.y *= ratio;
                    }
                }
            }
        }
        this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
        this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = this.colors[this.color];
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.closePath();
    }
}
