function oval(c,x,y,rx,ry,fill) {
  c.beginPath(); c.ellipse(x,y,rx,ry,0,0,Math.PI*2); c.fillStyle=fill; c.fill();
}
function muscle(c,x,y,w,h) {
  const g=c.createRadialGradient(x-w*.3,y-h*.35,2,x,y,Math.max(w,h));
  g.addColorStop(0,'#ffe4a5'); g.addColorStop(.6,'#ca854c'); g.addColorStop(1,'#763e31');
  oval(c,x,y,w,h,g);
}
export function boss(c, mouth) {
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
