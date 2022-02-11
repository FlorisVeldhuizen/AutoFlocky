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
    // this.scene;
    this.score = 0;
    this.scoreText;
    this.player;
    this.enemies;
    this.cursors;
    this.wasd;
    this.bombs;
    this.diamonds;
    this.playerBullets;
    this.enemySpeed = 70;

    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false,
    };
  }

  init() {}

  preload() {
    this.load.image("sky", skyImg);
    this.load.image("ground", platformImg);
    this.load.image("star", starImg);
    this.load.image("bomb", bombImg);
    this.load.image("diamond", diamondImg);
    this.load.image("bullet", bulletImg);
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

    // PLAYER
    this.player = new Player(this, 300, 400);

    makeAnimations(this);

    // STARS
    this.enemies = this.physics.add.group({
      key: "flocky",
      repeat: 30,
      setXY: { x: 0, y: 12, stepX: 28 },
    });

    this.enemies.children.iterate(function (child) {
      child.health = 20;
    });

    // GAME ITEMS
    this.bombs = this.physics.add.group();
    this.diamonds = this.physics.add.group();

    // PHYSICS
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.collider(this.enemies, this.enemies);
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.touchEnemy,
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
      this.enemies,
      this.playerBullets,
      this.enemyHitCallback,
      null,
      this
    );

    this.physics.add.collider(this.playerBullets, this.platforms);

    // AUTO SHOOT
    this.time.addEvent({
      delay: 500,
      callback: this.shoot,
      args: [],
      callbackScope: this,
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
      ? (this.keys.left = true)
      : (this.keys.left = false);
    this.cursors.right.isDown || this.wasd.right.isDown
      ? (this.keys.right = true)
      : (this.keys.right = false);
    this.cursors.up.isDown || this.wasd.up.isDown
      ? (this.keys.up = true)
      : (this.keys.up = false);
    this.cursors.down.isDown || this.wasd.down.isDown
      ? (this.keys.down = true)
      : (this.keys.down = false);
    this.animateFlockys();
    this.player.update(this.keys);
    this.enemyFollows(this.physics);
  }

  end() {
    console.log("Halloo");
  }

  //CUSTOM FUNCTIONS
  touchEnemy(player, star) {
    star.disableBody(true, true);
    // for now: 2 damage per hit
    player.damage(2);

    this.score += 10;
    this.scoreText.setText("Score: " + this.score);

    console.log(this.enemies);

    if (this.enemies.countActive(true) === 0) {
      this.enemies.children.iterate(function (child) {
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
    diamond.destroy();
    this.score += 50;
    this.scoreText.setText("Score: " + this.score);
  }

  hitBomb(player, bomb) {
    this.physics.pause();

    this.player.setTint(0xff0000);
    this.player.anims.play("turn");

    // this.scene.stop();
    this.scene.start("endScene");
  }

  enemyFollows() {
    this.enemies.children.each((enemy) => {
      this.physics.moveToObject(enemy, this.player, this.enemySpeed);
    });
  }

  shoot() {
    if (this.playerBullets.countActive(true) === 0) {
      // Get bullet from bullets group
      const bullet = this.playerBullets.get().setActive(true).setVisible(true);
      const enemies = this.enemies.children;
      if (bullet && enemies.entries.length > 0) {
        const player = this.player;
        let closestEnemy;
        let closestEnemyDist = 10000;
        enemies.iterate(function (child) {
          const dist = Phaser.Math.Distance.BetweenPoints(player, child);
          if (dist < closestEnemyDist) {
            closestEnemyDist = dist;
            closestEnemy = child;
          }
        });
        bullet.fire(this.player, closestEnemy);
      }
    }
  }

  animateFlockys() {
    const playerX = this.player.x;
    this.enemies.children.iterate(function (child) {
      if (child.body.position.x > playerX) {
        child.setFlipX(false);
      } else {
        child.setFlipX(true);
      }
    });
  }

  enemyHitCallback(enemyHit, bulletHit) {
    // Reduce health of enemy
    if (bulletHit.active === true && enemyHit.active === true) {
      enemyHit.health = enemyHit.health - 1;
      this.flashColor(enemyHit, 0xff0000);
      if (enemyHit.health <= 0) {
        const { x, y } = enemyHit;
        this.diamonds.create(x, y, "diamond");
        enemyHit.destroy();
      }
    }
  }

  flashColor(object, color) {
    object.setTint(color);
    this.time.addEvent({
      delay: 100,
      callback: function () {
        object.clearTint();
      },
      callbackScope: this,
    });
  }
}

export default GameScene;
