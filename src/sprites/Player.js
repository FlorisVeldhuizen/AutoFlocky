import Phaser from "phaser";

// CONSTANTS
const accelerationSpeed = 75;
const maxVelocity = 200;
class Player extends Phaser.GameObjects.Sprite {
  constructor(scene) {
    super(scene, 300, 400, "dude");

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    this.body.onOverlap = true;

    this.body.setBounce(0.1);
    this.body.setDamping(true);
    this.body.setDrag(0.01);
    this.body.setMaxVelocity(maxVelocity);
    this.body.setCollideWorldBounds(true);
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
  };
}

export default Player;
