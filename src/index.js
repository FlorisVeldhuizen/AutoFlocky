import TitleScene from "./titleScene.js";
import GameScene from "./gameScene.js";
import "./index.css";
import Phaser from "phaser";

// Our game scene
const gameScene = new GameScene();
const titleScene = new TitleScene();

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
};

const game = new Phaser.Game(config);
// load scenes
game.scene.add("titleScene", titleScene);
game.scene.add("game", gameScene);

// start title
game.scene.start("titleScene");
