import Phaser from "phaser";
import skyImg from "./assets/sky.png";
import starImg from "./assets/star.png";
import platformImg from "./assets/platform.png";
import bombImg from "./assets/bomb.png";
import dudeImg from "./assets/dude.png";
import bulletImg from "./assets/bullet.png";
import "./index.css";

// Tutorial:
// https://phaser.io/tutorials/making-your-first-phaser-3-game/part3

// Plan:
// https://docs.google.com/document/d/1-YIxIrBr3ptBb-FJzd6LaSc6j1txRjKX7bbwcFTI-JA/edit

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config);

function preload() {
  this.load.image("sky", skyImg);
  this.load.image("ground", platformImg);
  this.load.image("star", starImg);
  this.load.image("bomb", bombImg);
  this.load.image("bullet", bulletImg, 10, 10);
  this.load.spritesheet("dude", dudeImg, { frameWidth: 32, frameHeight: 48 });
}

let platforms;
let score = 0;
let scoreText;
let player;
let stars;
let cursors;
let wasd;

let up;
let down;
let left;
let right;

// CONSTANTS
const accelerationSpeed = 75;
const maxVelocity = 200;

function create() {
  // BACKGROUND
  this.add.image(0, 0, "sky").setOrigin(0);

  // PLATFORMS
  platforms = this.physics.add.staticGroup();
  platforms.create(400, 568, "ground").setScale(2).refreshBody();

  platforms.create(600, 400, "ground");
  platforms.create(50, 250, "ground");
  platforms.create(750, 220, "ground");

  // PLAYER
  player = this.physics.add.sprite(400, 300, "dude");
  player.setBounce(0.1);
  player.setDamping(true);
  player.setDrag(0.01);
  player.setMaxVelocity(maxVelocity);
  player.setCollideWorldBounds(true);

  this.anims.create({
    key: "left",
    frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "turn",
    frames: [{ key: "dude", frame: 4 }],
    frameRate: 20,
  });

  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1,
  });

  // STARS
  stars = this.physics.add.group({
    key: "star",
    repeat: 30,
    setXY: { x: 0, y: 12, stepX: 28 },
  });

  stars.children.iterate(function (child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });

  // BOMBS
  bombs = this.physics.add.group();

  // PHYSICS
  this.physics.add.collider(player, platforms);
  this.physics.add.collider(stars, platforms);
  this.physics.add.collider(stars, stars);
  this.physics.add.overlap(player, stars, collectStar, null, this);
  this.physics.add.collider(bombs, platforms);
  this.physics.add.collider(player, bombs, hitBomb, null, this);

  // CAMERA
  this.cameras.main.setSize(800, 600);
  this.cameras.main.startFollow(player);

  // BULLETS
  playerBullets = this.physics.add.group({
    classType: Bullet,
    runChildUpdate: true,
  });

  // OTHER
  cursors = this.input.keyboard.createCursorKeys();
  wasd = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D,
  });

  scoreText = this.add.text(16, 16, "score: 0", {
    fontSize: "32px",
    fill: "#000",
  });
}

function collectStar(player, star) {
  star.disableBody(true, true);

  score += 10;
  scoreText.setText("Score: " + score);

  if (stars.countActive(true) === 0) {
    stars.children.iterate(function (child) {
      child.enableBody(true, Phaser.Math.Between(0, 800), 0, true, true);
    });

    var x =
      player.x < 400
        ? Phaser.Math.Between(400, 800)
        : Phaser.Math.Between(0, 400);

    const y =
      player.y < 200
        ? Phaser.Math.Between(200, 400)
        : Phaser.Math.Between(0, 200);

    var bomb = bombs.create(x, y, "bomb");
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-300, 300), 100);
  }
}

function hitBomb(player, bomb) {
  this.physics.pause();

  player.setTint(0xff0000);
  player.anims.play("turn");

  gameOver = true;
}

function enemyFollows(physics) {
  stars.children.each((star) => {
    physics.moveToObject(star, player, 100);
  });
}

const movement = () => {
  const nothingHappens = !(left || right || up || down);
  const directionalBlock = (left && right) || (down && up);

  if (!directionalBlock) {
    if (left) {
      player.setVelocityX(player.body.velocity.x - accelerationSpeed);
      player.anims.play("left", true);
    }
    if (right) {
      player.setVelocityX(player.body.velocity.x + accelerationSpeed);
      player.anims.play("right", true);
    }
    if (up) {
      player.setVelocityY(player.body.velocity.y - accelerationSpeed);
      player.anims.play("turn", true);
    }
    if (down) {
      player.setVelocityY(player.body.velocity.y + accelerationSpeed);
      player.anims.play("turn", true);
    }
    if (player.body.velocity.length() > maxVelocity) {
      player.body.velocity.normalize().scale(maxVelocity);
    }
  }
  if (nothingHappens || directionalBlock) {
    player.anims.play("turn");
  }
};

function update() {
  cursors.left.isDown || wasd.left.isDown ? (left = true) : (left = false);
  cursors.right.isDown || wasd.right.isDown ? (right = true) : (right = false);
  cursors.up.isDown || wasd.up.isDown ? (up = true) : (up = false);
  cursors.down.isDown || wasd.down.isDown ? (down = true) : (down = false);
  movement();

  if (left || right || up || down) {
    //player.active
    // console.log(playerBullets.children.entries.length);

    if (playerBullets.children.entries.length == 0) {
      // Get bullet from bullets group
      var bullet = playerBullets.get().setActive(true).setVisible(true);

      if (bullet) {
        // closest = stars.closest(player);
        closest = this.physics.closest(player);
        console.log(closest);
        bullet.fire(player, closest);

        this.physics.add.collider(closest, bullet, starHitCallback);
      }
    }
  }

  enemyFollows(this.physics);
}

function starHitCallback(enemyHit, bulletHit) {
  // Reduce health of enemy
  if (bulletHit.active === true && enemyHit.active === true) {
    // enemyHit.setActive(false).setVisible(false);
    bulletHit.setActive(false).setVisible(false);
    console.log(enemyHit);
    collectStar(player, enemyHit);
  }
}

const Bullet = new Phaser.Class({
  Extends: Phaser.GameObjects.Image,

  initialize:
    // Bullet Constructor
    function Bullet(scene) {
      Phaser.GameObjects.Image.call(this, scene, 0, 0, "bullet");
      this.speed = 1;
      this.born = 0;
      this.direction = 0;
      this.xSpeed = 0;
      this.ySpeed = 0;
      this.setSize(12, 12, true);
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

    this.rotation = shooter.rotation; // angle bullet with shooters rotation
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
