// Verify the deployed bytes, not just HTTP status or successful unit tests.
const {readFileSync}=require('node:fs');
const {resolve}=require('node:path');
const {createHash}=require('node:crypto');
const vm=require('node:vm');
const base=process.argv[2]||'https://msimtiwyy160.github.io/home/';
const files=['index.html','game.js','art.js','scene.js','app.js','immersive.css','assets/short-v2.png','assets/long-v2.png','assets/plush-v2.png','assets/furniture-v3.png'];
const sha=b=>createHash('sha256').update(b).digest('hex');
(async()=>{
  let failures=0;
  const results=await Promise.all(files.map(async file=>{
    try {
      const response=await fetch(new URL(file+'?audit='+Date.now(),base),{signal:AbortSignal.timeout(30000)});
      if(!response.ok)throw Error('HTTP '+response.status);
      const remote=Buffer.from(await response.arrayBuffer()),local=readFileSync(resolve(__dirname,'..',file));
      if(sha(remote)!==sha(local))throw Error(`bytes differ (remote ${remote.length}, local ${local.length})`);
      if(file.endsWith('.png')&&!remote.subarray(-12).equals(Buffer.from('0000000049454e44ae426082','hex')))throw Error('PNG is missing its final IEND chunk');
      if(file==='game.js'){
        const scope={};vm.runInNewContext(remote.toString('utf8'),scope);
        const game=scope.CatGame,s=game.newGame({},100);
        if(game.itemEffect(s).trustBonus!==5)throw Error('deployed food bowl effect API is incompatible with the shop');
      }
      return 'PASS '+file;
    }catch(error){failures++;return 'FAIL '+file+': '+error.message;}
  }));
  results.forEach(line=>console.log(line));process.exitCode=failures?1:0;
})().catch(error=>{console.error(error.message);process.exitCode=1;});
