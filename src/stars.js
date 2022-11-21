import {circle} from "./shapes.js";

const N = 500;
const MAXRADIUS = 2;
const MINRADIUS = 0.5;

function Star(x, y, r, dx, dy, dr) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.lastX = this.x;
    this.lastY = this.y;
    this.lastR = this.r;
    this.dx = dx;
    this.dy = dy;
    this.dr = dr;
}


Star.prototype.update = function(delta) {
    this.lastX = this.x;
    this.lastY = this.y;
    this.lastR = this.r;

    this.x += this.dx * delta;
    this.y += this.dy * delta;
    this.r += this.dr * delta;
};

Star.prototype.draw = function(ctx, interpolationPercentage) {
    var x = this.lastX + (this.x - this.lastX) * interpolationPercentage,
        y = this.lastY + (this.y - this.lastY) * interpolationPercentage;
    circle(ctx, this.x, this.y, this.r, 'white');
};


Star.prototype.spawn = function(canvas) {
    this.x = Math.floor(Math.random() * canvas.width);
    this.y = Math.floor(Math.random() * canvas.height);
    this.r = MINRADIUS;
    let c = Math.random() * 200 + 300;
    this.dx = (this.x - (canvas.width / 2)) / c;
    this.dy = (this.y - (canvas.height / 2)) / c;
    this.setDefaultDR(canvas);
};

Star.prototype.setDefaultDR = function(canvas) {
    let framesX = this.dx < 0 ? -this.x / this.dx : (canvas.width - this.x) / this.dx;
    let framesY = this.dy < 0 ? -this.y / this.dy : (canvas.height - this.y) / this.dy;
    this.dr = MAXRADIUS / Math.min(framesX, framesY);
};


function StarSystem(canvas, fps, n) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.fps = fps;
    this.n = n;
    this.stars = [];

    for (let i = 0; i < this.n; i++) {
        let star = new Star();
        star.spawn(this.canvas);
        this.stars.push(star);
    }
    this.resize();

}

StarSystem.prototype.update = function(delta) {
    for (let star of this.stars) {
        star.update(delta / (1000 / this.fps));
        if (star.x > this.canvas.width || star.x < 0) {
            star.spawn(this.canvas);
        }

        if (star.y > this.canvas.height || star.y < 0) {
            star.spawn(this.canvas);
        }
    }
};

StarSystem.prototype.draw = function(interpolationPercentage) {
    this.ctx.fillStyle =  '#141414';
    this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fill()
    for (let star of this.stars) {
        star.draw(this.ctx, interpolationPercentage);
    }
};

StarSystem.prototype.restart = function() {
    for (let star of this.stars) {
        star.spawn(this.canvas);
    }
};

StarSystem.prototype.resize = function() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.restart();
};

export {StarSystem};