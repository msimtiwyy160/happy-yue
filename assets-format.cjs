// Lossy file-format compression only; does not paint, retouch or alter the artwork.
const fs=require('node:fs');const path=require('node:path');
const sharp=require('C:/Users/13953/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
async function main(){const [name,source]=process.argv.slice(2);if(!['rooms','balcony','living','short','long','plush'].includes(name)||!source)throw Error('Usage: node assets-format.cjs rooms|balcony|living|short|long|plush source.png');const out=path.join(__dirname,'assets',name+'-v1.webp');fs.mkdirSync(path.dirname(out),{recursive:true});await sharp(source).webp({quality:['rooms','balcony','living'].includes(name)?88:94,alphaQuality:100}).toFile(out);console.log(JSON.stringify({path:out,bytes:fs.statSync(out).size,metadata:await sharp(out).metadata()}));}
main().catch(e=>{console.error(e.message);process.exitCode=1;});

