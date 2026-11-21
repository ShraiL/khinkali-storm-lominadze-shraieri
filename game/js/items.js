export const TYPES = {
  herb: { points: 0, damage: 0, speed: 1 },
  normal: { points: 10, damage: 0, speed: 1, color: '#fff8e7' },
  gold: { points: 50, damage: 0, speed: 1.5, color: '#edba32' },
  pepper: { points: 0, damage: 1, speed: 1, color: '#e64a27' },
};

export function spawnItem(width, random = Math.random) {
  const roll = random();
  const type = roll < 0.08 ? 'gold' : roll < 0.30 ? 'pepper' : roll < 0.35 ? 'herb' : 'normal';
  return { type, x: 24 + random() * (width - 48), y: -25, previousY: -25, radius: 20 };
}

export function moveItem(item, seconds, level) {
  item.previousY = item.y;
  item.y += (145 + (level - 1) * 30) * TYPES[item.type].speed * seconds;
}

export function hitsPlate(item, plate) {
  // Test the path across the plate's top, not only the final position.
  return item.previousY + item.radius <= plate.y &&
    item.y + item.radius >= plate.y &&
    item.x + item.radius >= plate.x &&
    item.x - item.radius <= plate.x + plate.width;
}

export function drawItem(ctx, item) {
  ctx.save();
  ctx.translate(item.x, item.y);
  if (item.type === 'pepper' || item.type === 'herb') {
    ctx.font = '36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.type === 'herb' ? '🌿' : '🌶️', 0, 0);
  } else {
    // A pleated Georgian dumpling, drawn without external images.
    ctx.fillStyle = TYPES[item.type].color;
    ctx.strokeStyle = item.type === 'gold' ? '#9c6b10' : '#a1937b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-5, -15);
    ctx.bezierCurveTo(-10, -5, -27, 4, -18, 16);
    ctx.bezierCurveTo(-8, 24, 12, 23, 21, 13);
    ctx.bezierCurveTo(25, 4, 10, -6, 5, -15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    for (const endX of [-13, -5, 4, 13]) {
      ctx.beginPath();
      ctx.moveTo(0, -11);
      ctx.quadraticCurveTo(endX / 2, 6, endX, 17);
      ctx.stroke();
    }
    ctx.fillRect(-5, -20, 10, 9);
  }
  ctx.restore();
}
