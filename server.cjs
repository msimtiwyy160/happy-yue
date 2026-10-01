// Optional local preview: node server.cjs
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=__dirname;
http.createServer((req,res)=>{
  let filename;
  try {const url=decodeURIComponent(req.url.split('?')[0]);filename=path.resolve(root,'.'+(url==='/'?'/index.html':url));}catch{res.writeHead(400);return res.end('Bad request');}
  if(!filename.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  fs.readFile(filename,(err,data)=>{if(err){res.writeHead(404);return res.end('Not found');}
    res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8'})[path.extname(filename)]||'text/plain');res.end(data);
  });
}).listen(4173,'127.0.0.1',()=>console.log('猫咪小院 http://127.0.0.1:4173'));
