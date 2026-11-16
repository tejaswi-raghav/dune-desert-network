import {test,expect} from '@playwright/test';

test('landing explains simulation and opens mission control',async({page})=>{
 await page.goto('/'); await expect(page.getByRole('heading',{name:/The signal ends/})).toBeVisible();
 await expect(page.getByText('A working simulation.',{exact:false})).toBeVisible();
 await page.getByRole('link',{name:/Enter mission control/i}).click();
 await expect(page.getByLabel('Scenario',{exact:true})).toBeVisible();
 await expect(page.getByRole('banner').getByText('DEMO MODE',{exact:true})).toBeVisible();
});

test('scenarios demonstrate delivery, retries, partition, carriage and depletion',async({page})=>{
 await page.goto('/mission-control?scenario=success');
 const selector=page.getByLabel('Scenario',{exact:true});
 const end=async()=>{await page.getByLabel('Replay timeline',{exact:true}).press('End');};
 await expect(selector).toHaveValue('success');await end();
 await expect(page.locator('.packet-summary .status-text')).toContainText('ACKNOWLEDGED');
 await selector.selectOption('weak');await end();
 await expect(page.locator('.event-list')).toContainText('RETRYING');
 await selector.selectOption('partition');await end();
 await expect(page.locator('.packet-summary .status-text')).toContainText('UNDELIVERED');
 await expect(page.locator('.packet-summary')).toContainText('Pending');
 await selector.selectOption('mule');await end();
 await expect(page.locator('.packet-summary .status-text')).toContainText('ACKNOWLEDGED');
 await expect(page.locator('.event-list')).toContainText('RELAYED');
 await expect(page.locator('.packet-summary')).toContainText('truck');
 await selector.selectOption('solar');await end();
 await expect(page.locator('.event-list')).toContainText('BATTERY DEPLETED');
 await expect(page.locator('.packet-summary .status-text')).toContainText('UNDELIVERED');
});

test('pause, keyboard controls and export preserve actual packet trace',async({page})=>{
 await page.goto('/mission-control?scenario=success');
 await page.getByRole('button',{name:'Play simulation',exact:true}).click();
 await expect(page.getByRole('button',{name:'Pause simulation',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Pause simulation',exact:true}).click();
 await page.getByLabel('Replay timeline',{exact:true}).press('End');
 const downloading=page.waitForEvent('download');await page.getByRole('button',{name:'Export',exact:true}).click();
 const download=await downloading;expect(download.suggestedFilename()).toBe('DUNE-scenario.json');
 const stream=await download.createReadStream();let json='';for await(const chunk of stream!)json+=chunk.toString();
 const saved=JSON.parse(json);expect(saved.version).toBe(1);expect(saved.packets.some((p:{status:string})=>p.status==='ACKNOWLEDGED')).toBe(true);
 expect(saved.events.some((e:{type:string})=>e.type==='LINK_ACK')).toBe(true);
 await page.getByLabel('Scenario',{exact:true}).selectOption('partition');
 await page.locator('input[type=file]').setInputFiles({name:'replay.json',mimeType:'application/json',buffer:Buffer.from(json)});
 await expect(page.locator('.packet-summary .status-text')).toContainText('ACKNOWLEDGED');
 await expect(page.getByText(/Snapshot imported/)).toBeVisible();
});

test('device UI labels demo and queues a simulated SOS',async({page})=>{
 await page.goto('/device?scenario=partition');
 await expect(page.getByRole('banner').getByText('DEMO MODE',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:/Send SOS/i}).click();
 await expect(page.getByRole('dialog',{name:'Confirm simulated SOS'})).toBeVisible();
 await page.getByRole('button',{name:'Queue demo SOS',exact:true}).click();
 await expect(page.getByText(/Packet queued locally/)).toBeVisible();
});

test('engineering inputs and resilience experiments work without fabricated metrics',async({page})=>{
 await page.goto('/engineering');await expect(page.getByRole('heading',{name:/engineering|power|sun|built/i}).first()).toBeVisible();
 await expect(page.getByText(/Wh\/day/).first()).toBeVisible();
 await page.goto('/resilience?scenario=mule');
 await page.getByRole('button',{name:/Compare.*polic|Run.*compar|Compare routing/i}).click();
 await expect(page.getByText(/flooding/i).first()).toBeVisible();
 await expect(page.getByText(/constrained/i).first()).toBeVisible();
});

test('mobile and desktop have no horizontal document overflow',async({page})=>{
 for(const route of ['/','/mission-control','/device','/resilience','/engineering']){
  await page.goto(route);await expect(page.locator('h1').first()).toBeVisible();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  expect(overflow,route).toBeLessThanOrEqual(2);
 }
});


test('paused manual changes persist across reload',async({page})=>{
 await page.goto('/mission-control?scenario=partition');
 await page.getByRole('button',{name:'+10s',exact:true}).click();
 await expect.poll(()=>page.evaluate(async()=>new Promise<number>((resolve,reject)=>{const request=indexedDB.open('dune-simulator-v1',1);request.onsuccess=()=>{const db=request.result;const r=db.transaction('snapshots').objectStore('snapshots').get('latest');r.onsuccess=()=>{db.close();resolve(r.result?JSON.parse(r.result).time:-1)};r.onerror=()=>reject(r.error)};request.onerror=()=>reject(request.error)}))).toBe(10);
 await page.goto('/mission-control');
 await expect(page.getByLabel('Scenario',{exact:true})).toHaveValue('partition');
 await expect(page.getByLabel('Replay timeline',{exact:true})).toHaveValue('10');
 await expect(page.locator('.packet-summary .status-text')).toContainText('UNDELIVERED');
});
