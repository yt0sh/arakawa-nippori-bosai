import {cpSync,mkdirSync,rmSync} from 'node:fs';import {fileURLToPath} from 'node:url';import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),src=path.join(root,'public'),out=path.join(root,'dist');
rmSync(out,{recursive:true,force:true});mkdirSync(out,{recursive:true});cpSync(src,out,{recursive:true});
console.log('Built v0.8 frontend from canonical public source.');
