import Phaser from "phaser";

class EndScene extends Phaser.Scene {
  constructor() {
    super({ key: "endScene" });
  }

  preload() {
    this.load.image("background", "images/background.jpg");
  }

  create() {
    var bg = this.add.sprite(0, 0, "background");
    bg.setOrigin(0, 0);

    var text = this.add.text(100, 100, "You died! Click to try again.");
    text.setInteractive({ useHandCursor: true });
    text.on("pointerdown", () => this.clickButton());
  }

  clickButton() {
    this.scene.switch("gameScene");
  }
}

export default EndScene;
