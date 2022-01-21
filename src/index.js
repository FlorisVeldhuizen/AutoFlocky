import Phaser from 'phaser';
import logoImg from './assets/logo.png';
import skyImg from './assets/sky.png';
import starImg from './assets/star.png';

function preload ()
{
  this.load.image('logo', logoImg);
  this.load.image('sky', skyImg);
  this.load.image('ground', 'assets/platform.png');
  this.load.image('star', starImg);
  this.load.image('bomb', 'assets/bomb.png');
  this.load.spritesheet('dude',
    'assets/dude.png',
    { frameWidth: 32, frameHeight: 48 }
  );
}

function create ()
{
  this.add.image(400, 300, 'sky');
  this.add.image(400, 300, 'star');
  const logo = this.add.image(400, 150, 'logo');

  this.tweens.add({
    targets: logo,
    y: 450,
    duration: 2000,
    ease: "Power2",
    yoyo: true,
    loop: -1
  });

}

function update ()
{

}

const config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);
