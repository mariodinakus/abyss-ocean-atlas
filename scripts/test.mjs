import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {PLACES,ZONES,GEBCO_URL} from '../src/data.js';
assert(PLACES.length>=12,'At least 12 scientific destinations');
assert(new Set(PLACES.map(p=>p.id)).size===PLACES.length,'Unique feature IDs');
for(const p of PLACES){assert(p.lat>=-90&&p.lat<=90&&p.lon>=-180&&p.lon<=180,`Coordinates for ${p.name}`);assert(p.depth>0&&p.depth<=11000,`Depth for ${p.name}`);assert(p.source.startsWith('https://'),`Reference for ${p.name}`)}
assert.equal(ZONES[0].start,0);assert.equal(ZONES.at(-1).end,11000);
for(let i=1;i<ZONES.length;i++)assert.equal(ZONES[i].start,ZONES[i-1].end);
assert(GEBCO_URL.includes('wms.gebco.net')&&GEBCO_URL.includes('gebco_latest'));
for(const p of ['index.html','src/app.js','src/globe.js','src/styles.css','assets/favicon.svg','render.yaml'])assert((await stat(p)).isFile());
const index=await readFile('index.html','utf8');for(const id of ['globeMount','mapMount','depthSlider','featureInspector','locationList','savedGrid'])assert(index.includes(`id="${id}"`));
console.log(`PASS: ${PLACES.length} locations, ${ZONES.length} contiguous zones, project structure and GEBCO WMS configured`);