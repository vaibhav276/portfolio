'use strict';

let Particle = function() {
   let pos = createVector();
   let acc = createVector();
   let worldBounds = {
      x: 100,
      y: 100
   }

   this.setWorldBounds = function(width, height) {
      worldBounds.x = width;
      worldBounds.y = height;
      return this;
   }

   this.setIntialRandomPos = function() {
      pos.x = Math.floor(Math.random() * worldBounds.x);
      pos.y = Math.floor(Math.random() * worldBounds.y);
      return this;
   }

   this.applyForce = function(force) {
      // acc.add(force);
      acc = force;
      return this;
   }

   this.updatePosition = function() {
      pos.add(acc);

      if (pos.x >= worldBounds.x) pos.x = 0;
      if (pos.y >= worldBounds.y) pos.y = 0;
      if (pos.x < 0) pos.x = worldBounds.x - 1;
      if (pos.y < 0) pos.y = worldBounds.y - 1;
      return this;
   }

   this.getPosition = function() {
      return pos;
   }
}

var g = {
   width: 600,
   height: 400,
   xoff: 0,
   yoff: 0,
   zoff: 0,
   inc: 0.05,
   rez: 5,
   numParticles: 500,
   particals: [],
   forceField: [],
   magnitude: 5
};

let forceAt = function(v) {
   let c = Math.floor(v.x / g.rez);
   let r = Math.floor(v.y / g.rez);
   let rows = Math.floor(g.height / g.rez);

   if (g.forceField[r + (c * rows)] == undefined) {
      console.log(v);
      console.log(r, c, rows);
   }
   g.forceField[r + (c * rows)].mult(g.magnitude);
   return g.forceField[r + (c * Math.floor(g.height / g.rez))];
}

function setup() {
   let canvas = createCanvas(g.width, g.height);
   canvas.parent('sketch-holder');
   pixelDensity(1);
   // frameRate(5);

   for (let i = 0; i < g.numParticles; i++) {
      let p = new Particle();
      p.setWorldBounds(g.width, g.height);
      p.setIntialRandomPos();
      g.particals.push(p);
   }

   let cols = Math.floor(g.width / g.rez);
   let rows = Math.floor(g.height / g.rez);

   for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
         g.forceField[r + (c * rows)] = createVector();
      }
   }
}

function draw() {
   let cols = Math.floor(g.width / g.rez);
   let rows = Math.floor(g.height / g.rez);

   background(200, 200, 200);
   g.xoff = 0;
   for (let c = 0; c < cols; c++) {
      g.yoff = 0;
      for (let r = 0; r < rows; r++) {
         let val = noise(g.xoff, g.yoff, g.zoff);
         let v = p5.Vector.fromAngle(val * TWO_PI);

         g.forceField[r + (c * rows)] = v;

         // stroke(0);
         // push();
         // translate(c * g.rez, r * g.rez);
         // rotate(v.heading());
         // line(0, 0, g.rez, 0);
         // pop();

         g.yoff += g.inc;
      }
      g.xoff += g.inc;
   }

   fill(0, 100, 200);
   noStroke();
   for (let index = 0; index < g.particals.length; index++) {
      let particle = g.particals[index];
      ellipse(particle.getPosition().x, particle.getPosition().y, 4);
      particle.applyForce(forceAt(particle.getPosition()));
      particle.updatePosition();
   }

   g.zoff += g.inc / 10;
}
