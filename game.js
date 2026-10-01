(function (root) {
  'use strict';
  const HOUR = 3600000;
  const coats = [
    {id:'orange',name:'橘色',color:'#dba268',dark:'#b67643',breed:'中华田园猫'},
    {id:'tabby',name:'狸花',color:'#a89b89',dark:'#665e51',breed:'中华田园猫'},
    {id:'cream',name:'奶油',color:'#edcfac',dark:'#c69c73',breed:'英国短毛猫'},
    {id:'black',name:'黑色',color:'#51545a',dark:'#34373c',breed:'短毛家猫'},
    {id:'white',name:'白色',color:'#f9f5ea',dark:'#cec6b5',breed:'长毛家猫'},
    {id:'gray',name:'蓝灰',color:'#9ba9b1',dark:'#697c8b',breed:'英国短毛猫'},
    {id:'calico',name:'三花',color:'#f6eddb',dark:'#bd854e',breed:'中华田园猫'},
    {id:'tuxedo',name:'奶牛',color:'#f7f0df',dark:'#51545a',breed:'短毛家猫'}
  ];
  const items = [
    {id:'bowl',name:'小小食盆',emoji:'🥣',price:0,tag:'food',desc:'一碗温暖的饭，等一个新朋友。',x:21,y:72},
    {id:'box',name:'旧纸箱',emoji:'📦',price:0,tag:'box',desc:'猫咪心里的豪华小别墅。',x:64,y:70},
    {id:'mat',name:'柔软坐垫',emoji:'🧺',price:25,tag:'warm',desc:'晒着太阳打个长长的盹。',x:42,y:79},
    {id:'plant',name:'一盆绿意',emoji:'🪴',price:30,tag:'plant',desc:'给好奇的小鼻子添一处风景。',x:79,y:65},
    {id:'ball',name:'毛线小球',emoji:'🧶',price:20,tag:'play',desc:'每一根毛线，都有自己的冒险。',x:54,y:86},
    {id:'climb',name:'小猫爬架',emoji:'🪵',price:65,tag:'climb',desc:'爬高一点，看看院子外的世界。',x:85,y:81},
    {id:'light',name:'暖暖夜灯',emoji:'🏮',price:45,tag:'warm',desc:'傍晚也有一盏灯为你亮着。',x:12,y:52},
    {id:'flower',name:'雏菊花盆',emoji:'🌼',price:35,tag:'plant',desc:'把小小春天留在院子里。',x:9,y:83},
    {id:'fish',name:'咸鱼抱枕',emoji:'🐟',price:40,tag:'play',desc:'抱着一条鱼，也可以做美梦。',x:33,y:88},
    {id:'bench',name:'木质长凳',emoji:'🪑',price:80,tag:'climb',desc:'给你留座，也给它留座。',x:68,y:54},
    {id:'house',name:'小猫木屋',emoji:'🏠',price:120,tag:'box',desc:'风吹过的时候，有一个小小的家。',x:72,y:85},
    {id:'tea',name:'午后茶桌',emoji:'☕',price:90,tag:'warm',desc:'在这里，把下午过得慢一点。',x:19,y:88}
  ];
  const personalities=['亲人','好奇','慵懒','贪吃','害羞'];
  const safeName=n=>typeof n==='string'?n.trim().slice(0,16):'';
  function cat(coat='orange',name='小橘',status='visitor',pattern='stripe',accessory='none') {
    const c=coats.find(c=>c.id===coat)||coats[0];
    return {id:'cat-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8),name:safeName(name)||'小猫',coat:c.id,breed:c.breed,pattern,accessory,status,trust:status==='visitor'?10:100,affection:0,personality:personalities[Math.floor(Math.random()*5)],favorite:items[Math.floor(Math.random()*items.length)].tag,lastInteraction:0};
  }
  function newGame(options={},now=Date.now()) {
    return {version:1,lastSeen:now,coins:45,gifts:0,cats:[cat(options.coat,safeName(options.name)||'小橘','starter',options.pattern||'stripe',options.accessory||'none')],owned:['bowl','box'],placed:['bowl','box'],memories:[{text:'把第一只小猫接回了家。小院的故事，从这里开始。',at:now}],nextVisitor:now+10*60000};
  }
  function memory(s,text,now=Date.now()) {s.memories.unshift({text,at:now});s.memories=s.memories.slice(0,100);}
  function normalize(raw,now=Date.now()) {
    if(!raw||raw.version!==1||!Array.isArray(raw.cats)||!raw.cats.length) throw Error('无法识别的存档');
    const s={...raw};
    s.cats=raw.cats.filter(c=>c&&typeof c.id==='string').slice(0,100).map(c=>({...c,name:safeName(c.name)||'小猫',coat:coats.some(x=>x.id===c.coat)?c.coat:'orange',pattern:['stripe','solid','patch'].includes(c.pattern)?c.pattern:'solid',accessory:['none','scarf','bow'].includes(c.accessory)?c.accessory:'none',status:['starter','resident','visitor'].includes(c.status)?c.status:'visitor',trust:Math.max(0,Math.min(100,Number(c.trust)||0)),affection:Math.max(0,Number(c.affection)||0),lastInteraction:Number(c.lastInteraction)||0}));
    if(!s.cats.length) throw Error('存档没有猫咪');
    s.coins=Math.max(0,Number(s.coins)||0);s.gifts=Math.max(0,Number(s.gifts)||0);
    s.lastSeen=Number.isFinite(s.lastSeen)?s.lastSeen:now;
    s.nextVisitor=Number.isFinite(s.nextVisitor)?s.nextVisitor:now+10*60000;
    s.owned=[...new Set(['bowl','box',...(Array.isArray(s.owned)?s.owned:[])])].filter(id=>items.some(i=>i.id===id));
    s.placed=[...new Set(Array.isArray(s.placed)?s.placed:['bowl','box'])].filter(id=>s.owned.includes(id));
    s.memories=(Array.isArray(s.memories)?s.memories:[]).filter(m=>m&&typeof m.text==='string').slice(0,100);
    return s;
  }
  function addVisitor(s,now,rng=Math.random) {
    const tags=s.placed.map(id=>items.find(i=>i.id===id).tag);
    const c=cat(coats[Math.floor(rng()*coats.length)%coats.length].id,['栗子','芝麻','奶糖','团子','豆包','糯米','布丁','小满'][Math.floor(rng()*8)%8]);
    c.pattern=['stripe','solid','patch'][Math.floor(rng()*3)%3];
    c.favorite=tags[Math.floor(rng()*tags.length)]||'food';
    s.cats.push(c);memory(s,`一只${coats.find(x=>x.id===c.coat).name}小猫悄悄来到小院，暂时叫它「${c.name}」吧。`,now);return c;
  }
  function settle(s,now=Date.now(),rng=Math.random) {
    const elapsed=Math.min(12*HOUR,Math.max(0,now-s.lastSeen));
    const accrued=elapsed+Math.max(0,Math.min(30*60000-1,Number(s.giftRemainder)||0));
    const gifts=Math.min(72,Math.floor(accrued/(30*60000))*3);
    s.giftRemainder=accrued%(30*60000);
    s.gifts+=gifts;
    let visits=0;
    if(now>=s.nextVisitor&&s.cats.filter(c=>c.status==='visitor').length<3&&s.placed.length){addVisitor(s,now,rng);visits++;s.nextVisitor=now+30*60000;}
    s.lastSeen=now;return {elapsed,gifts,visits};
  }
  function interact(s,id,action,now=Date.now()) {
    const c=s.cats.find(c=>c.id===id);if(!c)return {ok:false,text:'这只小猫还没来到院子。'};
    if(now-c.lastInteraction<60000&&c.lastInteraction)return {ok:false,text:'它还在回味刚才的陪伴，过一小会再来吧。'};
    c.lastInteraction=now;c.affection+=5;if(c.status==='visitor')c.trust=Math.min(100,c.trust+(action==='feed'?25:20));
    s.coins+=2;memory(s,`${c.name}${action==='feed'?'吃完饭，满意地舔了舔小爪子。':'蹭了蹭你的手，发出轻轻的呼噜声。'}`,now);
    return {ok:true,text:c.status==='visitor'&&c.trust===100?'它已经信任你了，可以邀请它留下！':'收获了一点点亲近，猫爪印 +2'};
  }
  function adopt(s,id,name,now=Date.now()) {const c=s.cats.find(c=>c.id===id);if(!c||c.status!=='visitor'||c.trust<100)return false;c.name=safeName(name)||c.name;c.status='resident';memory(s,`「${c.name}」成为了小院的一员。从今天起，这里也是它的家。`,now);return true;}
  function buy(s,id) {const item=items.find(i=>i.id===id);if(!item||s.owned.includes(id)||s.coins<item.price)return false;s.coins-=item.price;s.owned.push(id);s.placed.push(id);memory(s,`为小院添了${item.name}，猫咪们围过来好奇地闻了闻。`);return true;}
  const api={coats,items,safeName,cat,newGame,normalize,settle,interact,adopt,buy,memory,addVisitor};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CatGame=api;
})(typeof globalThis!=='undefined'?globalThis:this);
