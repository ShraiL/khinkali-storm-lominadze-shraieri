import { boss } from './boss-art.js';

export const difficulties = {
  easy: { speed: .8, warning: 1.5, health: 7 },
  medium: { speed: 1, warning: 1.1, health: 10 },
  hard: { speed: 1.25, warning: .8, health: 14 },
};
const attacks = ['Ground wave · Jump!', 'Pepper drop · Move!', 'Body charge · Roll!'];
const ground = 465;
const clamp = (v,min,max) => Math.max(min,Math.min(max,v));

export class Duel {
  constructor(settings) {
    this.settings = settings;
    this.hp = settings.health;
    this.x = 155;
    this.bx = 648;
    this.height = this.velocity = this.roll = this.slash = this.hit = 0;
    this.cool = { sword:0, roll:0, clone:0, orb:0 };
    this.shots = [];
    this.attack = 0;
    this.phase = 'warning';
    this.time = 0;
    this.target = this.x;
    this.ending = null;
  }
  act(move) {
    if(this.phase === 'finish') {
      if(move === 'finish') { this.ending='win'; this.time=0; this.phase='ending'; }
      return;
    }
    if(this.ending || this.cool[move]>0) return;
    if(move==='jump' && this.height===0) this.velocity=610;
    if(move==='roll') { this.roll=.4; this.cool.roll=1.1; }
    if(move==='sword') {
      this.slash=.24; this.cool.sword=.42;
      if(Math.abs(this.bx-this.x)<162) this.damage(1);
    }
    if(move==='orb' || move==='clone') {
      this.cool[move]=move==='orb'?3:4;
      this.shots.push({move,x:this.x,y:this.height});
    }
  }
  damage(amount) {
    this.hp=Math.max(0,this.hp-amount);
    if(this.hp===0) { this.phase='finish'; this.time=0; this.shots=[]; }
  }
  tick(dt,hurt,direction=0) {
    this.time+=dt;
    if(this.ending) return this.time>=2 ? this.ending : null;
    if(this.phase==='finish') return null;
    for(const move in this.cool) this.cool[move]=Math.max(0,this.cool[move]-dt);
    this.slash=Math.max(0,this.slash-dt);
    this.hit=Math.max(0,this.hit-dt);
    this.roll=Math.max(0,this.roll-dt);
    this.x=clamp(this.x+dt*(this.roll>0?-480:direction*310),35,644);
    this.velocity-=1450*dt;
    this.height=Math.max(0,this.height+this.velocity*dt);
    if(this.height===0) this.velocity=0;
    for(const shot of this.shots) shot.x+=dt*(shot.move==='orb'?510:360);
    const arrived=this.shots.filter(s=>s.x>=this.bx-65);
    this.shots=this.shots.filter(s=>s.x<this.bx-65);
    for(const shot of arrived) {
      this.damage(shot.move==='orb'?3:2);
      if(this.phase==='finish') return null;
    }
    if(this.phase==='warning' && this.time>=this.settings.warning) {
      this.phase='strike'; this.time=0; this.connected=false; this.wave=this.bx-75;
    }
    if(this.phase==='strike') {
      const pace=this.settings.speed;
      let contact=false, done=false;
      if(this.attack===0) {
        this.wave-=dt*540*pace;
        contact=Math.abs(this.wave-this.x)<37 && this.height<55;
        done=this.wave < -45;
      } else if(this.attack===1) {
        contact=this.time>=.42 && this.time<.68 && Math.abs(this.target-this.x)<63;
        done=this.time>=.72;
      } else {
        this.bx=Math.max(70,this.bx-dt*610*pace);
        contact=Math.abs(this.bx-this.x)<85;
        done=this.bx<=70;
      }
      if(contact && this.roll) this.connected=true;
      if(contact && !this.connected) {
        this.connected=true; this.hit=.35;
        if(hurt()===0) { this.phase='ending'; this.ending='loss'; this.time=0; }
      }
      if(done && !this.ending) { this.phase='recover';this.time=0; }
    } else if(this.phase==='recover') {
      this.bx=Math.min(648,this.bx+dt*510);
      if(this.time>=1.35 && this.bx===648) {
        this.phase='warning';this.time=0;this.attack=(this.attack+1)%3;this.target=this.x;
      }
    }
    return null;
  }
}

