const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const G=require('./game.js');
const KEY='cat-courtyard-v1';
// Minimal DOM/storage boundary for running the real app handlers without a browser.
function boot(failRemove=false){
  const nodes=new Map(),data=new Map(),intervals=[],events={};
  const old=G.newGame({name:'旧猫'});old.coins=123;old.owned.push('mat');old.placed.push('mat');
  data.set(KEY,JSON.stringify(old));data.set('unrelated','keep');
  function node(id){const n={id,value:'',open:false,hidden:false,dataset:{},classList:{add(){},remove(){},toggle(){}},focus(){},showModal(){this.open=true;},close(){this.open=false;},appendChild(el){nodes.set(el.id,el);},click(){this.onclick?.({target:this});}};
    Object.defineProperty(n,'innerHTML',{get(){return this.html||'';},set(html){this.html=html;if(id==='modal-content')for(const key of dynamic)nodes.delete(key);for(const m of html.matchAll(/id="([^"]+)"/g)){const el=node(m[1]);nodes.set(m[1],el);if(id==='modal-content')dynamic.add(m[1]);}const input=nodes.get('cat-name');if(input)input.value='小橘';}});return n;}
  const dynamic=new Set();
  for(const id of ['modal-content','modal','toast','coins','resident-count','visitor-count','collect','collection','collection-title','panel','close-collection','call-cats','save-info','export-save','import-save','import-file','game-stage'])nodes.set(id,node(id));
  const document={hidden:false,querySelector:s=>nodes.get(s.slice(1))||null,querySelectorAll:()=>[],createElement:()=>node(''),addEventListener:(k,fn)=>{events[k]=fn;}};
  const localStorage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>{if(failRemove)throw Error('storage denied');data.delete(k);}};
  const CourtyardScene={setState(){},setRoom(){},portrait:()=>null};
  const window={CourtyardScene,addEventListener:(k,fn)=>{events[k]=fn;}};
  vm.runInNewContext(fs.readFileSync('app.js','utf8'),{CatGame:G,document,window,localStorage,CourtyardScene,setInterval:fn=>intervals.push(fn),setTimeout:()=>0,clearTimeout(){},URL,Blob});
  return {nodes,data,intervals,events};
}
function confirmation(b){b.nodes.get('save-info').click();assert.equal(typeof b.nodes.get('settings-restart')?.onclick,'function','settings must expose a working restart option');b.nodes.get('settings-restart').click();}
test('cancel restart preserves the saved cats, resources and furniture',()=>{const b=boot(),before=b.data.get(KEY);confirmation(b);b.nodes.get('cancel-restart').click();assert.equal(b.data.get(KEY),before);assert.ok(b.nodes.get('settings-export'));assert.equal(b.nodes.get('start'),undefined);});
test('confirmed restart clears only this game and opens first-cat creation',()=>{const b=boot();confirmation(b);b.nodes.get('confirm-restart').click();assert.equal(b.data.has(KEY),false);assert.equal(b.data.get('unrelated'),'keep');assert.ok(b.nodes.get('start'));b.intervals.forEach(fn=>fn());b.events.pagehide();assert.equal(b.data.has(KEY),false,'autosave must not resurrect the previous game');});
test('new cat after restart starts with initial currency and furniture',()=>{const b=boot();confirmation(b);b.nodes.get('confirm-restart').click();b.nodes.get('cat-name').value='新猫';b.nodes.get('start').click();const s=JSON.parse(b.data.get(KEY));assert.equal(s.cats[0].name,'新猫');assert.equal(s.coins,45);assert.deepEqual(s.owned,['bowl','box']);assert.equal(s.cats.some(c=>c.name==='旧猫'),false);assert.equal(b.nodes.get('modal').open,false);});
test('storage removal failure leaves the old game usable',()=>{const b=boot(true),before=b.data.get(KEY);confirmation(b);b.nodes.get('confirm-restart').click();assert.equal(b.data.get(KEY),before);assert.equal(b.nodes.get('start'),undefined);assert.ok(b.nodes.get('toast').textContent);});
