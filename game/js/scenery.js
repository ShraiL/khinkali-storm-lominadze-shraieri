// Paint once. The game loop reuses this illustrated mountain landscape.
export function mountainScene(width, height) {
  const layer = document.createElement('canvas');
  layer.width = width;
  layer.height = height;
  const c = layer.getContext('2d');
  const sky = c.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, '#637885');
  sky.addColorStop(.48, '#efbb88');
  sky.addColorStop(1, '#ffddab');
  c.fillStyle = sky;
  c.fillRect(0,0,width,height);
  function polygon(color, points) {
    c.fillStyle = color;
    c.beginPath();
    points.forEach(([x,y],i) => i ? c.lineTo(x,y) : c.moveTo(x,y));
    c.closePath();
    c.fill();
  }
  c.fillStyle = '#ffe8bb';
  c.beginPath(); c.arc(625,145,49,0,2*Math.PI); c.fill();
  const peaks = [[-70,290],[78,164],[158,251],[255,117],[330,207],[403,152],[505,240],[586,172],[697,229],[810,128]];
  polygon('#85828b',[...peaks,[800,620],[0,620]]);
  for (let i=1;i<peaks.length;i+=2) {
    const [x,y]=peaks[i];
    polygon('#f4d8c1',[[x-38,y+41],[x,y],[x+27,y+31],[x+11,y+23],[x+4,y+29],[x-3,y+14],[x-17,y+34],[x-19,y+26]]);
  }
  polygon('#716974',[[0,238],[105,298],[211,242],[342,345],[485,265],[590,315],[692,238],[800,280],[800,620],[0,620]]);
  polygon('#505d59',[[0,383],[145,320],[289,403],[459,363],[570,314],[665,304],[755,241],[800,231],[800,620],[0,620]]);
  // A watchtower above the valley.
  c.fillStyle='#875d46'; c.fillRect(720,210,20,54);
  polygon('#573f39',[[716,212],[730,193],[744,212]]);
  c.fillStyle='#493c34'; c.fillRect(728,223,5,11);
  polygon('#3e5049',[[0,319],[120,384],[219,412],[333,421],[429,452],[577,391],[691,368],[800,332],[800,620],[0,620]]);
  for(let i=0;i<64;i++){
    const x=i*14, y=485+30*Math.sin(i*.11), h=17+12*Math.sin(i*2.7);
    polygon('#34483e',[[x-9,y+h],[x,y-h],[x+9,y+h]]);
  }
  polygon('#38483c',[[0,504],[190,525],[401,508],[598,483],[800,469],[800,620],[0,620]]);
  c.fillStyle='#995b3f'; c.fillRect(0,585,width,35);
  for(let x=-15;x<width;x+=28){
    polygon('#dbab76',[[x,602],[x+10,593],[x+20,602],[x+10,611]]);
    polygon('#98462f',[[x+5,602],[x+10,598],[x+15,602],[x+10,606]]);
  }
  return layer;
}
