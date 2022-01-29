import Phaser from "phaser";
import skyImg from "./assets/sky.png";
import starImg from "./assets/star.png";
import platformImg from "./assets/platform.png";
import bombImg from "./assets/bomb.png";
import dudeImg from "./assets/dude.png";
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
    // constructor: constructor,
    preload: preload,
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config);

// function () {

// }

function preload() {
  this.load.image("sky", skyImg);
  this.load.image("ground", platformImg);
  this.load.image("star", starImg);
  this.load.image("bomb", bombImg);
  this.load.spritesheet("dude", dudeImg, { frameWidth: 32, frameHeight: 48 });
}

let platforms;
let score = 0;
let scoreText;
let player;
let stars;
let cursors;

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

  player.setBounce(0.2);
  // player.body.setGravityY(300);
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
    repeat: 11,
    setXY: { x: 12, y: 0, stepY: 70 },
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

  // OTHER
  cursors = this.input.keyboard.createCursorKeys();
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
      child.enableBody(true, child.x, 0, true, true);
    });

    var x =
      player.x < 400
        ? Phaser.Math.Between(400, 800)
        : Phaser.Math.Between(0, 400);

    var bomb = bombs.create(x, 16, "bomb");
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
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

function update() {
  if (cursors.left.isDown) {
    player.setVelocityX(-160);

    player.anims.play("left", true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);

    player.anims.play("right", true);
  } else if (cursors.up.isDown) {
    player.setVelocityY(-160);

    player.anims.play("turn", true);
  } else if (cursors.down.isDown) {
    player.setVelocityY(160);

    player.anims.play("turn", true);
  } else {
    player.setVelocityX(0);
    player.setVelocityY(0);

    player.anims.play("turn");
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-500);
  }

  enemyFollows(this.physics);
}
