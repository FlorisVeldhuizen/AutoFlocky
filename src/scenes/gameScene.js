import Phaser from "phaser";
import makeAnimations from "../helpers/animations";
import Bullet from "../sprites/Bullet";
import Player from "../sprites/Player";

// IMPORT ASSETS
import skyImg from "../assets/sky.png";
import starImg from "../assets/star.png";
import platformImg from "../assets/platform.png";
import bombImg from "../assets/bomb.png";
import dudeImg from "../assets/dude.png";
import bulletImg from "../assets/bullet.png";
import diamondImg from "../assets/diamond.png";
import flockyImg from "../assets/flocky.png";

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "gameScene" });

    this.platforms;
    this.scene;
    this.score = 0;
    this.scoreText;
    this.player;
    this.stars;
    this.cursors;
    this.wasd;
    this.bombs;
    this.diamonds;
    this.playerBullets;

    this.up;
    this.down;
    this.left;
    this.right;
  }

  init() {}

  preload() {
    this.load.image("sky", skyImg);
    this.load.image("ground", platformImg);
    this.load.image("star", starImg);
    this.load.image("bomb", bombImg);
    this.load.image("diamond", diamondImg);
    this.load.image("bullet", bulletImg, 10, 10);
    this.load.spritesheet("dude", dudeImg, { frameWidth: 32, frameHeight: 48 });
    this.load.image("flocky", flockyImg);
  }

  create() {
    // BACKGROUND
    this.add.image(0, 0, "sky").setOrigin(0);

    // this.platforms
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 568, "ground").setScale(2).refreshBody();

    this.platforms.create(600, 400, "ground");
    this.platforms.create(50, 250, "ground");
    this.platforms.create(750, 220, "ground");

    //SCENE
    this.scene = this;

    // PLAYER
    this.player = new Player(this);

    makeAnimations(this);

    // STARS
    this.stars = this.physics.add.group({
      key: "flocky",
      repeat: 30,
      setXY: { x: 0, y: 12, stepX: 28 },
    });

    this.stars.children.iterate(function (child) {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
      child.health = 20;
    });

    // GAME ITEMS
    this.bombs = this.physics.add.group();
    this.diamonds = this.physics.add.group();

    // PHYSICS
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.collider(this.stars, this.stars);
    this.physics.add.overlap(
      this.player,
      this.stars,
      this.collectStar,
      null,
      this
    );
    this.physics.add.overlap(
      this.player,
      this.diamonds,
      this.collectDiamond,
      null,
      this
    );
    this.physics.add.collider(this.bombs, this.platforms);
    this.physics.add.collider(
      this.player,
      this.bombs,
      this.hitBomb,
      null,
      this
    );

    // CAMERA
    this.cameras.main.setSize(800, 600);
    this.cameras.main.startFollow(this.player);

    // BULLETS
    this.playerBullets = this.physics.add.group({
      classType: Bullet,
      runChildUpdate: true,
    });

    this.physics.add.overlap(
      this.stars,
      this.playerBullets,
      this.starHitCallback,
      null,
      this
    );

    // AUTO SHOOT
    this.scene.time.addEvent({
      delay: 500,
      callback: this.shoot,
      args: [this.physics, this.playerBullets, this.player],
      callbackScope: this.scene,
      loop: true,
    });

    // OTHER
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    this.scoreText = this.add.text(16, 16, "score: 0", {
      fontSize: "32px",
      fill: "#000",
    });
  }

  update() {
    this.cursors.left.isDown || this.wasd.left.isDown
      ? (this.left = true)
      : (this.left = false);
    this.cursors.right.isDown || this.wasd.right.isDown
      ? (this.right = true)
      : (this.right = false);
    this.cursors.up.isDown || this.wasd.up.isDown
      ? (this.up = true)
      : (this.up = false);
    this.cursors.down.isDown || this.wasd.down.isDown
      ? (this.down = true)
      : (this.down = false);
    this.animateFlockys();
    this.player.update(this.left, this.right, this.up, this.down);
    this.enemyFollows(this.physics);
  }

  end() {}

  //CUSTOM FUNCTIONS
  collectStar(player, star) {
    star.disableBody(true, true);

    this.score += 10;
    this.scoreText.setText("Score: " + this.score);

    if (this.stars.countActive(true) === 0) {
      this.stars.children.iterate(function (child) {
        child.enableBody(true, Phaser.Math.Between(0, 800), 0, true, true);
        child.health = 20;
      });

      var x =
        this.player.x < 400
          ? Phaser.Math.Between(400, 800)
          : Phaser.Math.Between(0, 400);

      const y =
        this.player.y < 200
          ? Phaser.Math.Between(200, 400)
          : Phaser.Math.Between(0, 200);

      var bomb = this.bombs.create(x, y, "bomb");
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-300, 300), 100);
    }
  }

  collectDiamond(player, diamond) {
    diamond.disableBody(true, true);
    this.score += 50;
    this.scoreText.setText("Score: " + this.score);
  }

  hitBomb(player, bomb) {
    this.physics.pause();

    this.player.setTint(0xff0000);
    this.player.anims.play("turn");

    gameOver = true;
  }

  enemyFollows(physics) {
    this.stars.children.each((star) => {
      this.physics.moveToObject(star, this.player, 100);
    });
  }

  shoot(physics, playerBullets, player) {
    if (this.playerBullets.countActive(true) === 0) {
      // Get bullet from bullets group
      var bullet = this.playerBullets.get().setActive(true).setVisible(true);
      if (bullet) {
        const closest = this.physics.closest(this.player);
        bullet.fire(this.player, closest);
      }
    }
  }

  animateFlockys() {
    const playerX = this.player.x;
    this.stars.children.iterate(function (child) {
      if (child.body.position.x > playerX) {
        child.setFlipX(false);
      } else {
        child.setFlipX(true);
      }
    });
  }

  starHitCallback(enemyHit, bulletHit) {
    // Reduce health of enemy
    if (bulletHit.active === true && enemyHit.active === true) {
      enemyHit.health = enemyHit.health - 1;
      this.flashColor(enemyHit, 0xff0000);
      if (enemyHit.health <= 0) {
        const { x, y } = enemyHit;
        this.diamonds.create(x, y, "diamond");
        enemyHit.setActive(false).setVisible(false);
      }
    }
  }

  flashColor(object, color) {
    object.setTint(color);
    this.scene.time.addEvent({
      delay: 100,
      callback: function () {
        object.clearTint();
      },
      callbackScope: this,
    });
  }
}

export default GameScene;
