// Render the actual production sprite function with the bundled native Canvas.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const runtime=process.env.CAT_CANVAS_RUNTIME;
if(!runtime)throw Error('Set CAT_CANVAS_RUNTIME to the bundled @napi-rs/canvas module.');
const {createCanvas,loadImage}=require(runtime);
const CatGame=require('../game.js'),HomeArt=require('../art.js');
const root=path.resolve(__dirname,'..');
(async()=>{
  const artwork={};for(const kind of ['short','long','plush'])artwork[kind]=await loadImage(path.join(root,'assets',kind+'-v2.png'));
  const source=fs.readFileSync(path.join(root,'scene.js'),'utf8');
  const scope={CatGame,HomeArt,artwork,spriteCache:new Map(),document:{createElement:()=>createCanvas(256,256)}};
  vm.runInNewContext(source.slice(source.indexOf(' function spriteFrame('),source.indexOf(' function drawSprite('))+';this.render=spriteFrame;',scope);
  const poses=[8,14,12],breeds=['domestic','norwegian','british'];
  for(const coat of ['orange','calico','tuxedo','gray']){
    const patterns=CatGame.availablePatterns(coat),sheet=createCanvas(1440,patterns.length*160+40),p=sheet.getContext('2d');p.fillStyle='#f5efdf';p.fillRect(0,0,sheet.width,sheet.height);
    for(let row=0;row<patterns.length;row++)for(let col=0;col<9;col++){
      const pattern=patterns[row],breedId=breeds[Math.floor(col/3)],frame=poses[col%3],sprite=scope.render({coat,pattern:pattern.id,breedId},frame);
      p.drawImage(sprite,col*160,row*160+30,160,160);p.fillStyle='#4b5143';p.font='12px sans-serif';p.fillText(`${pattern.id} ${breedId} ${frame}`,col*160+4,row*160+18);
      const alpha=sprite.getContext('2d').getImageData(0,0,256,256).data;let visible=0;for(let i=3;i<alpha.length;i+=4)if(alpha[i]>0)visible++;if(visible<1000)throw Error('Missing sprite '+[coat,pattern.id,breedId,frame]);
    }
    const output=path.join(root,'coat-audit-'+coat+'.png');fs.writeFileSync(output,sheet.toBuffer('image/png'));console.log(output);
  }
  const preview=createCanvas(660,210),p=preview.getContext('2d');p.fillStyle='#f5efdf';p.fillRect(0,0,660,210);
  const samples=[{coat:'calico',pattern:'stripe',breedId:'domestic'},{coat:'tuxedo',pattern:'solid',breedId:'norwegian'},{coat:'silver',pattern:'tortoise',breedId:'british'}];
  samples.forEach((c,i)=>p.drawImage(scope.render(c,8),i*220,0,210,210));
  fs.writeFileSync(path.join(root,'coat-preview.png'),preview.toBuffer('image/png'));
})().catch(e=>{console.error(e);process.exitCode=1;});
