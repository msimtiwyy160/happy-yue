// Diagnostic: executes the actual Canvas scene with a native drawing engine.
// This is an off-screen render, not a browser screenshot or a full DOM/UI test.
const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const {createCanvas,Image:NativeImage}=require('C:/Users/13953/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
const G=require('./game.js');const A=require('./art.js');
async function render(width,height){
 const canvas=createCanvas(width,height);canvas.getBoundingClientRect=()=>({width,height});canvas.addEventListener=()=>{};canvas.classList={add(){},remove(){}};
 const hitboxes={replaceChildren(){},appendChild(){}};const labels={};const imageTasks=[];let animate;
 class Image extends NativeImage{set src(value){const task=new Promise((resolve,reject)=>{this.onload=resolve;this.onerror=reject;});imageTasks.push(task);super.src=fs.readFileSync(path.join(__dirname,value));}get naturalWidth(){return this.width;}get naturalHeight(){return this.height;}}
 const document={getElementById(id){if(id==='world')return canvas;if(id==='cat-hitboxes')return hitboxes;return labels[id]??={textContent:''};},createElement(tag){if(tag==='canvas')return createCanvas(1,1);return {style:{},dataset:{},setAttribute(){}};},querySelectorAll(){return [];},dispatchEvent(){}};
 const scope={document,Image,CatGame:G,HomeArt:A,devicePixelRatio:1,matchMedia:()=>({matches:false}),ResizeObserver:class{observe(){}},requestAnimationFrame(fn){animate=fn;},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail;}},console};scope.window=scope;
 vm.createContext(scope);vm.runInContext(fs.readFileSync(path.join(__dirname,'scene.js'),'utf8'),scope,{filename:'scene.js'});
 await Promise.all(imageTasks);const s=G.newGame({name:'团子',coat:'orange',breedId:'domestic',pattern:'stripe'},0);s.cats[0].location={room:'yard',x:.4,y:.70,nextMove:Infinity};
 const long=G.cat('seal','','visitor','point','none','ragdoll');long.location={room:'yard',x:.66,y:.68,nextMove:Infinity};s.cats.push(long);
 const plush=G.cat('gray','','visitor','solid','none','british');plush.location={room:'yard',x:.25,y:.72,nextMove:Infinity};s.cats.push(plush);scope.CourtyardScene.setState(s);
 for(let n=0;n<30;n++)animate(16.67*n);
 const dest=path.join(__dirname,`preview-home-${width}.png`);fs.writeFileSync(dest,canvas.toBuffer('image/png'));const rooms=['balcony','living','bedroom','kitchen','catroom'];for(const room of rooms){scope.CourtyardScene.setRoom(room);animate(600);}
 return {width,height,output:dest,assets:imageTasks.length,roomRenders:6};
}
(async()=>{for(const [w,h] of [[1200,800],[421,800]])console.log(JSON.stringify(await render(w,h)));})().catch(e=>{console.error(e);process.exitCode=1;});

