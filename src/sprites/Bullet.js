import Phaser from "phaser";

const Bullet = new Phaser.Class({
  Extends: Phaser.GameObjects.Sprite,

  initialize:
    // Bullet Constructor
    function Bullet(scene) {
      Phaser.GameObjects.Sprite.call(this, scene, 0, 0, "bullet");
      this.speed = 1;
      this.born = 0;
      this.direction = 0;
      this.xSpeed = 0;
      this.ySpeed = 0;
      this.setScale(0.5);
    },

  // Fires a bullet from the player to the reticle
  fire: function (shooter, target) {
    this.setPosition(shooter.x, shooter.y); // Initial position
    this.direction = Math.atan((target.x - this.x) / (target.y - this.y));

    // Calculate X and y velocity of bullet to moves it from shooter to target
    if (target.y >= this.y) {
      this.xSpeed = this.speed * Math.sin(this.direction);
      this.ySpeed = this.speed * Math.cos(this.direction);
    } else {
      this.xSpeed = -this.speed * Math.sin(this.direction);
      this.ySpeed = -this.speed * Math.cos(this.direction);
    }

    this.rotation = this.direction; //shooter.rotation; // angle bullet with shooters rotation
    this.born = 0; // Time since new bullet spawned
  },

  // Updates the position of the bullet each cycle
  update: function (time, delta) {
    this.x += this.xSpeed * delta;
    this.y += this.ySpeed * delta;
    this.born += delta;
    if (this.born > 1800) {
      this.setActive(false);
      this.setVisible(false);
    }
  },
});

export default Bullet;
