// The plate owns movement and drawing, but knows nothing about score.
export class Player {
  constructor(width, height) {
    this.width = 100;
    this.height = 18;
    this.x = (width - this.width) / 2;
    this.y = height - 55;
    this.speed = 460;
  }

  update(seconds, direction, canvasWidth) {
    this.x += direction * this.speed * seconds;
    this.x = Math.max(0, Math.min(canvasWidth - this.width, this.x));
  }

  draw(ctx) {
    ctx.fillStyle = '#25231f';
    ctx.beginPath();
    ctx.ellipse(this.x + this.width / 2, this.y + 13, 55, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fffdf6';
    ctx.strokeStyle = '#70675b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(this.x + this.width / 2, this.y + 3, this.width / 2, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#d9cdb5';
    ctx.beginPath();
    ctx.ellipse(this.x + this.width / 2, this.y + 3, 36, 5, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}
