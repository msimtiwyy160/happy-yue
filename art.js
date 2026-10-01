/* Pure animation/atlas geometry shared by the renderer and tests. */
(function(root){
  'use strict';
  const loop=(n,total)=>((Math.floor(n)%total)+total)%total;
  function frame(mode,phase,time,seed=0,reduced=false){
    if(mode==='walk')return reduced?8:loop(phase*4/Math.PI,8);
    if(mode==='sleep')return 12+(reduced?0:loop(time*.8+seed,2));
    if(mode==='groom')return 10+(reduced?0:loop(time*3+seed,2));
    if(mode==='sit')return 14+(Math.sin(time*.6+seed)>.98?1:0);
    return Math.sin(time*.77+seed)>.995?9:8;
  }
  function cell(width,height,index,columns=4,rows=4){const i=loop(index,columns*rows);return {x:i%columns*width/columns,y:Math.floor(i/columns)*height/rows,w:width/columns,h:height/rows};}
  function roomCell(width,height,room){return cell(width,height,({yard:0,bedroom:1,kitchen:2,catroom:3})[room]??0,2,2);}
  function latestRoomArt(artwork,room){return room==='balcony'||room==='living'?(artwork[room]||null):(artwork.rooms||null);}
  function kind(breed){return breed.fur==='long'?'long':breed.fur==='plush'?'plush':'short';}
  function visibleCats(s,room,focusId,limit=12){const cats=s.cats.filter(c=>c.location?.room===room);const focus=cats.find(c=>c.id===focusId);return (focus?[focus,...cats.filter(c=>c.id!==focusId)]:cats).slice(0,limit);}
  function irisPixel(pixel,target){const [r,g,b,a]=pixel;const iris=a>100&&((r>g*1.18&&g>b*1.3&&r-b>65)||(b>r*1.3&&b>g*1.08));if(!iris)return pixel;const shade=Math.max(r,g,b)/255;return target.map(v=>Math.round(v*shade)).concat(a);}
  function cover(sw,sh,dw,dh){const scale=Math.max(dw/sw,dh/sh),w=sw*scale,h=sh*scale;return {x:(dw-w)/2,y:(dh-h)/2,w,h};}
  function contain(sw,sh,dw,dh){const scale=Math.min(dw/sw,dh/sh),w=sw*scale,h=sh*scale;return {x:(dw-w)/2,y:(dh-h)/2,w,h};}
  function furPixel(pixel,target){
    const [r,g,b,a]=pixel,max=Math.max(r,g,b),min=Math.min(r,g,b);
    if(a===0||max<45||min>238||b>r*1.15||(r>g*1.25&&b>g*1.06))return pixel;
    const shade=.28+.72*max/255;
    return [Math.round(target[0]*shade),Math.round(target[1]*shade),Math.round(target[2]*shade),a];
  }
  const api={frame,cell,roomCell,latestRoomArt,kind,visibleCats,irisPixel,cover,contain,furPixel};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.HomeArt=api;
})(typeof globalThis!=='undefined'?globalThis:this);

