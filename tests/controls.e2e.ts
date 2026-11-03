import { test } from '@e2e-dev/web';
import { expect } from 'e2e';

test('the visible SVG receives input while its readonly label is pointer-inert', async ({ app, browser }) => {
  await app.open('/repro.html');
  const state = await browser.evaluate(() => {
    const label = document.querySelector('textarea')!;
    const box = label.getBoundingClientRect();
    return {
      hit: document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)?.localName ?? null,
      readOnly: label.readOnly,
      pointerEvents: getComputedStyle(label).pointerEvents,
    };
  });
  expect(state).toEqual({ hit: 'path', readOnly: true, pointerEvents: 'none' });
});

test('PASS: naming the event-handling container lets the same agent rename the label', async ({ app, agent, screen }) => {
  await app.open('/repro.html?accessible=1');
  await agent.act('Double-click the node label and rename it');
  await expect(screen.getByRole('textbox', 'Edit label')).toHaveValue('Renamed');
});

test('PASS: the original page edits when double-clicking its event-handling container', async ({ app, browser, screen }) => {
  await app.open('/repro.html');
  await browser.locator('#node').doubleTap();
  const label = screen.getByRole('textbox', 'Edit label');
  await label.fill('Renamed');
  await expect(label).toHaveValue('Renamed');
});
