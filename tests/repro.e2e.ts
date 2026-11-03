import { test } from '@e2e-dev/web';
import { expect } from 'e2e';

test('FAIL: agent doubleTap cannot edit the SVG-covered label', async ({ app, agent, screen }) => {
  await app.open('/repro.html');
  await agent.act('Double-click the node label and rename it');
  await expect(screen.getByRole('textbox', 'Edit label')).toHaveValue('Renamed');
});

test('FAIL: agent tapAt snaps the point back onto the pointer-inert textbox', async ({ app, agent }) => {
  await app.open('/repro.html');
  await agent.act('Tap the label at its viewport coordinates');
});
