class Healthbar {

  constructor (scene, body, maxHP, offsetX, offsetY)
  {
      this.bar = new Phaser.GameObjects.Graphics(scene);
      this.body = body;
      this.x = body.x;
      this.y = body.y;
      this.offsetX = offsetX;
      this.offsetY = offsetY;
      this.value = maxHP;
      this.p = 76 / 100;

      this.draw();

      scene.add.existing(this.bar);
  }

  decrease (amount)
  {
      this.value -= amount;

      if (this.value < 0)
      {
          this.value = 0;
      }

      this.draw();

      return (this.value === 0);
  }

  draw ()
  {
      this.bar.clear();

      //  BG
      this.bar.fillStyle(0x000000);
      this.bar.fillRect(this.x + this.offsetX, this.y + this.offsetY, 80, 16);

      //  Health

      this.bar.fillStyle(0xffffff);
      this.bar.fillRect(this.x + this.offsetX + 2, this.y + this.offsetY + 2, 76, 12);

      if (this.value < 30)
      {
          this.bar.fillStyle(0xff0000);
      }
      else
      {
          this.bar.fillStyle(0x00ff00);
      }

      var d = Math.floor(this.p * this.value);

      this.bar.fillRect(this.x + this.offsetX + 2, this.y + this.offsetY + 2, d, 12);
  }

  update () {
    this.x = this.body.x;
    this.y = this.body.y;
    this.draw();
  }

}

export default Healthbar;
