import Phaser from "phaser";
import EndScene from "./scenes/endScene";
import TitleScene from "./scenes/titleScene";
import GameScene from "./scenes/gameScene";
import "./index.css";

// Our game scene
const gameScene = new GameScene();
const titleScene = new TitleScene();
const endScene = new EndScene();

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: true,
    },
  },
  fps: {
    target: 60,
    forceSetTimeOut: true,
  },
  scene: [titleScene, gameScene, endScene],
};

const game = new Phaser.Game(config);

// // load scenes
// game.scene.add("titleScene", titleScene);
// game.scene.add("endScene", endScene);
// game.scene.add("game", gameScene);

// start title
game.scene.start("titleScene");
