import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from './server.js';

test('API validates input, sorts top ten and persists across restart', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'khinkali-test-'));
  let server;
  async function start() {
    server = createApp(directory).listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    return `http://127.0.0.1:${server.address().port}`;
  }
  async function stop() { await new Promise(resolve => server.close(resolve)); }
  try {
    let url = await start();
    assert.deepEqual(JSON.parse(readFileSync(join(directory, 'scores.json'))), []);
    const health = await fetch(url + '/api/health');
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), {status:'ok'});
    const post = (body) => fetch(url + '/api/scores', {
      method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body),
    });
    for (const body of [null, {}, {name:' ',score:10}, {name:'Nino',score:'10'},
      {name:'Nino',score:-1}, {name:'Nino',score:1.5}, {name:'x'.repeat(25),score:10}]) {
      assert.equal((await post(body)).status,400);
    }
    const malformed = await fetch(url + '/api/scores', {
      method:'POST',headers:{'Content-Type':'application/json'},body:'{bad',
    });
    assert.equal(malformed.status,400);
    for(let i=0;i<12;i++) assert.equal((await post({name:`Player ${i}`,score:i*10})).status,201);
    // Concurrent requests must not overwrite each other's scores.
    await Promise.all([post({name:'Nino',score:1240}),post({name:'Giorgi',score:900})]);
    const scores = await (await fetch(url + '/api/scores')).json();
    assert.equal(scores.length,10);
    assert.deepEqual(scores[0],{name:'Nino',score:1240});
    assert(scores.every((entry,i)=>i===0 || entry.score<=scores[i-1].score));
    assert.equal(JSON.parse(readFileSync(join(directory,'scores.json'))).length,14);
    await stop(); url = await start();
    assert.deepEqual(await (await fetch(url + '/api/scores')).json(),scores);
  } finally {
    if (server?.listening) await stop();
    rmSync(directory,{recursive:true,force:true});
  }
});
