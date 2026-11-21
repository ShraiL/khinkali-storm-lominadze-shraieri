// One sword swing per opening. Missing it costs one of the player's lives.
export const difficulties = {
  easy: { speed: .8, opening: 1.5, health: 2 },
  medium: { speed: 1, opening: .95, health: 3 },
  hard: { speed: 1.25, opening: .60, health: 4 },
};

export class Duel {
  constructor(settings) {
    this.settings = settings;
    this.hp = settings.health;
    this.elapsed = 0;
    this.flash = 0;
    this.ending = null;
    this.bite = 0;
  }
  get open() { return this.elapsed >= 1; }

  swing() {
    if (this.ending || !this.open) return;
    this.hp--;
    this.elapsed = 0;
    this.flash = .35;
    if (!this.hp) this.ending = 'win';
  }

  tick(dt, hurt) {
    if (this.ending) {
      this.bite += dt;
      return this.bite >= 1.6 ? this.ending : null;
    }
    this.flash = Math.max(0, this.flash - dt);
    this.elapsed += dt;
    if (this.elapsed > 1 + this.settings.opening) {
      this.elapsed = 0;
      if (hurt() === 0) this.ending = 'loss';
    }
    return null;
  }
}

function oval(c,x,y,rx,ry,fill) {
  c.beginPath(); c.ellipse(x,y,rx,ry,0,0,Math.PI*2); c.fillStyle=fill; c.fill();
}
function muscle(c,x,y,w,h) {
  const g=c.createRadialGradient(x-w*.3,y-h*.35,2,x,y,Math.max(w,h));
  g.addColorStop(0,'#ffe4a5'); g.addColorStop(.6,'#ca854c'); g.addColorStop(1,'#763e31');
  oval(c,x,y,w,h,g);
}
function boss(c, mouth) {
  for(const side of [-1,1]){
    c.save(); c.scale(side,1);
    muscle(c,96,20,45,40); muscle(c,138,4,32,49); muscle(c,147,-43,25,30);
    muscle(c,53,38,58,33);
    for(let i=0;i<3;i++) muscle(c,23,74+i*21,24-i*2,16);
    c.restore();
  }
  muscle(c,0,-54,87,77);
  c.strokeStyle='#975a3b'; c.lineWidth=4;
  for(const x of [-65,-35,0,35,65]){
    c.beginPath();c.moveTo(0,-129);c.quadraticCurveTo(x*.8,-121,x,-82);c.stroke();
  }
  muscle(c,0,-129,14,14);
  for(const side of [-1,1]){
    c.save();c.scale(side,1);c.rotate(-.18);
    oval(c,33,-53,16,8,'#fff3bc');oval(c,30,-54,5,6,'#41171b');c.restore();
  }
  oval(c,0,-22,37,9+mouth*22,'#521d20');
  for(const x of [-20,0,20]){c.fillStyle='#fff3bf';c.beginPath();c.moveTo(x-4,-30-mouth*12);c.lineTo(x+4,-30-mouth*12);c.lineTo(x,-19-mouth*12);c.fill();}
  for(const [x,y,r] of [[-63,-32,6],[-56,-27,3],[64,37,7],[71,45,3],[-128,9,5],[33,78,4]]){
    oval(c,x,y,r,r*.75,'#9c2227');oval(c,x+1,y+r,r*.28,r*1.4,'#a12526');
  }
}
export function drawDuel(c,d){
  c.save();
  c.fillStyle='#220f1b70'; c.fillRect(0,0,800,620);
  const bite=Math.min(1,d.bite/1.2);
  const won=d.ending==='win', lost=d.ending==='loss';
  const bossSize=won?1-bite:1+bite*.5;
  c.save();c.translate(400,290+(won?bite*160:lost?bite*90:Math.sin(d.elapsed*4)*5));c.scale(bossSize,bossSize);
  boss(c,lost?Math.sin(bite*Math.PI):d.open?.45:0);c.restore();
  c.save();c.translate(400,484-(lost?bite*130:0));
  const chefSize=lost?1-bite:1+bite*.4;c.scale(chefSize,chefSize);
  c.font='76px sans-serif';c.textAlign='center';c.fillText(won&&bite>.65?'😋':'🧑‍🍳',0,0);
  if(!d.ending){c.translate(35,-30);c.rotate(d.flash>0?-1:.2);c.font='65px sans-serif';c.fillText('🗡️',20,0);}
  c.restore();
  c.textAlign='center';c.fillStyle='#fff4d2';c.font='bold 31px sans-serif';
  c.fillText(d.ending?(won?'You feast on the boss!':'The boss eats you!'):'Khinkali Boss',400,60);
  for(let i=0;i<d.settings.health;i++){let x=400+(i-(d.settings.health-1)/2)*29;c.fillStyle=i<d.hp?'#f15335':'#653b39';c.fillRect(x-11,80,22,8);}
  c.font='bold 23px sans-serif';
  if(!d.ending)c.fillText(d.open?'Opening! Swing now':'Watch for an opening…',400,545);
  c.restore();
}
