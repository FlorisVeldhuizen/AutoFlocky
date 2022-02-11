import Phaser from "phaser";
import Healthbar from "./Healthbar";

// CONSTANTS
const accelerationSpeed = 75;
const maxVelocity = 200;
class Player extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "dude");
    this.scene = scene;
    this.alive = true;

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    this.body.onOverlap = true;

    this.body.setBounce(0.1);
    this.body.setDamping(true);
    this.body.setDrag(0.01);
    this.body.setMaxVelocity(maxVelocity);
    this.body.setCollideWorldBounds(true);
    this.hp = new Healthbar(scene, this.body, 100, -24, -10);
  }

  update({ left, right, up, down }) {
    const nothingHappens = !(left || right || up || down);
    const directionalBlock = (left && right) || (down && up);

    if (!directionalBlock) {
      if (left) {
        this.body.setVelocityX(this.body.velocity.x - accelerationSpeed);
        this.anims.play("left", true);
      }
      if (right) {
        this.body.setVelocityX(this.body.velocity.x + accelerationSpeed);
        this.anims.play("right", true);
      }
      if (up) {
        this.body.setVelocityY(this.body.velocity.y - accelerationSpeed);
        this.anims.play("turn", true);
      }
      if (down) {
        this.body.setVelocityY(this.body.velocity.y + accelerationSpeed);
        this.anims.play("turn", true);
      }
      if (this.body.velocity.length() > maxVelocity) {
        this.body.velocity.normalize().scale(maxVelocity);
      }
    }
    if (nothingHappens || directionalBlock) {
      this.anims.play("turn");
    }
    this.hp.update();
  };

  damage (amount) {
    this.scene.flashColor(this, 0xff0000);
    if (this.hp.decrease(amount)) {
      this.alive = false;
      this.scene.physics.pause();
      this.anims.play("turn");
      this.scene.scene.start("endScene");
    }
  }
}

export function collectDiamond(player, diamond) {
  diamond.disableBody(true, true);
  this.score += 50;
  this.scoreText.setText("Score: " + this.score);
}

export default Player;
