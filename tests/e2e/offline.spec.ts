import {test,expect} from '@playwright/test';
test('cached mission shell reloads offline and sends simulated packets',async({page,context})=>{
 await page.goto('/mission-control?scenario=success');
 await expect(page.getByLabel('Scenario',{exact:true})).toBeVisible();
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
 await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller),{timeout:15000}).toBe(true);
 // Cache canonical route after activation; query URL is a scenario input, not a separate shell.
 await page.goto('/mission-control');
 await page.waitForLoadState('networkidle');
 await context.setOffline(true);
 await page.reload();
 await expect(page.getByLabel('Scenario',{exact:true})).toBeVisible();
 await expect(page.getByText('OFFLINE · LOCAL SIMULATION',{exact:true})).toBeVisible();
 await page.getByLabel('Scenario',{exact:true}).selectOption('success');
 await page.getByLabel('Replay timeline',{exact:true}).press('End');
 await expect(page.locator('.packet-summary .status-text')).toContainText('ACKNOWLEDGED');
 await context.setOffline(false);
});