function fighter(c,x,y,pose,alpha=1) {
  c.save(); c.globalAlpha=alpha; c.translate(x,y);
  if(pose==='roll') {c.translate(0,-36);c.rotate(-1.4);c.translate(0,36);}
  c.lineWidth=14;c.lineCap='round';c.strokeStyle='#28273b';
  for(const foot of [-24,23]){c.beginPath();c.moveTo(0,-43);c.lineTo(foot,-4);c.stroke();}
  c.fillStyle='#fff0cf';c.fillRect(-18,-89,38,48);
  c.fillStyle='#d84422';c.fillRect(-18,-50,42,9);
  c.font='55px sans-serif';c.textAlign='center';c.fillText('🧑‍🍳',1,-81);
  c.strokeStyle='#e3ae77';c.lineWidth=10;c.beginPath();c.moveTo(8,-76);c.lineTo(35,-60);c.stroke();
  c.strokeStyle='#d9efff';c.lineWidth=6;c.beginPath();c.moveTo(35,-60);
  c.lineTo(pose==='slash'?125:66,pose==='slash'?-59:-115);c.stroke();c.restore();
}

export function drawDuel(c,d) {
  c.save();c.fillStyle='#120e27a8';c.fillRect(0,0,800,620);
  c.fillStyle='#322531';c.fillRect(0,ground,800,155);
  c.fillStyle='#ce9973';c.fillRect(0,ground,800,4);
  const end=clamp(d.time/1.4,0,1), won=d.ending==='win',lost=d.ending==='loss';
  const chefX=won?d.x+(d.bx-d.x-55)*end:d.x;
  const bossX=lost?d.bx+(d.x-d.bx+30)*end:d.bx;
  if(d.attack===1 && ['warning','strike'].includes(d.phase)){
    c.fillStyle='#ff502d66';c.fillRect(d.target-63,ground-8,126,8);
    c.font='48px sans-serif';c.fillText('🌶️',d.target-24,d.phase==='warning'?160:Math.min(ground,160+690*d.time));
  }
  if(d.phase==='strike' && d.attack===0){
    c.fillStyle='#ffab30';c.beginPath();c.moveTo(d.wave-35,ground);c.lineTo(d.wave,ground-60);c.lineTo(d.wave+30,ground);c.fill();
  }
  c.save();c.translate(bossX,ground-103+(won?end*60:0));
  const size=won?1-end:1;c.scale(size*.85,size*.85);boss(c,lost?1:d.phase==='warning'?.45:0);c.restore();
  for(const s of d.shots) {
    if(s.move==='clone'){fighter(c,s.x-28,ground,'slash',.25);fighter(c,s.x,ground,'slash',.65);}
    else {c.save();c.shadowColor='#20deff';c.shadowBlur=28;c.fillStyle='#8df5ff';c.beginPath();c.arc(s.x,ground-68-s.y,24,0,7);c.fill();c.strokeStyle='white';c.beginPath();c.ellipse(s.x,ground-68-s.y,21,8,s.x/35,0,7);c.stroke();c.restore();}
  }
  fighter(c,chefX,ground-d.height,d.roll?'roll':d.slash||won?'slash':'idle',lost?1-end:d.hit?.55:1);
  if(won && end>.4 && end<.85){c.strokeStyle='white';c.lineWidth=9;c.beginPath();c.moveTo(bossX-90,ground-25);c.lineTo(bossX+65,ground-205);c.stroke();}
  c.fillStyle='#fff1cf';c.font='bold 23px sans-serif';c.textAlign='left';c.fillText('CHEF',35,54);
  c.textAlign='right';c.fillText('KHINKALI BOSS',765,54);c.fillStyle='#49333c';c.fillRect(525,67,240,12);
  c.fillStyle='#f35d40';c.fillRect(765-240*d.hp/d.settings.health,67,240*d.hp/d.settings.health,12);
  c.fillStyle='#ffda88';c.textAlign='center';c.font='bold 25px sans-serif';
  const caption=won?'FATALITY · Dinner is served':lost?'The boss devours you':d.phase==='finish'?'FINISH HIM · Press F':d.phase==='recover'?'Boss recovering':attacks[d.attack];
  c.fillText(caption,400,132);c.restore();
}
