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
  const furnitureOrder=['bowl','box','mat','plant','ball','climb','light','flower','fish','bench','house','tea'];
  function furnitureCell(width,height,id){const index=furnitureOrder.indexOf(id);return index<0?null:cell(width,height,index,3,4);}
  function latestRoomArt(artwork,room){return room==='balcony'||room==='living'?(artwork[room]||null):(artwork.rooms||null);}
  function catDisplaySize(breed,viewportWidth){const base=Math.max(76,Math.min(156,viewportWidth*.115));const shape=breed?.shape;return Math.round(base*(shape==='large'?1.08:shape==='slender'?.92:1));}
  function separatePositions(points,minimumDistance,bounds){const out=points.map(p=>({x:Math.max(bounds.minX,Math.min(bounds.maxX,p.x)),y:Math.max(bounds.minY,Math.min(bounds.maxY,p.y))}));for(let pass=0;pass<24;pass++)for(let i=0;i<out.length;i++)for(let j=i+1;j<out.length;j++){const a=out[i],b=out[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||.001;if(d>=minimumDistance)continue;const angle=d<.01?(i*2.399+j*.71):Math.atan2(dy,dx),push=(minimumDistance-d)/2;const ux=Math.cos(angle),uy=Math.sin(angle);a.x=Math.max(bounds.minX,Math.min(bounds.maxX,a.x-ux*push));a.y=Math.max(bounds.minY,Math.min(bounds.maxY,a.y-uy*push));b.x=Math.max(bounds.minX,Math.min(bounds.maxX,b.x+ux*push));b.y=Math.max(bounds.minY,Math.min(bounds.maxY,b.y+uy*push));}return out;}
  function kind(breed){return breed.fur==='long'?'long':breed.fur==='plush'?'plush':'short';}
  function visibleCats(s,room,focusId,limit=12){const cats=s.cats.filter(c=>c.location?.room===room);const focus=cats.find(c=>c.id===focusId);return (focus?[focus,...cats.filter(c=>c.id!==focusId)]:cats).slice(0,limit);}
  function irisPixel(pixel,target){const [r,g,b,a]=pixel;const iris=a>100&&((r>g*1.18&&g>b*1.3&&r-b>65)||(b>r*1.3&&b>g*1.08));if(!iris)return pixel;const shade=Math.max(r,g,b)/255;return target.map(v=>Math.round(v*shade)).concat(a);}
  function cover(sw,sh,dw,dh){const scale=Math.max(dw/sw,dh/sh),w=sw*scale,h=sh*scale;return {x:(dw-w)/2,y:(dh-h)/2,w,h};}
  function contain(sw,sh,dw,dh){const scale=Math.min(dw/sw,dh/sh),w=sw*scale,h=sh*scale;return {x:(dw-w)/2,y:(dh-h)/2,w,h};}
  function furPixel(pixel,target,kind='short'){
    const [r,g,b,a]=pixel,max=Math.max(r,g,b);
    // Keep ink, pink skin and saturated eyes, but tint even the brightest fur.
    // The plush atlas is blue-gray rather than ivory, so it needs its own exposure.
    if(a===0||max<45||(b>r*1.3&&b>g*1.08)||(r>g*1.24&&b>g*.91))return pixel;
    const shade=Math.min(1.07,.22+.78*max/(kind==='plush'?185:255));
    return [Math.min(255,Math.round(target[0]*shade)),Math.min(255,Math.round(target[1]*shade)),Math.min(255,Math.round(target[2]*shade)),a];
  }
  const clamp=n=>Math.max(0,Math.min(1,n));
  function patternTarget(base,dark,pattern,x,y,index,kind){
    const sleeping=index===12||index===13,groom=index===10||index===11,seated=index>=14;
    // Anatomy follows each atlas/pose; markings never use a painted rectangle or outline.
    let body,face,tail;
    if(sleeping){body=[107,174,83,52];face=[199,174,43,40];tail=[97,203,72,23];}
    else if(groom){body=[134,181,47,46];face=[171,93,47,45];tail=[67,187,40,26];}
    else if(seated){body=[129,183,45,46];face=[132,101,47,48];tail=[66,187,38,26];}
    else{body=[100,159,65,38];face=[190,102,42,46];tail=[43,81,22,66];}
    if(kind==='long'){
      if(sleeping){body=[126,169,92,54];face=[214,162,37,43];tail=[115,205,89,24];}
      else if(groom){body=[159,175,48,43];face=[185,97,37,42];tail=[70,179,42,43];}
      else if(seated){body=[155,176,42,43];face=[153,96,37,43];tail=[69,185,44,39];}
      else{body=[133,148,63,35];face=[208,106,31,36];tail=[61,83,41,58];}
    }else if(kind==='plush'){
      if(sleeping){body=[101,179,85,53];face=[182,180,48,43];tail=[95,210,75,24];}
      else if(groom){body=[129,184,49,44];face=[174,119,49,50];tail=[82,205,39,25];}
      else if(seated){body=[137,185,49,42];face=[144,113,49,51];tail=[79,207,42,25];}
      else{body=[107,171,63,41];face=[178,126,53,49];tail=[61,103,26,67];}
    }
    const zone=a=>{const u=(x-a[0])/a[2],v=(y-a[1])/a[3];return {u,v,mask:clamp((1-u*u-v*v)*5)};};
    const b=zone(body),f=zone(face),t=zone(tail);let amount=0,color=dark;
    const stripe=(u,v,centers)=>{if(v>.55)return 0;let m=0;for(let i=0;i<centers.length;i++){const center=centers[i]+.08*Math.sin(v*3+i),width=.09*clamp((.55-v)/1.2);m=Math.max(m,clamp((width-Math.abs(u-center))/.025));}return m*clamp((.55-v)*2);};
    const blob=(u,v,cx,cy,rx,ry)=>{const du=(u-cx)/rx,dv=(v-cy)/ry,q=du*du+dv*dv+.13*Math.sin(u*17+v*9)+.09*Math.cos(v*21-u*5);return clamp((1-q)*4);};
    if(pattern==='stripe'){
      amount=Math.max(b.mask*stripe(b.u,b.v,[-.7,-.35,.12,.6]),f.mask*stripe(f.u,f.v,[-.38,-.08,.22])*clamp((-f.v-.18)*3),t.mask*clamp((.12-Math.abs(Math.sin(t.v*12+t.u*.8)))/.12))*.65;
    }else if(pattern==='patch'||pattern==='tortoise'){
      const one=blob(b.u,b.v,-.35,-.45,.62,.73)*b.mask,two=blob(f.u,f.v,-.25,-.55,.7,.8)*f.mask;
      amount=Math.max(one,two)*.85;
      if(pattern==='tortoise'){const ginger=blob(b.u,b.v,.55,.18,.57,.73)*b.mask;if(ginger>amount){amount=ginger*.85;color=[200,137,88];}}
    }else if(pattern==='bicolor'){
      const edge=.25+.14*Math.sin(b.u*5)+.08*Math.sin(b.u*13);
      color=[249,245,235];amount=Math.max(b.mask*clamp((b.v-edge)*3),f.mask*clamp((f.v-.22)*3)*clamp((.6-Math.abs(f.u))*4),clamp((y-(sleeping?220:214)-3*Math.sin(x*.11))/12))*.96;
    }else if(pattern==='point'){
      amount=Math.max(f.mask*.88,t.mask*.86,clamp((y-(sleeping?220:210))/16)*.82);
    }else if(pattern==='spotted'||pattern==='rosette'){
      for(let i=0;i<9;i++){const u=-.72+(i%3)*.65+.1*Math.sin(i*2.7),v=-.65+Math.floor(i/3)*.57,d=Math.hypot((b.u-u)*1.05,(b.v-v)*.7);const spot=pattern==='spotted'?clamp((.13-d)/.055):clamp((.04-Math.abs(d-.13))/.027)*clamp((Math.sin(Math.atan2(b.v-v,b.u-u)+i)+.65)*3);amount=Math.max(amount,spot*b.mask*.68);}
    }
    // Color the source fur itself, preserving shading and wispy alpha at marking edges.
    return base.map((v,i)=>v+(color[i]-v)*amount);
  }
  const patternFields=new Map();
  function patternPainter(base,dark,pattern,index,kind='short'){
    if(pattern==='solid')return pixel=>furPixel(pixel,base,kind);
    const pose=index<10?8:index<12?10:index<14?12:14,key=[kind,pose,pattern,...base,...dark].join(':');
    let field=patternFields.get(key);
    if(!field){field=new Float32Array(65*65*3);for(let gy=0;gy<=64;gy++)for(let gx=0;gx<=64;gx++)field.set(patternTarget(base,dark,pattern,gx*4,gy*4,pose,kind),(gy*65+gx)*3);patternFields.set(key,field);if(patternFields.size>96)patternFields.delete(patternFields.keys().next().value);}
    // Reuse a small pose/color field, rather than recomputing geometry on every fur pixel.
    return (pixel,x,y)=>{const plain=furPixel(pixel,base,kind);if(plain===pixel)return pixel;
      const gx=Math.max(0,Math.min(63,x/4)),gy=Math.max(0,Math.min(63,y/4)),ix=Math.floor(gx),iy=Math.floor(gy),fx=gx-ix,fy=gy-iy,offset=(iy*65+ix)*3,target=[];
      for(let k=0;k<3;k++){const a=field[offset+k]*(1-fx)+field[offset+3+k]*fx,b=field[offset+195+k]*(1-fx)+field[offset+198+k]*fx;target[k]=a*(1-fy)+b*fy;}
      return furPixel(pixel,target,kind);
    };
  }
  function patternPixel(pixel,base,dark,pattern,x,y,index,kind='short'){
    return patternPainter(base,dark,pattern,index,kind)(pixel,x,y);
  }
  const api={frame,cell,roomCell,furnitureCell,latestRoomArt,catDisplaySize,separatePositions,kind,visibleCats,irisPixel,cover,contain,furPixel,patternPixel,patternPainter};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.HomeArt=api;
})(typeof globalThis!=='undefined'?globalThis:this);
