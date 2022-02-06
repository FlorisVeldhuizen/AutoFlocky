import Phaser from "phaser";
import makeAnimations from "./helpers/animations";
import Bullet from "./sprites/Bullet";
import "./index.css";

// IMAGE IMPORT
import skyImg from "./assets/sky.png";
import starImg from "./assets/star.png";
import platformImg from "./assets/platform.png";
import bombImg from "./assets/bomb.png";
import dudeImg from "./assets/dude.png";
import bulletImg from "./assets/bullet.png";
import diamondImg from "./assets/diamond.png";
import flockyImg from "./assets/flocky.png";

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
  fps: {
    target: 60,
    forceSetTimeOut: true,
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
  this.load.image("diamond", diamondImg);
  this.load.image("bullet", bulletImg, 10, 10);
  this.load.spritesheet("dude", dudeImg, { frameWidth: 32, frameHeight: 48 });
  this.load.image("flocky", flockyImg);
}

let platforms;
let scene;
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

  //SCENE
  scene = this.scene.scene;

  // PLAYER
  player = this.physics.add.sprite(400, 300, "dude");
  player.setBounce(0.1);
  player.setDamping(true);
  player.setDrag(0.01);
  player.setMaxVelocity(maxVelocity);
  player.setCollideWorldBounds(true);

  makeAnimations(this);

  // STARS
  stars = this.physics.add.group({
    key: "flocky",
    repeat: 30,
    setXY: { x: 0, y: 12, stepX: 28 },
  });

  stars.children.iterate(function (child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    child.health = 20;
  });

  // GAME ITEMS
  bombs = this.physics.add.group();
  diamonds = this.physics.add.group();

  // PHYSICS
  this.physics.add.collider(player, platforms);
  this.physics.add.collider(stars, platforms);
  this.physics.add.collider(stars, stars);
  this.physics.add.overlap(player, stars, collectStar, null, this);
  this.physics.add.overlap(player, diamonds, collectDiamond, null, this);
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

  this.physics.add.overlap(stars, playerBullets, starHitCallback, null, this);

  // AUTO SHOOT
  scene.time.addEvent({
    delay: 500,
    callback: shoot,
    args: [this.physics],
    loop: true,
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
      child.health = 20;
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

function collectDiamond(player, diamond) {
  diamond.disableBody(true, true);
  score += 50;
  scoreText.setText("Score: " + score);
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

function shoot(physics) {
  if (playerBullets.countActive(true) === 0) {
    // Get bullet from bullets group
    var bullet = playerBullets.get().setActive(true).setVisible(true);
    if (bullet) {
      closest = physics.closest(player);
      bullet.fire(player, closest);
    }
  }
}

function animateFlockys() {
  stars.children.iterate(function (child) {
    if (child.body.position.x > player.x) {
      child.setFlipX(false);
    } else {
      child.setFlipX(true);
    }
  });
}

function update() {
  cursors.left.isDown || wasd.left.isDown ? (left = true) : (left = false);
  cursors.right.isDown || wasd.right.isDown ? (right = true) : (right = false);
  cursors.up.isDown || wasd.up.isDown ? (up = true) : (up = false);
  cursors.down.isDown || wasd.down.isDown ? (down = true) : (down = false);
  movement();
  animateFlockys();

  enemyFollows(this.physics);
}

function starHitCallback(enemyHit, bulletHit) {
  // Reduce health of enemy
  if (bulletHit.active === true && enemyHit.active === true) {
    enemyHit.health = enemyHit.health - 1;
    flashColor(enemyHit, 0xff0000);
    if (enemyHit.health <= 0) {
      const { x, y } = enemyHit;
      diamonds.create(x, y, "diamond");
      enemyHit.setActive(false).setVisible(false);
    }
  }
}

const flashColor = (object, color) => {
  object.setTint(color);
  scene.time.addEvent({
    delay: 100,
    callback: function () {
      object.clearTint();
    },
    callbackScope: this,
  });
}
