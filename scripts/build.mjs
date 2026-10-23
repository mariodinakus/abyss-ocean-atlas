import {rm,mkdir,cp,copyFile} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});
await mkdir('dist',{recursive:true});
await copyFile('index.html','dist/index.html');
await cp('assets','dist/assets',{recursive:true});
await cp('src','dist/src',{recursive:true});
console.log('ABYSS static build ready → dist/');